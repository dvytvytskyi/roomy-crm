'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import { propertyServiceAdapted } from '../../lib/api/adapters/apiAdapter';
import { reservationServiceAdapted } from '../../lib/api/adapters/apiAdapter';
// import { pricingCalendarService, PropertyPricingMap } from '../../lib/api/services/pricingCalendarService';

// Константи для ID префіксів
const ID_PREFIXES = {
  PROPERTY: 'prop_',
  RESERVATION: 'res_',
  MOCK: 'mock_'
} as const;

// Типи для API даних
interface PropertyV2 {
  id: string;
  name: string;
  nickname?: string;
  type: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  isActive: boolean;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ReservationV2 {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guestName?: string;
  guestCount?: number;
  status?: string;
  totalPrice?: number;
  notes?: string;
}

// Типи для dhtmlxGantt
interface GanttTask {
  id: string;
  text: string;
  start_date: string | Date;
  duration: number;
  order?: number;
  progress: number;
  open?: boolean;
  parent?: string;
  type?: string;
  status?: "paid" | "pending" | "booked";
  guest_amount?: number;
  guest?: string;
  price?: number;
  render?: string;
}

interface GanttLink {
  id: number;
  source: string | number;
  target: string | number;
  type: string;
}

interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}

interface GanttSchedulerProps {
  tasks: GanttData;
}

// Функції конвертації даних
const convertPropertiesToGanttTasks = (properties: PropertyV2[]): GanttTask[] => {
  return properties.map(property => ({
    id: `${ID_PREFIXES.PROPERTY}${property.id}`,
    text: `${property.name} - ${property.address}, ${property.city}`,
    start_date: new Date(2025, 9, 1), // 1 жовтня 2025
    duration: 365,
    type: "project",
    progress: 0,
    open: true,
    parent: 0,
    render: "split", // КЛЮЧОВЕ! Split tasks для квартир
    // Кастомні поля для API даних
    propertyId: property.id,
    propertyType: property.type,
    capacity: property.capacity,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    pricePerNight: property.pricePerNight,
    ownerName: property.owner ? `${property.owner.firstName} ${property.owner.lastName}` : 'Не призначено',
    isActive: property.isActive
  }));
};

const convertReservationsToGanttTasks = (reservations: ReservationV2[], properties: PropertyV2[]): GanttTask[] => {
  return reservations.map(reservation => {
    // Знаходимо нерухомість для цієї резервації
    const property = properties.find(p => p.id === reservation.propertyId);
    
    return {
      id: `${ID_PREFIXES.RESERVATION}${reservation.id}`,
      text: `${reservation.guestName || 'Гість'} (${reservation.guestCount || 1} ос.)`,
      start_date: new Date(reservation.checkIn),
      duration: Math.ceil((new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
      parent: `${ID_PREFIXES.PROPERTY}${reservation.propertyId}`,
      progress: 1,
      status: reservation.status || 'PENDING',
      source: reservation.source || 'DIRECT', // Використовуємо source з резервації
      guest_amount: reservation.guestCount || 1,
      // Кастомні поля
      reservationId: reservation.id,
      guestName: reservation.guestName,
      // Додаємо фото нерухомості
      propertyPhotoUrl: property?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center',
      totalPrice: reservation.totalPrice,
      notes: reservation.notes
    };
  });
};

const combinePropertiesAndReservations = (
  properties: PropertyV2[], 
  reservations: ReservationV2[]
): GanttTask[] => {
  const propertyTasks = convertPropertiesToGanttTasks(properties);
  const reservationTasks = convertReservationsToGanttTasks(reservations, properties);
  
  return [...propertyTasks, ...reservationTasks];
};

export default function GanttScheduler({ tasks }: GanttSchedulerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<any>(null);

  // Стани для API даних
  const [properties, setProperties] = useState<PropertyV2[]>([]);
  const [reservations, setReservations] = useState<ReservationV2[]>([]);
  // const [pricingData, setPricingData] = useState<PropertyPricingMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функція рекурсивного завантаження всіх квартир
  const loadAllProperties = async (): Promise<PropertyV2[]> => {
    let allProperties: PropertyV2[] = [];
    let currentPage = 1;
    let totalPages = 1;

    console.log('🔄 Starting recursive property loading...');

    do {
      try {
        const response = await propertyServiceAdapted.getAll({ 
          page: currentPage, 
          limit: 100,
          active: true // Тільки активні квартири
        });

        // Перевіряємо структуру відповіді від PropertyServiceV2
        if (response.success && response.data) {
          let properties = [];
          let total = 0;
          let totalPages = 1;
          
          if (Array.isArray(response.data)) {
            // Пряма відповідь з масивом (поточна структура PropertyServiceV2)
            properties = response.data;
            total = properties.length;
            console.log(`📄 Direct array format: Loaded ${properties.length} properties directly`);
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            // Вкладена структура з пагінацією (якщо зміниться в майбутньому)
            properties = response.data.data;
            total = response.data.pagination?.total || 0;
            totalPages = response.data.pagination?.totalPages || 1;
            console.log(`📄 Nested format: Loaded page ${currentPage}/${totalPages}, properties: ${properties.length}. Total in DB: ${total}`);
          }
          
          if (properties.length > 0) {
            allProperties.push(...properties);
            
            // Якщо це пряма відповідь (масив), завантажуємо все одразу
            if (Array.isArray(response.data)) {
              console.log(`📄 Direct array detected: All properties loaded in one request`);
              break; // Виходимо з циклу
            } else {
              currentPage++; // Для вкладеної структури переходимо до наступної сторінки
            }
          } else {
            console.warn('⚠️ No properties found in response');
            break;
          }
        } else {
          console.warn('⚠️ Failed to load page:', currentPage, 'Response structure:', response);
          break;
        }
      } catch (error) {
        console.error(`❌ Error loading page ${currentPage}:`, error);
        break;
      }
    } while (currentPage <= totalPages);

    console.log(`✅ Total properties loaded: ${allProperties.length}`);
    return allProperties;
  };

  // Функція завантаження бронювань
  const loadReservations = async (): Promise<ReservationV2[]> => {
    try {
      const response = await reservationServiceAdapted.getAll({
        limit: 1000, // Отримуємо всі резервації за період
        page: 1,
        // Не фільтруємо за статусом - показуємо всі
      });

      // Перевіряємо структуру відповіді від ReservationServiceV2
      if (response.success && response.data) {
        let reservations = [];
        
        if (Array.isArray(response.data)) {
          // Пряма відповідь з масивом (поточна структура ReservationServiceV2)
          reservations = response.data;
          console.log(`✅ Direct array format: Loaded ${reservations.length} reservations directly`);
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // Вкладена структура з пагінацією (якщо зміниться в майбутньому)
          reservations = response.data.data;
          console.log(`✅ Nested format: Loaded ${reservations.length} reservations from API`);
        }
        
        if (reservations.length > 0) {
          console.log('✅ First reservation sample:', reservations[0]);
          return reservations;
        } else {
          console.warn('⚠️ No reservations found in response');
          return [];
        }
      } else {
        console.warn('⚠️ No reservations from API:', response.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading reservations:', error);
      return [];
    }
  };

  // Функція обробки помилок API
  const handleApiError = (error: any, context: string) => {
    console.error(`❌ ${context}:`, error);
    
    if (error.response?.status === 401) {
      setError('Сесія закінчилася. Будь ласка, увійдіть знову.');
    } else if (error.response?.status === 403) {
      setError('Недостатньо прав для доступу до даних.');
    } else if (error.response?.status >= 500) {
      setError('Помилка сервера. Спробуйте пізніше.');
    } else {
      setError('Помилка завантаження даних.');
    }
  };

  // Конвертація даних для Gantt з useMemo
  const ganttTasks = useMemo(() => {
    console.log('🔄 useMemo recalculating ganttTasks...');
    console.log(`📊 Properties: ${properties.length}, Reservations: ${reservations.length}`);
    
    if (properties.length > 0 || reservations.length > 0) {
      const combined = combinePropertiesAndReservations(properties, reservations);
      console.log(`✅ Using API data: ${combined.length} total tasks`);
      return combined;
    } else {
      const fallback = tasks?.data || [];
      console.log(`⚠️ Using fallback mock data: ${fallback.length} tasks`);
      return fallback;
    }
  }, [properties, reservations, tasks]);

  // Функція завантаження pricing data (закоментовано)
  // const loadPricingData = async (startDate: string, endDate: string): Promise<PropertyPricingMap[]> => {
  //   try {
  //     console.log('Loading pricing data...');
  //     const response = await pricingCalendarService.getBulkPricing(startDate, endDate);
  //     
  //     if (response.success && response.data) {
  //       console.log(`Loaded pricing data for ${response.data.length} properties`);
  //       return response.data;
  //     } else {
  //       console.warn('Failed to load pricing data:', response.error);
  //       return [];
  //     }
  //   } catch (error) {
  //     console.error('Error loading pricing data:', error);
  //     return [];
  //   }
  // };

  // Завантаження всіх даних
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🚀 Starting data loading...');

        // Паралельне завантаження квартир та бронювань
        const [propertiesData, reservationsData] = await Promise.all([
          loadAllProperties(),
          loadReservations()
        ]);

        // Завантажуємо pricing data для поточного місяця (закоментовано)
        // const today = new Date();
        // const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0); // +2 місяці для кращого покриття
        
        // const startDate = startOfMonth.toISOString().split('T')[0];
        // const endDate = endOfMonth.toISOString().split('T')[0];
        
        // const pricingData = await loadPricingData(startDate, endDate);

        setProperties(propertiesData);
        setReservations(reservationsData);
        // setPricingData(pricingData);

        console.log(`✅ Data loaded: ${propertiesData.length} properties, ${reservationsData.length} reservations`);
        console.log('🔍 Properties sample:', propertiesData[0]);
        console.log('🔍 Reservations sample:', reservationsData[0]);

      } catch (error) {
        console.error('❌ Error loading data:', error);
        handleApiError(error, 'Data loading');
        setProperties([]);
        setReservations([]);
        // setPricingData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []); // Запускаємо тільки один раз при монтуванні

  // Оновлення цін коли pricingData зміниться (закоментовано)
  // useEffect(() => {
  //   if (pricingData.length > 0 && ganttRef.current) {
  //     console.log('🔄 Updating prices with new pricing data:', pricingData);
  //     // Додаємо ціни з новими даними
  //     setTimeout(() => {
  //       const addPricesToCells = () => {
  //         // Видаляємо попередні ціни, якщо вони є
  //         const existingPrices = containerRef.current?.querySelectorAll('.gantt-cell-price');
  //         existingPrices?.forEach(el => el.remove());
  //         
  //         // Отримуємо всі квартири (projects) - використовуємо правильний API
  //         const allTasks = ganttRef.current.getTaskByTime();
  //         const projectTasks = allTasks.filter((task: any) => task.type === 'project');
  //         
  //         projectTasks.forEach((task: any) => {
  //           // Знаходимо відповідний property
  //           const property = properties.find(p => p.id === task.propertyId);
  //           if (!property) return;
  //           
  //           // Отримуємо видимий діапазон дат
  //           const startDate = ganttRef.current.getState().min_date;
  //           const endDate = ganttRef.current.getState().max_date;
  //           
  //           // Ітеруємо через кожен день у видимому діапазоні
  //           let currentDate = new Date(startDate);
  //           while (currentDate <= endDate) {
  //             const nextDate = new Date(currentDate);
  //             nextDate.setDate(nextDate.getDate() + 1);
  //             
  //             // Отримуємо позицію клітинки
  //             const cellStartPos = ganttRef.current.posFromDate(currentDate);
  //             const cellEndPos = ganttRef.current.posFromDate(nextDate);
  //             
  //             const cellWidth = cellEndPos - cellStartPos;
  //             
  //             // Отримуємо ціну для цієї конкретної дати
  //             const dateStr = currentDate.toISOString().split('T')[0];
  //             const pricingEntry = pricingData.find(p => p.propertyId === task.propertyId);
  //             const priceForDate = pricingEntry?.pricingMap?.[dateStr] || property.pricePerNight;
  //             
  //             // Створюємо div з ціною
  //             const priceDiv = document.createElement('div');
  //             priceDiv.className = 'gantt-cell-price';
  //             priceDiv.style.cssText = `
  //               position: absolute;
  //               top: 0;
  //               left: ${cellStartPos}px;
  //               width: ${cellWidth}px;
  //               height: ${ganttRef.current.config.row_height}px;
  //               display: flex;
  //               align-items: center;
  //               justify-content: center;
  //               font-size: 11px;
  //               color: #000;
  //               font-weight: 400;
  //               pointer-events: none;
  //               z-index: 0;
  //             `;
  //             priceDiv.textContent = `$${priceForDate}`;
  //             
  //             // Додаємо в відповідний рядок
  //             const rowElement = containerRef.current?.querySelector(`[task_id="${task.id}"]`);
  //             if (rowElement) {
  //               rowElement.appendChild(priceDiv);
  //             }
  //             
  //             currentDate.setDate(currentDate.getDate() + 1);
  //           }
  //         });
  //       };
  //       
  //       addPricesToCells();
  //     }, 100);
  //   }
  // }, [pricingData, properties]);

  // Функція для створення split tasks (бронювань)
  const onDragEnd = (startPoint: any, endPoint: any, startDate: any, endDate: any, tasksBetweenDates: any, tasksInRow: any) => {
    if (tasksInRow.length === 1) {
      const currentTask = tasksInRow[0];
      
      if (currentTask.type === "project") {
        // НЕ створюємо task тут - дозволяємо DataProcessor обробити створення
        // Тільки зберігаємо дані для DataProcessor
        const tempData = {
          start_date: ganttRef.current.roundDate(startDate),
          end_date: ganttRef.current.roundDate(endDate),
          parent: currentTask.id,
          text: "New Reservation",
          status: "PENDING",
          guest_amount: 1,
          price: "0"
        };
        
        // Додаємо тимчасовий task для відображення
        const tempId = ganttRef.current.uid();
        ganttRef.current.addTask({
          id: tempId,
          text: "New Reservation",
          start_date: tempData.start_date,
          end_date: tempData.end_date,
          parent: tempData.parent,
          status: "pending",
          guest_amount: 1,
          price: "0"
        });
        
        // Відкриваємо модалку для редагування нового бронювання
        setTimeout(() => {
          try {
            if (ganttRef.current && ganttRef.current.getTask(tempId)) {
              ganttRef.current.showLightbox(tempId);
            }
          } catch (error) {
            console.warn("Could not open lightbox for new reservation:", error);
          }
        }, 300);
        
        ganttRef.current.message({
          text: "✅ Створено бронювання для " + currentTask.text + ". Заповніть деталі в модалці.",
          expire: 3000
        });
      } else {
        // Якщо клікнули на бронювання - створюємо новий проект
        const projectName = "Квартира #" + (Date.now() % 100);
        const newProject = ganttRef.current.addTask({
          text: projectName,
          render: "split",
          type: "project",
          start_date: ganttRef.current.roundDate(startDate),
          duration: 365
        }, 0);
        
        // Переміщуємо існуюче бронювання в новий проект
        ganttRef.current.moveTask(currentTask.id, 0, newProject);
        
        // Створюємо нове бронювання
        ganttRef.current.addTask({
          text: "New Reservation",
          start_date: ganttRef.current.roundDate(startDate),
          end_date: ganttRef.current.roundDate(endDate),
          status: "pending",
          guest_amount: 1,
          price: "" // Сума за період (optional)
        }, newProject);
        
        ganttRef.current.calculateTaskLevel(currentTask);
      }
    } else if (tasksInRow.length === 0) {
      // Створюємо новий проект (квартиру)
      const projectName = "Квартира #" + (Date.now() % 100);
      const newPropertyId = "prop_" + Date.now();
      
      ganttRef.current.createTask({
        id: newPropertyId,
        text: projectName,
        render: "split",
        type: "project",
        start_date: ganttRef.current.roundDate(startDate),
        duration: 365
      });
      
      // Відкриваємо модалку для редагування нової квартири
      setTimeout(() => {
        try {
          if (ganttRef.current && ganttRef.current.getTask(newPropertyId)) {
            ganttRef.current.showLightbox(newPropertyId);
          }
        } catch (error) {
          console.warn("Could not open lightbox for new property:", error);
        }
      }, 300);
      
      ganttRef.current.message({
        text: "✅ Створено нову квартиру. Заповніть деталі в модалці.",
        expire: 3000
      });
    }
  };

  useEffect(() => {
    // Перевіряємо чи код виконується на клієнті
    if (typeof window === 'undefined') return;

    // Не ініціалізуємо Gantt поки дані завантажуються
    if (isLoading) {
      console.log('⏳ Waiting for data to load...');
      return;
    }

    // Перевіряємо, чи є дані для відображення
    if (ganttTasks.length === 0) {
      console.log('⚠️ No tasks to display, skipping Gantt initialization');
      return;
    }

    console.log('🚀 Starting Gantt initialization with', ganttTasks.length, 'tasks');

    // Динамічно завантажуємо dhtmlxGantt
    const loadGantt = async () => {
      // Завантажуємо CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/dhtmlxGantt/codebase/dhtmlxgantt.css';
      document.head.appendChild(link);

      // Додаємо кастомні стилі для split tasks
      const style = document.createElement('style');
      style.textContent = `
        /* Приховуємо стрілочки дропдауну */
        .gantt_tree_icon {
          display: none !important;
        }
        
        .gantt_folder_open,
        .gantt_folder_closed {
          display: none !important;
        }
        
        /* Приховуємо рядки бронювань в grid */
        .gantt_hidden_row {
          display: none !important;
        }
        
        /* Приховуємо рядки гостей/бронювань в grid */
        .gantt_task_row[data-task-type]:not([data-task-type="project"]) {
          display: none !important;
        }
        
        /* Додатково приховуємо рядки з parent */
        .gantt_task_row[data-parent] {
          display: none !important;
        }
        
        /* Стилі для split tasks */
        .gantt_split_task {
          margin: 2px !important;
        }
        
        /* Додаткові hover ефекти */
        .gantt_task_line {
          transition: all 0.2s ease !important;
        }
        
        .gantt_task_line:hover {
          z-index: 10 !important;
        }
        
        /* Ціни в клітинках - завжди позаду всіх елементів (закоментовано) */
        /* .gantt-cell-price {
          z-index: 0 !important;
        } */
        
        /* Бронювання завжди поверх цін */
        .gantt_task_line {
          z-index: 2 !important;
        }
        
        .gantt_task_content {
          z-index: 3 !important;
        }
        
        /* Стилі для tooltip */
        .gantt_tooltip {
          font-size: 13px !important;
          line-height: 1.4 !important;
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          padding: 12px 14px !important;
          max-width: 300px !important;
          min-width: 250px !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          color: #374151 !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          white-space: normal !important;
        }
        
        /* Покращення стилів для елементів всередині tooltip */
        .gantt_tooltip img {
          max-width: 16px !important;
          max-height: 16px !important;
          vertical-align: middle !important;
          display: inline-block !important;
        }
        
        .gantt_tooltip svg {
          flex-shrink: 0 !important;
          width: 16px !important;
          height: 16px !important;
        }
        
        /* Стилі для task content */
        .gantt_task_content {
          font-size: 11px !important;
          line-height: 1.2 !important;
          padding: 2px 4px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          word-break: break-all !important;
        }
        
        .gantt_task_content img {
          max-width: 24px !important;
          max-height: 24px !important;
          vertical-align: middle !important;
          display: inline-block !important;
        }
        
        /* ===== ROOMY LIGHTBOX MODAL STYLING ===== */
        
        /* Основний контейнер модалки - правильні класи dhtmlxGantt */
        .gantt_cal_light {
          background: #ffffff !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1) !important;
          border: none !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          max-width: 500px !important;
          width: 90% !important;
        }

        /* Заголовок модалки */
        .gantt_cal_ltitle {
          background: #FF6B35 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 18px !important;
          padding: 20px 24px !important;
          border-radius: 16px 16px 0 0 !important;
          border: none !important;
          text-align: center !important;
          letter-spacing: 0.5px !important;
        }

        /* Кнопка закриття */
        .gantt_cal_ltitle_close_btn {
          background: rgba(255, 255, 255, 0.2) !important;
          border-radius: 50% !important;
          width: 32px !important;
          height: 32px !important;
          top: 16px !important;
          right: 16px !important;
          border: none !important;
          color: #ffffff !important;
          font-size: 18px !important;
          font-weight: bold !important;
          transition: all 0.2s ease !important;
        }

        .gantt_cal_ltitle_close_btn:hover {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.1) !important;
        }

        /* Контент модалки */
        .gantt_cal_larea {
          padding: 24px !important;
          background: #ffffff !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 16px !important;
          align-items: start !important;
        }

        /* Секції форми - кожна секція займає одну клітинку сітки */
        .gantt_cal_lsection {
          margin-bottom: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 0 !important;
        }
        
        /* Контейнери для полів вводу */
        .gantt_cal_ltext {
          height: auto !important;
          min-height: 36px !important;
          max-height: 36px !important;
          overflow: hidden !important;
        }

        /* Лейбли полів */
        .gantt_cal_lsection label {
          color: #2d3748 !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          margin-bottom: 8px !important;
          display: block !important;
          letter-spacing: 0.3px !important;
          width: 100% !important;
        }

        /* Поля вводу */
        .gantt_cal_ltext textarea,
        .gantt_cal_ltext select,
        .gantt_cal_ltext input {
          width: 100% !important;
          padding: 8px 12px !important;
          border: 2px solid #e2e8f0 !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          font-family: inherit !important;
          background: #ffffff !important;
          color: #2d3748 !important;
          transition: all 0.2s ease !important;
          box-sizing: border-box !important;
          line-height: 1.2 !important;
          height: auto !important;
          min-height: 36px !important;
          max-height: 36px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        
        /* Спеціальні стилі для textarea */
        .gantt_cal_ltext textarea {
          height: 36px !important;
          resize: none !important;
          overflow-y: hidden !important;
        }

        .gantt_cal_ltext textarea:focus,
        .gantt_cal_ltext select:focus,
        .gantt_cal_ltext input:focus {
          outline: none !important;
          border-color: #FF6B35 !important;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1) !important;
        }

        .gantt_cal_ltext textarea:hover,
        .gantt_cal_ltext select:hover,
        .gantt_cal_ltext input:hover {
          border-color: #cbd5e0 !important;
        }

        /* Кнопки */
        .gantt_btn_set {
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          padding: 12px 24px !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          letter-spacing: 0.3px !important;
          margin-left: 8px !important;
        }

        /* Кнопка Save (основна) */
        .gantt_save_btn_set {
          background: #FF6B35 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3) !important;
        }

        .gantt_save_btn_set:hover {
          background: #e55a2b !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4) !important;
        }

        .gantt_save_btn_set:active {
          transform: translateY(0) !important;
        }

        /* Кнопка Cancel */
        .gantt_cancel_btn_set {
          background: #ffffff !important;
          color: #718096 !important;
          border: 2px solid #e2e8f0 !important;
        }

        .gantt_cancel_btn_set:hover {
          background: #f7fafc !important;
          border-color: #cbd5e0 !important;
          color: #4a5568 !important;
        }

        /* Кнопка Delete */
        .gantt_delete_btn_set {
          background: #ffffff !important;
          color: #e53e3e !important;
          border: 2px solid #fed7d7 !important;
        }

        .gantt_delete_btn_set:hover {
          background: #fed7d7 !important;
          color: #c53030 !important;
          border-color: #feb2b2 !important;
        }

        /* Спеціальні стилі для Time period - займає всю ширину */
        .gantt_section_time,
        .gantt_section_duration {
          grid-column: 1 / -1 !important;
          margin-bottom: 16px !important;
        }

        /* Футер з кнопками */
        .gantt_cal_lcontrols {
          padding: 20px 24px !important;
          background: #f8fafc !important;
          border-radius: 0 0 16px 16px !important;
          border-top: 1px solid #e2e8f0 !important;
          display: flex !important;
          justify-content: flex-end !important;
          align-items: center !important;
          gap: 12px !important;
        }

        /* Анімація появи модалки */
        .gantt_cal_light {
          animation: lightboxSlideIn 0.3s ease-out !important;
        }

        @keyframes lightboxSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Overlay фон - можливо gantt використовує інший клас */
        .gantt_cal_light::before,
        .gantt_cal_light::after {
          background: rgba(0, 0, 0, 0.4) !important;
          backdrop-filter: blur(4px) !important;
        }

        /* Додаткові стилі для Roomy lightbox */
        .roomy-lightbox {
          transform: scale(1) !important;
          opacity: 1 !important;
        }
        
        /* Більш специфічні селектори для перевизначення dhtmlx стилів */
        .gantt_lightbox,
        div[class*="gantt_lightbox"],
        div[id*="lightbox"] {
          background: #ffffff !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1) !important;
          border: none !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          max-width: 500px !important;
          width: 90% !important;
        }
        
        /* Агресивне перевизначення стилів dhtmlxGantt - перевизначаємо inline стилі */
        .gantt_cal_light .gantt_cal_ltext,
        .gantt_cal_light .gantt_cal_ltext[style*="height"] {
          height: 36px !important;
          min-height: 36px !important;
          max-height: 36px !important;
          overflow: hidden !important;
        }
        
        .gantt_cal_light .gantt_cal_ltext textarea,
        .gantt_cal_light .gantt_cal_ltext input,
        .gantt_cal_light .gantt_cal_ltext select,
        .gantt_cal_light .gantt_cal_ltext textarea[style*="height"],
        .gantt_cal_light .gantt_cal_ltext input[style*="height"],
        .gantt_cal_light .gantt_cal_ltext select[style*="height"] {
          height: 36px !important;
          min-height: 36px !important;
          max-height: 36px !important;
          line-height: 1.2 !important;
          padding: 8px 12px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        
        .gantt_cal_light .gantt_cal_ltext textarea,
        .gantt_cal_light .gantt_cal_ltext textarea[style*="resize"] {
          resize: none !important;
          overflow-y: hidden !important;
        }
        
        /* Додаткові стилі для grid layout */
        .gantt_cal_light .gantt_cal_larea,
        .gantt_cal_light .gantt_cal_larea[style*="grid"] {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 16px !important;
          align-items: start !important;
          padding: 24px !important;
        }
        
        /* Стилі для секцій */
        .gantt_cal_light .gantt_cal_lsection,
        .gantt_cal_light .gantt_cal_lsection[style*="margin"] {
          margin-bottom: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 0 !important;
        }
        
        /* Стилізація заголовка колонки Calendar - ТИМЧАСОВО ВІДКЛЮЧЕНО */
        /*
        .gantt_grid_head_cell {
          width: 389px !important;
          padding-left: 8px !important;
          font-size: 20px !important;
          font-weight: 600 !important;
          color: #111111 !important;
          display: block !important;
          text-align: left !important;
        }
        
        .gantt_grid_head_row {
          height: auto !important;
        }
        */
      `;
      document.head.appendChild(style);

      // Завантажуємо JS
      const script = document.createElement('script');
      script.src = '/dhtmlxGantt/codebase/dhtmlxgantt.js';
      script.async = true;

      script.onload = () => {
        if (containerRef.current && (window as any).gantt) {
          const gantt = (window as any).gantt;
          ganttRef.current = gantt;

          // Налаштування колонок (тільки назви квартир)
          gantt.config.columns = [
            { name: "text", label: "Calendar", width: "*", tree: false }
          ];
          
          // Приховуємо заголовок колонки
          gantt.config.show_task_cells = true;
          gantt.config.show_links = false;
          
          // CSS для стилізації заголовка колонки - ТИМЧАСОВО ВІДКЛЮЧЕНО
          setTimeout(() => {
            const headerCell = document.querySelector('.gantt_grid_head_cell');
            if (headerCell) {
              // Тимчасово приховуємо для тестування
              headerCell.style.setProperty('display', 'none', 'important');
            }
            const headerRow = document.querySelector('.gantt_grid_head_row');
            if (headerRow) {
              headerRow.style.setProperty('height', '0px', 'important');
            }
          }, 100);

          // Налаштування для кращого вигляду
          gantt.config.date_format = "%d-%m-%Y";
          gantt.config.scale_height = 50;
          
          // Встановлюємо висоту рядків 50px
          gantt.config.row_height = 50;      // Висота рядка в grid
          gantt.config.bar_height = 40;      // Висота блоку бронювання (bar)
          
          // Відключаємо прогрес-бар
          gantt.config.show_progress = false;
          gantt.config.progress_height = 0;
          
          // Дозволяємо перетягування та зміну розміру, включаючи створення резервацій
          gantt.config.drag_move = true;        // ✅ Дозволяємо переміщення
          gantt.config.drag_resize = true;      // ✅ Дозволяємо зміну розміру
          gantt.config.drag_create = true;      // ✅ Дозволяємо створення резервацій
          gantt.config.drag_links = false;      // ❌ Заборонено зв'язки
          
          // Увімкнення marker та tooltip плагінів
          gantt.plugins({ 
            marker: true,
            tooltip: true
          });
          
          // Сучасний API для scales з новим форматом дат
          gantt.config.scales = [
            { unit: "month", step: 1, format: "%F, %Y" },
            { unit: "day", step: 1, format: "%d %D" }
          ];

          // Фіксований діапазон календаря: вересень 2025 - вересень 2027
          gantt.config.start_date = new Date(2025, 8, 1); // 1 вересня 2025
          gantt.config.end_date = new Date(2027, 8, 30);   // 30 вересня 2027

          // Налаштування Drag & Drop для створення split tasks
          gantt.plugins({
            click_drag: true
          });

          // Прибираємо split tasks, використовуємо звичайні дочірні завдання
          gantt.config.open_split_tasks = false;
          gantt.config.multiselect = false;
          
          // Приховуємо дропдаун для проектів (квартир)
          gantt.config.show_task_cells = false;
          
          // Показуємо тільки батьківські задачі в grid (тільки квартири)
          gantt.templates.grid_row_class = (start, end, task) => {
            // Ховаємо рядки, які не є проектами (квартирами)
            if (task.type !== "project") {
              return "gantt_hidden_row";
            }
            return "";
          };
          
          // Додаткова перевірка після завантаження даних
          gantt.attachEvent("onAfterTaskDisplay", () => {
            // Ховаємо всі рядки, які не є проектами
            gantt.eachTask((task) => {
              if (task.type !== "project") {
                const row = gantt.getTaskNode(task.id);
                if (row) {
                  row.style.display = "none";
                }
              }
            });
          });
          
          gantt.templates.grid_folder = (task) => {
            return ""; // Приховуємо стрілочку для всіх задач
          };
          
          gantt.config.click_drag = {
            callback: onDragEnd,
            singleRow: true
          };

          // Базові секції lightbox (будуть динамічно змінюватися)
          gantt.config.lightbox.sections = [
            // --- Основна інформація ---
            { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
            
            // --- Інформація про гостя ---
            { name: "guest_email", height: 22, map_to: "guest_email", type: "textarea" },
            { name: "guest_phone", height: 22, map_to: "guest_phone", type: "textarea" },
            
            // --- Деталі бронювання ---
            { name: "status", height: 22, map_to: "status", type: "select", options: [
              { key: "PENDING", label: "Pending" },
              { key: "CONFIRMED", label: "Confirmed" },
              { key: "CANCELLED", label: "Cancelled" },
              { key: "COMPLETED", label: "Completed" },
              { key: "NO_SHOW", label: "No Show" }
            ]},
            { name: "guest_amount", height: 22, map_to: "guest_amount", type: "select", options: [
              { key: 1, label: "1" },
              { key: 2, label: "2" },
              { key: 3, label: "3" },
              { key: 4, label: "4" },
              { key: 5, label: "5" },
              { key: 6, label: "6" }
            ]},
            { name: "source", height: 22, map_to: "source", type: "select", options: [
              { key: "DIRECT", label: "Direct" },
              { key: "AIRBNB", label: "Airbnb" },
              { key: "BOOKING_COM", label: "Booking.com" },
              { key: "VRBO", label: "VRBO" },
              { key: "EXPEDIA", label: "Expedia" },
              { key: "OTHER", label: "Other" }
            ] },
            { name: "price", height: 22, map_to: "price", type: "textarea" },
            
            // --- Часовий період ---
            { name: "time", type: "duration", map_to: "auto" }
          ];

          // Налаштування локалізації
          gantt.locale.labels.section_description = "Name";
          gantt.locale.labels.section_status = "Status";
          gantt.locale.labels.section_guest_amount = "Guest amount";
          gantt.locale.labels.section_price = "Total Price (optional)";
          gantt.locale.labels.section_time = "Time period";

          // Динамічне налаштування секцій lightbox
          gantt.attachEvent("onBeforeLightbox", (id: string) => {
            try {
              const task = gantt.getTask(id);
              
              if (!task) {
                console.warn("Task not found for lightbox:", id);
                return false;
              }
              
              if (task.type === "project") {
              // Секції для квартири
              gantt.config.lightbox.sections = [
                { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
                { name: "time", type: "duration", map_to: "auto" }
              ];
            } else {
              // Секції для бронювання
              gantt.config.lightbox.sections = [
                // --- Основна інформація ---
                { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
                
                // --- Інформація про гостя ---
                { name: "guest_email", height: 22, map_to: "guest_email", type: "textarea" },
                { name: "guest_phone", height: 22, map_to: "guest_phone", type: "textarea" },
                
                // --- Деталі бронювання ---
                { name: "status", height: 22, map_to: "status", type: "select", options: [
                  { key: "PENDING", label: "Pending" },
                  { key: "CONFIRMED", label: "Confirmed" },
                  { key: "CANCELLED", label: "Cancelled" },
                  { key: "COMPLETED", label: "Completed" },
                  { key: "NO_SHOW", label: "No Show" }
                ]},
                { name: "guest_amount", height: 22, map_to: "guest_amount", type: "select", options: [
                  { key: 1, label: "1" },
                  { key: 2, label: "2" },
                  { key: 3, label: "3" },
                  { key: 4, label: "4" },
                  { key: 5, label: "5" },
                  { key: 6, label: "6" }
                ]},
                { name: "source", height: 22, map_to: "source", type: "select", options: [
                  { key: "DIRECT", label: "Direct" },
                  { key: "AIRBNB", label: "Airbnb" },
                  { key: "BOOKING_COM", label: "Booking.com" },
                  { key: "VRBO", label: "VRBO" },
                  { key: "EXPEDIA", label: "Expedia" },
                  { key: "OTHER", label: "Other" }
                ] },
                { name: "price", height: 22, map_to: "price", type: "textarea" },
                
                // --- Часовий період ---
                { name: "time", type: "duration", map_to: "auto" }
              ];
            }
            
            return true;
          } catch (error) {
            console.error("Error in onBeforeLightbox:", error);
            return false;
          }
        });

        // Обробник для застосування стилів до lightbox після його створення
        gantt.attachEvent("onLightbox", function(id: any) {
          // Застосовуємо стилі після створення lightbox
          setTimeout(() => {
            const lightbox = document.querySelector('.gantt_cal_light');
            if (lightbox) {
              console.log('🎨 Applying Roomy styles to lightbox');
              // Додаємо клас для додаткового стилювання
              lightbox.classList.add('roomy-lightbox');
              
              // Додаємо інлайн стилі для гарантії
              (lightbox as HTMLElement).style.background = '#ffffff';
              (lightbox as HTMLElement).style.borderRadius = '16px';
              (lightbox as HTMLElement).style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)';
              (lightbox as HTMLElement).style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
              
              // Стилізуємо область контенту для grid layout
              const contentArea = lightbox.querySelector('.gantt_cal_larea');
              if (contentArea) {
                (contentArea as HTMLElement).style.display = 'grid';
                (contentArea as HTMLElement).style.gridTemplateColumns = '1fr 1fr';
                (contentArea as HTMLElement).style.gap = '16px';
                (contentArea as HTMLElement).style.alignItems = 'start';
                (contentArea as HTMLElement).style.padding = '24px';
              }
              
              // Стилізуємо заголовок
              const title = lightbox.querySelector('.gantt_cal_ltitle');
              if (title) {
                (title as HTMLElement).style.background = '#FF6B35';
                (title as HTMLElement).style.color = '#ffffff';
                (title as HTMLElement).style.borderRadius = '16px 16px 0 0';
                (title as HTMLElement).style.padding = '20px 24px';
                (title as HTMLElement).style.textAlign = 'center';
                (title as HTMLElement).style.fontWeight = '600';
                (title as HTMLElement).style.fontSize = '18px';
              }
              
              // Стилізуємо кнопки
              const saveBtn = lightbox.querySelector('.gantt_save_btn_set');
              if (saveBtn) {
                (saveBtn as HTMLElement).style.background = '#FF6B35';
                (saveBtn as HTMLElement).style.color = '#ffffff';
                (saveBtn as HTMLElement).style.borderRadius = '12px';
                (saveBtn as HTMLElement).style.border = 'none';
                (saveBtn as HTMLElement).style.padding = '12px 24px';
                (saveBtn as HTMLElement).style.fontWeight = '600';
                (saveBtn as HTMLElement).style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)';
              }
              
              const cancelBtn = lightbox.querySelector('.gantt_cancel_btn_set');
              if (cancelBtn) {
                (cancelBtn as HTMLElement).style.background = '#ffffff';
                (cancelBtn as HTMLElement).style.color = '#718096';
                (cancelBtn as HTMLElement).style.border = '2px solid #e2e8f0';
                (cancelBtn as HTMLElement).style.borderRadius = '12px';
                (cancelBtn as HTMLElement).style.padding = '12px 24px';
                (cancelBtn as HTMLElement).style.fontWeight = '600';
              }
              
              const deleteBtn = lightbox.querySelector('.gantt_delete_btn_set');
              if (deleteBtn) {
                (deleteBtn as HTMLElement).style.background = '#ffffff';
                (deleteBtn as HTMLElement).style.color = '#e53e3e';
                (deleteBtn as HTMLElement).style.border = '2px solid #fed7d7';
                (deleteBtn as HTMLElement).style.borderRadius = '12px';
                (deleteBtn as HTMLElement).style.padding = '12px 24px';
                (deleteBtn as HTMLElement).style.fontWeight = '600';
              }
              
              // Стилізуємо всі поля вводу - агресивно перевизначаємо inline стилі
              const inputs = lightbox.querySelectorAll('input, select, textarea');
              inputs.forEach((input) => {
                const element = input as HTMLElement;
                // Видаляємо всі inline стилі висоти
                element.style.removeProperty('height');
                element.style.removeProperty('min-height');
                element.style.removeProperty('max-height');
                element.style.removeProperty('line-height');
                element.style.removeProperty('overflow');
                element.style.removeProperty('text-overflow');
                element.style.removeProperty('white-space');
                
                // Встановлюємо наші стилі
                element.style.setProperty('padding', '8px 12px', 'important');
                element.style.setProperty('border', '2px solid #e2e8f0', 'important');
                element.style.setProperty('border-radius', '8px', 'important');
                element.style.setProperty('font-size', '14px', 'important');
                element.style.setProperty('line-height', '1.2', 'important');
                element.style.setProperty('height', '36px', 'important');
                element.style.setProperty('min-height', '36px', 'important');
                element.style.setProperty('max-height', '36px', 'important');
                element.style.setProperty('box-sizing', 'border-box', 'important');
                element.style.setProperty('overflow', 'hidden', 'important');
                element.style.setProperty('text-overflow', 'ellipsis', 'important');
                element.style.setProperty('white-space', 'nowrap', 'important');
              });
              
              // Спеціальні стилі для textarea
              const textareas = lightbox.querySelectorAll('textarea');
              textareas.forEach((textarea) => {
                (textarea as HTMLElement).style.resize = 'none';
                (textarea as HTMLElement).style.overflowY = 'hidden';
              });
              
              // Стилізуємо контейнери полів - агресивно перевизначаємо
              const textContainers = lightbox.querySelectorAll('.gantt_cal_ltext');
              textContainers.forEach((container) => {
                const element = container as HTMLElement;
                element.style.removeProperty('height');
                element.style.removeProperty('min-height');
                element.style.removeProperty('max-height');
                element.style.removeProperty('overflow');
                
                element.style.setProperty('height', '36px', 'important');
                element.style.setProperty('min-height', '36px', 'important');
                element.style.setProperty('max-height', '36px', 'important');
                element.style.setProperty('overflow', 'hidden', 'important');
              });
              
              // Стилізуємо секції форми
              const sections = lightbox.querySelectorAll('.gantt_cal_lsection');
              sections.forEach((section) => {
                (section as HTMLElement).style.marginBottom = '0';
                (section as HTMLElement).style.display = 'flex';
                (section as HTMLElement).style.flexDirection = 'column';
              });
              
              // Спеціальні стилі для Time period
              const timeSection = lightbox.querySelector('.gantt_section_time, .gantt_section_duration');
              if (timeSection) {
                (timeSection as HTMLElement).style.gridColumn = '1 / -1';
                (timeSection as HTMLElement).style.marginBottom = '16px';
              }
            }
          }, 50);
        });

        // Обробник для заповнення lightbox поточними даними task (з debounce)
        let lightboxTimeout: NodeJS.Timeout | null = null;
        gantt.attachEvent("onLightbox", function(id: any) {
          try {
            // Очищуємо попередній таймаут
            if (lightboxTimeout) {
              clearTimeout(lightboxTimeout);
            }
            
            const task = gantt.getTask(id);
            if (task && task.type !== "project") {
              console.log('🔍 onLightbox - Task data:', task);
              
              // Якщо це новий task (без моків) - додаємо preview маркер та моки
              if (!task.isPreview && !task.guest_email) {
                console.log('🔄 Converting new task to preview...');
                
                // Отримуємо фото нерухомості для preview task
                const propertyId = task.parent?.replace('prop_', '') || '';
                const property = properties.find(p => p.id === propertyId);
                const propertyPhotoUrl = property?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center';
                
                const previewTask = {
                  ...task,
                  text: "New Reservation (Preview)",
                  isPreview: true,
                  
                  // Додаємо моки для всіх полів
                  guest_email: 'guest@example.com',
                  guest_phone: '+971501234567',
                  status: 'pending',
                  guest_amount: 2,
                  source: 'DIRECT',
                  price: '500',
                  special_requests: 'Late check-in preferred',
                  
                  // Додаємо фото нерухомості
                  propertyPhotoUrl: propertyPhotoUrl
                };
                
                // Оновлюємо task з preview даними
                gantt.updateTask(id, previewTask);
                
                console.log('✅ Task converted to preview:', previewTask);
              }
              
              // Заповнюємо поля поточними значеннями з task з debounce
              lightboxTimeout = setTimeout(() => {
                try {
                  const currentTask = gantt.getTask(id);
                  const lightboxData = {
                    text: currentTask.text || 'New Reservation',
                    guest_email: currentTask.guest_email || 'guest@example.com',
                    guest_phone: currentTask.guest_phone || '+971501234567',
                    status: currentTask.status || 'pending',
                    guest_amount: currentTask.guest_amount || 2,
                    source: currentTask.source || 'DIRECT',
                    price: currentTask.price || '500',
                    start_date: currentTask.start_date,
                    end_date: currentTask.end_date,
                    special_requests: currentTask.special_requests || 'Late check-in preferred'
                  };
                  
                  console.log('📝 Setting lightbox data:', lightboxData);
                  
                  Object.keys(lightboxData).forEach(key => {
                    const input = document.querySelector(`[name="${key}"]`) as HTMLInputElement;
                    if (input) {
                      // ✅ Завжди встановлюємо значення, навіть якщо воно порожнє
                      input.value = lightboxData[key] || '';
                      console.log(`✅ Set ${key} = "${lightboxData[key] || ''}"`);
                    }
                  });
                } catch (error) {
                  console.warn('⚠️ Error setting lightbox data:', error);
                }
              }, 200);
            }
            
            return true;
          } catch (error) {
            console.error('❌ Error in onLightbox:', error);
            return false;
          }
        });

          // Налаштування відображення для split tasks
          gantt.templates.task_class = (start, end, task) => {
            if (task.type === "project") {
              return "project-row";
            } else {
              return `reservation-${task.status || 'pending'}`;
            }
          };

          // Відключаємо прогрес для всіх задач
          gantt.templates.task_progress = (start, end, task) => {
            return 0; // Встановлюємо прогрес на 0 для всіх задач
          };

          // Приховуємо тільки дати (drag/resize залишаємо активними)
          gantt.templates.task_start_date = (start, end, task) => {
            return ""; // Приховуємо дату початку
          };

          gantt.templates.task_end_date = (start, end, task) => {
            return ""; // Приховуємо дату закінчення
          };

          // Відключаємо інтерактивність для рядків квартир
          gantt.templates.task_row_class = (start, end, task) => {
            if (task.type === "project") {
              return "no_interaction";
            }
            return "";
          };

          // Налаштування кліку для резервацій - відкриваємо сторінку в новому вікні
          gantt.attachEvent("onTaskClick", function(id, e) {
            const task = gantt.getTask(id);
            if (task && task.type === "project") {
              return false; // Блокуємо клік для квартир
            }
            
            // Для резервацій - відкриваємо сторінку в новому вікні
            if (task && task.type !== "project") {
              const reservationId = task.reservationId || (typeof task.id === 'string' ? task.id.replace('res_', '') : String(task.id));
              if (reservationId) {
                window.open(`/reservations/${reservationId}`, '_blank');
              }
              return false; // Запобігаємо стандартній поведінці
            }
            
            return true;
          });

          // Відключаємо подвійний клік для рядків квартир
          gantt.attachEvent("onTaskDblClick", function(id, e) {
            const task = gantt.getTask(id);
            if (task && task.type === "project") {
              return false; // Блокуємо подвійний клік для квартир
            }
            return true; // Дозволяємо подвійний клік для бронювань
          });

          // Налаштування tooltip для резервацій
          gantt.templates.tooltip_date_format = gantt.date.date_to_str("%F %j, %Y");
          
          // Кастомний tooltip для резервацій
          gantt.templates.tooltip_text = function (start, end, task) {
            // Показуємо tooltip тільки для резервацій (не для квартир)
            if (task.type === "project") {
              return null;
            }

            // Отримуємо дані резервації
            const reservationId = task.reservationId || (typeof task.id === 'string' ? task.id.replace('res_', '') : String(task.id));
            const reservation = reservations.find(r => r.id === reservationId);
            const property = properties.find(p => p.id === task.propertyId);

            // Форматуємо дати
            const formatDate = (dateStr: string) => {
              return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            };

            // Обчислюємо кількість ночей
            const checkIn = new Date(reservation?.checkIn || task.start_date);
            const checkOut = new Date(reservation?.checkOut || task.end_date);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

            // Функція для отримання логотипу платформи
            const getPlatformLogo = (source: string) => {
              switch (source?.toUpperCase()) {
                case 'AIRBNB':
                  return 'https://images.icon-icons.com/2108/PNG/512/airbnb_icon_131000.png';
                case 'BOOKING_COM':
                  return 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Booking.com_Icon_2022.svg';
                case 'VRBO':
                  return 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Vrbo_logo.svg';
                case 'EXPEDIA':
                  return 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Expedia_logo.svg';
                case 'DIRECT':
                  return 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Home_icon.svg';
                default:
                  return null;
              }
            };

            const logoUrl = getPlatformLogo(task.source || 'DIRECT');
            const platformName = task.source || 'DIRECT';

            // Отримуємо дані для відображення
            const guestName = reservation?.guestName || task.guest_name || 'Unknown Guest';
            const propertyName = property?.name || 'Unknown Property';
            const totalAmount = reservation?.totalAmount || task.price || 0;
            const guestCount = task.guest_amount || 1;
            const agentName = reservation?.agentName || 'System';
            
            // Обмежуємо довжину тексту
            const truncateText = (text: string, maxLength: number) => {
              if (text.length <= maxLength) return text;
              return text.substring(0, maxLength) + '...';
            };

            // Створюємо HTML контент tooltip з покращеним дизайном
            let content = `
              <div style="margin-bottom: 6px;">
                <div style="display: flex; align-items: center; margin-bottom: 3px; min-height: 20px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 6px; color: #374151; flex-shrink: 0;">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                  <span style="color: #374151; font-size: 13px; word-break: break-word;">
                    ${logoUrl ? `<img src="${logoUrl}" style="width: 16px; height: 16px; margin-right: 4px; vertical-align: middle; display: inline-block;" alt="${platformName} logo" />` : ''}
                    ${platformName}
                  </span>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 3px; min-height: 20px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; color: #059669; flex-shrink: 0;">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span style="color: #374151; font-size: 13px;">Reservation • ${nights} nights</span>
                </div>
                
                <div style="color: #374151; font-size: 13px; margin-bottom: 6px; line-height: 1.3;">
                  ${formatDate(reservation?.checkIn || task.start_date)} → ${formatDate(reservation?.checkOut || task.end_date)}
                </div>
              </div>
              
              <div style="margin-bottom: 3px; display: flex; align-items: flex-start; min-height: 20px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 6px; color: #374151; margin-top: 2px; flex-shrink: 0;">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
                <span style="color: #374151; font-size: 13px; word-break: break-word; line-height: 1.3;">${truncateText(propertyName, 25)}</span>
              </div>
              
              <div style="margin-bottom: 3px; display: flex; align-items: flex-start; min-height: 20px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 6px; color: #374151; margin-top: 2px; flex-shrink: 0;">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span style="color: #374151; font-size: 13px; word-break: break-word; line-height: 1.3;">
                  ${truncateText(guestName, 20)} ${totalAmount > 0 ? `${totalAmount} AED` : ''} • ${guestCount} guest${guestCount > 1 ? 's' : ''}
                </span>
              </div>
              
              <div style="margin-bottom: 3px; display: flex; align-items: flex-start; min-height: 20px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 6px; color: #374151; margin-top: 2px; flex-shrink: 0;">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span style="color: #374151; font-size: 13px;">AED ${totalAmount} total</span>
              </div>
              
              ${reservation?.totalAmount && reservation?.paidAmount && (reservation.totalAmount - reservation.paidAmount) > 0 ? `
                <div style="margin-bottom: 3px; color: #EA580C; font-size: 13px; font-weight: 600;">
                  AED ${reservation.totalAmount - reservation.paidAmount} Unpaid
                </div>
                <div style="margin-bottom: 6px; color: #EA580C; font-size: 13px; font-weight: 600;">
                  AED ${reservation.totalAmount - reservation.paidAmount} Payout
                </div>
              ` : ''}
              
              <div style="color: #6B7280; font-size: 12px; display: flex; align-items: flex-start; margin-top: 6px; padding-top: 6px; border-top: 1px solid #f3f4f6;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 6px; margin-top: 1px; flex-shrink: 0;">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span style="line-height: 1.3; word-break: break-word;">
                  Added by ${truncateText(agentName, 15)} on ${new Date(task.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            `;

            return content;
          };

          // Додаємо data-атрибути для стилізації
          gantt.attachEvent("onTaskCreated", function(task) {
            const taskNode = gantt.getTaskNode(task.id);
            if (taskNode) {
              // Додаємо data-атрибути для CSS селекторів
              if (task.type === "project") {
                taskNode.setAttribute('data-type', 'project');
              } else {
                taskNode.setAttribute('data-status', task.status || 'PENDING');
                taskNode.setAttribute('data-source', task.source || 'DIRECT');
              }
            }
          });

          // Оновлюємо data-атрибути при зміні завдання
          gantt.attachEvent("onAfterTaskUpdate", function(id, task) {
            const taskNode = gantt.getTaskNode(id);
            if (taskNode) {
              if (task.type === "project") {
                taskNode.setAttribute('data-type', 'project');
              } else {
                taskNode.setAttribute('data-status', task.status || 'PENDING');
                taskNode.setAttribute('data-source', task.source || 'DIRECT');
              }
            }
          });

          // Налаштування тексту в task
          gantt.templates.task_text = (start, end, task) => {
            if (task.type === "project") {
              return task.text;
            } else {
              // Отримуємо дані з task
              const platform = task.source || 'DIRECT';
              const guestName = task.guest_name || task.text || 'Гість';
              const price = task.price ? `AED ${task.price}` : 'N/A';
              const status = task.status || 'PENDING';
              
              // Форматуємо текст для відображення
              return `${platform} | ${guestName} | ${price} | ${status}`;
            }
          };

          // Кастомний template для task text з логотипами та обрізкою тексту
          gantt.templates.task_text = (start, end, task) => {
            if (task.type === "project") {
              return task.text;
            } else {
              // 🚨 МАКСИМАЛЬНО ПРОСТЕ ЛОГУВАННЯ
              console.log('🚨🚨🚨 TASK_CONTENT CALLED 🚨🚨🚨');
              console.log('🚨 task.source =', task.source);
              console.log('🚨 task.source type =', typeof task.source);
              console.log('🚨 task.id =', task.id);
              console.log('🚨 task.text =', task.text);
              
              const platform = task.source || 'DIRECT';
              console.log('🚨 Final platform =', platform);
              
              // Якщо platform не VRBO/DIRECT/BOOKING_COM - показуємо ВСЕ!
              if (platform !== 'VRBO' && platform !== 'DIRECT' && platform !== 'BOOKING_COM' && platform !== 'EXPEDIA' && platform !== 'OTHER') {
                console.log('🚨🚨🚨 WRONG PLATFORM DETECTED! 🚨🚨🚨');
                console.log('🚨 Expected: VRBO, DIRECT, BOOKING_COM, EXPEDIA, or OTHER');
                console.log('🚨 Got:', platform);
                console.log('🚨 Full task object:', JSON.stringify(task, null, 2));
              } else {
                console.log('✅ Platform is valid:', platform);
              }
              
              const guestName = task.guest_name || task.text || 'Гість';
              const price = task.price ? `AED ${task.price}` : 'N/A';
              const status = task.status || 'PENDING';
              
              // Отримуємо URL логотипу платформи
              const getPlatformLogo = (source: string) => {
                console.log('🎨 GET_PLATFORM_LOGO DEBUG - Input source:', source);
                console.log('🎨 GET_PLATFORM_LOGO DEBUG - Input source type:', typeof source);
                console.log('🎨 GET_PLATFORM_LOGO DEBUG - Input source.toUpperCase():', source?.toUpperCase());
                
                const upperSource = source?.toUpperCase();
                let result = null;
                
                switch (upperSource) {
                  case 'AIRBNB':
                    result = 'https://images.icon-icons.com/2108/PNG/512/airbnb_icon_131000.png';
                    break;
                  case 'BOOKING_COM':
                    result = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Booking.com_Icon_2022.svg';
                    break;
                  case 'VRBO':
                    result = 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Vrbo_logo.svg';
                    break;
                  case 'EXPEDIA':
                    result = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Expedia_logo.svg';
                    break;
                  case 'DIRECT':
                    // Створюємо кастомний логотип "R" для DIRECT (Roomy стиль)
                    result = 'data:image/svg+xml;base64,' + btoa(`
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="6" fill="white" stroke="#FF6B35" stroke-width="1"/>
                        <text x="12" y="16.5" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#FF6B35">R</text>
                      </svg>
                    `);
                    break;
                  default:
                    result = null;
                    break;
                }
                
                console.log('🎨 GET_PLATFORM_LOGO DEBUG - Result:', result);
                console.log('🎨 GET_PLATFORM_LOGO DEBUG - Platform:', source);
                if (source === 'DIRECT') {
                  console.log('🎨 DIRECT LOGO: Custom R logo created');
                }
                return result;
              };

              const logoUrl = getPlatformLogo(platform);
              
              // Отримуємо фото нерухомості з task (вже збережене при створенні)
              console.log('🏠 Task object keys:', Object.keys(task));
              console.log('🏠 Task propertyPhotoUrl:', task.propertyPhotoUrl);
              console.log('🏠 Task parent:', task.parent);
              
              // Перевіряємо, чи є реальне фото нерухомості
              let propertyPhotoUrl = task.propertyPhotoUrl;
              if (!propertyPhotoUrl || propertyPhotoUrl.includes('Home_icon') || propertyPhotoUrl.includes('fallback')) {
                console.log('⚠️ Using fallback property photo');
                propertyPhotoUrl = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center';
              }
              
              console.log('🏠 Final property photo URL:', propertyPhotoUrl);
              
              // Обрізаємо довгі тексти для кращого відображення
              const truncateText = (text: string, maxLength: number) => {
                if (text.length <= maxLength) return text;
                return text.substring(0, maxLength) + '...';
              };
              
              // Створюємо HTML тільки з логотипом платформи
              let content = '';
              
              // Додаємо тільки логотип платформи (24px)
              if (logoUrl) {
                const logoHtml = `<img src="${logoUrl}" style="width: 24px; height: 24px; margin-right: 6px; vertical-align: middle; display: inline-block;" alt="${platform} logo" />`;
                content += logoHtml;
                console.log('🏷️ Logo HTML:', logoHtml);
                console.log('🏷️ Logo URL:', logoUrl);
                console.log('🏷️ Logo size: 24x24px');
              }
              
              // Обрізаємо кожен компонент для кращого відображення
              const shortPlatform = truncateText(platform, 8);
              const shortGuestName = truncateText(guestName, 15);
              const shortPrice = price.length > 10 ? truncateText(price, 10) : price;
              const shortStatus = truncateText(status, 8);
              
              // Додаємо візуальну відмінність для preview tasks
              const previewText = task.isPreview ? ' (Preview)' : '';
              const previewStyle = task.isPreview ? 'style="opacity: 0.7; font-style: italic;"' : '';
              
              content += `<span ${previewStyle}>${shortPlatform} | ${shortGuestName}${previewText} | ${shortPrice} | ${shortStatus}</span>`;
              
              console.log('🎨 TASK_CONTENT DEBUG - Final content:', content);
              console.log('🎨 TASK_CONTENT DEBUG - shortPlatform:', shortPlatform);
              console.log('🎨 TASK_CONTENT DEBUG - logoUrl:', logoUrl);
              console.log('🎨 TASK_CONTENT DEBUG - propertyPhotoUrl:', propertyPhotoUrl);
              
              return content;
            }
          };
          
          // Кастомний template для task content з HTML
          gantt.templates.task_content = (start, end, task) => {
            if (task.type === "project") {
              return '';
            } else {
              // Отримуємо фото нерухомості з task
              let propertyPhotoUrl = task.propertyPhotoUrl;
              if (!propertyPhotoUrl || propertyPhotoUrl.includes('Home_icon') || propertyPhotoUrl.includes('fallback')) {
                propertyPhotoUrl = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center';
              }
              const platform = task.source || 'DIRECT';
              
              // Функція для отримання логотипу платформи
              const getPlatformLogo = (source: string) => {
                switch (source?.toUpperCase()) {
                  case 'AIRBNB':
                    return 'https://images.icon-icons.com/2108/PNG/512/airbnb_icon_131000.png';
                  case 'BOOKING_COM':
                    return 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Booking.com_Icon_2022.svg';
                  case 'VRBO':
                    return 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Vrbo_logo.svg';
                  case 'EXPEDIA':
                    return 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Expedia_logo.svg';
                  case 'DIRECT':
                    // Створюємо кастомний логотип "R" для DIRECT (Roomy стиль)
                    return 'data:image/svg+xml;base64,' + btoa(`
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="6" fill="white" stroke="#FF6B35" stroke-width="1"/>
                        <text x="12" y="16.5" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#FF6B35">R</text>
                      </svg>
                    `);
                  default:
                    return null;
                }
              };
              
              const logoUrl = getPlatformLogo(platform);
              
              // Створюємо HTML тільки з логотипом платформи
              let content = '';
              
              // Додаємо тільки логотип платформи (24px)
              if (logoUrl) {
                content += `<img src="${logoUrl}" style="width: 24px; height: 24px; margin-right: 6px; vertical-align: middle; display: inline-block;" alt="${platform} logo" />`;
              }
              
              console.log('🎨 TASK_CONTENT HTML:', content);
              return content;
            }
          };

          // Функція для отримання ціни для конкретної дати (закоментовано)
          // const getPriceForDate = (task: any, date: Date): number => {
          //   const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
          //   
          //   // Спочатку шукаємо в pricing data з PriceLabs
          //   const pricingEntry = pricingData.find(p => p.propertyId === task.propertyId);
          //   if (pricingEntry && pricingEntry.pricingMap && pricingEntry.pricingMap[dateStr]) {
          //     return pricingEntry.pricingMap[dateStr];
          //   }
          //   
          //   // Якщо є динамічне ціноутворення в task (legacy)
          //   if (task.pricingMap && typeof task.pricingMap === 'object') {
          //     if (task.pricingMap[dateStr]) {
          //       return task.pricingMap[dateStr];
          //     }
          //   }
          //   
          //   // Якщо є масив цін по датах (legacy)
          //   if (task.pricing && Array.isArray(task.pricing)) {
          //     const priceEntry = task.pricing.find((p: any) => p.date === dateStr);
          //     if (priceEntry && priceEntry.price) {
          //       return priceEntry.price;
          //     }
          //   }
          //   
          //   // Fallback до базової ціни
          //   return task.pricePerNight || 0;
          // };

          // Функція для додавання цін в клітинки календаря (закоментовано)
          // const addPricesToCells = () => {
          //   // Видаляємо попередні ціни, якщо вони є
          //   const existingPrices = containerRef.current?.querySelectorAll('.gantt-cell-price');
          //   existingPrices?.forEach(el => el.remove());
          //   
          //   // Отримуємо всі квартири (projects) - використовуємо правильний API
          //   const allTasks = gantt.getTaskByTime();
          //   const projectTasks = allTasks.filter((task: any) => task.type === 'project');
          //   
          //   projectTasks.forEach((task) => {
          //     
          //     const taskId = task.id;
          //     
          //     // Знаходимо всі рядки в timeline area
          //     const taskBgRows = containerRef.current?.querySelectorAll('.gantt_task_row');
          //     
          //     // Для кожного рядка перевіряємо чи він відповідає нашому task
          //     taskBgRows?.forEach((row: any) => {
          //       const rowTaskId = row.getAttribute('task_id');
          //       if (rowTaskId !== taskId) return;
          //       
          //       // Отримуємо всі клітинки днів в цьому рядку
          //       const dataArea = containerRef.current?.querySelector('.gantt_data_area');
          //       if (!dataArea) return;
          //       
          //       // Рахуємо скільки днів показується
          //       const scaleConfigs = gantt.config.scales;
          //       const dayScale = scaleConfigs?.find((s: any) => s.unit === 'day');
          //       
          //       if (!dayScale) return;
          //       
          //       // Генеруємо позиції для кожного дня
          //       let currentDate = new Date(gantt.config.start_date);
          //       const endDate = new Date(gantt.config.end_date);
          //       
          //       while (currentDate < endDate) {
          //         const cellStartPos = gantt.posFromDate(currentDate);
          //         
          //         const nextDate = new Date(currentDate);
          //         nextDate.setDate(nextDate.getDate() + 1);
          //         const cellEndPos = gantt.posFromDate(nextDate);
          //         
          //         const cellWidth = cellEndPos - cellStartPos;
          //         
          //         // Отримуємо ціну для цієї конкретної дати
          //         const priceForDate = getPriceForDate(task, new Date(currentDate));
          //         
          //         // Створюємо div з ціною
          //         const priceDiv = document.createElement('div');
          //         priceDiv.className = 'gantt-cell-price';
          //         priceDiv.style.cssText = `
          //           position: absolute;
          //           top: 0;
          //           left: ${cellStartPos}px;
          //           width: ${cellWidth}px;
          //           height: ${gantt.config.row_height}px;
          //           display: flex;
          //           align-items: center;
          //           justify-content: center;
          //           font-size: 11px;
          //           color: #000;
          //           font-weight: 400;
          //           pointer-events: none;
          //           z-index: 0;
          //         `;
          //         priceDiv.textContent = `$${priceForDate}`;
          //         
          //         // Додаємо ціну до рядка
          //         row.appendChild(priceDiv);
          //         
          //         currentDate = nextDate;
          //       }
          //     });
          //   }); // Закриваємо forEach для projectTasks
          // };

          // Додаємо ціни після рендерингу Gantt (закоментовано)
          // gantt.attachEvent("onGanttRender", function() {
          //   setTimeout(addPricesToCells, 200);
          //   return true;
          // });

          // Додаємо ціни після завантаження даних (закоментовано)
          // gantt.attachEvent("onDataRender", function() {
          //   setTimeout(addPricesToCells, 200);
          // });

          // Додаємо ціни після скролу (закоментовано)
          // gantt.attachEvent("onGanttScroll", function() {
          //   setTimeout(addPricesToCells, 100);
          // });


          // Ініціалізуємо Gantt
          gantt.init(containerRef.current);

          // Додаємо marker для сьогоднішнього дня
          const dateToStr = gantt.date.date_to_str(gantt.config.task_date);
          const todayMarkerId = gantt.addMarker({
            start_date: new Date(),
            css: "today_marker",
            text: "Сьогодні",
            title: dateToStr(new Date())
          });
          
          // Оновлюємо marker кожну хвилину
          const updateTodayMarker = () => {
            const today = gantt.getMarker(todayMarkerId);
            today.start_date = new Date();
            today.title = dateToStr(today.start_date);
            gantt.updateMarker(todayMarkerId);
          };
          
          // Запускаємо оновлення кожну хвилину
          const markerInterval = setInterval(updateTodayMarker, 1000 * 60);

          // Показуємо повідомлення про можливість створення split tasks
          gantt.message({
            text: "Клікніть та перетягніть для створення нового бронювання або нової квартири",
            expire: 5000
          });

          // Фільтруємо дані - показуємо тільки квартири (projects) в grid
          const propertiesOnly = ganttTasks.filter(task => task.type === "project");
          
          // Створюємо повну структуру з бронюваннями як частини split tasks
          const fullData = {
            data: ganttTasks, // Всі дані включаючи бронювання
            links: []
          };

          // Завантажуємо всі дані
          gantt.parse(fullData);
          
          // Ховаємо рядки бронювань в grid (вони будуть відображатися тільки як split tasks)
          gantt.refreshData();
          
          // Оновлюємо існуючі tasks з фото нерухомості (якщо його немає)
          gantt.eachTask(function(task: any) {
            if (task.type !== "project" && !task.propertyPhotoUrl) {
              const propertyId = task.parent?.replace('prop_', '') || '';
              const property = properties.find(p => p.id === propertyId);
              const propertyPhotoUrl = property?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center';
              
              gantt.updateTask(task.id, {
                ...task,
                propertyPhotoUrl: propertyPhotoUrl
              });
              
              console.log('🔄 Updated existing task with property photo:', task.id, propertyPhotoUrl);
            }
          });
          
          // Додаємо ціни після першого завантаження (закоментовано)
          // setTimeout(addPricesToCells, 300);

          // Обробник подвійного кліку для відкриття модалки
          gantt.attachEvent("onTaskDblClick", (id: string, e: Event) => {
            try {
              const task = gantt.getTask(id);
              if (task && task.id) {
                // Відкриваємо модалку для всіх типів задач
                setTimeout(() => {
                  if (gantt.getTask(id)) {
                    gantt.showLightbox(id);
                  }
                }, 50);
              }
            } catch (error) {
              console.warn("Task not found for double click:", id);
            }
            return false; // запобігаємо стандартній поведінці
          });

          // Нова логіка збереження: створюємо резервацію тільки при Save
          gantt.attachEvent("onLightboxSave", function(id: any, item: any, is_new: any) {
            try {
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('💾 onLightboxSave START');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('📋 Parameters:', { id, item, is_new });
              
              const task = gantt.getTask(id);
              console.log('🔍 Current task:', task);
              
              // Якщо це preview task - створюємо реальну резервацію
              if (task && task.isPreview) {
                console.log('🔄 Converting preview to real reservation...');
                console.log('📝 Item data from form:', item);
                console.log('📝 Task data before conversion:', task);
                console.log('🔍 Task isPreview:', task.isPreview);
                console.log('🔍 Task type:', typeof task.isPreview);
                console.log('🔍 SOURCE DEBUG - Item source:', item.source);
                console.log('🔍 SOURCE DEBUG - Task source:', task.source);
                console.log('🔍 SOURCE DEBUG - Item source type:', typeof item.source);
                console.log('🔍 SOURCE DEBUG - Task source type:', typeof task.source);
                
                // Видаляємо preview маркер та додаємо дані з форми
                const realTask = {
                  ...task,
                  ...item,
                  isPreview: false,
                  text: item.text || task.text,
                  // Додаємо всі дані з форми
                  guest_email: item.guest_email || task.guest_email,
                  guest_phone: item.guest_phone || task.guest_phone,
                  status: item.status || task.status,
                  guest_amount: item.guest_amount || task.guest_amount,
                  source: item.source || task.source,
                  price: item.price || task.price,
                  notes: item.notes || task.notes,
                  special_requests: item.special_requests || task.special_requests
                };
                
                console.log('📝 Real task data:', realTask);
                
                // Оновлюємо task
                console.log('🔄 Updating task with real data...');
                gantt.updateTask(id, realTask);
                
                console.log('✅ Task converted to real reservation:', realTask);
                
                // ✅ ВАЖЛИВО: Видаляємо task та створюємо новий з НОВИМ ID для CREATE action
                console.log('🗑️ Deleting old task...');
                gantt.deleteTask(id);
                
                // ✅ НОВЕ: Генеруємо НОВИЙ ID для CREATE action
                const newId = gantt.uid();
                
                // Створюємо новий task з НОВИМ ID, але без preview маркера
                const newRealTask = {
                  ...realTask,
                  id: newId // ✅ НОВИЙ ID для CREATE action
                };
                
                console.log('➕ Adding new task for CREATE action with NEW ID:', newRealTask);
                
                // Додаємо task з НОВИМ ID - це викличе CREATE action
                gantt.addTask(newRealTask);
                
                console.log('✅ New task added for CREATE action:', newRealTask);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('💾 onLightboxSave END - Preview converted');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
                setTimeout(() => {
                  gantt.message({
                    text: "✅ Резервацію створено!",
                    type: "success",
                    expire: 3000
                  });
                }, 500);
                
                return true; // Дозволяємо DataProcessor обробити
              } else {
                console.log('❌ Task is NOT preview - skipping conversion');
                console.log('🔍 Task exists:', !!task);
                console.log('🔍 Task isPreview:', task?.isPreview);
                console.log('🔍 Task type:', typeof task?.isPreview);
              }
              
              // Для існуючих резервацій - стандартна обробка
              if (is_new) {
                console.log('✅ New reservation - DataProcessor will handle it');
                setTimeout(() => {
                  gantt.message({
                    text: "✅ Нова резервація створюється...",
                    type: "success",
                    expire: 3000
                  });
                }, 100);
              } else {
                console.log('🔄 Existing reservation - DataProcessor will handle it');
                setTimeout(() => {
                  gantt.message({
                    text: "✅ Зміни резервації збережено!",
                    type: "success",
                    expire: 3000
                  });
                }, 500);
              }
              
              return true; // Дозволяємо стандартну обробку
            } catch (error) {
              console.error('❌ Error in onLightboxSave:', error);
              return false;
            }
          });

          // Обробник закриття модалки - видаляємо preview task при Cancel
          gantt.attachEvent("onLightboxCancel", function(id: any, item: any) {
            try {
              console.log('❌ onLightboxCancel:', { id, item });
              
              const task = gantt.getTask(id);
              
              // Якщо це preview task - видаляємо його
              if (task && task.isPreview) {
                console.log('🗑️ Deleting preview task...');
                gantt.deleteTask(id);
                
                gantt.message({
                  text: "❌ Створення резервації скасовано",
                  type: "error",
                  expire: 2000
                });
              }
              
              return true;
            } catch (error) {
              console.error('❌ Error in onLightboxCancel:', error);
              return false;
            }
          });

          // --- ПОВНИЙ КОНТРОЛЬ НАД СТВОРЕННЯМ ЗАВДАНЬ ---
          
          // 1. Дозволяємо створення резервацій
          gantt.config.drag_create = true;
          
          // Простий обробник створення task - без моків
          gantt.attachEvent("onTaskCreated", function (task: any) {
            console.log('🔄 onTaskCreated: Task created', { task });
            
            // Просто встановлюємо базові поля
            const newTask = {
              ...task,
              text: "New Reservation",
              type: "reservation"
            };
            
            // Оновлюємо task
            gantt.updateTask(task.id, newTask);
            
            console.log('✅ Task created:', newTask);
            return true; // Дозволяємо стандартну обробку
          });

          // DataProcessor для збереження змін через API з router
          const dp = gantt.createDataProcessor({
            router: async (entity: string, action: string, data: any, id: any) => {
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('📊 DataProcessor Router START');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log(`📊 Entity: ${entity}, Action: ${action}`);
              console.log('📊 Data:', data);
              console.log('📊 ID:', id, 'Type:', typeof id);
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              
              // Перевіряємо токен авторизації
              const token = localStorage.getItem('token');
              console.log('🔑 Auth token check:', token ? 'Token exists' : 'No token found');
              
              try {
                // Працюємо тільки з резерваціями (task entity)
                if (entity === "task") {
                  console.log('🔍 Processing task entity...');
                  
                  // Ігноруємо проекти (квартири) - вони не змінюються через планувальник
                  if (data.type === "project") {
                    console.log('⚠️ Skipping project modification (read-only in scheduler)');
                    return { id: id };
                  }
                  
                  // Ігноруємо preview tasks - вони не зберігаються в базі
                  if (data.isPreview) {
                    console.log('⚠️ Skipping preview task (not saved to database)');
                    console.log('📝 Data isPreview:', data.isPreview);
                    return { id: id };
                  }
                  
                  // ✅ НОВЕ: Ігноруємо нові task без guest_email (ще не готові для збереження)
                  if (action === "create" && !data.guest_email) {
                    console.log('⚠️ Skipping new task without guest data (not ready for saving)');
                    console.log('📝 Action:', action, 'guest_email:', data.guest_email);
                    return { id: id };
                  }
                  
                  console.log('✅ Task passed all checks, proceeding with processing...');

                  // Витягуємо ID резервації з префіксу
                  const extractReservationId = (ganttId: any): string => {
                    // Перевіряємо, чи ganttId є рядком
                    if (typeof ganttId !== 'string') {
                      console.warn('⚠️ extractReservationId: ganttId is not a string:', ganttId, typeof ganttId);
                      // Якщо це число - повертаємо як є (це тимчасовий ID)
                      return String(ganttId);
                    }
                    
                    // ganttId формат: "res_123" або "res_1759764990604"
                    const match = ganttId.match(/^res_(.+)$/);
                    return match ? match[1] : ganttId;
                  };

                  // Витягуємо ID квартири з батьківського task
                  const extractPropertyId = (parentGanttId: any): string => {
                    // Перевіряємо, чи parentGanttId є рядком
                    if (typeof parentGanttId !== 'string') {
                      console.warn('⚠️ extractPropertyId: parentGanttId is not a string:', parentGanttId, typeof parentGanttId);
                      return String(parentGanttId);
                    }
                    
                    // parentGanttId формат: "prop_123"
                    const match = parentGanttId.match(/^prop_(.+)$/);
                    return match ? match[1] : parentGanttId;
                  };

                  // Конвертуємо дату з Gantt формату в ISO формат
                  const formatDateForApi = (date: Date | string): string => {
                    let d: Date;
                    
                    if (typeof date === 'string') {
                      // Gantt може передавати дати в різних форматах
                      if (date.includes('-')) {
                        const parts = date.split('-');
                        if (parts[0].length === 4) {
                          d = new Date(date);
                        } else {
                          // DD-MM-YYYY -> YYYY-MM-DD
                          d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                        }
                      } else {
                        d = new Date(date);
                      }
                    } else {
                      d = date;
                    }
                    
                    console.log(`📅 Formatting date: input="${date}" -> output="${d.toISOString().split('T')[0]}"`);
                    return d.toISOString().split('T')[0]; // YYYY-MM-DD
                  };

                  // Обчислюємо checkOut дату з start_date + duration
                  const calculateCheckOut = (startDate: Date | string, duration: number): string => {
                    let start: Date;
                    
                    if (typeof startDate === 'string') {
                      if (startDate.includes('-')) {
                        const parts = startDate.split('-');
                        if (parts[0].length === 4) {
                          start = new Date(startDate);
                        } else {
                          start = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                        }
                      } else {
                        start = new Date(startDate);
                      }
                    } else {
                      start = startDate;
                    }
                    
                    const checkOut = new Date(start);
                    checkOut.setDate(checkOut.getDate() + duration);
                    return formatDateForApi(checkOut);
                  };

                  switch (action) {
                    case "create": {
                      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      console.log('➕ CREATE: New reservation via API...');
                      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      console.log('🔍 Raw Gantt data:', data);
                      console.log('🔍 Task ID:', id, 'Type:', typeof id);
                      console.log('🔍 Data keys:', Object.keys(data));
                      console.log('🔍 Data values:', Object.values(data));
                      // 🚨 МАКСИМАЛЬНО ПРОСТЕ ЛОГУВАННЯ
                      console.log('🚨🚨🚨 DATAPROCESSOR CREATE 🚨🚨🚨');
                      console.log('🚨 data.source =', data.source);
                      console.log('🚨 data.source type =', typeof data.source);
                      
                      // Якщо source не той - показуємо ВСЕ!
                      if (data.source !== 'VRBO' && data.source !== 'DIRECT' && data.source !== 'BOOKING_COM' && data.source !== 'EXPEDIA' && data.source !== 'OTHER') {
                        console.log('🚨🚨🚨 WRONG SOURCE IN CREATE! 🚨🚨🚨');
                        console.log('🚨 Expected: VRBO, DIRECT, BOOKING_COM, EXPEDIA, or OTHER');
                        console.log('🚨 Got:', data.source);
                        console.log('🚨 Full data object:', JSON.stringify(data, null, 2));
                      } else {
                        console.log('✅ Source is valid:', data.source);
                      }
                      
                      // ВАЖЛИВО: Видаляємо тимчасовий ID для create
                      delete data.id;
                      
                      // Логування всіх ключових значень для діагностики
                      console.log('🔍 Extracted values:', {
                        start_date: data.start_date,
                        end_date: data.end_date,
                        duration: data.duration,
                        guest_amount: data.guest_amount,
                        text: data.text,
                        parent: data.parent,
                        price: data.price
                      });
                      
                      // Проблема №4: Виправляємо витягування propertyId
                      const propertyId = extractPropertyId(data.parent);
                      console.log('🏠 Property ID extracted:', propertyId);
                      
                      // Проблема №3: Виправляємо обробку дат
                      const checkIn = formatDateForApi(data.start_date);
                      const checkOut = data.end_date 
                        ? formatDateForApi(data.end_date)
                        : calculateCheckOut(data.start_date, data.duration || 1);
                      
                      console.log('📅 Dates calculated:', { 
                        checkIn, 
                        checkOut,
                        duration_days: data.duration,
                        has_end_date: !!data.end_date
                      });
                      
                      // Проблема №1: НЕ ВКЛЮЧАЄМО reservationId!
                      // Проблема №2: Виправляємо guests (Number() + fallback)
                      // ✅ НОВЕ: Збираємо дані з lightbox форми
                      const getLightboxValue = (fieldName: string): string => {
                        const input = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
                        const value = input ? input.value : '';
                        console.log(`🔍 getLightboxValue(${fieldName}): "${value}"`);
                        return value;
                      };
                      
                      const reservationData = {
                        propertyId: propertyId,
                        checkIn: checkIn,
                        checkOut: checkOut,
                        guests: Number(data.guest_amount) || 2,
                        guestName: data.text || 'New Guest',
                        guestEmail: getLightboxValue('guest_email') || 'guest@example.com',
                        guestPhone: getLightboxValue('guest_phone') || '+971501234567',
                        source: getLightboxValue('source') || 'DIRECT',
                        status: getLightboxValue('status') || 'pending',
                        totalAmount: parseFloat(getLightboxValue('price')) || 500,
                        paidAmount: 0,
                        specialRequests: getLightboxValue('special_requests') || 'Late check-in preferred'
                        // ✅ НЕ ВКЛЮЧАЄМО reservationId!
                      };

                      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      console.log('📤 FINAL API PAYLOAD DEBUG:');
                      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      console.log('🔍 Form values from lightbox:');
                      console.log('  guest_email:', getLightboxValue('guest_email'));
                      console.log('  guest_phone:', getLightboxValue('guest_phone'));
                      console.log('  source:', getLightboxValue('source'));
                      console.log('  status:', getLightboxValue('status'));
                      console.log('  price:', getLightboxValue('price'));
                      console.log('🔍 Payload keys:', Object.keys(reservationData));
                      console.log('🔍 Payload values:', Object.values(reservationData));
                      console.log('🔍 Payload types:', Object.entries(reservationData).map(([k, v]) => `${k}: ${typeof v}`));
                      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      console.log('📋 JSON payload:', JSON.stringify(reservationData, null, 2));
                      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      console.log('📤 API CREATE URL: POST /api/v2/reservations (NO ID!)');

                      // Перевіряємо авторизацію перед API викликом
                      if (!token) {
                        throw new Error('No authentication token found. Please log in.');
                      }

                      const response = await reservationServiceAdapted.create(reservationData);
                      
                      if (response.success && response.data) {
                        console.log('✅ Reservation created successfully:', response.data);
                        gantt.message({
                          text: "✅ Резервацію створено успішно!",
                          type: "success",
                          expire: 3000
                        });
                        
                        // Повертаємо відповідь з даними для onAfterUpdate
                        return { 
                          id: id, // Залишаємо оригінальний тимчасовий ID
                          tid: id,
                          data: response.data // Додаємо дані резервації для onAfterUpdate
                        };
                      } else {
                        console.error('❌ API Response error:', response);
                        throw new Error(`Failed to create reservation: ${response.error || response.message || 'Unknown error'}`);
                      }
                    }

                    case "update": {
                      console.log('✏️ UPDATE: Updating reservation via API...');
                      
                      const reservationId = extractReservationId(id);
                      const checkIn = data.start_date ? formatDateForApi(data.start_date) : undefined;
                      const checkOut = data.end_date 
                        ? formatDateForApi(data.end_date)
                        : (data.start_date && data.duration 
                          ? calculateCheckOut(data.start_date, data.duration)
                          : undefined);
                      
                      const updateData: any = {
                        checkIn: checkIn,
                        checkOut: checkOut,
                        guests: data.guest_amount,
                        totalAmount: data.price ? parseFloat(data.price) : undefined,
                        guestName: data.text,
                        status: data.status?.toUpperCase(),
                        notes: data.notes
                      };

                      // Видаляємо undefined значення
                      Object.keys(updateData).forEach(key => 
                        updateData[key] === undefined && delete updateData[key]
                      );

                      console.log('📤 API UPDATE Request data:', updateData);
                      console.log('📤 API UPDATE URL: PUT /api/v2/reservations/' + reservationId);

                      // Перевіряємо авторизацію перед API викликом
                      if (!token) {
                        throw new Error('No authentication token found. Please log in.');
                      }

                      const response = await reservationServiceAdapted.update(reservationId, updateData);
                      
                      if (response.success) {
                        console.log('✅ Reservation updated successfully:', response.data);
                        gantt.message({
                          text: "✅ Резервацію оновлено успішно!",
                          type: "success",
                          expire: 3000
                        });
                        return { id: id };
                      } else {
                        throw new Error('Failed to update reservation');
                      }
                    }

                    case "delete": {
                      console.log('🗑️ DELETE: Deleting reservation via API...');
                      
                      const reservationId = extractReservationId(id);
                      console.log('📤 API DELETE URL: DELETE /api/v2/reservations/' + reservationId);

                      // Перевіряємо авторизацію перед API викликом
                      if (!token) {
                        throw new Error('No authentication token found. Please log in.');
                      }

                      const response = await reservationServiceAdapted.delete(reservationId);
                      
                      if (response.success) {
                        console.log('✅ Reservation deleted successfully');
                        gantt.message({
                          text: "✅ Резервацію видалено успішно!",
                          type: "success",
                          expire: 3000
                        });
                        return { id: id };
                      } else {
                        throw new Error('Failed to delete reservation');
                      }
                    }

                    default:
                      console.warn('⚠️ Unknown action:', action);
                      return { id: id };
                  }
                }
                
                // Для інших entities (links тощо) просто повертаємо id
                return { id: id };
                
              } catch (error: any) {
                console.error('❌ DataProcessor error:', error);
                console.error('❌ Error details:', {
                  message: error.message,
                  status: error.response?.status,
                  statusText: error.response?.statusText,
                  data: error.response?.data,
                  url: error.config?.url
                });
                
                // Показуємо детальну помилку користувачу
                let errorMessage = 'Unknown error';
                
                if (error.response?.data?.message) {
                  errorMessage = error.response.data.message;
                } else if (error.response?.data?.error) {
                  errorMessage = error.response.data.error;
                } else if (error.response?.data?.details) {
                  errorMessage = error.response.data.details;
                } else if (error.response?.data) {
                  errorMessage = JSON.stringify(error.response.data);
                } else if (error.message) {
                  errorMessage = error.message;
                }
                
                // Додаємо інформацію про статус код
                if (error.response?.status) {
                  errorMessage = `HTTP ${error.response.status}: ${errorMessage}`;
                }
                
                gantt.message({
                  text: `❌ Помилка збереження: ${errorMessage}`,
                  type: "error",
                  expire: 8000
                });
                
                // Повертаємо помилку для Gantt
                throw error;
              }
            }
          });

          // ВАЖЛИВО! Синхронізуємо ID після створення
          dp.attachEvent("onAfterUpdate", function(id: any, action: string, tid: any, response: any){
            console.log('🔄 onAfterUpdate:', { id, action, tid, response });
            console.log('🔍 SOURCE DEBUG - Response data source:', response?.data?.source);
            console.log('🔍 SOURCE DEBUG - Response source:', response?.source);
            
            if (action === "create" && response) {
              // Перевіряємо різні можливі структури відповіді
              let reservationId = null;
              
              if (response.data && response.data.id) {
                reservationId = response.data.id;
              } else if (response.id) {
                reservationId = response.id;
              } else if (response.data && response.data.reservationId) {
                reservationId = response.data.reservationId;
              }
              
              console.log('🔍 ON_AFTER_UPDATE DEBUG - Full response.data:', response.data);
              console.log('🔍 ON_AFTER_UPDATE DEBUG - response.data.source:', response.data?.source);
              
              if (reservationId) {
                // Замінюємо тимчасовий ID (id) на реальний ID з бекенду
                const newId = `${ID_PREFIXES.RESERVATION}${reservationId}`;
                console.log(`🔄 Changing task ID from "${id}" to "${newId}"`);
                
                // Перевіряємо task перед оновленням
                const currentTask = gantt.getTask(id);
                console.log('🔍 ON_AFTER_UPDATE DEBUG - Current task before changeTaskId:', currentTask);
                console.log('🔍 ON_AFTER_UPDATE DEBUG - Current task.source:', currentTask?.source);
                
                try {
                  gantt.changeTaskId(id, newId);
                  console.log(`✅ Successfully changed task ID to "${newId}"`);
                  
                  // Перевіряємо task після оновлення ID
                  const updatedTask = gantt.getTask(newId);
                  console.log('🔍 ON_AFTER_UPDATE DEBUG - Updated task after changeTaskId:', updatedTask);
                  console.log('🔍 ON_AFTER_UPDATE DEBUG - Updated task.source:', updatedTask?.source);
                } catch (error) {
                  console.warn(`⚠️ Failed to change task ID: ${error.message}`);
                }
              } else {
                console.warn('⚠️ No reservation ID found in response:', response);
              }
            }
            
            // ✅ Додаємо обробку для оновлення
            if (action === "update" && response) {
              console.log('🔄 Updating task data after successful API update');
              
              console.log('🔍 ON_AFTER_UPDATE DEBUG - Update action - Response data:', response.data);
              console.log('🔍 ON_AFTER_UPDATE DEBUG - Update action - Response data.source:', response.data?.source);
              
              try {
                // Отримуємо поточний task
                const task = gantt.getTask(id);
                console.log('🔍 ON_AFTER_UPDATE DEBUG - Update action - Current task:', task);
                console.log('🔍 ON_AFTER_UPDATE DEBUG - Update action - Current task.source:', task?.source);
                
                if (task && task.type !== "project") {
                  // Оновлюємо дані task з відповіді API
                  if (response.data) {
                    const updatedTask = {
                      ...task,
                      text: response.data.guestName || task.text,
                      guest_email: response.data.guestEmail || task.guest_email,
                      guest_phone: response.data.guestPhone || task.guest_phone,
                      status: response.data.status || task.status,
                      source: response.data.source !== undefined ? response.data.source : task.source,
                      total_amount: response.data.totalAmount || task.total_amount,
                      guest_amount: response.data.guests || task.guest_amount,
                      notes: response.data.notes || task.notes,
                      special_requests: response.data.specialRequests || task.special_requests
                    };
                    
                    // 🚨 МАКСИМАЛЬНО ПРОСТЕ ЛОГУВАННЯ
                    console.log('🚨🚨🚨 ON_AFTER_UPDATE 🚨🚨🚨');
                    console.log('🚨 response.data.source =', response.data.source);
                    console.log('🚨 task.source =', task.source);
                    console.log('🚨 updatedTask.source =', updatedTask.source);
                    
                    // Якщо source не той - показуємо ВСЕ!
                    if (updatedTask.source !== 'VRBO' && updatedTask.source !== 'DIRECT' && updatedTask.source !== 'BOOKING_COM' && updatedTask.source !== 'EXPEDIA' && updatedTask.source !== 'OTHER') {
                      console.log('🚨🚨🚨 WRONG SOURCE IN UPDATE! 🚨🚨🚨');
                      console.log('🚨 Expected: VRBO, DIRECT, BOOKING_COM, EXPEDIA, or OTHER');
                      console.log('🚨 Got:', updatedTask.source);
                      console.log('🚨 Full response.data:', JSON.stringify(response.data, null, 2));
                      console.log('🚨 Full task:', JSON.stringify(task, null, 2));
                    } else {
                      console.log('✅ Source is valid in update:', updatedTask.source);
                    }
                    
                    console.log('🔍 ON_AFTER_UPDATE DEBUG - Update action - Updated task data:', updatedTask);
                    console.log('🔍 ON_AFTER_UPDATE DEBUG - Update action - Updated task.source:', updatedTask.source);
                    
                    // Оновлюємо task в Gantt
                    gantt.updateTask(id, updatedTask);
                    console.log('✅ Task data updated successfully');
                    
                    // Показуємо повідомлення про успіх
                    gantt.message({
                      text: "✅ Дані резервації оновлено!",
                      type: "success",
                      expire: 3000
                    });
                  }
                }
              } catch (error) {
                console.error('❌ Error updating task data:', error);
              }
            }
          });

          console.log(`🎯 Gantt loaded with ${ganttTasks.length} tasks from ${properties.length > 0 ? 'API' : 'mock data'}`);
        }
      };

      document.body.appendChild(script);

      return () => {
        // Cleanup lightbox timeout
        if (lightboxTimeout) {
          clearTimeout(lightboxTimeout);
        }
        
        if (ganttRef.current) {
          ganttRef.current.destructor();
        }
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        // Cleanup marker interval
        if (markerInterval) {
          clearInterval(markerInterval);
        }
      };
    };

    loadGantt();
  }, [isLoading, ganttTasks.length]); // Залежить тільки від кількості задач, а не від самого масиву

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 rounded-2xl bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження квартир та бронювань...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 rounded-2xl bg-red-50">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (!isLoading && properties.length === 0 && reservations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 rounded-2xl bg-gray-50">
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium">Дані не знайдені</p>
          <p className="text-sm mt-2">Створіть першу квартиру, щоб почати роботу з планувальником</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="rounded-2xl overflow-hidden"
      style={{ 
        width: "100%", 
        height: "100vh"
      }}
    />
  );
}
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

const convertReservationsToGanttTasks = (reservations: ReservationV2[]): GanttTask[] => {
  return reservations.map(reservation => ({
    id: `${ID_PREFIXES.RESERVATION}${reservation.id}`,
    text: `${reservation.guestName || 'Гість'} (${reservation.guestCount || 1} ос.)`,
    start_date: new Date(reservation.checkIn),
    duration: Math.ceil((new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
    parent: `${ID_PREFIXES.PROPERTY}${reservation.propertyId}`,
    progress: 1,
    status: reservation.status || 'PENDING',
    source: 'AIRBNB', // Встановлюємо джерело для стилізації
    guest_amount: reservation.guestCount || 1,
    // Кастомні поля
    reservationId: reservation.id,
    guestName: reservation.guestName,
    totalPrice: reservation.totalPrice,
    notes: reservation.notes
  }));
};

const combinePropertiesAndReservations = (
  properties: PropertyV2[], 
  reservations: ReservationV2[]
): GanttTask[] => {
  const propertyTasks = convertPropertiesToGanttTasks(properties);
  const reservationTasks = convertReservationsToGanttTasks(reservations);
  
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
            { name: "text", label: "", width: "*", tree: false }
          ];
          
          // Приховуємо заголовок колонки
          gantt.config.show_task_cells = true;
          gantt.config.show_links = false;
          
          // CSS для приховування заголовка колонки
          setTimeout(() => {
            const headerCell = document.querySelector('.gantt_grid_head_cell');
            if (headerCell) {
              headerCell.style.display = 'none';
            }
            const headerRow = document.querySelector('.gantt_grid_head_row');
            if (headerRow) {
              headerRow.style.height = '0px';
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
          
          // Дозволяємо перетягування та зміну розміру, але без створення та зв'язків
          gantt.config.drag_move = true;        // ✅ Дозволяємо переміщення
          gantt.config.drag_resize = true;      // ✅ Дозволяємо зміну розміру
          gantt.config.drag_create = false;     // ❌ Заборонено створення
          gantt.config.drag_links = false;      // ❌ Заборонено зв'язки
          
          // Увімкнення marker плагіна
          gantt.plugins({ 
            marker: true 
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
            { name: "guest_email", height: 22, map_to: "guest_email", type: "textarea", default_value: "guest@example.com" },
            { name: "guest_phone", height: 22, map_to: "guest_phone", type: "textarea", default_value: "+380000000000" },
            
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
            ], default_value: "DIRECT" },
            { name: "price", height: 22, map_to: "price", type: "textarea", default_value: "0" },
            
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
                { name: "guest_email", height: 22, map_to: "guest_email", type: "textarea", default_value: "guest@example.com" },
                { name: "guest_phone", height: 22, map_to: "guest_phone", type: "textarea", default_value: "+380000000000" },
                
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
                ], default_value: "DIRECT" },
                { name: "price", height: 22, map_to: "price", type: "textarea", default_value: "0" },
                
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
              const reservationId = task.reservationId || task.id.replace('res_', '');
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

          // Додаємо hover tooltip для резервацій
          let tooltipTimeout: NodeJS.Timeout | null = null;
          let currentTooltip: HTMLElement | null = null;

          gantt.attachEvent("onTaskMouseOver", function(id, e) {
            const task = gantt.getTask(id);
            
            // Показуємо tooltip тільки для резервацій (не для квартир)
            if (!task || task.type === "project") {
              return true;
            }

            // Очищуємо попередній таймаут
            if (tooltipTimeout) {
              clearTimeout(tooltipTimeout);
            }

            // Додаємо затримку перед показом tooltip
            tooltipTimeout = setTimeout(() => {
              showReservationTooltip(task, e);
            }, 500);

            return true;
          });

          gantt.attachEvent("onTaskMouseOut", function(id, e) {
            // Очищуємо таймаут якщо мишка вийшла до показу tooltip
            if (tooltipTimeout) {
              clearTimeout(tooltipTimeout);
              tooltipTimeout = null;
            }

            // Ховаємо tooltip
            hideReservationTooltip();
            return true;
          });

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

          // Кастомний template для task content з логотипами
          gantt.templates.task_content = (start, end, task) => {
            if (task.type === "project") {
              return task.text;
            } else {
              const platform = task.source || 'DIRECT';
              const guestName = task.guest_name || task.text || 'Гість';
              const price = task.price ? `AED ${task.price}` : 'N/A';
              const status = task.status || 'PENDING';
              
              // Отримуємо URL логотипу платформи
              const getPlatformLogo = (source: string) => {
                switch (source.toUpperCase()) {
                  case 'AIRBNB':
                    return 'https://images.icon-icons.com/2108/PNG/512/airbnb_icon_131000.png';
                  case 'BOOKING_COM':
                    return 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Booking.com_Icon_2022.svg';
                  default:
                    return null;
                }
              };

              const logoUrl = getPlatformLogo(platform);
              
              // Створюємо HTML з логотипом та текстом
              let content = '';
              
              if (logoUrl) {
                content += `<img src="${logoUrl}" style="width: 16px; height: 16px; margin-right: 4px; vertical-align: middle;" alt="${platform} logo" />`;
              }
              
              content += `${platform} | ${guestName} | ${price} | ${status}`;
              
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

          // Функції для tooltip
          const showReservationTooltip = (task: any, event: any) => {
            // Прибираємо попередній tooltip якщо він є
            hideReservationTooltip();

            // Створюємо tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'reservation-tooltip';
            tooltip.style.cssText = `
              position: absolute;
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              padding: 16px;
              z-index: 1000;
              max-width: 320px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 14px;
              line-height: 1.4;
              pointer-events: none;
            `;

            // Отримуємо дані резервації
            const reservation = reservations.find(r => r.id === task.reservationId || r.id === task.id.replace('res_', ''));
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
                default:
                  return null;
              }
            };

            const logoUrl = getPlatformLogo(task.source || 'DIRECT');

            // Створюємо контент tooltip в стилі зображення
            tooltip.innerHTML = `
              <div style="margin-bottom: 8px;">
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 8px; color: #374151;">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                  <span style="color: #374151; font-size: 14px;">
                    ${logoUrl ? `<img src="${logoUrl}" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: middle;" alt="${task.source} logo" />` : ''}
                    ${task.source || 'DIRECT'}
                  </span>
                </div>
                
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px; color: #059669;">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span style="color: #374151; font-size: 14px;">Reservation • ${nights} nights</span>
                </div>
                
                <div style="color: #374151; font-size: 14px; margin-bottom: 8px;">
                  ${formatDate(reservation?.checkIn || task.start_date)} → ${formatDate(reservation?.checkOut || task.end_date)}
                </div>
              </div>
              
              <div style="margin-bottom: 4px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display: inline; margin-right: 8px; vertical-align: middle; color: #374151;">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
                <span style="color: #374151; font-size: 14px;">${property?.name || 'Unknown Property'}</span>
              </div>
              
              <div style="margin-bottom: 4px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display: inline; margin-right: 8px; vertical-align: middle; color: #374151;">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span style="color: #374151; font-size: 14px;">
                  ${reservation?.guestName || task.guest_name || 'Unknown Guest'} ${reservation?.totalAmount || task.price ? `${reservation?.totalAmount || task.price} AED` : ''} • ${task.guest_amount || 1} guest${(task.guest_amount || 1) > 1 ? 's' : ''}
                </span>
              </div>
              
              <div style="margin-bottom: 4px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display: inline; margin-right: 8px; vertical-align: middle; color: #374151;">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span style="color: #374151; font-size: 14px;">AED ${reservation?.totalAmount || task.price || 0} total</span>
              </div>
              
              ${reservation?.totalAmount && reservation?.paidAmount && (reservation.totalAmount - reservation.paidAmount) > 0 ? `
                <div style="margin-bottom: 4px; color: #EA580C; font-size: 14px;">
                  <strong>AED ${reservation.totalAmount - reservation.paidAmount} Unpaid</strong>
                </div>
                <div style="margin-bottom: 8px; color: #EA580C; font-size: 14px;">
                  <strong>AED ${reservation.totalAmount - reservation.paidAmount} Payout</strong>
                </div>
              ` : ''}
              
              <div style="color: #6B7280; font-size: 14px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display: inline; margin-right: 8px; vertical-align: middle;">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                Added by ${reservation?.agentName || 'System'} on ${new Date(task.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            `;

            // Додаємо tooltip до body
            document.body.appendChild(tooltip);
            currentTooltip = tooltip;

            // Позиціонуємо tooltip
            const rect = event.target.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 10;

            // Перевіряємо чи tooltip виходить за межі екрану
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
              left = window.innerWidth - tooltipRect.width - 10;
            }
            if (top < 10) {
              top = rect.bottom + 10;
            }

            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
          };

          const hideReservationTooltip = () => {
            if (currentTooltip) {
              currentTooltip.remove();
              currentTooltip = null;
            }
          };

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

          // --- ПОВНИЙ КОНТРОЛЬ НАД СТВОРЕННЯМ ЗАВДАНЬ ---
          
          // 1. Вимикаємо стандартний drag-n-drop для створення
          gantt.config.drag_create = false;
          
          // 2. Перехоплюємо подію, коли користувач намагається створити завдання
          gantt.attachEvent("onTaskCreated", function (task: any) {
            console.log('🔄 onTaskCreated: Intercepting task creation', { task });
            
            // 3. Створюємо новий ID для нашого завдання
            const newTaskId = gantt.uid();
            
            // 4. Створюємо об'єкт завдання з УСІМА необхідними полями
            const newTask = {
              id: newTaskId,
              text: "New Reservation",
              start_date: task.start_date,
              end_date: task.end_date,
              duration: task.duration || 1,
              parent: task.parent,
              
              // --- ВАШІ ОБОВ'ЯЗКОВІ ПОЛЯ З ДЕФОЛТНИМИ ЗНАЧЕННЯМИ ---
              guest_email: "guest@example.com",
              guest_phone: "+380000000000",
              source: "DIRECT",
              guest_amount: 1,
              status: "PENDING",
              price: "0",
              totalAmount: 0
            };
            
            console.log('✅ Creating fully prepared task:', newTask);
            
            // 5. Вручну додаємо це повністю готове завдання в Gantt
            gantt.addTask(newTask);
            
            // 6. Вручну відкриваємо лайтбокс для нього
            setTimeout(() => {
              gantt.showLightbox(newTaskId);
            }, 100);
            
            // 7. Повертаємо false, щоб запобігти стандартній обробці
            return false;
          });

          // DataProcessor для збереження змін через API з router
          const dp = gantt.createDataProcessor({
            router: async (entity: string, action: string, data: any, id: any) => {
              console.log(`📊 DataProcessor Router: ${entity} ${action}`, { data, id });
              
              try {
                // Працюємо тільки з резерваціями (task entity)
                if (entity === "task") {
                  // Ігноруємо проекти (квартири) - вони не змінюються через планувальник
                  if (data.type === "project") {
                    console.log('⚠️ Skipping project modification (read-only in scheduler)');
                    return { id: id };
                  }

                  // Витягуємо ID резервації з префіксу
                  const extractReservationId = (ganttId: string): string => {
                    // ganttId формат: "res_123" або "res_1759764990604"
                    const match = ganttId.match(/^res_(.+)$/);
                    return match ? match[1] : ganttId;
                  };

                  // Витягуємо ID квартири з батьківського task
                  const extractPropertyId = (parentGanttId: string): string => {
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
                      console.log('➕ CREATE: New reservation via API...');
                      console.log('🔍 Raw Gantt data:', data);
                      
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
                      // ✅ НОВЕ: Використовуємо дані з lightbox замість заглушок
                      const reservationData = {
                        propertyId: propertyId,
                        checkIn: checkIn,
                        checkOut: checkOut,
                        guests: Number(data.guest_amount) || 1,  // ✅ Виправлено: завжди число
                        guestName: data.text || 'New Guest',
                        guestEmail: data.guest_email || 'guest@example.com',  // ✅ З lightbox!
                        guestPhone: data.guest_phone || '+380000000000',      // ✅ З lightbox!
                        source: data.source || 'DIRECT',                      // ✅ З lightbox!
                        status: data.status || 'PENDING',                     // ✅ З lightbox!
                        totalAmount: parseFloat(data.price) || 0,             // ✅ З lightbox!
                        paidAmount: 0,
                        notes: data.notes || '',
                        specialRequests: data.notes || ''
                        // ✅ НЕ ВКЛЮЧАЄМО reservationId!
                      };

                      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      console.log('📤 FINAL API PAYLOAD DEBUG:');
                      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      console.log('🔍 Payload keys:', Object.keys(reservationData));
                      console.log('🔍 Payload values:', Object.values(reservationData));
                      console.log('🔍 Payload types:', Object.entries(reservationData).map(([k, v]) => `${k}: ${typeof v}`));
                      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      console.log('📋 JSON payload:', JSON.stringify(reservationData, null, 2));
                      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      console.log('📤 API CREATE URL: POST /api/v2/reservations (NO ID!)');

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
                        throw new Error('Failed to create reservation');
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
                // Прибрано детальне логування помилок - не заважає роботі
                console.error('❌ DataProcessor error:', error.message);
                
                // Показуємо помилку користувачу
                let errorMessage = 'Unknown error';
                
                if (error.response?.data?.message) {
                  errorMessage = error.response.data.message;
                } else if (error.response?.data?.error) {
                  errorMessage = error.response.data.error;
                } else if (error.response?.data) {
                  errorMessage = JSON.stringify(error.response.data);
                } else if (error.message) {
                  errorMessage = error.message;
                }
                
                // Прибрано повідомлення про помилку - не заважає роботі
                // gantt.message({
                //   text: `❌ Помилка: ${errorMessage}`,
                //   type: "error",
                //   expire: 5000
                // });
                
                // Повертаємо помилку для Gantt
                throw error;
              }
            }
          });

          // ВАЖЛИВО! Синхронізуємо ID після створення
          dp.attachEvent("onAfterUpdate", function(id: any, action: string, tid: any, response: any){
            console.log('🔄 onAfterUpdate:', { id, action, tid, response });
            
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
              
              if (reservationId) {
                // Замінюємо тимчасовий ID (id) на реальний ID з бекенду
                const newId = `${ID_PREFIXES.RESERVATION}${reservationId}`;
                console.log(`🔄 Changing task ID from "${id}" to "${newId}"`);
                
                try {
                  gantt.changeTaskId(id, newId);
                  console.log(`✅ Successfully changed task ID to "${newId}"`);
                } catch (error) {
                  console.warn(`⚠️ Failed to change task ID: ${error.message}`);
                }
              } else {
                console.warn('⚠️ No reservation ID found in response:', response);
              }
            }
          });

          console.log(`🎯 Gantt loaded with ${ganttTasks.length} tasks from ${properties.length > 0 ? 'API' : 'mock data'}`);
        }
      };

      document.body.appendChild(script);

      return () => {
        // Cleanup tooltip
        hideReservationTooltip();
        
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
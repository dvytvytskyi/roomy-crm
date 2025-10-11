'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import { propertyServiceAdapted } from '../../lib/api/adapters/apiAdapter';
import { reservationServiceAdapted } from '../../lib/api/adapters/apiAdapter';

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
    status: reservation.status || 'pending',
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

        setProperties(propertiesData);
        setReservations(reservationsData);

        console.log(`✅ Data loaded: ${propertiesData.length} properties, ${reservationsData.length} reservations`);
        console.log('🔍 Properties sample:', propertiesData[0]);
        console.log('🔍 Reservations sample:', reservationsData[0]);

      } catch (error) {
        console.error('❌ Error loading data:', error);
        handleApiError(error, 'Data loading');
        setProperties([]);
        setReservations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []); // Запускаємо тільки один раз при монтуванні

  // Функція для створення split tasks (бронювань)
  const onDragEnd = (startPoint: any, endPoint: any, startDate: any, endDate: any, tasksBetweenDates: any, tasksInRow: any) => {
    if (tasksInRow.length === 1) {
      const currentTask = tasksInRow[0];
      
      if (currentTask.type === "project") {
        // Створюємо нову частину split task (бронювання)
        const newReservationId = "res_" + Date.now();
        ganttRef.current.addTask({
          id: newReservationId,
          text: "New Reservation",
          start_date: ganttRef.current.roundDate(startDate),
          end_date: ganttRef.current.roundDate(endDate),
          status: "pending",
          guest_amount: 1
        }, currentTask.id);
        
        // Відкриваємо модалку для редагування нового бронювання
        setTimeout(() => {
          try {
            if (ganttRef.current && ganttRef.current.getTask(newReservationId)) {
              ganttRef.current.showLightbox(newReservationId);
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
          guest_amount: 1
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
        /* Стилі для проектів (квартир) */
        .gantt_task_line[data-type="project"] {
          background: #f8f9fa !important;
          border-left: 4px solid #007bff !important;
          font-weight: bold !important;
        }
        
          /* Стилі для бронювань (частини split tasks) */
          .gantt_task_line[data-status="pending"] {
            background: #fff3cd !important;
            border: 2px solid #ffc107 !important;
            color: #856404 !important;
          }
          
          .gantt_task_line[data-status="paid"] {
            background: #d4edda !important;
            border: 2px solid #28a745 !important;
            color: #155724 !important;
          }
          
          .gantt_task_line[data-status="booked"] {
            background: #cce5ff !important;
            border: 2px solid #007bff !important;
            color: #004085 !important;
          }
        
        /* Загальні стилі */
        .gantt_task_line {
          border-radius: 4px !important;
        }
        
        .gantt_task_content {
          font-size: 12px !important;
          font-weight: 500 !important;
        }
        
        /* Стилі для split tasks */
        .gantt_split_task {
          margin: 2px !important;
        }
        
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

          // Налаштування колонок (назви квартир + кнопка додавання)
          gantt.config.columns = [
            { name: "text", label: "Квартира", width: "*", tree: false },
            { name: "add", label: "", width: 44 }
          ];

          // Налаштування для кращого вигляду
          gantt.config.date_format = "%d-%m-%Y";
          gantt.config.scale_height = 50;
          
          // Сучасний API для scales (як у вашому прикладі)
          gantt.config.scales = [
            { unit: "month", step: 1, format: "%F, %Y" },
            { unit: "day", step: 1, format: "%j, %D" }
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
            { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
            { name: "status", height: 22, map_to: "status", type: "select", options: [
              { key: "paid", label: "Paid" },
              { key: "pending", label: "Pending" },
              { key: "booked", label: "Booked" }
            ]},
            { name: "guest_amount", height: 22, map_to: "guest_amount", type: "select", options: [
              { key: 1, label: "1" },
              { key: 2, label: "2" },
              { key: 3, label: "3" },
              { key: 4, label: "4" },
              { key: 5, label: "5" },
              { key: 6, label: "6" }
            ]},
            { name: "time", type: "duration", map_to: "auto" }
          ];

          // Налаштування локалізації
          gantt.locale.labels.section_description = "Name";
          gantt.locale.labels.section_status = "Status";
          gantt.locale.labels.section_guest_amount = "Guest amount";
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
                { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
                { name: "status", height: 22, map_to: "status", type: "select", options: [
                  { key: "paid", label: "Paid" },
                  { key: "pending", label: "Pending" },
                  { key: "booked", label: "Booked" }
                ]},
                { name: "guest_amount", height: 22, map_to: "guest_amount", type: "select", options: [
                  { key: 1, label: "1" },
                  { key: 2, label: "2" },
                  { key: 3, label: "3" },
                  { key: 4, label: "4" },
                  { key: 5, label: "5" },
                  { key: 6, label: "6" }
                ]},
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

          // Налаштування тексту в task
          gantt.templates.task_text = (start, end, task) => {
            if (task.type === "project") {
              return task.text;
            } else {
              const guestCount = task.guest_amount || 1;
              const status = task.status || 'pending';
              return `${task.text} (${guestCount} guest${guestCount > 1 ? 's' : ''}, ${status})`;
            }
          };

          // Ініціалізуємо Gantt
          gantt.init(containerRef.current);

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

          // DataProcessor для збереження змін
          gantt.createDataProcessor((entity: string, action: string, data: any, id: any) => {
            console.log(`${entity} ${action}`, data);
            gantt.message(`${entity} ${action}`);
            
            // Тут можна додати API виклик для збереження даних
            return Promise.resolve({ id: id });
          });

          console.log(`🎯 Gantt loaded with ${ganttTasks.length} tasks from ${properties.length > 0 ? 'API' : 'mock data'}`);
        }
      };

      document.body.appendChild(script);

      return () => {
        if (ganttRef.current) {
          ganttRef.current.destructor();
        }
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      };
    };

    loadGantt();
  }, [isLoading, ganttTasks.length]); // Залежить тільки від кількості задач, а не від самого масиву

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
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
      <div className="flex items-center justify-center h-96">
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
      <div className="flex items-center justify-center h-96">
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
      style={{ 
        width: "100%", 
        height: "100%",
        minHeight: "600px"
      }}
    />
  );
}
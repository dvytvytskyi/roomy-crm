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
  start_date: string;
  duration: number;
  order: number;
  progress: number;
  open?: boolean;
  parent?: string;
  type?: string;
  status?: string;
  guest_amount?: number;
}

// Базовий інтерфейс для екземпляра Gantt
interface GanttInstance {
  init: (container: HTMLElement) => void;
  parse: (data: { data: any[]; links: any[] }) => void;
  destructor: () => void;
  showLightbox: (taskId: string | number) => void;
  hideLightbox: () => void;
  getTask: (taskId: string | number) => any;
  addTask: (task: any, parentId?: string) => string | number;
  createTask: (task: any) => string | number;
  moveTask: (taskId: string, targetIndex: number, parentId: string) => void;
  calculateTaskLevel: (task: any) => void;
  attachEvent: (eventName: string, handler: (...args: any[]) => any) => string;
  detachAllEvents: () => void;
  getTaskByTime: () => any[];
  getState: () => any;
  roundDate: (date: any) => Date;
  message: (options: { text: string; expire: number }) => void;
  config: any; // config - це великий об'єкт, залишаємо any на початку
  plugins: (plugins: { [key: string]: boolean }) => void;
  locale: any;
  templates: any;
  createDataProcessor: (handler: (entity: string, action: string, data: any, id: any) => Promise<any>) => void;
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
  const ganttRef = useRef<GanttInstance | null>(null); // ПОКРАЩЕНА ТИПІЗАЦІЯ
  const timeoutIds = useRef<NodeJS.Timeout[]>([]); // НОВИЙ REF для зберігання ID таймерів
  const styleTagRef = useRef<HTMLStyleElement | null>(null); // НОВИЙ REF для CSS стилів

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
        // Фільтруємо бронювання за періодом календаря
        dateFrom: '2025-09-01',
        dateTo: '2027-09-30',
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
        const timeoutId = setTimeout(() => {
          try {
            if (ganttRef.current && ganttRef.current.getTask(newReservationId)) {
              ganttRef.current.showLightbox(newReservationId);
            }
          } catch (error) {
            console.warn("Could not open lightbox for new reservation:", error);
          }
        }, 300);
        timeoutIds.current.push(timeoutId); // ЗБЕРІГАЄМО ID
        
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
      
      // Створюємо мокові дані для нової квартири (1-3 вересня 2025)
      const mockReservation1 = {
        id: "res_mock_1_" + Date.now(),
        text: "Green Mock Reservation",
        start_date: "01-09-2025",
        duration: 2,
        parent: newPropertyId,
        progress: 1,
        status: "pending",
        guest_amount: 2
      };
      
      const mockReservation2 = {
        id: "res_mock_2_" + Date.now(),
        text: "Blue Mock Reservation", 
        start_date: "02-09-2025",
        duration: 2,
        parent: newPropertyId,
        progress: 1,
        status: "paid",
        guest_amount: 3
      };
      
      // Додаємо мокові резервації
      ganttRef.current.addTask(mockReservation1);
      ganttRef.current.addTask(mockReservation2);
      
      // Відкриваємо модалку для редагування нової квартири
      const timeoutId2 = setTimeout(() => {
        try {
          if (ganttRef.current && ganttRef.current.getTask(newPropertyId)) {
            ganttRef.current.showLightbox(newPropertyId);
          }
        } catch (error) {
          console.warn("Could not open lightbox for new property:", error);
        }
      }, 300);
      timeoutIds.current.push(timeoutId2); // ЗБЕРІГАЄМО ID
      
      ganttRef.current.message({
        text: "✅ Створено нову квартиру з моковими даними (1-3 вересня 2025). Заповніть деталі в модалці.",
        expire: 3000
      });
    }
  };

  // Функція ініціалізації Gantt
  const initializeGantt = () => {
    if (!ganttRef.current || !containerRef.current) {
      console.log('⚠️ Cannot initialize Gantt: missing refs');
      return;
    }
    
    const gantt = ganttRef.current;
    
    // Перевіряємо, чи Gantt вже ініціалізований
    if (gantt.isInitialized && gantt.isInitialized()) {
      console.log('⚠️ Gantt already initialized, skipping...');
      return;
    }

    // Додаткова перевірка на наявність необхідних методів
    if (!gantt.init || typeof gantt.init !== 'function') {
      console.error('❌ Gantt init method not available');
      return;
    }

    if (!gantt.parse || typeof gantt.parse !== 'function') {
      console.error('❌ Gantt parse method not available');
      return;
    }

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

    // Вимкнення стандартного обробника подвійного кліку
    gantt.config.dblclick_create = false;

    // Налаштування для split tasks
    gantt.config.open_split_tasks = false;
    gantt.config.multiselect = false;

    // Налаштування для приховування dropdown-ів
    gantt.config.show_task_cells = false;
    gantt.templates.grid_folder = (task: any) => {
      return ""; // Приховуємо стрілочку для всіх задач
    };

    // Налаштування Drag & Drop
    gantt.config.click_drag = {
      callback: onDragEnd,
      singleRow: true
    };

    // Налаштування lightbox секцій
    gantt.config.lightbox.sections = [
      { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
      { name: "status", height: 22, map_to: "status", type: "select", options: [
        { key: "paid", label: "Paid" },
        { key: "pending", label: "Pending" },
        { key: "booked", label: "Booked" }
      ] },
      { name: "guest_amount", height: 22, map_to: "guest_amount", type: "select", options: [
        { key: 1, label: "1" },
        { key: 2, label: "2" },
        { key: 3, label: "3" },
        { key: 4, label: "4" },
        { key: 5, label: "5" },
        { key: 6, label: "6" }
      ] },
      { name: "time", type: "duration", map_to: "auto" }
    ];

    // Локалізація
    gantt.locale.labels.section_description = "Name";
    gantt.locale.labels.section_status = "Status";
    gantt.locale.labels.section_guest_amount = "Guest amount";
    gantt.locale.labels.section_time = "Time period";

    // Динамічне налаштування секцій lightbox
    gantt.attachEvent("onBeforeLightbox", (id: string) => {
      console.log("onBeforeLightbox called with ID:", id);
      
      try {
        const task = gantt.getTask(id);
        
        if (!task) {
          console.warn("Task not found for lightbox:", id);
          return false;
        }
        
        console.log("Setting lightbox sections for task:", task);
        
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
          ] },
          { name: "guest_amount", height: 22, map_to: "guest_amount", type: "select", options: [
            { key: 1, label: "1" },
            { key: 2, label: "2" },
            { key: 3, label: "3" },
            { key: 4, label: "4" },
            { key: 5, label: "5" },
            { key: 6, label: "6" }
          ] },
          { name: "time", type: "duration", map_to: "auto" }
        ];
        }
        
        return true;
      } catch (error) {
        console.error("Error in onBeforeLightbox:", error);
        return false;
      }
    });

    // Templates для відображення
    gantt.templates.task_class = (start: any, end: any, task: any) => {
      if (task.type === "project") {
        return "project-row";
      } else {
        return `reservation-${task.status || 'pending'}`;
      }
    };

    gantt.templates.task_text = (start: any, end: any, task: any) => {
      if (task.type === "project") {
        return task.text;
      } else {
        return `${task.text} (${task.guest_amount || 1} guests, ${task.status || 'pending'})`;
      }
    };

    // КРОК 1: ІНІЦІАЛІЗАЦІЯ. Створює DOM і сховища даних.
    console.log('🔧 Initializing Gantt container...');
    gantt.init(containerRef.current);
    console.log('✅ Gantt container initialized');

    // КРОК 2: ЗАВАНТАЖЕННЯ ДАНИХ. Наповнює вже існуючі сховища.
    console.log('📊 Loading data into Gantt...');
    const fullData = {
      data: ganttTasks || [], // Використовуємо API дані або fallback до mock
      links: []
    };

    console.log('📊 Data to load:', fullData.data.length, 'tasks');
    gantt.parse(fullData);
    console.log('✅ Data loaded into Gantt');
    
    console.log(`🎯 Gantt loaded with ${ganttTasks.length} tasks from ${properties.length > 0 ? 'API' : 'mock data'}`);
    
    // Діагностика: показуємо всі завантажені задачі
    console.log("Loaded tasks:", gantt.getTaskByTime());
    console.log("Task IDs:", gantt.getTaskByTime().map(t => t.id));
    
    // Ховаємо рядки бронювань в grid (вони будуть відображатися тільки як split tasks)
    gantt.refreshData();

    // Обробник подвійного кліку для відкриття модалки
    gantt.attachEvent("onTaskDblClick", (id: string, e: Event) => {
      console.log("Double click on task ID:", id);
      
      try {
        // Спробуємо знайти задачу різними способами
        let task = gantt.getTask(id);
        
        if (!task) {
          // Якщо не знайшли за ID, спробуємо знайти в масиві задач
          const allTasks = gantt.getTaskByTime();
          task = allTasks.find(t => t.id === id);
        }
        
        if (!task) {
          // Спробуємо знайти за текстом або іншими властивостями
          gantt.eachTask((t) => {
            if (t.id === id || t.id.toString() === id.toString()) {
              task = t;
            }
          });
        }
        
        console.log("Found task:", task);
        
        if (task) {
          // Запобігаємо подвійному відкриттю модалки
          if (gantt.getState().lightbox_id) {
            gantt.hideLightbox();
          }
          
          // Відкриваємо модалку для всіх типів задач
          const timeoutId3 = setTimeout(() => {
            try {
              gantt.showLightbox(task.id);
            } catch (lightboxError) {
              console.error("Error opening lightbox:", lightboxError);
            }
          }, 100);
          timeoutIds.current.push(timeoutId3); // ЗБЕРІГАЄМО ID
        } else {
          console.warn("Task not found for ID:", id);
          // Показуємо всі доступні ID для діагностики
          console.log("Available task IDs:", gantt.getTaskByTime().map(t => t.id));
        }
      } catch (error) {
        console.error("Error in double click handler:", error);
      }
      return false; // запобігаємо стандартній поведінці
    });

    // Обробники подій lightbox
    gantt.attachEvent("onLightboxCancel", () => {
      console.log("Lightbox cancelled");
      return true;
    });

    gantt.attachEvent("onLightboxSave", (id: string, item: any, is_new: boolean) => {
      console.log("Lightbox saved for task:", id, item);
      return true;
    });

    // DataProcessor для збереження змін
    gantt.createDataProcessor(async (entity: string, action: string, data: any, id: any) => {
      console.log(`${entity} ${action}`, data);
      
      try {
        if (entity === 'task') {
          // Перевіряємо чи це резервація (має parent) чи property (project)
          const isReservation = data.parent && String(data.parent) !== '0';
          
          if (isReservation) {
            // ============================================
            // RESERVATION OPERATIONS
            // ============================================
            
            if (action === 'create') {
              // Створюємо нову резервацію
              console.log('📅 Creating new reservation via API...');
              
              // Calculate dates
              const startDate = new Date(data.start_date);
              const endDate = new Date(startDate);
              endDate.setDate(endDate.getDate() + (data.duration || 1));
              
              const response = await reservationServiceAdapted.create({
                propertyId: String(data.parent).replace('prop_', ''),
                guestName: data.text || 'New Guest',
                guestEmail: 'guest@example.com', // TODO: Prompt for email in modal
                checkIn: startDate.toISOString(),
                checkOut: endDate.toISOString(),
                guests: data.guest_amount || 1,
                totalAmount: 0, // TODO: Calculate from property price * nights
                source: 'DIRECT',
                status: data.status || 'PENDING',
                notes: 'Created via scheduler'
              });
              
              if (response.success && response.data) {
                console.log('✅ Reservation created successfully:', response.data);
                gantt.message({ text: '✅ Reservation created successfully!', expire: 3000 });
                
                // Return new ID with proper prefix
                return { 
                  id: `res_${response.data.id}`,
                  tid: `res_${response.data.id}`
                };
              } else {
                console.error('❌ Failed to create reservation:', response.error);
                gantt.message({ text: `❌ Error: ${response.error || 'Failed to create reservation'}`, expire: 5000 });
                return { id: id };
              }
            }
            
            if (action === 'update') {
              // Оновлюємо існуючу резервацію
              console.log('📅 Updating reservation via API...');
              
              const reservationId = String(id).replace('res_', '');
              
              // Calculate dates
              const startDate = new Date(data.start_date);
              const endDate = new Date(startDate);
              endDate.setDate(endDate.getDate() + (data.duration || 1));
              
              const response = await reservationServiceAdapted.update(reservationId, {
                guestName: data.text,
                checkIn: startDate.toISOString(),
                checkOut: endDate.toISOString(),
                guests: data.guest_amount,
                status: data.status,
              });
              
              if (response.success) {
                console.log('✅ Reservation updated successfully');
                gantt.message({ text: '✅ Reservation updated!', expire: 3000 });
                return { id: id };
              } else {
                console.error('❌ Failed to update reservation:', response.error);
                gantt.message({ text: `❌ Error: ${response.error || 'Failed to update'}`, expire: 5000 });
                return { id: id };
              }
            }
            
            if (action === 'delete') {
              // Видаляємо резервацію
              console.log('📅 Deleting reservation via API...');
              
              const reservationId = String(id).replace('res_', '');
              const response = await reservationServiceAdapted.delete(reservationId);
              
              if (response.success) {
                console.log('✅ Reservation deleted successfully');
                gantt.message({ text: '✅ Reservation deleted!', expire: 3000 });
                return { id: id };
              } else {
                console.error('❌ Failed to delete reservation:', response.error);
                gantt.message({ text: `❌ Error: ${response.error || 'Failed to delete'}`, expire: 5000 });
                return { id: id };
              }
            }
          } else {
            // ============================================
            // PROPERTY OPERATIONS
            // ============================================
            
            if (action === 'create') {
              // Створення property через scheduler поки що не підтримується
              console.log('⚠️ Property creation via scheduler not supported yet');
              gantt.message({ text: '⚠️ Property creation not supported. Please use Property page.', expire: 3000 });
              return { id: id };
            }
            
            if (action === 'update') {
              // Оновлення property через scheduler поки що не підтримується
              console.log('⚠️ Property update via scheduler not supported yet');
              gantt.message({ text: '⚠️ Property update not supported. Please use Property page.', expire: 3000 });
              return { id: id };
            }
            
            if (action === 'delete') {
              // Видалення property через scheduler не підтримується
              console.log('⚠️ Property deletion via scheduler not supported');
              gantt.message({ text: '⚠️ Property deletion not supported. Please use Property page.', expire: 3000 });
              return { id: id };
            }
          }
        }
        
        // Fallback for other entities or actions
        gantt.message({ text: `${entity} ${action}`, expire: 2000 });
        return Promise.resolve({ id: id });
        
      } catch (error) {
        console.error('❌ DataProcessor error:', error);
        gantt.message({ 
          text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          expire: 5000 
        });
        return Promise.resolve({ id: id });
      }
    });

    // Повідомлення користувачу
    gantt.message({
      text: "Клікніть та перетягніть для створення нового бронювання або нової квартири",
      expire: 5000
    });
  };

  // Ініціалізація Gantt після завантаження даних
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
      // Перевіряємо, чи вже ініціалізований Gantt
      if (ganttRef.current) {
        console.log('⚠️ Gantt instance already exists, cleaning up first...');
        try {
          // Перевіряємо чи Gantt повністю ініціалізований перед очищенням
          if (ganttRef.current.isInitialized && ganttRef.current.isInitialized()) {
            ganttRef.current.destructor();
            console.log('✅ Gantt destructor called');
          } else {
            console.log('⚠️ Gantt not fully initialized, skipping destructor');
          }
          containerRef.current!.innerHTML = '';
          ganttRef.current = null;
          console.log('✅ Gantt instance cleaned up');
        } catch (error) {
          console.error('Error cleaning up existing Gantt:', error);
          // Якщо помилка при очищенні, просто очищуємо контейнер
          try {
            containerRef.current!.innerHTML = '';
            ganttRef.current = null;
            console.log('✅ Container cleared after error');
          } catch (clearError) {
            console.error('Error clearing container:', clearError);
          }
        }
      }

      // Функція ініціалізації, яка буде викликана, коли все готово
      const startGantt = () => {
        console.log('🎯 startGantt called');
        
        if (!containerRef.current) {
          console.error('❌ Container ref not available');
          return;
        }
        
        if (!(window as any).gantt) {
          console.error('❌ Gantt object not available');
          return;
        }
        
        if (ganttRef.current) {
          console.log('⚠️ Gantt ref already exists, cleaning up...');
          try {
            // Перевіряємо чи Gantt повністю ініціалізований перед очищенням
            if (ganttRef.current.isInitialized && ganttRef.current.isInitialized()) {
              ganttRef.current.destructor();
              console.log('✅ Gantt destructor called');
            } else {
              console.log('⚠️ Gantt not fully initialized, skipping destructor');
            }
            containerRef.current.innerHTML = '';
            console.log('✅ Container cleared');
          } catch (error) {
            console.error('Error cleaning up existing Gantt:', error);
            // Якщо помилка при очищенні, просто очищуємо контейнер
            try {
              containerRef.current.innerHTML = '';
              console.log('✅ Container cleared after error');
            } catch (clearError) {
              console.error('Error clearing container:', clearError);
            }
          }
        }
        
        ganttRef.current = (window as any).gantt;
        console.log('✅ Gantt ref set, initializing...');
        
        try {
          initializeGantt();
          console.log('✅ Gantt initialization completed');
        } catch (error) {
          console.error('❌ Error initializing Gantt:', error);
        }
      };

      // Якщо об'єкт gantt вже є, просто запускаємо ініціалізацію
      if ((window as any).gantt) {
        console.log('Gantt object already available, starting initialization...');
        startGantt();
        return;
      }

      console.log('📦 Loading dhtmlxGantt CSS and JS...');
      
      // Завантажуємо CSS
      if (!document.querySelector('link[href*="dhtmlxgantt.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/dhtmlxGantt/codebase/dhtmlxgantt.css';
        document.head.appendChild(link);
        console.log('✅ CSS loaded');
      }

      // Додаємо кастомні стилі для split tasks
      if (!styleTagRef.current) { // Створюємо тільки якщо ще не створено
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
        
        /* Приховуємо стрілочки для всіх задач */
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
        
        /* Показуємо мокові резервації тільки на 1-3 вересня 2025 */
        .gantt_task_line[data-parent] {
          display: none !important;
        }
        
        /* Показуємо тільки мокові резервації */
        .gantt_task_line[data-task-id*="mock"] {
          display: block !important;
        }
      `;
        document.head.appendChild(style);
        styleTagRef.current = style; // ЗБЕРІГАЄМО ЕЛЕМЕНТ
      }

      // Завантажуємо JS
      if (!document.querySelector('script[src*="dhtmlxgantt.js"]')) {
        const script = document.createElement('script');
        script.src = '/dhtmlxGantt/codebase/dhtmlxgantt.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ JS script loaded');
          startGantt();
        };
        document.body.appendChild(script);
        console.log('📦 JS script loading...');
      } else {
        // Якщо скрипт є, але об'єкта `gantt` ще немає, чекаємо на нього
        console.log('Script exists but gantt object not ready, waiting...');
        const intervalId = setInterval(() => {
          if ((window as any).gantt) {
            clearInterval(intervalId);
            startGantt();
          }
        }, 100);
      }
    };

    loadGantt();

    // Cleanup function
    return () => {
      // Очищуємо всі таймери, які були заплановані
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];

      // Видаляємо тег стилів, якщо він існує
      if (styleTagRef.current) {
        styleTagRef.current.remove();
        styleTagRef.current = null;
      }

      if (ganttRef.current) {
        try {
          // Видаляємо всі обробники подій
          ganttRef.current.detachAllEvents();
          // Знищуємо Gantt
          ganttRef.current.destructor();
          // Очищуємо контейнер
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        } catch (error) {
          console.error('Error cleaning up Gantt:', error);
        }
      }
    };
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
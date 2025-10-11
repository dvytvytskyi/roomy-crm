'use client';

import { useEffect, useRef } from "react";

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

export default function GanttScheduler({ tasks }: GanttSchedulerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<any>(null);

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
        text: "✅ Створено нову квартиру з моковими даними (1-3 вересня 2025). Заповніть деталі в модалці.",
        expire: 3000
      });
    }
  };

  // Функція ініціалізації Gantt
  const initializeGantt = () => {
    if (!ganttRef.current || !containerRef.current) return;
    
    const gantt = ganttRef.current;

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

    // Ініціалізація Gantt
    gantt.init(containerRef.current);

    // Завантажуємо всі дані
    const fullData = {
      data: tasks.data, // Всі дані включаючи бронювання
      links: []
    };

    gantt.parse(fullData);
    
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
          setTimeout(() => {
            try {
              gantt.showLightbox(task.id);
            } catch (lightboxError) {
              console.error("Error opening lightbox:", lightboxError);
            }
          }, 100);
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
    gantt.createDataProcessor((entity: string, action: string, data: any, id: any) => {
      console.log(`${entity} ${action}`, data);
      gantt.message(`${entity} ${action}`);
      
      // Тут можна додати API виклик для збереження даних
      return Promise.resolve({ id: id });
    });

    // Повідомлення користувачу
    gantt.message({
      text: "Клікніть та перетягніть для створення нового бронювання або нової квартири",
      expire: 5000
    });
  };

  useEffect(() => {
    // Перевіряємо чи код виконується на клієнті
    if (typeof window === 'undefined') return;

    // Динамічно завантажуємо dhtmlxGantt
    const loadGantt = async () => {
      // Перевіряємо, чи вже ініціалізований Gantt
      if (ganttRef.current) {
        console.log('Gantt already initialized, skipping...');
        return;
      }

      // Завантажуємо CSS
      if (!document.querySelector('link[href*="dhtmlxgantt.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/dhtmlxGantt/codebase/dhtmlxgantt.css';
        document.head.appendChild(link);
      }

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

      // Завантажуємо JS
      if (!document.querySelector('script[src*="dhtmlxgantt.js"]')) {
        const script = document.createElement('script');
        script.src = '/dhtmlxGantt/codebase/dhtmlxgantt.js';
        script.async = true;

        script.onload = () => {
          if (containerRef.current && (window as any).gantt) {
            const gantt = (window as any).gantt;
            ganttRef.current = gantt;
            initializeGantt();
          }
        };

        document.body.appendChild(script);
      } else {
        // Скрипт вже завантажений, ініціалізуємо одразу
        if (containerRef.current && (window as any).gantt) {
          const gantt = (window as any).gantt;
          ganttRef.current = gantt;
          initializeGantt();
        }
      }
    };

    loadGantt();

    // Cleanup function
    return () => {
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
  }, []); // Видаляємо залежність від tasks

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
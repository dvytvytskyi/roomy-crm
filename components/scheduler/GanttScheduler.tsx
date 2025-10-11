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
          if (ganttRef.current && ganttRef.current.getTask(newReservationId)) {
            ganttRef.current.showLightbox(newReservationId);
          }
        }, 200);
        
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
        if (ganttRef.current && ganttRef.current.getTask(newPropertyId)) {
          ganttRef.current.showLightbox(newPropertyId);
        }
      }, 200);
      
      ganttRef.current.message({
        text: "✅ Створено нову квартиру. Заповніть деталі в модалці.",
        expire: 3000
      });
    }
  };

  useEffect(() => {
    // Перевіряємо чи код виконується на клієнті
    if (typeof window === 'undefined') return;

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
            const task = gantt.getTask(id);
            
            if (task && task.type === "project") {
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
          const propertiesOnly = tasks.data.filter(task => task.type === "project");
          
          // Створюємо повну структуру з бронюваннями як частини split tasks
          const fullData = {
            data: tasks.data, // Всі дані включаючи бронювання
            links: []
          };

          // Завантажуємо всі дані
          gantt.parse(fullData);
          
          // Ховаємо рядки бронювань в grid (вони будуть відображатися тільки як split tasks)
          gantt.refreshData();

          // Обробник подвійного кліку для відкриття модалки
          gantt.attachEvent("onTaskDblClick", (id: string, e: Event) => {
            const task = gantt.getTask(id);
            if (task) {
              // Відкриваємо модалку для всіх типів задач
              gantt.showLightbox(id);
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
  }, [tasks]);

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


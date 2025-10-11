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
        ganttRef.current.addTask({
          text: "Нове бронювання",
          start_date: ganttRef.current.roundDate(startDate),
          end_date: ganttRef.current.roundDate(endDate),
          guest: "Новий гість",
          price: 0,
          status: "pending"
        }, currentTask.id);
        
        ganttRef.current.message({
          text: "✅ Бронювання створено для " + currentTask.text,
          expire: 2000
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
          text: "Нове бронювання",
          start_date: ganttRef.current.roundDate(startDate),
          end_date: ganttRef.current.roundDate(endDate),
          guest: "Новий гість",
          price: 0,
          status: "pending"
        }, newProject);
        
        ganttRef.current.calculateTaskLevel(currentTask);
      }
    } else if (tasksInRow.length === 0) {
      // Створюємо новий проект (квартиру)
      const projectName = "Квартира #" + (Date.now() % 100);
      ganttRef.current.createTask({
        text: projectName,
        render: "split",
        type: "project",
        start_date: ganttRef.current.roundDate(startDate),
        duration: 365
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
        
        .gantt_task_line[data-status="confirmed"] {
          background: #d4edda !important;
          border: 2px solid #28a745 !important;
          color: #155724 !important;
        }
        
        .gantt_task_line[data-status="cancelled"] {
          background: #f8d7da !important;
          border: 2px solid #dc3545 !important;
          color: #721c24 !important;
          text-decoration: line-through !important;
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
            { name: "text", label: "Квартира", width: "*", tree: false },
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

          // Налаштування для split tasks
          gantt.config.open_split_tasks = true;
          gantt.config.multiselect = true;
          
          // Приховуємо дропдаун для проектів (квартир)
          gantt.config.show_task_cells = false;
          
          // Показуємо тільки батьківські задачі в grid (тільки квартири)
          gantt.templates.grid_row_class = (start, end, task) => {
            if (task.type !== "project") {
              return "gantt_hidden_row";
            }
            return "";
          };
          
          gantt.templates.grid_folder = (task) => {
            return ""; // Приховуємо стрілочку для всіх задач
          };
          
          gantt.config.click_drag = {
            callback: onDragEnd,
            singleRow: true
          };

          // Налаштування lightbox для бронювань
          gantt.config.lightbox.sections = [
            { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
            { name: "guest", height: 22, map_to: "guest", type: "text" },
            { name: "price", height: 22, map_to: "price", type: "text" },
            { name: "status", height: 22, map_to: "status", type: "select", options: [
              { key: "pending", label: "Очікує" },
              { key: "confirmed", label: "Підтверджено" },
              { key: "cancelled", label: "Скасовано" }
            ]},
            { name: "time", type: "duration", map_to: "auto" }
          ];

          // Налаштування локалізації
          gantt.locale.labels.section_guest = "Гість";
          gantt.locale.labels.section_price = "Ціна";
          gantt.locale.labels.section_status = "Статус";

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
              return `${task.guest || 'Гість'} (${task.price || 0}₴)`;
            }
          };

          // Ініціалізуємо Gantt
          gantt.init(containerRef.current);

          // Показуємо повідомлення про можливість створення split tasks
          gantt.message({
            text: "Клікніть та перетягніть для створення нового бронювання або нової квартири",
            expire: 5000
          });

          // Фільтруємо дані - показуємо тільки квартири (projects)
          const filteredTasks = {
            data: tasks.data.filter(task => task.type === "project"),
            links: []
          };

          // Завантажуємо відфільтровані дані
          gantt.parse(filteredTasks);
          
          // Додаємо бронювання як частини split tasks
          tasks.data.filter(task => task.type !== "project").forEach(reservation => {
            gantt.addTask(reservation, reservation.parent);
          });

          // Обробник подвійного кліку для відкриття модалки
          gantt.attachEvent("onTaskDblClick", (id: string, e: Event) => {
            const task = gantt.getTask(id);
            if (task.type !== "project") {
              gantt.showLightbox(id);
              return false; // запобігаємо стандартній поведінці
            }
            return true;
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


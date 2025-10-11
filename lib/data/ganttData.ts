export function getGanttData() {
  const tasks = {
    data: [
      // Properties (квартири) - основні рядки як split tasks
      {
        id: "prop_1",
        text: "Квартира #1 - Центр міста",
        type: "project",
        render: "split",
        start_date: "01-10-2025",
        duration: 365,
        progress: 0,
        open: true,
        parent: 0,
      },
      {
        id: "prop_2", 
        text: "Квартира #2 - Біля парку",
        type: "project",
        render: "split",
        start_date: "01-10-2025",
        duration: 365,
        progress: 0,
        open: true,
        parent: 0,
      },
      {
        id: "prop_3",
        text: "Квартира #3 - Поруч з метро",
        type: "project",
        render: "split",
        start_date: "01-10-2025",
        duration: 365,
        progress: 0,
        open: true,
        parent: 0,
      },
      
      // Приклади бронювань (частини split tasks)
      {
        id: "res_1",
        text: "Іван Петренко (1500₴)",
        start_date: "15-10-2025",
        duration: 5,
        parent: "prop_1",
        progress: 1,
        status: "confirmed",
        guest: "Іван Петренко",
        price: 1500
      },
      {
        id: "res_2", 
        text: "Марія Сидоренко (1200₴)",
        start_date: "25-10-2025",
        duration: 3,
        parent: "prop_1",
        progress: 1,
        status: "confirmed",
        guest: "Марія Сидоренко", 
        price: 1200
      },
      {
        id: "res_3",
        text: "Олексій Коваленко (1800₴)",
        start_date: "20-11-2025",
        duration: 7,
        parent: "prop_2",
        progress: 1,
        status: "confirmed",
        guest: "Олексій Коваленко",
        price: 1800
      }
    ],
    links: [], // Для бронювань зв'язки не потрібні
  };
  return tasks;
}

// Типи для TypeScript
export interface GanttTask {
  id: string;
  text: string;
  start_date: string | null;
  duration: number | null;
  order: number;
  progress: number | null;
  open?: boolean;
  parent?: string;
  type: "property" | "reservation";
  status?: "confirmed" | "pending" | "cancelled";
  guest?: string;
  price?: number;
}

export interface GanttLink {
  id: number;
  source: string | number;
  target: string | number;
  type: string;
}

export interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}


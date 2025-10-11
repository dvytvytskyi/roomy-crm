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
        text: "Ivan Petrenko",
        start_date: "15-10-2025",
        duration: 5,
        parent: "prop_1",
        progress: 1,
        status: "paid",
        guest_amount: 2
      },
      {
        id: "res_2", 
        text: "Maria Sydorenko",
        start_date: "25-10-2025",
        duration: 3,
        parent: "prop_1",
        progress: 1,
        status: "booked",
        guest_amount: 1
      },
      {
        id: "res_3",
        text: "Oleksiy Kovalenko",
        start_date: "20-11-2025",
        duration: 7,
        parent: "prop_2",
        progress: 1,
        status: "pending",
        guest_amount: 4
      },
      
      // Мокові дані для квартири #1 (1-3 вересня 2025)
      {
        id: "res_mock_1_prop_1",
        text: "Green Mock Reservation",
        start_date: "01-09-2025",
        duration: 2,
        parent: "prop_1",
        progress: 1,
        status: "pending",
        guest_amount: 2
      },
      {
        id: "res_mock_2_prop_1",
        text: "Blue Mock Reservation",
        start_date: "02-09-2025", 
        duration: 2,
        parent: "prop_1",
        progress: 1,
        status: "paid",
        guest_amount: 3
      },
      
      // Мокові дані для квартири #2 (1-3 вересня 2025)
      {
        id: "res_mock_1_prop_2",
        text: "Green Mock Reservation",
        start_date: "01-09-2025",
        duration: 2,
        parent: "prop_2",
        progress: 1,
        status: "pending",
        guest_amount: 2
      },
      {
        id: "res_mock_2_prop_2",
        text: "Blue Mock Reservation",
        start_date: "02-09-2025",
        duration: 2,
        parent: "prop_2",
        progress: 1,
        status: "paid",
        guest_amount: 3
      },
      
      // Мокові дані для квартири #3 (1-3 вересня 2025)
      {
        id: "res_mock_1_prop_3",
        text: "Green Mock Reservation",
        start_date: "01-09-2025",
        duration: 2,
        parent: "prop_3",
        progress: 1,
        status: "pending",
        guest_amount: 2
      },
      {
        id: "res_mock_2_prop_3",
        text: "Blue Mock Reservation",
        start_date: "02-09-2025",
        duration: 2,
        parent: "prop_3",
        progress: 1,
        status: "paid",
        guest_amount: 3
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
  order?: number;
  progress: number | null;
  open?: boolean;
  parent?: string;
  type?: "project" | "property";
  status?: "paid" | "pending" | "booked";
  guest_amount?: number;
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


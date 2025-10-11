// Типи для dhtmlxGantt
declare global {
  interface Window {
    gantt: any;
  }
}

export interface GanttConfig {
  date_format: string;
  scale_unit: string;
  step: number;
  date_scale: string;
  subscales?: Array<{
    unit: string;
    step: number;
    date: string;
  }>;
}

export interface GanttTask {
  id: string;
  text: string;
  start_date: string;
  duration: number;
  order: number;
  progress: number;
  open?: boolean;
  parent?: string;
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

export interface GanttInstance {
  init: (container: HTMLElement) => void;
  parse: (data: GanttData) => void;
  destructor: () => void;
  config: GanttConfig;
  message: (text: string) => void;
  createDataProcessor: (handler: DataProcessorHandler) => void;
}

export type DataProcessorHandler = (
  entity: string,
  action: string,
  data: any,
  id: any
) => Promise<{ id: any; tid?: any }>;

export {};


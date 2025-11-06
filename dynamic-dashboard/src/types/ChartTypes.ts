// src/types/ChartTypes.ts

export type ChartType = "bar" | "pie" | "line" | "table";

export interface ChartDataItem {
  [key: string]: any;
}

export interface WidgetData {
  database: string;
  collection: string;
  query?: any;
  projection?: any;
  xField?: string;
  yField?: string;
  branch?: string;
}

export interface WidgetItem {
  id: number;
  type: ChartType;
  data: WidgetData;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface SavedLayout {
  id: string;
  layoutName: string;
  createdAt: string;
}

export interface LayoutWithWidgets extends SavedLayout {
  widgets: WidgetItem[];
}
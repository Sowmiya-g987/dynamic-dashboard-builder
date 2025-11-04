// src/types/ChartTypes.ts

export interface ChartDataItem {
  [key: string]: string | number;
}


export type ChartType = "bar" | "pie" | "line" | "table";

export interface WidgetData {
  schemaName: string;  
  xField: string;     
  yField: string;      
  branch?: string;     
}

export interface WidgetItem {
  id: number;
  type: ChartType;
  data: WidgetData;
  position: { x: number; y: number; w: number; h: number };
}


export interface WidgetDataResponse {
  widgetId: number;
  data: ChartDataItem[];
  error?: string;
}


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}


export interface SavedLayout {
  id: string;
  layoutName: string;
  createdAt: string;
}


export interface LayoutWithWidgets extends SavedLayout {
  widgets: WidgetItem[];
}
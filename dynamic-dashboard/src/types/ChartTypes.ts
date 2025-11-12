// src/types/ChartTypes.ts

export interface ChartDataItem {
  [key: string]: string | number;
}


export type ChartType = "bar" | "pie" | "line" | "table";


export interface WidgetData {
  database: string;      // PostgreSQL database name (e.g., "salesDB")
  collection: string;    // PostgreSQL table name (e.g., "branchstats")
  query?: any;          // WHERE clause conditions (e.g., { branch: "Chennai" })
  projection?: any;     // SELECT fields (e.g., { branch: 1, NofEmployee: 1 })
  xField: string;       // Field for X-axis (e.g., "branch")
  yField: string;       // Field for Y-axis (e.g., "NofEmployee")
  branch?: string;      // Optional: specific branch filter
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
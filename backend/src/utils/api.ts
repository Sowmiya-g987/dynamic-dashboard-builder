// src/types/ChartTypes.ts

/**
 * Chart data item (dynamic structure)
 */
export interface ChartDataItem {
  [key: string]: string | number;
}

/**
 * Supported chart types
 */
export type ChartType = "bar" | "pie" | "line" | "table";

/**
 * Widget data configuration (NO URLs - only field names)
 */
export interface WidgetData {
  schemaName: string;  // MongoDB collection name (e.g., "branchstats")
  xField: string;      // Field for X-axis (e.g., "branch")
  yField: string;      // Field for Y-axis (e.g., "NofEmployee")
  branch?: string;     // Optional: specific branch filter
}

/**
 * Complete widget configuration
 */
export interface WidgetItem {
  id: number;
  type: ChartType;
  data: WidgetData;
  position: { x: number; y: number; w: number; h: number };
}

/**
 * API Response when fetching widget data
 */
export interface WidgetDataResponse {
  widgetId: number;
  data: ChartDataItem[];
  error?: string;
}

/**
 * API Response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Layout structure
 */
export interface SavedLayout {
  id: string;
  layoutName: string;
  createdAt: string;
}

/**
 * Full layout with widgets
 */
export interface LayoutWithWidgets extends SavedLayout {
  widgets: WidgetItem[];
}
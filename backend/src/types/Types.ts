// backend/src/types/types.ts


export interface WidgetConfig {
  id: number;
  type: "bar" | "pie" | "line" | "table";
  data: {
    schemaName: string;  
    xField: string;      
    yField: string;      
    branch?: string;     
  };
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}


export interface LayoutConfig {
  layoutName?: string;
  widgets: WidgetConfig[];
}


export interface FetchDataRequest {
  widgets: WidgetConfig[];
}


export interface FetchDataResponse {
  widgetId: number;
  data: any[];
  error?: string;
}


export interface QueryParams {
  schemaName: string;
  xField: string;
  yField: string;
  branch?: string;
}
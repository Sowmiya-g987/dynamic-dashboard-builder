// ============================================================================
// FILE: backend/src/types/Types.ts
// ============================================================================

export interface WidgetConfig {
  id: number;
  type: string;
  data: {
    database: string;
    collection: string;
    query?: any;
    projection?: any;
    xField?: string;
    yField?: string;
    branch?: string;
  };
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface FetchDataRequest {
  widgets: WidgetConfig[];
}

export interface QueryResult {
  widgetId: number;
  data: any[];
  error: string | null;
}

export interface DatabaseSchema {
  database: string;
  collections: string[];
}
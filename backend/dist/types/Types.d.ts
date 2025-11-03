/**
 * Widget configuration sent from frontend
 */
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
/**
 * Layout structure with multiple widgets
 */
export interface LayoutConfig {
    layoutName?: string;
    widgets: WidgetConfig[];
}
/**
 * Request to fetch data for widgets
 */
export interface FetchDataRequest {
    widgets: WidgetConfig[];
}
/**
 * Response with data for each widget
 */
export interface FetchDataResponse {
    widgetId: number;
    data: any[];
    error?: string;
}
/**
 * Query parameters for dynamic data fetching
 */
export interface QueryParams {
    schemaName: string;
    xField: string;
    yField: string;
    branch?: string;
}
//# sourceMappingURL=Types.d.ts.map
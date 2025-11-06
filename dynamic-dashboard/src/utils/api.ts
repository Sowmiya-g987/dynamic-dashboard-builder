
// ============================================================================
// FILE: src/utils/api.ts
// ============================================================================

import type { WidgetItem, ChartDataItem } from "../types/ChartTypes";

const API_BASE_URL = "http://localhost:8080/api";

export interface QueryResult {
  widgetId: number;
  data: ChartDataItem[];
  error: string | null;
}

export const dataApi = {
  async fetchWidgetData(widgets: WidgetItem[]): Promise<QueryResult[]> {
    try {
      console.log("📤 [API] Sending fetch request for", widgets.length, "widgets");
      
      const response = await fetch(`${API_BASE_URL}/data/fetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ widgets }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ [API] Fetch successful:", result.results.length, "results");
      
      return result.results;
    } catch (error) {
      console.error("❌ [API] Error fetching widget data:", error);
      throw error;
    }
  },

  async getAvailableDatabases(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/data/databases`);
      const result = await response.json();
      return result.databases || [];
    } catch (error) {
      console.error("❌ [API] Error fetching databases:", error);
      return [];
    }
  },

  async getCollections(database: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/data/databases/${database}/collections`);
      const result = await response.json();
      return result.collections || [];
    } catch (error) {
      console.error("❌ [API] Error fetching collections:", error);
      return [];
    }
  }
};

export const layoutApi = {
 async saveLayout(layoutName: string, widgets: WidgetItem[]) {
  const response = await fetch(`${API_BASE_URL}/savedlayouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layoutName, widgets }),
  });

  const data = await response.json();

  console.log("saveLayout response:", data);

  if (!response.ok) {
    throw new Error(data.message || "Failed to save layout");
  }

  return data;
},

  async getLayoutById(layoutId: string) {
    const response = await fetch(`${API_BASE_URL}/savedlayouts/${layoutId}`);
    const result = await response.json();
    return result.layout;
  },

  async updateLayout(layoutId: string, widgets: WidgetItem[]) {
    const response = await fetch(`${API_BASE_URL}/savedlayouts/${layoutId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgets }),
    });
    return response.json();
  },

  async updateLayoutName(layoutId: string, layoutName: string) {
    const response = await fetch(`${API_BASE_URL}/savedlayouts/${layoutId}/name`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layoutName }),
    });
    return response.json();
  },

  async getAllLayouts() {
    const response = await fetch(`${API_BASE_URL}/savedlayouts`);
    const result = await response.json();
    return result.layouts;
  },

  async deleteLayout(layoutId: string) {
    const response = await fetch(`${API_BASE_URL}/savedlayouts/${layoutId}`, {
      method: "DELETE",
    });
    return response.json();
  }
};

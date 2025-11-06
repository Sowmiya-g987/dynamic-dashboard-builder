// ============================================================================
// FILE: src/utils/api.ts (FIXED)
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
    console.log("💾 [API] Saving layout:", layoutName);
    const response = await fetch(`${API_BASE_URL}/savedlayouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layoutName, widgets }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save layout: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("✅ [API] Layout saved:", result.layout);
    return result.layout; // Returns: { id, layoutName, createdAt }
  },

  async getLayoutById(layoutId: string) {
    console.log("📂 [API] Loading layout:", layoutId);
    const response = await fetch(`${API_BASE_URL}/savedlayouts/${layoutId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load layout: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("✅ [API] Layout loaded:", result.layout);
    return result.layout;
  },

  async updateLayout(layoutId: string, widgets: WidgetItem[]) {
    console.log("🔄 [API] Updating layout:", layoutId);
    const response = await fetch(`${API_BASE_URL}/savedlayouts/${layoutId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgets }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update layout: ${response.statusText}`);
    }
    
    return response.json();
  },

  async updateLayoutName(layoutId: string, layoutName: string) {
    console.log("✏️ [API] Updating layout name:", layoutId, "->", layoutName);
    const response = await fetch(`${API_BASE_URL}/savedlayouts/${layoutId}/name`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layoutName }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update layout name: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getAllLayouts() {
    console.log("📋 [API] Fetching all layouts");
    const response = await fetch(`${API_BASE_URL}/savedlayouts`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch layouts: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.layouts;
  },

  async deleteLayout(layoutId: string) {
    console.log("🗑️ [API] Deleting layout:", layoutId);
    const response = await fetch(`${API_BASE_URL}/savedlayouts/${layoutId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete layout: ${response.statusText}`);
    }
    
    return response.json();
  }
};
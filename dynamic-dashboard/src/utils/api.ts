// src/utils/api.ts

import type {
  WidgetItem,
  WidgetDataResponse,
  SavedLayout,
  LayoutWithWidgets,
} from "../types/ChartTypes";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const dataApi = {
 
  async fetchWidgetData(widgets: WidgetItem[]): Promise<WidgetDataResponse[]> {
    try {
      console.log(`🔄 [API] Fetching data for ${widgets.length} widgets`);

      const response = await fetch(`${API_BASE_URL}/api/data/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch widget data");
      }

      console.log("✅ [API] Data fetched successfully");
      return data.results;
    } catch (error: any) {
      console.error("❌ [API] Error fetching widget data:", error);
      throw error;
    }
  },

 
  async getAvailableDatabases(): Promise<string[]> {
    try {
      console.log("📚 [API] Fetching available databases");

      const response = await fetch(`${API_BASE_URL}/api/data/databases`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch databases");
      }

      console.log(`✅ [API] Found ${data.databases.length} databases`);
      return data.databases;
    } catch (error: any) {
      console.error("❌ [API] Error fetching databases:", error);
      throw error;
    }
  },


  async getCollections(database: string): Promise<string[]> {
    try {
      console.log(`📚 [API] Fetching collections for database: ${database}`);

      const response = await fetch(
        `${API_BASE_URL}/api/data/databases/${encodeURIComponent(database)}/collections`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch collections");
      }

      console.log(`✅ [API] Found ${data.collections.length} collections`);
      return data.collections;
    } catch (error: any) {
      console.error("❌ [API] Error fetching collections:", error);
      throw error;
    }
  },
};

export const layoutApi = {

  async getAllLayouts(): Promise<SavedLayout[]> {
    try {
      console.log("📋 [API] Fetching all layouts");

      const response = await fetch(`${API_BASE_URL}/api/savedlayouts`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch layouts");
      }

      console.log(`✅ [API] Found ${data.layouts.length} layouts`);
      return data.layouts;
    } catch (error: any) {
      console.error("❌ [API] Error fetching layouts:", error);
      throw error;
    }
  },


  async getLayoutById(layoutId: string): Promise<LayoutWithWidgets> {
    try {
      console.log(`📂 [API] Fetching layout: ${layoutId}`);

      const response = await fetch(`${API_BASE_URL}/api/savedlayouts/${layoutId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch layout");
      }

      console.log(`✅ [API] Layout fetched with ${data.layout.widgets.length} widgets`);
      return data.layout;
    } catch (error: any) {
      console.error("❌ [API] Error fetching layout:", error);
      throw error;
    }
  },

  
  async saveLayout(
    layoutName: string,
    widgets: WidgetItem[]
  ): Promise<SavedLayout> {
    try {
      console.log(`💾 [API] Saving layout: ${layoutName}`);
      console.log(`💾 [API] Widgets to save: ${widgets.length}`);

      const response = await fetch(`${API_BASE_URL}/api/savedlayouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutName, widgets }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to save layout");
      }

      console.log(`✅ [API] Layout saved with ID: ${data.layout.id}`);
      return data.layout;
    } catch (error: any) {
      console.error("❌ [API] Error saving layout:", error);
      throw error;
    }
  },


  async updateLayout(layoutId: string, widgets: WidgetItem[]): Promise<void> {
    try {
      console.log(`🔄 [API] Updating layout: ${layoutId}`);
      console.log(`🔄 [API] Widgets to update: ${widgets.length}`);

      const response = await fetch(`${API_BASE_URL}/api/savedlayouts/${layoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update layout");
      }

      console.log("✅ [API] Layout updated successfully");
    } catch (error: any) {
      console.error("❌ [API] Error updating layout:", error);
      throw error;
    }
  },

  async updateLayoutName(layoutId: string, layoutName: string): Promise<void> {
    try {
      console.log(`✏️ [API] Updating layout name: ${layoutId} -> ${layoutName}`);

      const response = await fetch(
        `${API_BASE_URL}/api/savedlayouts/${layoutId}/name`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ layoutName }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update layout name");
      }

      console.log("✅ [API] Layout name updated successfully");
    } catch (error: any) {
      console.error("❌ [API] Error updating layout name:", error);
      throw error;
    }
  },

 
  async deleteLayout(layoutId: string): Promise<void> {
    try {
      console.log(`🗑️ [API] Deleting layout: ${layoutId}`);

      const response = await fetch(`${API_BASE_URL}/api/savedlayouts/${layoutId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete layout");
      }

      console.log("✅ [API] Layout deleted successfully");
    } catch (error: any) {
      console.error("❌ [API] Error deleting layout:", error);
      throw error;
    }
  },
};
// src/utils/api.ts

import axios from "axios";
import type { WidgetItem, WidgetDataResponse, SavedLayout, LayoutWithWidgets } from "../types/ChartTypes";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(" API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 *  Data API - Fetches data for widgets
 */
export const dataApi = {
  /**
   * Fetch data for multiple widgets
   * Backend will query MongoDB based on widget configurations
   */
  fetchWidgetData: async (widgets: WidgetItem[]): Promise<WidgetDataResponse[]> => {
    console.log(" [API] Sending widgets to backend:", widgets.length);
    console.log(" [API] Widget details:", JSON.stringify(widgets, null, 2));
    console.log(" [API] Backend URL:", BASE_URL);
    
    try {
      const response = await api.post("/api/data/fetch", { widgets });
      
      console.log(" [API] Received response:", response.data);
      console.log(" [API] Results:", response.data.results);
      
      return response.data.results;
    } catch (error: any) {
      console.error(" [API] Error details:", error);
      console.error(" [API] Error response:", error.response?.data);
      throw error;
    }
  },

  /**
   * Get available database schemas/collections
   */
  getAvailableSchemas: async (): Promise<string[]> => {
    const response = await api.get("/api/data/schemas");
    return response.data.schemas;
  },

  /**
   * Get fields for a specific schema
   */
  getSchemaFields: async (schemaName: string): Promise<string[]> => {
    const response = await api.get(`/api/data/schemas/${schemaName}/fields`);
    return response.data.fields;
  },

  /**
   * Test backend connection
   */
  testConnection: async (): Promise<boolean> => {
    try {
      const response = await api.get("/api/data/test");
      return response.data.success;
    } catch (error) {
      return false;
    }
  },
};


export const layoutApi = {
  /**
   * Get all saved layouts (list only)
   */
  getAllLayouts: async (): Promise<SavedLayout[]> => {
    console.log("[API] Fetching all layouts");
    
    const response = await api.get("/api/savedlayouts");
    
    return response.data.layouts;
  },

  /**
   * Get specific layout with LIVE data
   */
  getLayoutById: async (layoutId: string): Promise<LayoutWithWidgets> => {
    console.log(" [API] Fetching layout:", layoutId);
    
    const response = await api.get(`/api/savedlayouts/${layoutId}`);
    
    console.log(" Layout loaded with live data");
    
    return response.data.layout;
  },

  /**
   * Save new layout (saves configuration only, not data)
   */
  saveLayout: async (layoutName: string, widgets: WidgetItem[]): Promise<SavedLayout> => {
    console.log(" [API] Saving layout:", layoutName);
    
    const response = await api.post("/api/savedlayouts", {
      layoutName,
      widgets,
    });
    
    console.log(" [API] Layout saved successfully");
    
    return response.data.layout;
  },

  /**
   * Update existing layout (for auto-save)
   */
  updateLayout: async (layoutId: string, widgets: WidgetItem[]): Promise<void> => {
    console.log("[API] Updating layout:", layoutId);
    
    await api.put(`/api/savedlayouts/${layoutId}`, {
      widgets,
    });
    
    console.log("[API] Layout updated successfully");
  },

  /**
   * Update layout name (when finalizing temporary layout)
   */
  updateLayoutName: async (layoutId: string, layoutName: string): Promise<void> => {
    console.log("[API] Updating layout name:", layoutId, layoutName);
    
    await api.patch(`/api/savedlayouts/${layoutId}`, {
      layoutName,
    });
    
    console.log(" [API] Layout name updated successfully");
  },

  /**
   * Delete a saved layout
   */
  deleteLayout: async (layoutId: string): Promise<void> => {
    console.log(" [API] Deleting layout:", layoutId);
    
    await api.delete(`/api/savedlayouts/${layoutId}`);
    
    console.log(" [API] Layout deleted successfully");
  },
};

export default api;
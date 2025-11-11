
// ============================================================================
// FILE: backend/src/controllers/SavedLayoutsController.ts (FIXED TYPES)
// ============================================================================

import { Request, Response } from "express";
import { SavedLayout, ISavedLayout } from "../models/SavedLayout.js";
import { QueryService } from "../services/QueryService.js";
import { Types } from "mongoose";

export class SavedLayoutsController {

  static async getAllLayouts(req: Request, res: Response) {
    try {
      console.log("📋 [LayoutController] Fetching all saved layouts");

      const layouts = await SavedLayout.find()
        .select("_id layoutName createdAt")
        .sort({ createdAt: -1 })
        .lean<Array<{
          _id: Types.ObjectId;
          layoutName: string;
          createdAt: Date;
        }>>();

      const formattedLayouts = layouts.map((layout) => ({
        id: layout._id.toString(),
        layoutName: layout.layoutName,
        createdAt: layout.createdAt,
      }));

      console.log(`✅ [LayoutController] Retrieved ${formattedLayouts.length} layouts`);

      return res.status(200).json({
        success: true,
        layouts: formattedLayouts,
      });
    } catch (error: any) {
      console.error("❌ [LayoutController] Error fetching layouts:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch layouts",
      });
    }
  }

  static async getLayoutById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`📂 [LayoutController] Fetching layout: ${id}`);

      const layout = await SavedLayout.findById(id).lean<{
        _id: Types.ObjectId;
        layoutName: string;
        widgets: any[];
        createdAt: Date;
      }>();

      if (!layout) {
        console.warn(`⚠️ [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      console.log("🔄 [LayoutController] Fetching live data for widgets");
      
      // Only fetch data for configured widgets
      const configuredWidgets = layout.widgets.filter(
        (w: any) => w.data?.database && w.data?.collection
      );

      let widgetDataResults: any[] = [];
      
      if (configuredWidgets.length > 0) {
        try {
          widgetDataResults = await QueryService.executeMultipleQueries(configuredWidgets);
        } catch (error) {
          console.error("⚠️ [LayoutController] Error fetching widget data:", error);
          // Continue without data - widgets will show empty state
        }
      }

      const widgetsWithData = layout.widgets.map((widget: any) => {
        const dataResult = widgetDataResults.find(
          (result) => result.widgetId === widget.id
        );

        return {
          ...widget,
          fetchedData: dataResult?.data || [],
          error: dataResult?.error || null,
        };
      });

      const response = {
        id: layout._id.toString(),
        layoutName: layout.layoutName,
        widgets: widgetsWithData,
        createdAt: layout.createdAt,
      };

      console.log("✅ [LayoutController] Layout retrieved successfully");

      return res.status(200).json({
        success: true,
        layout: response,
      });
    } catch (error: any) {
      console.error("❌ [LayoutController] Error fetching layout:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch layout",
      });
    }
  }

  static async saveLayout(req: Request, res: Response) {
    try {
      const { layoutName, widgets } = req.body;
      console.log(widgets,"hfjhd");

      console.log("💾 [LayoutController] Saving new layout:", layoutName);
      console.log(`📊 [LayoutController] Widgets count: ${widgets?.length || 0}`);

      if (widgets === undefined) {
        return res.status(400).json({
          success: false,
          error: "Widgets are required",
        });
      }

      // If no layoutName provided, it's a temp layout
      const finalLayoutName = layoutName || `TempLayout_${Date.now()}`;

      const newLayout = new SavedLayout({
        layoutName: finalLayoutName,
        widgets,
      });

      const savedLayout = await newLayout.save();

      console.log(`✅ [LayoutController] Layout saved with ID: ${savedLayout._id.toString()}`);

      // Return consistent structure
      return res.status(201).json({
        success: true,
        layout: {
          id: savedLayout._id.toString(),
          layoutName: savedLayout.layoutName,
          createdAt: savedLayout.createdAt,
        },
      });
    } catch (error: any) {
      console.error("❌ [LayoutController] Error saving layout:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to save layout",
      });
    }
  }

  static async updateLayout(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { widgets } = req.body;

      console.log(`🔄 [LayoutController] Updating layout: ${id}`);
      console.log(`📊 [LayoutController] New widgets count: ${widgets?.length || 0}`);

      if (widgets === undefined) {
        return res.status(400).json({
          success: false,
          error: "Widgets are required",
        });
      }

      const updatedLayout = await SavedLayout.findByIdAndUpdate(
        id,
        { widgets },
        { new: true }
      );

      if (!updatedLayout) {
        console.warn(`⚠️ [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      console.log("✅ [LayoutController] Layout widgets updated successfully");

      return res.status(200).json({
        success: true,
        message: "Layout updated successfully",
        layout: {
          id: updatedLayout._id.toString(),
          layoutName: updatedLayout.layoutName,
        },
      });
    } catch (error: any) {
      console.error("❌ [LayoutController] Error updating layout:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update layout",
      });
    }
  }

  static async updateLayoutName(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { layoutName } = req.body;

      console.log(`✏️ [LayoutController] Updating layout name: ${id} -> ${layoutName}`);

      if (!layoutName) {
        return res.status(400).json({
          success: false,
          error: "Layout name is required",
        });
      }

      const updatedLayout = await SavedLayout.findByIdAndUpdate(
        id,
        { layoutName },
        { new: true }
      );

      if (!updatedLayout) {
        console.warn(`⚠️ [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      console.log("✅ [LayoutController] Layout name updated successfully");

      return res.status(200).json({
        success: true,
        message: "Layout name updated successfully",
        layout: {
          id: updatedLayout._id.toString(),
          layoutName: updatedLayout.layoutName,
        },
      });
    } catch (error: any) {
      console.error("❌ [LayoutController] Error updating layout name:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update layout name",
      });
    }
  }

  static async deleteLayout(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`🗑️ [LayoutController] Deleting layout: ${id}`);

      const deletedLayout = await SavedLayout.findByIdAndDelete(id);

      if (!deletedLayout) {
        console.warn(`⚠️ [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      console.log("✅ [LayoutController] Layout deleted successfully");

      return res.status(200).json({
        success: true,
        message: "Layout deleted successfully",
      });
    } catch (error: any) {
      console.error("❌ [LayoutController] Error deleting layout:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete layout",
      });
    }
  }
}
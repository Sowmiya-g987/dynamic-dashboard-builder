// backend/src/controllers/SavedLayoutsController.ts

import { Request, Response } from "express";
import { SavedLayout } from "../models/SavedLayout.js";
import { QueryService } from "../services/QueryService.js";

export class SavedLayoutsController {

  static async getAllLayouts(req: Request, res: Response) {
    try {
      console.log("📋 [LayoutController] Fetching all saved layouts");

      const layouts = await SavedLayout.findAll({
        attributes: ["id", "layoutName", "createdAt"],
        order: [["createdAt", "DESC"]],
      });

      const formattedLayouts = layouts.map((layout) => ({
        id: layout.id.toString(),
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

      const layout = await SavedLayout.findByPk(id);

      if (!layout) {
        console.warn(`⚠️ [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      console.log("📄 [LayoutController] Fetching live data for widgets");
      
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
        id: layout.id.toString(),
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

      console.log("💾 [LayoutController] Saving new layout:", layoutName);
      console.log("📊 [LayoutController] Request body:", JSON.stringify(req.body, null, 2));
      console.log("📊 [LayoutController] Widgets received:", widgets);
      console.log("📊 [LayoutController] Widgets type:", typeof widgets);
      console.log("📊 [LayoutController] Widgets is Array:", Array.isArray(widgets));

      // ✅ FIX: Better validation
      if (!Array.isArray(widgets)) {
        console.error("❌ [LayoutController] widgets is not an array:", widgets);
        return res.status(400).json({
          success: false,
          error: "Widgets must be an array",
        });
      }

      // If no layoutName provided, create temp layout
      const finalLayoutName = layoutName || `TempLayout_${Date.now()}`;

      console.log(`💾 [LayoutController] Creating layout "${finalLayoutName}" with ${widgets.length} widgets`);

      const savedLayout = await SavedLayout.create({
        layoutName: finalLayoutName,
        widgets: widgets,
      });

      console.log(`✅ [LayoutController] Layout saved with ID: ${savedLayout.id}`);
      console.log(`✅ [LayoutController] SavedLayout object:`, JSON.stringify(savedLayout.toJSON(), null, 2));

      // ✅ FIX: Ensure ID exists before converting to string
      if (!savedLayout.id) {
        throw new Error("Failed to generate layout ID");
      }

      return res.status(201).json({
        success: true,
        layout: {
          id: savedLayout.id.toString(),
          layoutName: savedLayout.layoutName,
          createdAt: savedLayout.createdAt,
        },
      });
    } catch (error: any) {
      console.error("❌ [LayoutController] Error saving layout:", error);
      console.error("❌ [LayoutController] Error stack:", error.stack);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to save layout",
      });
    }
  }

  static async updateLayout(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { widgets } = req.body;

      console.log(`🔄 [LayoutController] Updating layout: ${id}`);
      console.log(`📊 [LayoutController] New widgets count: ${widgets?.length || 0}`);

      // ✅ FIX: Better validation
      if (!Array.isArray(widgets)) {
        console.error("❌ [LayoutController] widgets is not an array:", widgets);
        return res.status(400).json({
          success: false,
          error: "Widgets must be an array",
        });
      }

      const [affectedRows] = await SavedLayout.update(
        { widgets },
        { where: { id } }
      );

      if (affectedRows === 0) {
        console.warn(`⚠️ [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      const updatedLayout = await SavedLayout.findByPk(id);

      console.log("✅ [LayoutController] Layout widgets updated successfully");

      return res.status(200).json({
        success: true,
        message: "Layout updated successfully",
        layout: {
          id: updatedLayout!.id.toString(),
          layoutName: updatedLayout!.layoutName,
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

      const [affectedRows] = await SavedLayout.update(
        { layoutName },
        { where: { id } }
      );

      if (affectedRows === 0) {
        console.warn(`⚠️ [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      const updatedLayout = await SavedLayout.findByPk(id);

      console.log("✅ [LayoutController] Layout name updated successfully");

      return res.status(200).json({
        success: true,
        message: "Layout name updated successfully",
        layout: {
          id: updatedLayout!.id.toString(),
          layoutName: updatedLayout!.layoutName,
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

      const deletedRows = await SavedLayout.destroy({
        where: { id }
      });

      if (deletedRows === 0) {
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
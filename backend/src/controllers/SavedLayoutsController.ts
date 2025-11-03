// backend/src/controllers/SavedLayoutsController.ts

import { Request, Response } from "express";
import { SavedLayout } from "../models/SavedLayout.js";
import { QueryService } from "../services/QueryService.js";

export class SavedLayoutsController {

  static async getAllLayouts(req: Request, res: Response) {
    try {
      console.log(" [LayoutController] Fetching all saved layouts");

      const layouts = await SavedLayout.find()
        .select("_id layoutName createdAt")
        .sort({ createdAt: -1 })
        .lean();

      const formattedLayouts = layouts.map((layout: any) => ({
        id: layout._id,
        layoutName: layout.layoutName,
        createdAt: layout.createdAt,
      }));

      console.log(` [LayoutController] Retrieved ${formattedLayouts.length} layouts`);

      return res.status(200).json({
        success: true,
        layouts: formattedLayouts,
      });
    } catch (error: any) {
      console.error(" [LayoutController] Error fetching layouts:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch layouts",
      });
    }
  }


  static async getLayoutById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(` [LayoutController] Fetching layout: ${id}`);

      const layout = await SavedLayout.findById(id).lean();

      if (!layout) {
        console.warn(` [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      
      console.log(" [LayoutController] Fetching live data for widgets");
      const widgetDataResults = await QueryService.executeMultipleQueries(
        (layout as any).widgets
      );

      
      const widgetsWithData = (layout as any).widgets.map((widget: any) => {
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
        id: (layout as any)._id,
        layoutName: (layout as any).layoutName,
        widgets: widgetsWithData,
        createdAt: (layout as any).createdAt,
      };

      console.log(" [LayoutController] Layout with data retrieved successfully");

      return res.status(200).json({
        success: true,
        layout: response,
      });
    } catch (error: any) {
      console.error(" [LayoutController] Error fetching layout:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch layout",
      });
    }
  }


  static async saveLayout(req: Request, res: Response) {
    try {
      const { layoutName, widgets } = req.body;

      console.log(" [LayoutController] Saving layout:", layoutName);
      console.log(`[LayoutController] Widgets: ${widgets?.length || 0}`);

      if (!layoutName || !widgets) {
        return res.status(400).json({
          success: false,
          error: "Layout name and widgets are required",
        });
      }

      const newLayout = new SavedLayout({
        layoutName,
        widgets,
      });

      const savedLayout = await newLayout.save();

      console.log(` [LayoutController] Layout saved: ${savedLayout._id}`);

      return res.status(201).json({
        success: true,
        layout: {
          id: savedLayout._id,
          layoutName: savedLayout.layoutName,
          createdAt: savedLayout.createdAt,
        },
      });
    } catch (error: any) {
      console.error(" [LayoutController] Error saving layout:", error);
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

      console.log(` [LayoutController] Updating layout: ${id}`);
      console.log(` [LayoutController] New widgets count: ${widgets?.length || 0}`);

      if (!widgets) {
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
        console.warn(` [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      console.log(" [LayoutController] Layout updated successfully");

      return res.status(200).json({
        success: true,
        message: "Layout updated successfully",
      });
    } catch (error: any) {
      console.error(" [LayoutController] Error updating layout:", error);
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

      console.log(` [LayoutController] Updating layout name: ${id} -> ${layoutName}`);

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
        console.warn(` [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      console.log(" [LayoutController] Layout name updated successfully");

      return res.status(200).json({
        success: true,
        message: "Layout name updated successfully",
      });
    } catch (error: any) {
      console.error(" [LayoutController] Error updating layout name:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update layout name",
      });
    }
  }

  static async deleteLayout(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(` [LayoutController] Deleting layout: ${id}`);

      const deletedLayout = await SavedLayout.findByIdAndDelete(id);

      if (!deletedLayout) {
        console.warn(` [LayoutController] Layout not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: "Layout not found",
        });
      }

      console.log(" [LayoutController] Layout deleted successfully");

      return res.status(200).json({
        success: true,
        message: "Layout deleted successfully",
      });
    } catch (error: any) {
      console.error(" [LayoutController] Error deleting layout:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete layout",
      });
    }
  }
}
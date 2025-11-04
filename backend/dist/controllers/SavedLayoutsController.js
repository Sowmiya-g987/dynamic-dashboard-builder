// backend/src/controllers/SavedLayoutsController.ts
import { SavedLayout } from "../models/SavedLayout.js";
import { QueryService } from "../services/QueryService.js";
export class SavedLayoutsController {
    /**
     * 📋 GET /api/savedlayouts
     * Get all saved layouts (list view only - no data)
     */
    static async getAllLayouts(req, res) {
        try {
            console.log("📂 [LayoutController] Fetching all saved layouts");
            const layouts = await SavedLayout.find()
                .select("_id layoutName createdAt")
                .sort({ createdAt: -1 })
                .lean();
            const formattedLayouts = layouts.map((layout) => ({
                id: layout._id,
                layoutName: layout.layoutName,
                createdAt: layout.createdAt,
            }));
            console.log(`✅ [LayoutController] Retrieved ${formattedLayouts.length} layouts`);
            return res.status(200).json({
                success: true,
                layouts: formattedLayouts,
            });
        }
        catch (error) {
            console.error("❌ [LayoutController] Error fetching layouts:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to fetch layouts",
            });
        }
    }
    /**
     * 📂 GET /api/savedlayouts/:id
     * Get specific layout with LIVE data for all widgets
     */
    static async getLayoutById(req, res) {
        try {
            const { id } = req.params;
            console.log(`🔍 [LayoutController] Fetching layout: ${id}`);
            const layout = await SavedLayout.findById(id).lean();
            if (!layout) {
                console.warn(`⚠️ [LayoutController] Layout not found: ${id}`);
                return res.status(404).json({
                    success: false,
                    error: "Layout not found",
                });
            }
            // Fetch live data for all widgets
            console.log("📊 [LayoutController] Fetching live data for widgets");
            const widgetDataResults = await QueryService.executeMultipleQueries(layout.widgets);
            // Merge widget configurations with their data
            const widgetsWithData = layout.widgets.map((widget) => {
                const dataResult = widgetDataResults.find((result) => result.widgetId === widget.id);
                return {
                    ...widget,
                    fetchedData: dataResult?.data || [],
                    error: dataResult?.error || null,
                };
            });
            const response = {
                id: layout._id,
                layoutName: layout.layoutName,
                widgets: widgetsWithData,
                createdAt: layout.createdAt,
            };
            console.log("✅ [LayoutController] Layout with data retrieved successfully");
            return res.status(200).json({
                success: true,
                layout: response,
            });
        }
        catch (error) {
            console.error("❌ [LayoutController] Error fetching layout:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to fetch layout",
            });
        }
    }
    /**
     * 💾 POST /api/savedlayouts
     * Save new layout (saves configuration only, not data)
     */
    static async saveLayout(req, res) {
        try {
            const { layoutName, widgets } = req.body;
            console.log("💾 [LayoutController] Saving layout:", layoutName);
            console.log(`📊 [LayoutController] Widgets: ${widgets?.length || 0}`);
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
            console.log(`✅ [LayoutController] Layout saved: ${savedLayout._id}`);
            return res.status(201).json({
                success: true,
                layout: {
                    id: savedLayout._id,
                    layoutName: savedLayout.layoutName,
                    createdAt: savedLayout.createdAt,
                },
            });
        }
        catch (error) {
            console.error("❌ [LayoutController] Error saving layout:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to save layout",
            });
        }
    }
    /**
     * 🗑️ DELETE /api/savedlayouts/:id
     * Delete a saved layout
     */
    static async deleteLayout(req, res) {
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
        }
        catch (error) {
            console.error("❌ [LayoutController] Error deleting layout:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to delete layout",
            });
        }
    }
}
//# sourceMappingURL=SavedLayoutsController.js.map
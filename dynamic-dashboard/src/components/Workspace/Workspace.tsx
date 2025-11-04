import React, { useState, useImperativeHandle, forwardRef, useEffect, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Label } from "@progress/kendo-react-labels";
import { Switch } from "@progress/kendo-react-inputs";
import Widget from "./Widget";
import { dataApi, layoutApi } from "../../utils/api";
import type { WidgetItem, ChartType, ChartDataItem } from "../../types/ChartTypes";
import { toast } from "react-toastify";
import "./Workspace.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface WorkspaceRef {
  saveLayout: (layoutName: string) => Promise<void>;
  loadLayout: (layoutId: string) => Promise<void>;
  clearLayout: () => void;
  autoArrange: () => void;
  refreshData: () => Promise<void>;
  createNewDashboard: () => Promise<void>;
}

interface WorkspaceProps {
  isPreviewMode?: boolean;
  editMode?: boolean;
  onEditModeChange?: (mode: boolean) => void;
}

const Workspace = forwardRef<WorkspaceRef, WorkspaceProps>(
  ({ isPreviewMode = false, editMode = false, onEditModeChange }, ref) => {
    const [widgets, setWidgets] = useState<WidgetItem[]>([]);
    const [widgetDataMap, setWidgetDataMap] = useState<Map<number, ChartDataItem[]>>(new Map());
    const [loadingWidgets, setLoadingWidgets] = useState<Set<number>>(new Set());
    const [errorWidgets, setErrorWidgets] = useState<Map<number, string>>(new Map());
    const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedWidget, setSelectedWidget] = useState<WidgetItem | null>(null);
    const [xAxis, setXAxis] = useState("All");
    const [yAxis, setYAxis] = useState("NofEmployee");
    const [branch, setBranch] = useState("All");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [widgetToDelete, setWidgetToDelete] = useState<number | null>(null);

    // Branch options for dropdown
    const branchOptions = [
      { text: "Pondy", value: "Pondy" },
      { text: "Hyderabad", value: "Hyderabad" },
      { text: "Pune", value: "Pune" },
      { text: "Bangalore", value: "Bangalore" },
      { text: "Chennai", value: "Chennai" },
    ];

    const xAxisOptions = [
      { text: "All Branches", value: "All" },
      { text: "Selected Branch", value: "Selected" },
    ];

    const yAxisOptions = [
      { text: "Number of Employees", value: "NofEmployee" },
      { text: "Number of Interns", value: "NofIntern" },
    ];

    useEffect(() => {
      if (currentLayoutId && widgets.length >= 0 && !isPreviewMode && !isInitialLoad) {
        const timer = setTimeout(() => {
          autoSaveLayout();
        }, 1000); 
        
        return () => clearTimeout(timer);
      }
    }, [widgets, currentLayoutId, isPreviewMode, isInitialLoad]);

    useEffect(() => {
      if (widgets.length > 0 && !isInitialLoad) {
        fetchDataForValidWidgets();
      }
    }, [widgets, editMode, isInitialLoad]);

    const autoSaveLayout = async () => {
      if (!currentLayoutId || isAutoSaving) return;

      try {
        setIsAutoSaving(true);
        console.log("💾 [Workspace] Auto-saving layout:", currentLayoutId);
        
        await layoutApi.updateLayout(currentLayoutId, widgets);
        
        console.log("✅ [Workspace] Auto-save successful");
      } catch (error) {
        console.error("❌ [Workspace] Auto-save failed:", error);
      } finally {
        setIsAutoSaving(false);
      }
    };

    const fetchDataForValidWidgets = useCallback(async () => {
      const validWidgets = widgets.filter(
        w => w.data.xField && w.data.yField && w.data.xField !== "" && w.data.yField !== ""
      );

      if (validWidgets.length === 0) {
        console.log("[Workspace] No widgets with configured xField/yField - using mock data");
        return;
      }

      console.log(`🔄 [Workspace] Fetching data for ${validWidgets.length} configured widgets`);
      
      setLoadingWidgets(new Set(validWidgets.map(w => w.id)));
      
      try {
        const results = await dataApi.fetchWidgetData(validWidgets);
        
        const newDataMap = new Map<number, ChartDataItem[]>();
        const newErrorMap = new Map<number, string>();
        
        results.forEach(result => {
          if (result.error) {
            newErrorMap.set(result.widgetId, result.error);
          } else {
            newDataMap.set(result.widgetId, result.data);
          }
        });
        
        setWidgetDataMap(newDataMap);
        setErrorWidgets(newErrorMap);
        setLoadingWidgets(new Set());
        
      } catch (error: any) {
        console.error("❌ [Workspace] Error fetching widget data:", error);
        
        const newErrorMap = new Map<number, string>();
        validWidgets.forEach(w => {
          newErrorMap.set(w.id, "Failed to fetch data from backend");
        });
        setErrorWidgets(newErrorMap);
        setLoadingWidgets(new Set());
      }
    }, [widgets]);

    useImperativeHandle(ref, () => ({
      saveLayout: async (layoutName: string) => {
        try {
          console.log("💾 [Workspace] Saving layout with name:", layoutName);
          
          if (currentLayoutId) {
            await layoutApi.updateLayoutName(currentLayoutId, layoutName);
            toast.success(`Layout "${layoutName}" saved successfully!`);
          } else {
            const savedLayout = await layoutApi.saveLayout(layoutName, widgets);
            setCurrentLayoutId(savedLayout.id);
            setIsInitialLoad(false);
            toast.success(`Layout "${layoutName}" saved successfully!`);
          }
        } catch (err) {
          console.error("❌ [Workspace] Error saving layout:", err);
          toast.error("Failed to save layout. Please try again.");
        }
      },

      loadLayout: async (layoutId: string) => {
        try {
          console.log("📂 [Workspace] Loading layout:", layoutId);
          
          setIsInitialLoad(true); 
          
          const layout = await layoutApi.getLayoutById(layoutId);
          
          console.log("[Workspace] Layout loaded with", layout.widgets.length, "widgets");
          
          setWidgets(layout.widgets);
          setCurrentLayoutId(layoutId);
          
          setTimeout(() => {
            setIsInitialLoad(false);
          }, 100);
          
        } catch (err) {
          console.error("❌ [Workspace] Error loading layout:", err);
          toast.error("Failed to load layout. Please try again.");
          setIsInitialLoad(false);
        }
      },

      clearLayout: () => {
        console.log("🗑️ [Workspace] Clearing layout");
        setWidgets([]);
        setWidgetDataMap(new Map());
        setErrorWidgets(new Map());
        setLoadingWidgets(new Set());
        setCurrentLayoutId(null);
        setIsInitialLoad(true);
      },

      autoArrange: () => {
        console.log("📐 [Auto Arrange] Organizing widgets");
        const cols = 12;
        const colHeights = new Array(cols).fill(0);

        setWidgets((prevWidgets) => {
          const sorted = [...prevWidgets].sort(
            (a, b) => a.position.w - b.position.w || a.id - b.id
          );

          const rearranged = sorted.map((w) => {
            let bestX = 0;
            let minY = Infinity;

            for (let x = 0; x <= cols - w.position.w; x++) {
              const yPos = Math.max(...colHeights.slice(x, x + w.position.w));
              if (yPos < minY) {
                minY = yPos;
                bestX = x;
              }
            }

            for (let x = bestX; x < bestX + w.position.w; x++) {
              colHeights[x] = minY + w.position.h;
            }

            return { ...w, position: { ...w.position, x: bestX, y: minY } };
          });

          console.log("✅ [Auto Arrange] Layout optimized");
          return rearranged;
        });
      },

      refreshData: async () => {
        console.log("🔄 [Workspace] Refreshing all widget data");
        await fetchDataForValidWidgets();
      },

      createNewDashboard: async () => {
        try {
          console.log("➕ [Workspace] Creating new dashboard");
          
          const tempName = `TempLayout_${Date.now()}`;
          
          setIsInitialLoad(true); 
          
          const newLayout = await layoutApi.saveLayout(tempName, []);
          
          setCurrentLayoutId(newLayout.id);
          setWidgets([]);
          setWidgetDataMap(new Map());
          setErrorWidgets(new Map());

          setTimeout(() => {
            setIsInitialLoad(false);
          }, 100);
          
          console.log("✅ [Workspace] New dashboard created:", newLayout.id);
          toast.success("New dashboard created! Add widgets and they will auto-save.");
          
        } catch (error) {
          console.error("❌ [Workspace] Error creating new dashboard:", error);
          toast.error("Failed to create new dashboard. Please try again.");
          setIsInitialLoad(false);
        }
      },
    }));

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      if (isPreviewMode) return;
      e.preventDefault();
      const rawType = e.dataTransfer.getData("chartType");
      if (!rawType) return;

      const chartType: ChartType = rawType.toLowerCase().includes("bar")
        ? "bar"
        : rawType.toLowerCase().includes("pie")
        ? "pie"
        : rawType.toLowerCase().includes("table")
        ? "table"
        : "line";

      const newWidget: WidgetItem = {
        id: Date.now(),
        type: chartType,
        data: {
          schemaName: "branchstats",
          xField: "", 
          yField: "", 
          branch: "All",
        },
        position: { x: (widgets.length * 2) % 12, y: Infinity, w: 4, h: 3 },
      };

      console.log("📥 [Drop] New widget created (will use mock data):", newWidget);
      
      if (!currentLayoutId) {
        createAutoLayout(newWidget);
      } else {
        setWidgets((prev) => [...prev, newWidget]);
      }
    };

    const createAutoLayout = async (firstWidget: WidgetItem) => {
      try {
        console.log("🔧 [Auto-create] Creating layout for first widget");
        const tempName = `TempLayout_${Date.now()}`;
        
        setIsInitialLoad(true);
        
        const newLayout = await layoutApi.saveLayout(tempName, [firstWidget]);
        
        setCurrentLayoutId(newLayout.id);
        setWidgets([firstWidget]);
        
        setTimeout(() => {
          setIsInitialLoad(false);
        }, 100);
        
        console.log("✅ [Auto-create] Layout created:", newLayout.id);
      } catch (error) {
        console.error("❌ [Auto-create] Failed:", error);
        
        setWidgets([firstWidget]);
        setIsInitialLoad(false);
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      if (!isPreviewMode) e.preventDefault();
    };

    const layouts: { [key: string]: Layout[] } = {
      lg: widgets.map((w) => ({
        i: w.id.toString(),
        x: w.position.x,
        y: w.position.y,
        w: w.position.w,
        h: w.position.h,
      })),
    };

    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
    const cols = { lg:12, md:10, sm: 6, xs: 4, xxs: 2 };

    const handleEditWidget = (widget: WidgetItem) => {
      console.log("[Edit] Widget selected:", widget);
      setSelectedWidget(widget);
      setXAxis(widget.data.branch === "All" ? "All" : "Selected");
      setYAxis(widget.data.yField || "NofEmployee");
      setBranch(widget.data.branch || "All");
      setShowDrawer(true);
    };

    const handleDeleteWidget = (id: number) => {
      console.log("🗑️ [Delete] Confirming deletion for widget:", id);
      setWidgetToDelete(id);
      setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
      if (widgetToDelete !== null) {
        console.log("✅ [Delete] Removing widget:", widgetToDelete);
        setWidgets((prev) => prev.filter((w) => w.id !== widgetToDelete));
        
        setWidgetDataMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(widgetToDelete);
          return newMap;
        });
        setErrorWidgets(prev => {
          const newMap = new Map(prev);
          newMap.delete(widgetToDelete);
          return newMap;
        });
        
        setShowDeleteDialog(false);
        setWidgetToDelete(null);
      }
    };

    const handleFilterApply = () => {
      if (!selectedWidget) {
        console.warn("⚠️ [Filter] No widget selected");
        return;
      }

      const updatedBranch = xAxis === "All" ? "All" : branch;

      console.log("✅ [Filter] Applying:", { yAxis, branch: updatedBranch });

      setWidgets((prev) =>
        prev.map((w) =>
          w.id === selectedWidget.id
            ? {
                ...w,
                data: {
                  ...w.data,
                  xField: "branch", 
                  yField: yAxis, 
                  branch: updatedBranch,
                },
              }
            : w
        )
      );

      setShowDrawer(false);
    };

    const handleLayoutChange = (newLayout: Layout[]) => {
      if (isPreviewMode || editMode) return;
      setWidgets((prev) =>
        prev.map((w) => {
          const l = newLayout.find((x) => x.i === w.id.toString());
          return l ? { ...w, position: { x: l.x, y: l.y, w: l.w, h: l.h } } : w;
        })
      );
    };

    return (
      <div
        className={`workspace-container ${isPreviewMode ? 'preview-mode' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!isPreviewMode && (
          <div className="workspace-header">
            <h5>
              Workspace {isAutoSaving && <span className="auto-save-indicator">💾 Saving...</span>}
            </h5>
            <div className="workspace-header-actions">
              <span className="workspace-mode-label">
                {editMode ? "📝 Edit Mode" : "🔄 Drag Mode"}
              </span>
              <Switch
                checked={editMode}
                onChange={(e) => onEditModeChange?.(e.value)}
              />
            </div>
          </div>
        )}

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={150}
          isResizable={!isPreviewMode && !editMode}
          isDraggable={!isPreviewMode && !editMode}
          onLayoutChange={handleLayoutChange}
        >
          {widgets.map((w) => (
            <div key={w.id.toString()}>
              <Widget
                widget={w}
                widgetData={widgetDataMap.get(w.id) || []}
                loading={loadingWidgets.has(w.id)}
                error={errorWidgets.get(w.id)}
                isEditMode={editMode && !isPreviewMode}
                onEdit={() => handleEditWidget(w)}
                onDelete={() => handleDeleteWidget(w.id)}
              />
            </div>
          ))}
        </ResponsiveGridLayout>

        {/* Custom Offcanvas-style Panel for Widget Configuration */}
        {!isPreviewMode && showDrawer && selectedWidget && (
          <>
            {/* Backdrop/Overlay */}
            <div
              className="offcanvas-backdrop"
              onClick={() => setShowDrawer(false)}
            />
            
            {/* Offcanvas Panel */}
            <div className="offcanvas-panel">
              {/* Header */}
              <div className="offcanvas-header">
                <h3>Widget Configuration</h3>
                <Button
                  icon="close"
                  fillMode="flat"
                  onClick={() => setShowDrawer(false)}
                />
              </div>

              {/* Body */}
              <div className="offcanvas-body">
                <div className="offcanvas-body-content">
                  <div className="form-field">
                    <Label>X-Axis</Label>
                    <DropDownList
                      data={xAxisOptions}
                      textField="text"
                      dataItemKey="value"
                      value={xAxisOptions.find(opt => opt.value === xAxis)}
                      onChange={(e) => setXAxis(e.value.value)}
                    />
                  </div>

                  {xAxis === "Selected" && (
                    <div className="form-field">
                      <Label>Select Branch</Label>
                      <DropDownList
                        data={branchOptions}
                        textField="text"
                        dataItemKey="value"
                        value={branchOptions.find(opt => opt.value === branch)}
                        onChange={(e) => setBranch(e.value.value)}
                      />
                    </div>
                  )}

                  <div className="form-field">
                    <Label>Y-Axis</Label>
                    <DropDownList
                      data={yAxisOptions}
                      textField="text"
                      dataItemKey="value"
                      value={yAxisOptions.find(opt => opt.value === yAxis)}
                      onChange={(e) => setYAxis(e.value.value)}
                    />
                  </div>

                  <Button
                    themeColor="primary"
                    onClick={handleFilterApply}
                    className="apply-filter-btn"
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Kendo Dialog for Delete Confirmation */}
        {showDeleteDialog && (
          <Dialog
            title="Confirm Delete"
            onClose={() => setShowDeleteDialog(false)}
            width={400}
          >
            <p style={{ margin: "20px 0" }}>
              Are you sure you want to delete this widget? This action cannot be undone.
            </p>
            <DialogActionsBar>
              <Button
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                themeColor="error"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </DialogActionsBar>
          </Dialog>
        )}
      </div>
    );
  }
);

Workspace.displayName = "Workspace";
export default Workspace;
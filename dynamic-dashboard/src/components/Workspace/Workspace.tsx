
import React, { useState, useImperativeHandle, forwardRef, useEffect, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Offcanvas, Form, Button, Modal } from "react-bootstrap";
import Widget from "./Widget";
import { dataApi, layoutApi } from "../../utils/api";
import type { WidgetItem, ChartType, ChartDataItem } from "../../types/ChartTypes";
import { toast } from "react-toastify";
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
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [selectedWidget, setSelectedWidget] = useState<WidgetItem | null>(null);
    const [xAxis, setXAxis] = useState("All");
    const [yAxis, setYAxis] = useState("NofEmployee");
    const [branch, setBranch] = useState("All");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [widgetToDelete, setWidgetToDelete] = useState<number | null>(null);

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
        console.log(" [Workspace] Auto-saving layout:", currentLayoutId);
        
        await layoutApi.updateLayout(currentLayoutId, widgets);
        
        console.log(" [Workspace] Auto-save successful");
      } catch (error) {
        console.error(" [Workspace] Auto-save failed:", error);
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

      console.log(` [Workspace] Fetching data for ${validWidgets.length} configured widgets`);
      
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
        console.error(" [Workspace] Error fetching widget data:", error);
        
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
          console.log(" [Workspace] Saving layout with name:", layoutName);
          
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
          console.error(" [Workspace] Error saving layout:", err);
          toast.error("Failed to save layout. Please try again.");
        }
      },

      loadLayout: async (layoutId: string) => {
        try {
          console.log(" [Workspace] Loading layout:", layoutId);
          
          setIsInitialLoad(true); 
          
          const layout = await layoutApi.getLayoutById(layoutId);
          
          console.log("[Workspace] Layout loaded with", layout.widgets.length, "widgets");
          
          setWidgets(layout.widgets);
          setCurrentLayoutId(layoutId);
          
         
          setTimeout(() => {
            setIsInitialLoad(false);
          }, 100);
          
        } catch (err) {
          console.error(" [Workspace] Error loading layout:", err);
          toast.error("Failed to load layout. Please try again.");
          setIsInitialLoad(false);
        }
      },

      clearLayout: () => {
        console.log(" [Workspace] Clearing layout");
        setWidgets([]);
        setWidgetDataMap(new Map());
        setErrorWidgets(new Map());
        setLoadingWidgets(new Set());
        setCurrentLayoutId(null);
        setIsInitialLoad(true);
      },

      autoArrange: () => {
        console.log(" [Auto Arrange] Organizing widgets");
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

          console.log(" [Auto Arrange] Layout optimized");
          return rearranged;
        });
      },

      refreshData: async () => {
        console.log(" [Workspace] Refreshing all widget data");
        await fetchDataForValidWidgets();
      },

      createNewDashboard: async () => {
        try {
          console.log(" [Workspace] Creating new dashboard");
          
          
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
          
          console.log(" [Workspace] New dashboard created:", newLayout.id);
          toast.success("New dashboard created! Add widgets and they will auto-save.");
          
        } catch (error) {
          console.error(" [Workspace] Error creating new dashboard:", error);
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

      console.log(" [Drop] New widget created (will use mock data):", newWidget);
      
    
      if (!currentLayoutId) {
        createAutoLayout(newWidget);
      } else {
        setWidgets((prev) => [...prev, newWidget]);
      }
    };

    const createAutoLayout = async (firstWidget: WidgetItem) => {
      try {
        console.log(" [Auto-create] Creating layout for first widget");
        const tempName = `TempLayout_${Date.now()}`;
        
        setIsInitialLoad(true);
        
        const newLayout = await layoutApi.saveLayout(tempName, [firstWidget]);
        
        setCurrentLayoutId(newLayout.id);
        setWidgets([firstWidget]);
        
        setTimeout(() => {
          setIsInitialLoad(false);
        }, 100);
        
        console.log(" [Auto-create] Layout created:", newLayout.id);
      } catch (error) {
        console.error(" [Auto-create] Failed:", error);
        
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
      setShowOffcanvas(true);
    };

    const handleDeleteWidget = (id: number) => {
      console.log(" [Delete] Confirming deletion for widget:", id);
      setWidgetToDelete(id);
      setShowDeleteModal(true);
    };

    const confirmDelete = () => {
      if (widgetToDelete !== null) {  
        console.log(" [Delete] Removing widget:", widgetToDelete);
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
        
        setShowDeleteModal(false);
        setWidgetToDelete(null);
      }
    };

    const handleFilterApply = () => {
      if (!selectedWidget) {
        console.warn(" [Filter] No widget selected");
        return;
      }

      const updatedBranch = xAxis === "All" ? "All" : branch;

      console.log(" [Filter] Applying:", { yAxis, branch: updatedBranch });

      
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

      setShowOffcanvas(false);
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
        style={{
          flexGrow: 1,
          padding: isPreviewMode ? "3rem 1rem 1rem 1rem" : "1rem",
          height: "100%",
          width: "100%",
          boxSizing: "border-box",
          overflow: "auto",
          backgroundColor: "#f5f5f5",
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!isPreviewMode && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h5 style={{ margin: 0, color: "#333" }}>
              Workspace {isAutoSaving && <span style={{ fontSize: "12px", color: "#28a745" }}>💾 Saving...</span>}
            </h5>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#555" }}>
                {editMode ? "📝 Edit Mode" : "🔄 Drag Mode"}
              </span>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={editMode}
                  onChange={(e) => onEditModeChange?.(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: editMode ? "#28a745" : "#ccc",
                    transition: "0.4s",
                    borderRadius: "24px",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      height: "18px",
                      width: "18px",
                      left: editMode ? "26px" : "3px",
                      bottom: "3px",
                      backgroundColor: "white",
                      transition: "0.4s",
                      borderRadius: "50%",
                    }}
                  />
                </span>
              </label>
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


        {!isPreviewMode && (
          <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Widget Configuration</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>X-Axis</Form.Label>
                  <Form.Select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
                    <option value="All">All Branches</option>
                    <option value="Selected">Selected Branch</option>
                  </Form.Select>
                </Form.Group>

                {xAxis === "Selected" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Select Branch</Form.Label>
                    <Form.Select value={branch} onChange={(e) => setBranch(e.target.value)}>
                      <option value="Pondy">Pondy</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Chennai">Chennai</option>
                    </Form.Select>
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Y-Axis</Form.Label>
                  <Form.Select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
                    <option value="NofEmployee">Number of Employees</option>
                    <option value="NofIntern">Number of Interns</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="primary" onClick={handleFilterApply} className="w-100">
                  Apply Filter
                </Button>
              </Form>
            </Offcanvas.Body>
          </Offcanvas>
        )}

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this widget? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
);

Workspace.displayName = "Workspace";
export default Workspace;
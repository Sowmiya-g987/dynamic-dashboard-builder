import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
import type {
  WidgetItem,
  ChartType,
  ChartDataItem,
} from "../../types/ChartTypes";
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
    // Widget & Layout State
    const [widgets, setWidgets] = useState<WidgetItem[]>([]);
    const [widgetDataMap, setWidgetDataMap] = useState<
      Map<number, ChartDataItem[]>
    >(new Map());
    const [loadingWidgets, setLoadingWidgets] = useState<Set<number>>(
      new Set()
    );
    const [errorWidgets, setErrorWidgets] = useState<Map<number, string>>(
      new Map()
    );
    const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Drawer & Dialog State
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedWidget, setSelectedWidget] = useState<WidgetItem | null>(
      null
    );
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [widgetToDelete, setWidgetToDelete] = useState<number | null>(null);

    // Multi-Database State
    const [databases, setDatabases] = useState<string[]>([]);
    const [selectedDatabase, setSelectedDatabase] = useState<string>("");
    const [collections, setCollections] = useState<string[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string>("");

    // Widget Configuration State
    const [xAxis, setXAxis] = useState("All");
    const [yAxis, setYAxis] = useState("NofEmployee");
    const [branch, setBranch] = useState("All");

    // SSE Ref to maintain connection
    const sseRef = useRef<EventSource | null>(null);

    // Dropdown Options
    const [databaseOptions, setDatabaseOptions] = useState<
      { text: string; value: string }[]
    >([]);
    const [collectionOptions, setCollectionOptions] = useState<
      { text: string; value: string }[]
    >([]);

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
      loadDatabases();
    }, []);

  
    useEffect(() => {
      console.log("🔍 [Widgets State Changed]", {
        count: widgets.length,
        ids: widgets.map((w) => w.id),
        layoutId: currentLayoutId,
        isInitialLoad,
      });
    }, [widgets]);

    const loadDatabases = async () => {
      try {
        console.log("📚 [Workspace] Loading available databases");
        const dbs = await dataApi.getAvailableDatabases();
        setDatabases(dbs);
        setDatabaseOptions(dbs.map((db) => ({ text: db, value: db })));
        console.log(`✅ [Workspace] Loaded ${dbs.length} databases:`, dbs);
      } catch (error) {
        console.error("❌ [Workspace] Failed to load databases:", error);
        toast.error("Failed to load databases");
      }
    };


    const handleDatabaseChange = async (dbName: string) => {
      setSelectedDatabase(dbName);
      setSelectedCollection("");
      setCollectionOptions([]);

      try {
        console.log(
          `📚 [Workspace] Loading collections for database: ${dbName}`
        );
        const cols = await dataApi.getCollections(dbName);
        setCollections(cols);
        setCollectionOptions(cols.map((col) => ({ text: col, value: col })));
        console.log(`✅ [Workspace] Loaded ${cols.length} collections:`, cols);
      } catch (error) {
        console.error("❌ [Workspace] Failed to load collections:", error);
        toast.error("Failed to load collections");
      }
    };

    useEffect(() => {
      if (
        currentLayoutId &&
        widgets.length >= 0 &&
        !isPreviewMode &&
        !isInitialLoad
      ) {
        const timer = setTimeout(() => {
          console.log(
            "⏰ [AutoSave] Timer triggered for",
            widgets.length,
            "widgets"
          );
          autoSaveLayout();
        }, 1000);

        return () => {
          console.log("🧹 [AutoSave] Cleanup - clearing timer");
          clearTimeout(timer);
        };
      }
    }, [widgets, currentLayoutId, isPreviewMode, isInitialLoad]);

    const autoSaveLayout = async () => {
      if (!currentLayoutId || isAutoSaving) {
        console.log(
          "⏭️ [AutoSave] Skipping - layoutId:",
          currentLayoutId,
          "isAutoSaving:",
          isAutoSaving
        );
        return;
      }

      try {
        setIsAutoSaving(true);
        console.log("💾 [AutoSave] Saving layout:", currentLayoutId);
        console.log("💾 [AutoSave] Widgets to save:", widgets.length);
        console.log(
          "💾 [AutoSave] Widget IDs:",
          widgets.map((w) => w.id)
        );

        await layoutApi.updateLayout(currentLayoutId, widgets);

        console.log(
          "✅ [AutoSave] Successfully saved",
          widgets.length,
          "widgets"
        );
      } catch (error) {
        console.error("❌ [AutoSave] Failed:", error);
      } finally {
        setIsAutoSaving(false);
      }
    };

   
    useEffect(() => {
      if (widgets.length > 0 && !isInitialLoad) {
        fetchDataForValidWidgets();
      }
    }, [widgets, editMode, isInitialLoad]);

    const fetchDataForValidWidgets = useCallback(async () => {
      const validWidgets = widgets.filter(
        (w) => w.data.database && w.data.collection
      );

      if (validWidgets.length === 0) {
        console.log(
          "📊 [Workspace] No widgets with configured database/collection"
        );
        return;
      }

      console.log(
        `🔄 [Workspace] Fetching data for ${validWidgets.length} configured widgets`
      );

      setLoadingWidgets(new Set(validWidgets.map((w) => w.id)));

      try {
        const results = await dataApi.fetchWidgetData(validWidgets);

        const newDataMap = new Map<number, ChartDataItem[]>();
        const newErrorMap = new Map<number, string>();

        results.forEach((result) => {
          if (result.error) {
            newErrorMap.set(result.widgetId, result.error);
          } else {
            newDataMap.set(result.widgetId, result.data);
          }
        });

        setWidgetDataMap(newDataMap);
        setErrorWidgets(newErrorMap);
        setLoadingWidgets(new Set());

        console.log("✅ [Workspace] Data fetched successfully");
      } catch (error: any) {
        console.error("❌ [Workspace] Error fetching widget data:", error);

        const newErrorMap = new Map<number, string>();
        validWidgets.forEach((w) => {
          newErrorMap.set(w.id, "Failed to fetch data from backend");
        });
        setErrorWidgets(newErrorMap);
        setLoadingWidgets(new Set());
      }
    }, [widgets]);

    useEffect(() => {
      let reconnectTimeout: any;

      const connectSSE = () => {
        if (sseRef.current) {
          console.log("🔌 [SSE] Closing previous connection");
          sseRef.current.close();
          sseRef.current = null;
        }

        const configuredWidgets = widgets.filter(
          (w) => w.data.database && w.data.collection
        );

        if (configuredWidgets.length === 0) {
          console.log(
            "📡 [SSE] No configured widgets, skipping SSE connection"
          );
          return;
        }

        console.log(
          `📡 [SSE] Establishing connection for ${configuredWidgets.length} configured widgets`
        );

        try {
          const widgetsForSSE = configuredWidgets.map((w) => ({
            id: w.id,
            type: w.type,
            data: {
              database: w.data.database,
              collection: w.data.collection,
              query: w.data.query || {},
              projection: w.data.projection || {},
              xField: w.data.xField || "branch",
              yField: w.data.yField || "NofEmployee",
              branch: w.data.branch || "All",
            },
          }));

          const widgetsParam = encodeURIComponent(
            JSON.stringify(widgetsForSSE)
          );
          const eventSource = new EventSource(
            `http://localhost:8080/api/data/stream-stats?widgets=${widgetsParam}`
          );

          sseRef.current = eventSource;

          eventSource.onopen = () => {
            console.log("✅ [SSE] Connection established");
          };

          eventSource.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);

              if (data.type === "connected") {
                console.log("✅ [SSE]", data.message);
                return;
              }

              if (data.widgetId && data.data) {
                console.log(
                  "📥 [SSE] Live update received for widget:",
                  data.widgetId
                );

                setWidgetDataMap((prevMap) => {
                  const newMap = new Map(prevMap);
                  newMap.set(Number(data.widgetId), data.data);
                  return newMap;
                });

                toast.info(`Widget updated with live data`, {
                  autoClose: 2000,
                  position: "bottom-right",
                });
              }
            } catch (err) {
              console.error("❌ [SSE] Error parsing data:", err);
            }
          };

          eventSource.onerror = (err) => {
            console.error("❌ [SSE] Connection error:", err);
            eventSource.close();
            sseRef.current = null;

            console.log("🔁 [SSE] Attempting to reconnect in 3s...");
            reconnectTimeout = setTimeout(connectSSE, 3000);
          };
        } catch (error) {
          console.error("❌ [SSE] Failed to establish connection:", error);
          reconnectTimeout = setTimeout(connectSSE, 5000);
        }
      };

      connectSSE();

      return () => {
        if (sseRef.current) {
          console.log("📡 [SSE] Closing connection on cleanup");
          sseRef.current.close();
          sseRef.current = null;
        }
        clearTimeout(reconnectTimeout);
      };
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
          console.log("📂 [LoadLayout] Loading layout:", layoutId);

          setIsInitialLoad(true);

          const layout = await layoutApi.getLayoutById(layoutId);

          console.log(
            "📊 [LoadLayout] Received layout with",
            layout.widgets.length,
            "widgets"
          );

          setWidgets(layout.widgets);
          setCurrentLayoutId(layoutId);

          setTimeout(() => {
            setIsInitialLoad(false);
            console.log("✅ [LoadLayout] Load complete");
          }, 100);
        } catch (err) {
          console.error("❌ [LoadLayout] Error:", err);
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
          toast.success(
            "New dashboard created! Add widgets and they will auto-save."
          );
        } catch (error) {
          console.error("❌ [Workspace] Error creating new dashboard:", error);
          toast.error("Failed to create new dashboard. Please try again.");
          setIsInitialLoad(false);
        }
      },
    }));

   
    const createAutoLayout = async (firstWidget: WidgetItem) => {
      try {
        console.log("🔧 [Auto-create] ====================================");
        console.log("🔧 [Auto-create] Creating layout for first widget");
        console.log(
          "🔧 [Auto-create] Widget:",
          JSON.stringify(firstWidget, null, 2)
        );

        const tempName = `TempLayout_${Date.now()}`;

        setIsInitialLoad(true);

        const widgetToSave = {
          id: firstWidget.id,
          type: firstWidget.type,
          data: {
            database: firstWidget.data.database || "",
            collection: firstWidget.data.collection || "",
            query: firstWidget.data.query || {},
            projection: firstWidget.data.projection || {},
            xField: firstWidget.data.xField || "",
            yField: firstWidget.data.yField || "",
            branch: firstWidget.data.branch || "All",
          },
          position: firstWidget.position,
        };

        console.log(
          "🔧 [Auto-create] Sanitized widget:",
          JSON.stringify(widgetToSave, null, 2)
        );

        const newLayout = await layoutApi.saveLayout(tempName, [widgetToSave]);

        console.log("✅ [Auto-create] Layout created with ID:", newLayout.id);
        console.log("🔧 [Auto-create] ====================================");

        setCurrentLayoutId(newLayout.id);
        setWidgets([widgetToSave]);

        setTimeout(() => setIsInitialLoad(false), 100);
      } catch (error: any) {
        console.error("❌ [Auto-create] Failed:", error);
        console.error("❌ [Auto-create] Error message:", error.message);

        setWidgets([firstWidget]);
        setIsInitialLoad(false);

        toast.error("Failed to create layout. Please try again.");
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      if (isPreviewMode) return;
      e.preventDefault();

      const rawType = e.dataTransfer.getData("chartType");
      if (!rawType) {
        console.warn("⚠️ [Drop] No chart type in drag data");
        return;
      }

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
          database: "",
          collection: "",
          query: {},
          projection: {},
          xField: "",
          yField: "",
          branch: "All",
        },
        position: { x: (widgets.length * 2) % 12, y: Infinity, w: 4, h: 3 },
      };

      console.log("📥 [Drop] ====================================");
      console.log("📥 [Drop] New widget created with ID:", newWidget.id);
      console.log("📊 [Drop] Current layout ID:", currentLayoutId);
      console.log("📊 [Drop] Current widgets count:", widgets.length);

      if (!currentLayoutId) {
        console.log("🆕 [Drop] NO LAYOUT - Creating new layout");
        createAutoLayout(newWidget);
      } else {
        console.log("➕ [Drop] LAYOUT EXISTS - Adding widget");
        setWidgets((prevWidgets) => {
          const updatedWidgets = [...prevWidgets, newWidget];
          console.log("✅ [Drop] Updated count:", updatedWidgets.length);
          console.log("📥 [Drop] ====================================");
          return updatedWidgets;
        });
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      if (!isPreviewMode) e.preventDefault();
    };

 

    const handleEditWidget = async (widget: WidgetItem) => {
      console.log("✏️ [Edit] Widget selected:", widget);

      if (databaseOptions.length === 0) {
        console.log("📚 [Edit] Loading databases first...");
        await loadDatabases();
      }

      setSelectedWidget(widget);

      if (widget.data.database) {
        setSelectedDatabase(widget.data.database);

        try {
          console.log(
            `📚 [Edit] Loading collections for: ${widget.data.database}`
          );
          const cols = await dataApi.getCollections(widget.data.database);
          setCollections(cols);
          setCollectionOptions(cols.map((col) => ({ text: col, value: col })));

          if (widget.data.collection) {
            setSelectedCollection(widget.data.collection);
          } else {
            setSelectedCollection("");
          }
        } catch (error) {
          console.error("❌ [Edit] Failed to load collections:", error);
          toast.error("Failed to load collections");
        }
      } else {
        setSelectedDatabase("");
        setSelectedCollection("");
        setCollectionOptions([]);
      }

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

        setWidgetDataMap((prev) => {
          const newMap = new Map(prev);
          newMap.delete(widgetToDelete);
          return newMap;
        });
        setErrorWidgets((prev) => {
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

      if (!selectedDatabase || !selectedCollection) {
        toast.error("Please select both database and collection");
        return;
      }

      const updatedBranch = xAxis === "All" ? "All" : branch;
      const query = updatedBranch === "All" ? {} : { branch: updatedBranch };

      const projection: any = {};
      if (yAxis) projection[yAxis] = 1;
      projection["branch"] = 1;

      console.log("✅ [Filter] Applying configuration:", {
        database: selectedDatabase,
        collection: selectedCollection,
        query,
        projection,
        xField: "branch",
        yField: yAxis,
        branch: updatedBranch,
      });

      setWidgets((prev) =>
        prev.map((w) =>
          w.id === selectedWidget.id
            ? {
                ...w,
                data: {
                  database: selectedDatabase,
                  collection: selectedCollection,
                  query,
                  projection,
                  xField: "branch",
                  yField: yAxis,
                  branch: updatedBranch,
                },
              }
            : w
        )
      );

      setShowDrawer(false);
      toast.success("Widget configuration updated!");
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
    const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

    return (
      <div
        className={`workspace-container ${isPreviewMode ? "preview-mode" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!isPreviewMode && (
          <div className="workspace-header">
            <h5>
              Workspace{" "}
              {isAutoSaving && (
                <span className="auto-save-indicator">💾 Saving...</span>
              )}
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
       
        {!isPreviewMode && showDrawer && selectedWidget && (
          <>
            <div
              className="offcanvas-backdrop"
              onClick={() => setShowDrawer(false)}
            />

            <div className="offcanvas-panel">
              <div className="offcanvas-header">
                <h3>Widget Configuration</h3>
                <Button
                  icon="close"
                  fillMode="flat"
                  onClick={() => setShowDrawer(false)}
                />
              </div>

              <div className="offcanvas-body">
                <div className="offcanvas-body-content">
                  {/* Database Selection */}
                  <div className="form-field">
                    <Label>Database</Label>
                    {databaseOptions.length > 0 ? (
                      <DropDownList
                        data={databaseOptions}
                        textField="text"
                        dataItemKey="value"
                        value={
                          selectedDatabase
                            ? databaseOptions.find(
                                (opt) => opt.value === selectedDatabase
                              ) || databaseOptions[0]
                            : databaseOptions[0]
                        }
                        onChange={(e) => {
                          if (e.value?.value) {
                            handleDatabaseChange(e.value.value);
                          }
                        }}
                      />
                    ) : (
                      <div style={{ padding: "10px", color: "#999" }}>
                        Loading databases...
                      </div>
                    )}
                  </div>

                  {/* Collection Selection */}
                  {selectedDatabase && (
                    <div className="form-field">
                      <Label>Collection (Schema)</Label>
                      {collectionOptions.length > 0 ? (
                        <DropDownList
                          data={collectionOptions}
                          textField="text"
                          dataItemKey="value"
                          value={
                            selectedCollection
                              ? collectionOptions.find(
                                  (opt) => opt.value === selectedCollection
                                ) || collectionOptions[0]
                              : collectionOptions[0]
                          }
                          onChange={(e) => {
                            if (e.value?.value) {
                              setSelectedCollection(e.value.value);
                            }
                          }}
                        />
                      ) : (
                        <div style={{ padding: "10px", color: "#999" }}>
                          Loading collections...
                        </div>
                      )}
                    </div>
                  )}

                  {/* X-Axis Selection */}
                  <div className="form-field">
                    <Label>X-Axis</Label>
                    <DropDownList
                      data={xAxisOptions}
                      textField="text"
                      dataItemKey="value"
                      value={
                        xAxisOptions.find((opt) => opt.value === xAxis) ||
                        xAxisOptions[0]
                      }
                      onChange={(e) => {
                        if (e.value?.value) {
                          setXAxis(e.value.value);
                        }
                      }}
                    />
                  </div>

                  {/* Branch Selection (if Selected) */}
                  {xAxis === "Selected" && (
                    <div className="form-field">
                      <Label>Select Branch</Label>
                      <DropDownList
                        data={branchOptions}
                        textField="text"
                        dataItemKey="value"
                        value={
                          branchOptions.find((opt) => opt.value === branch) ||
                          branchOptions[0]
                        }
                        onChange={(e) => {
                          if (e.value?.value) {
                            setBranch(e.value.value);
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Y-Axis Selection */}
                  <div className="form-field">
                    <Label>Y-Axis</Label>
                    <DropDownList
                      data={yAxisOptions}
                      textField="text"
                      dataItemKey="value"
                      value={
                        yAxisOptions.find((opt) => opt.value === yAxis) ||
                        yAxisOptions[0]
                      }
                      onChange={(e) => {
                        if (e.value?.value) {
                          setYAxis(e.value.value);
                        }
                      }}
                    />
                  </div>

                  {/* Apply Button */}
                  <Button
                    themeColor="primary"
                    onClick={handleFilterApply}
                    className="apply-filter-btn"
                    disabled={!selectedDatabase || !selectedCollection}
                  >
                    Apply Configuration
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
        {showDeleteDialog && (
          <Dialog
            title="Confirm Delete"
            onClose={() => setShowDeleteDialog(false)}
            width={400}
          >
            <p style={{ margin: "20px 0" }}>
              Are you sure you want to delete this widget? This action cannot be
              undone.
            </p>
            <DialogActionsBar>
              <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button themeColor="error" onClick={confirmDelete}>
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

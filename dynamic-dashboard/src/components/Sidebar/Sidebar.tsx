// src/components/Sidebar/Sidebar.tsx
import React, { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import "./SidebarStyles.css";

interface SidebarProps {
  onSave: (layoutName: string) => void;
  onPreview: () => void;
  onAutoArrange: () => void;
  onNewDashboard: () => void;
}

const chartTypes = [
  { id: "BarChart", label: "Bar Chart", icon: "", description: "Compare values across categories" },
  { id: "PieChart", label: "Pie Chart", icon: "", description: "Show proportions and percentages" },
  { id: "LineChart", label: "Line Chart", icon: "", description: "Display trends over time" },
  { id: "Table", label: "Data Table", icon: "", description: "View raw data in rows and columns" },
];

const Sidebar: React.FC<SidebarProps> = ({
  onSave,
  onPreview,
  onAutoArrange,
  onNewDashboard,
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [layoutName, setLayoutName] = useState("");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleSave = () => {
    if (layoutName.trim()) {
      console.log("Saving layout:", layoutName);
      onSave(layoutName.trim());
      setLayoutName("");
      setShowSaveModal(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, chartType: string) => {
    e.dataTransfer.setData("chartType", chartType);
    setDraggedItem(chartType);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <>
      <div className="sidebar-container">
        {/* Header */}
        <div className="sidebar-header">
          <h4 className="sidebar-title">📊 Dashboard Builder</h4>
          <p className="sidebar-subtitle">Drag charts to workspace</p>
        </div>

        {/* Content */}
        <div className="sidebar-content">
          <h6 className="sidebar-section-title">Available Charts</h6>

          <div className="chart-list">
            {chartTypes.map((chart) => (
              <div
                key={chart.id}
                className={`chart-card ${
                  draggedItem === chart.id ? "dragging" : ""
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, chart.id)}
                onDragEnd={handleDragEnd}
              >
                <span className="chart-icon">{chart.icon}</span>
                <div className="chart-info">
                  <div className="chart-label">{chart.label}</div>
                  <div className="chart-description">{chart.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="tip-box">
            <p className="tip-text">
              💡 <strong>Tip:</strong> Drag any chart from above and drop it
              onto the workspace. Enable Edit Mode to configure chart data fields.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sidebar-footer">
          <Button themeColor="info" fillMode="outline" onClick={onNewDashboard}>
            New Dashboard
          </Button>

          <Button themeColor="secondary" onClick={onAutoArrange}>
            Auto Arrange
          </Button>

          <Button
            themeColor="success"
            fillMode="outline"
            onClick={() => setShowSaveModal(true)}
          >
            Save Layout
          </Button>

          <Button themeColor="primary" onClick={onPreview}>
            Preview Layouts
          </Button>
        </div>
      </div>

      {showSaveModal && (
        <Dialog
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>💾</span>
              <strong>Save Layout</strong>
            </div>
          }
          onClose={() => setShowSaveModal(false)}
        >
          <div className="save-modal-body">
            <label className="save-modal-label">Layout Name</label>
            <Input
              placeholder="e.g., Sales Dashboard, Analytics View"
              value={layoutName}
              onChange={(e) => setLayoutName(e.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
              className="save-modal-input"
            />
            <small className="save-modal-hint">
              Choose a descriptive name for your dashboard layout
            </small>
          </div>

          <DialogActionsBar>
            <Button
              themeColor="secondary"
              onClick={() => setShowSaveModal(false)}
            >
              Cancel
            </Button>
            <Button
              themeColor="success"
              fillMode="outline"
              onClick={handleSave}
              disabled={!layoutName.trim()}
            >
              Save Layout
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
};

export default Sidebar;

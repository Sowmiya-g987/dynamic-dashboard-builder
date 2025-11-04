// src/components/Sidebar/Sidebar.tsx

import React, { useState } from "react";
import { ListGroup, Button, Modal, Form } from "react-bootstrap";

interface SidebarProps {
  onSave: (layoutName: string) => void;
  onPreview: () => void;
  onAutoArrange: () => void;
  onNewDashboard: () => void;
}

const chartTypes = [
  { id: "BarChart", label: "Bar Chart", icon: "📊", description: "Compare values across categories" },
  { id: "PieChart", label: "Pie Chart", icon: "🥧", description: "Show proportions and percentages" },
  { id: "LineChart", label: "Line Chart", icon: "📈", description: "Display trends over time" },
  { id: "Table", label: "Data Table", icon: "📋", description: "View raw data in rows and columns" },
];

const Sidebar: React.FC<SidebarProps> = ({ onSave, onPreview, onAutoArrange, onNewDashboard }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [layoutName, setLayoutName] = useState("");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleSave = () => {  
    if (layoutName.trim()) {
      console.log(" [Sidebar] Saving layout:", layoutName);
      onSave(layoutName.trim());
      setLayoutName("");
      setShowSaveModal(false);    
    }
  };  

  const handleDragStart = (e: React.DragEvent, chartType: string) => {
    console.log(" [Sidebar] Drag started:", chartType);
    e.dataTransfer.setData("chartType", chartType);
    setDraggedItem(chartType);
  };


  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <>
      <div
        className="bg-light"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "2px solid #dee2e6",
          boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
        }}
      >

        <div
          style={{
            padding: "1.5rem 1rem",
            borderBottom: "2px solid #dee2e6",
            backgroundColor: "#fff",
          }}
        >
          <h4 style={{ margin: 0, color: "#333", fontWeight: "700", fontSize: "18px" }}>
            Dashboard Builder
          </h4>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "11px", color: "#6c757d" }}>
            Drag charts to workspace
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          <h6 style={{ marginBottom: "0.75rem", color: "#495057", fontWeight: "600", fontSize: "13px" }}>
            Available Charts
          </h6>
          <ListGroup>
            {chartTypes.map((chart) => (
              <ListGroup.Item
                key={chart.id}
                action  
                draggable
                onDragStart={(e) => handleDragStart(e, chart.id)}
                onDragEnd={handleDragEnd}
                style={{
                  cursor: "grab",
                  marginBottom: "0.5rem",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  backgroundColor: draggedItem === chart.id ? "#e7f3ff" : "#fff",
                  transition: "all 0.2s ease",
                  padding: "0.75rem",
                }}  
                onMouseEnter={(e) => {
                  if (draggedItem !== chart.id) {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (draggedItem !== chart.id) {
                    e.currentTarget.style.backgroundColor = "#fff";
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "24px" }}>{chart.icon}</span>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "13px", color: "#333" }}>
                      {chart.label}
                    </div>
                    <div style={{ fontSize: "10px", color: "#6c757d", marginTop: "2px" }}>
                      {chart.description}
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>


          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              backgroundColor: "#e7f3ff",
              borderRadius: "8px",
              border: "1px solid #b3d9ff",
            }}
          >
            <p style={{ margin: 0, fontSize: "11px", color: "#004085", lineHeight: "1.5" }}>
              <strong>Tip:</strong> Drag any chart from above and drop it onto the workspace. Enable Edit Mode to configure the chart data fields.
            </p>
          </div>
        </div>
        <div
          style={{
            padding: "1rem",
            borderTop: "2px solid #dee2e6",
            backgroundColor: "#fff",
          }}
        >
          <Button
            className="w-100 mb-2"
            variant="outline-info"
            onClick={onNewDashboard}
            style={{
              fontWeight: "600",
              padding: "0.6rem",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
         
            New Dashboard
          </Button>
          <Button
            className="w-100 mb-2"
            variant="secondary"
            onClick={onAutoArrange}
            style={{
              fontWeight: "600",
              padding: "0.6rem",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
          
            Auto Arrange
          </Button>
          <Button
            variant="outline-success"
            className="w-100 mb-2"
            onClick={() => setShowSaveModal(true)}
            style={{
              fontWeight: "600",
              padding: "0.6rem",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
      
            Save Layout
          </Button>
          <Button
            variant="primary"
            className="w-100"
            onClick={onPreview}
            style={{
              fontWeight: "600",
              padding: "0.6rem",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            Preview Layouts
          </Button>
        </div>
      </div>
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: "2px solid #dee2e6" }}>
          <Modal.Title style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>💾</span>
            Save Layout
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.5rem" }}>
          <Form>
            <Form.Group>
              <Form.Label style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                Layout Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Sales Dashboard, Analytics View"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSave()}
                autoFocus
                style={{
                  padding: "0.75rem",
                  fontSize: "14px",
                  borderRadius: "6px",
                }}
              />
              <Form.Text className="text-muted" style={{ fontSize: "12px" }}>
                Choose a descriptive name for your dashboard layout
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "2px solid #dee2e6" }}>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)} style={{ fontWeight: "600" }}>
            Cancel
          </Button>
          <Button
            variant="outline-success"
            onClick={handleSave}
            disabled={!layoutName.trim()}
            style={{ fontWeight: "600" }}
          >
             Save Layout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Sidebar;
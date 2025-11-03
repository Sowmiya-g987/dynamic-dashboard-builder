// src/components/Workspace/Widget.tsx

import React from "react";
import BarChartComp from "../Charts/BarChartComp";
import PieChartComp from "../Charts/PieChartComp";
import LineChartComp from "../Charts/LineChartComp";
import Table from "../Charts/Table";
import type { WidgetItem, ChartDataItem } from "../../types/ChartTypes";

interface WidgetProps {
  widget: WidgetItem;
  widgetData?: ChartDataItem[];
  loading?: boolean;
  error?: string;
  isEditMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const Widget: React.FC<WidgetProps> = ({
  widget,
  widgetData = [],
  loading = false,
  error,
  isEditMode = false,
  onEdit,
  onDelete,
}) => {
  const { type, data, id } = widget;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(" [Widget] Edit clicked for ID:", id);
    onEdit?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(" [Widget] Delete clicked for ID:", id);
    onDelete?.();
  };


  const hasConfiguration = data.xField && data.yField && data.xField !== "" && data.yField !== "";
  

  const displayData = hasConfiguration ? widgetData : [];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: isEditMode ? "2px solid #007bff" : "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Edit/Delete Buttons */}
      {isEditMode && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            display: "flex",
            gap: "5px",
            zIndex: 10,
          }}
        >
          <button
            onClick={handleEditClick}
            style={{
              padding: "6px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0056b3";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#007bff";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="Edit Widget"
          >
             Edit
          </button>
          <button
            onClick={handleDeleteClick}
            style={{
              padding: "6px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#c82333";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#dc3545";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="Delete Widget"
          >
            Delete
          </button>
        </div>
      )}

      {/* Widget Title */}
      <div
        style={{
          marginBottom: "8px",
          marginTop: isEditMode ? "35px" : "5px",
          textAlign: "center",
          fontSize: "13px",
          fontWeight: "600",
          color: "#333",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {type.toUpperCase()} Chart
        {hasConfiguration && (
          <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
            {data.yField} by {data.xField}
          </div>
        )}
        {!hasConfiguration && (
          <div style={{ fontSize: "10px", color: "#999", marginTop: "2px" }}>
            📊 Mock Data (Edit to configure)
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div
        style={{
          flex: 1,
          width: "100%",
          minHeight: 0,
          overflow: "hidden",
          pointerEvents: isEditMode ? "none" : "auto",
          opacity: isEditMode ? 0.7 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        {type === "bar" && (
          <BarChartComp
            data={displayData}
            xField={data.xField || "branch"}
            yField={data.yField || "NofEmployee"}
            loading={loading}
            error={error}
          />
        )}
        {type === "pie" && (
          <PieChartComp
            data={displayData}
            xField={data.xField || "branch"}
            yField={data.yField || "NofEmployee"}
            loading={loading}
            error={error}
          />
        )}
        {type === "line" && (
          <LineChartComp
            data={displayData}
            xField={data.xField || "branch"}
            yField={data.yField || "NofEmployee"}
            loading={loading}
            error={error}
          />
        )}
        {type === "table" && (
          <Table
            data={displayData}
            xField={data.xField || "branch"}
            yField={data.yField || "NofEmployee"}
            loading={loading}
            error={error}
          />
        )}
      </div>

      {/* Edit Mode Badge */}
      {isEditMode && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            padding: "3px 8px",
            backgroundColor: "rgba(0, 123, 255, 0.1)",
            color: "#007bff",
            fontSize: "9px",
            fontWeight: "600",
            borderRadius: "4px",
            border: "1px solid #007bff",
          }}
        >
          📝 EDIT MODE
        </div>
      )}
    </div>
  );
};

export default Widget;
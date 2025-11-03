// src/components/Charts/Table.tsx

import React from "react";
import type { ChartDataItem } from "../../types/ChartTypes";
import mockData from "../data/mockData";

interface TableProps {
  data: ChartDataItem[];
  xField: string;
  yField: string;
  loading?: boolean;
  error?: string;
}

const Table: React.FC<TableProps> = ({ data, xField, yField, loading, error }) => {
  const chartData = (data && data.length > 0 ? data : mockData) || mockData;
  
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: "10px" }}>Loading table data...</p>
      </div>
    );
  }

if (error) {
    console.warn(" Error fetching data. Using mock data instead:", error);
  }

  const keys = Array.from(new Set(chartData.flatMap((item) => Object.keys(item))));

  return (
    <div style={{ overflowX: "auto", overflowY: "auto", width: "100%", height: "100%" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
        }}
      >
        <thead style={{ backgroundColor: "#f4f4f4", position: "sticky", top: 0, zIndex: 1 }}>
          <tr>
            {keys.map((key) => (
              <th key={key} style={thStyle}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chartData.map((item, index) => (
            <tr key={index} style={index % 2 ? trAltStyle : trStyle}>
              {keys.map((key) => (
                <td key={key} style={tdStyle}>
                  {item[key] !== undefined ? item[key] : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "10px 8px",
  borderBottom: "2px solid #ddd",
  textAlign: "left",
  fontWeight: "600",
  color: "#333",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #eee",
  color: "#555",
};

const trStyle: React.CSSProperties = {
  backgroundColor: "#fff",
};

const trAltStyle: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
};

export default Table;
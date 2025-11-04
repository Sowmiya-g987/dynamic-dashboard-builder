import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataItem } from "../../types/ChartTypes";
import mockData from "../data/mockData";

interface Props {
  data: ChartDataItem[];
  xField: string;
  yField: string;
  loading?: boolean;
  error?: string;
}

const BarChartComp: React.FC<Props> = ({ data, xField, yField, loading, error }) => {
  const chartData = (data && data.length > 0 ? data : mockData) || mockData;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#666",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "10px" }}>Loading chart data...</p>
        </div>
      </div>
    );
  }


  if (error) {
    console.warn("Error fetching data. Using mock data instead:", error);
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} style={{ fontSize: "12px" }} />
        <YAxis style={{ fontSize: "12px" }} />
        <Tooltip />
        <Bar dataKey={yField} fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComp;

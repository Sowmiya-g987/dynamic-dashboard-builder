// src/components/Charts/LineChartComp.tsx

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

const LineChartComp: React.FC<Props> = ({ data, xField, yField, loading, error }) => {
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
    console.warn(" Error fetching data. Using mock data instead:", error);
  }


  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} style={{ fontSize: "12px" }} />
        <YAxis style={{ fontSize: "12px" }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Line 
          type="monotone" 
          dataKey={yField} 
          stroke="#8884d8" 
          activeDot={{ r: 8 }} 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComp;
// src/components/Charts/BarChartComp.tsx
import React from "react";
import {
  Chart,
  ChartTitle,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartSeries,
  ChartSeriesItem,
  ChartTooltip,
  ChartArea,
  ChartLegend,
} from "@progress/kendo-react-charts";
import "@progress/kendo-theme-default/dist/all.css";
import type { ChartDataItem } from "../../types/ChartTypes";
import mockData from "../data/mockData";
import "./Charts.css";

interface Props {
  data: ChartDataItem[];
  xField: string;
  yField: string;
  loading?: boolean;
  error?: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF6B6B", "#4ECDC4"];

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

  const categories = chartData.map((item) => item[xField]);
  const values = chartData.map((item) => item[yField]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Chart style={{ height: "100%", width: "100%" }}>
        <ChartTitle text={`${yField} vs ${xField}`} />
        <ChartArea background="transparent" />
        <ChartLegend position="bottom" orientation="horizontal" />
        <ChartTooltip format="{0}" />
        <ChartCategoryAxis>
          <ChartCategoryAxisItem
            categories={categories}
            labels={{ rotation: -45 }}
          />
        </ChartCategoryAxis>

        <ChartSeries>
          <ChartSeriesItem
            type="column"
            data={values}
            name={yField}
            color={(point: { index: number; }) => COLORS[point.index % COLORS.length]}
            tooltip={{
              visible: true,
              format: "{0}",
            }}
            labels={{
              visible: true,
              background: "transparent",
              content: (e) => `${e.category}: ${e.value}`,
            }}
          />
        </ChartSeries>
      </Chart>
    </div>
  );
};

export default BarChartComp;

// src/components/Charts/LineChartComp.tsx

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
    console.warn("Error fetching data. Using mock data instead:", error);
  }

  const categories = chartData.map((item) => item[xField]);
  const values = chartData.map((item) => item[yField]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Chart>
        <ChartTitle text={`${yField} vs ${xField}`} />
        <ChartArea background="transparent" />
        <ChartCategoryAxis>
          <ChartCategoryAxisItem categories={categories} labels={{ rotation: -45 }} />
        </ChartCategoryAxis>
        <ChartSeries>
          <ChartSeriesItem
            type="line"
            data={values}
            name={yField}
            tooltip={{ visible: true }}
            markers={{ visible: true }}
          />
        </ChartSeries>
        <ChartTooltip format="{0}" />
        <ChartLegend position="bottom" orientation="horizontal" />
      </Chart>
    </div>
  );
};

export default LineChartComp;
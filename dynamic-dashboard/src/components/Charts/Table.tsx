// src/components/Charts/Table.tsx

import React from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import type { ChartDataItem } from "../../types/ChartTypes";
import mockData from "../data/mockData";
import "@progress/kendo-theme-default/dist/all.css";

interface Props {
  data: ChartDataItem[];
  xField: string;
  yField: string;
  loading?: boolean;
  error?: string;
}

const Table: React.FC<Props> = ({ data, xField, yField, loading, error }) => {
  const tableData = (data && data.length > 0 ? data : mockData) || mockData;

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
          <p style={{ marginTop: "10px" }}>Loading table data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn("Error fetching data. Using mock data instead:", error);
  }

  return (
    <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <Grid
        data={tableData}
        style={{ height: "100%", fontSize: "12px" }}
      >
        <GridColumn field={xField} title={xField} width="150px" />
        <GridColumn field={yField} title={yField} width="120px" />
      </Grid>
    </div>
  );
};

export default Table;
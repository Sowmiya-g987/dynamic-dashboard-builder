// src/components/Charts/Table.tsx

import React,{useState} from "react";
import type { ChartDataItem } from "../../types/ChartTypes";
import mockData from "../data/mockData";  
import { Grid, GridColumn as Column, GridSortChangeEvent } from "@progress/kendo-react-grid";
import "@progress/kendo-theme-default/dist/all.css";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import "./Charts.css";

interface TableProps {
  data: ChartDataItem[];
  xField: string;
  yField: string;
  loading?: boolean;
  error?: string;
}

const Table: React.FC<TableProps> = ({ data, xField, yField, loading, error }) => {
    const [sort, setSort] = useState<SortDescriptor[]>([]);
  
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
      <Grid
      
         data={orderBy(chartData, sort)} 
             sortable={true}
             sort={sort}
             onSortChange={(e: GridSortChangeEvent) => setSort(e.sort)} // Update sort state on user action
             className="table__style"
        filterable={true}
        resizable={true}
        reorderable={true}
      >
        {keys.map((key) => (
          <Column
            key={key}
            field={key}
            title={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
          />
        ))}
      </Grid>
    </div>
  );
};

export default Table;
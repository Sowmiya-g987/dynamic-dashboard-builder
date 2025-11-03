import React, { useState } from "react";
import { Grid, GridColumn as Column, GridSortChangeEvent } from "@progress/kendo-react-grid";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import "@progress/kendo-theme-default/dist/all.css";

// ✅ Define the props type
interface KendoReactGridProps {
  data: Record<string, any>[]; // Array of objects, e.g. [{ branch: "Chennai", employees: 20 }]
}

const KendoReactGrid: React.FC<KendoReactGridProps> = ({ data }) => {
  // ✅ sort state typed as SortDescriptor array
  const [sort, setSort] = useState<SortDescriptor[]>([]);

  // ✅ safely handle case when data might be empty
  const keys = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Grid
      data={orderBy(data, sort)} // Apply sorting to the data
      sortable={true}
      sort={sort}
      onSortChange={(e: GridSortChangeEvent) => setSort(e.sort)} // Update sort state on user action
      style={{
        height: "400px",
        fontSize: "13px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {keys.map((key) => (
        <Column
          key={key}
          field={key}
          title={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
          sortable={true}
        />
      ))}
    </Grid>
  );
};

export default KendoReactGrid;

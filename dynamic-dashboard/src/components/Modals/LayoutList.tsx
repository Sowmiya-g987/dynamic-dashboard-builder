
import React from "react";
import type { SavedLayout } from "../../types/ChartTypes";
import LayoutCard from "./LayoutCard";

interface LayoutListProps {
  layouts: SavedLayout[];
  onView: (layoutId: string) => void;
  onEdit: (layoutId: string) => void;
  onDelete: (layoutId: string, layoutName: string) => void;
}

const LayoutList: React.FC<LayoutListProps> = ({
  layouts,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="layout-list">
      {layouts.map((layout) => (
        <LayoutCard
          key={layout.id}
          layout={layout}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default LayoutList;

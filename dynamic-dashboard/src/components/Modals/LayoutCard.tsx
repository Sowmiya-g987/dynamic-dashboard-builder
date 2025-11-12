
import React from "react";
import { Button } from "@progress/kendo-react-buttons";
import type { SavedLayout } from "../../types/ChartTypes";

interface LayoutCardProps {
  layout: SavedLayout;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

const LayoutCard: React.FC<LayoutCardProps> = ({
  layout,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="layout-card"
      onMouseEnter={(e) => e.currentTarget.classList.add("hovered")}
      onMouseLeave={(e) => e.currentTarget.classList.remove("hovered")}
    >
      <div className="layout-card-content">
        <div className="layout-card-info">
          <strong>{layout.layoutName}</strong>
          <small>🕒 {new Date(layout.createdAt).toLocaleString()}</small>
        </div>
        <div className="layout-card-actions">
          <Button
            size="small"
            themeColor="primary"
            fillMode="outline"
            onClick={() => onView(layout.id)}
          >
            View
          </Button>
          <Button
            size="small"
            themeColor="success"
            fillMode="outline"
            onClick={() => onEdit(layout.id)}
          >
            Edit
          </Button>
          <Button
            size="small"
            themeColor="error"
            fillMode="outline"
            onClick={() => onDelete(layout.id, layout.layoutName)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LayoutCard;

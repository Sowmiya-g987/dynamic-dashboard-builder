// src/components/Modals/PreviewModal.tsx
import React, { useEffect, useState } from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import { Loader } from "@progress/kendo-react-indicators";
import { layoutApi } from "../../utils/api";
import type { SavedLayout } from "../../types/ChartTypes";
import { toast } from "react-toastify";
import LayoutList from "./LayoutList";
import "./PreviewModalStyles.css";

interface PreviewModalProps {
  show: boolean;
  onHide: () => void;
  onViewLayout: (layoutId: string) => void;
  onEditLayout: (layoutId: string) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  show,
  onHide,
  onViewLayout,
  onEditLayout,
}) => {
  const [layouts, setLayouts] = useState<SavedLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) fetchLayouts();
  }, [show]);

  useEffect(() => {
    if (error) toast.error(" " + error);
  }, [error]);

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(" [PreviewModal] Fetching saved layouts");

      const fetchedLayouts = await layoutApi.getAllLayouts();
      console.log(" [PreviewModal] Layouts retrieved:", fetchedLayouts.length);
      setLayouts(fetchedLayouts);
    } catch (err: any) {
      console.error(" [PreviewModal] Error fetching layouts:", err);
      setError(err.message || "Failed to load saved layouts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (layoutId: string, layoutName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${layoutName}"?`)) return;
    try {
      await layoutApi.deleteLayout(layoutId);
      toast.success(`Layout "${layoutName}" deleted successfully!`);
      fetchLayouts();
    } catch (err: any) {
      toast.error("Failed to delete layout: " + err.message);
    }
  };

  if (!show) return null;

  return (
    <Dialog title={"Saved Layouts"} onClose={onHide} width={700} minWidth={600}>
      <div className="preview-modal-body">
        {loading ? (
          <div className="loading-container">
            <Loader size="large" type="infinite-spinner" />
            <p className="loading-text">Loading layouts...</p>
          </div>
        ) : error ? (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        ) : layouts.length === 0 ? (
          <div className="no-layouts">
            <p className="no-layouts-text">No saved layouts found</p>
            <p className="no-layouts-subtext">
              Create your first layout by arranging widgets and clicking <b>“Save Layout”</b>.
            </p>
          </div>
        ) : (
          <LayoutList
            layouts={layouts}
            onView={onViewLayout}
            onEdit={onEditLayout}
            onDelete={handleDelete}
          />
        )}
      </div>

      <DialogActionsBar>
        <Button themeColor="secondary" fillMode="solid" onClick={onHide}>
          Close
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
};

export default PreviewModal;

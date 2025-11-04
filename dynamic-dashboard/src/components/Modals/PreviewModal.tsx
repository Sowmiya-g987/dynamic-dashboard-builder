// src/components/Modals/PreviewModal.tsx

import React, { useEffect, useState } from "react";
import { Modal, ListGroup, Button, Spinner, Alert } from "react-bootstrap";
import { layoutApi } from "../../utils/api";
import type { SavedLayout } from "../../types/ChartTypes";
import { toast } from "react-toastify";

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
    if (show) {
      fetchLayouts();
    }
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

  const handleView = (layoutId: string) => {
    console.log(" [PreviewModal] View layout:", layoutId);
    onViewLayout(layoutId);
    onHide();
  };

  const handleEdit = (layoutId: string) => {
    console.log("[PreviewModal] Edit layout:", layoutId);
    onEditLayout(layoutId);
    onHide();
  };

  const handleDelete = async (layoutId: string, layoutName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${layoutName}"?`)) return;

    try {
      console.log(" [PreviewModal] Deleting layout:", layoutId);
      await layoutApi.deleteLayout(layoutId);

      toast.success(`Layout "${layoutName}" deleted successfully!`);
      fetchLayouts(); // Refresh
    } catch (err: any) {
      console.error(" [PreviewModal] Error deleting layout:", err);
      toast.error("Failed to delete layout: " + err.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ borderBottom: "2px solid #dee2e6" }}>
        <Modal.Title>
         
          Saved Layouts
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3" style={{ color: "#666" }}>
              Loading layouts...
            </p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            <strong>Error:</strong> {error}
          </Alert>
        ) : layouts.length === 0 ? (
          <div className="text-center p-4">
            <p style={{ color: "#999", fontSize: "16px" }}>📭 No saved layouts found</p>
            <p style={{ color: "#999", fontSize: "13px" }}>
              Create your first layout by arranging widgets and clicking "Save Layout"
            </p>
          </div>
        ) : (
          <ListGroup>
            {layouts.map((layout) => (
              <ListGroup.Item
                key={layout.id}
                style={{
                  marginBottom: "0.5rem",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: "15px", color: "#333" }}>
                      {layout.layoutName}
                    </strong>
                    <br />
                    <small style={{ color: "#6c757d", fontSize: "12px" }}>
                      Created: {new Date(layout.createdAt).toLocaleDateString()}{" "}
                      {new Date(layout.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleView(layout.id)}
                      style={{ fontWeight: "600", fontSize: "12px" }}
                    >
                       View
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleEdit(layout.id)}
                      style={{ fontWeight: "600", fontSize: "12px" }}
                    >
                       Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(layout.id, layout.layoutName)}
                      style={{ fontWeight: "600", fontSize: "12px" }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer style={{ borderTop: "2px solid #dee2e6" }}>
        <Button variant="secondary" onClick={onHide} style={{ fontWeight: "600" }}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;
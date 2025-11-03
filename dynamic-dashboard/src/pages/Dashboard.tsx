// src/pages/Dashboard.tsx

import React, { useRef, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Workspace from "../components/Workspace/Workspace";
import type { WorkspaceRef } from "../components/Workspace/Workspace";
import PreviewModal from "../components/Modals/PreviewModal";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const workspaceRef = useRef<WorkspaceRef>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [mode, setMode] = useState<"normal" | "view" | "edit">("normal");
  const [editMode, setEditMode] = useState(false);

  const navigate = useNavigate();

  const handleSaveLayout = (layoutName: string) => {
    if (workspaceRef.current) {
      workspaceRef.current.saveLayout(layoutName);
    }
  };

  const handlePreview = () => setShowPreviewModal(true);

  const handleViewLayout = (layoutId: string) => {
    console.log("[Dashboard] Navigating to preview:", layoutId);
    navigate(`/preview/${layoutId}`);
    setShowPreviewModal(false);
  };  

  const handleEditLayout = (layoutId: string) => {
    if (workspaceRef.current) {
      console.log("[Dashboard] Loading layout for editing:", layoutId);
      workspaceRef.current.loadLayout(layoutId);
      setMode("edit");
      setShowPreviewModal(false);
    }
  };

  const handleAutoArrange = () => {
    if (workspaceRef.current) {
      workspaceRef.current.autoArrange();
    }
  };

  const handleNewDashboard = () => {
    if (workspaceRef.current) {
      console.log(" [Dashboard] Creating new dashboard");
      workspaceRef.current.createNewDashboard();
    }
  };

  const showSidebar = mode === "normal" || mode === "edit";
  const isReadOnly = mode === "view";

  return (
    <>
      <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
        
        {showSidebar && (
          <div style={{ width: "280px", flexShrink: 0 }}>
            <Sidebar
              onSave={handleSaveLayout}
              onPreview={handlePreview}
              onAutoArrange={handleAutoArrange}
              onNewDashboard={handleNewDashboard}
            />
          </div>
        )}

      
        <div style={{ flexGrow: 1, position: "relative", overflow: "hidden" }}>
          <Workspace
            ref={workspaceRef}
            isPreviewMode={isReadOnly}
            editMode={editMode}
            onEditModeChange={setEditMode}
          />
        </div>
      </div>

      <PreviewModal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        onViewLayout={handleViewLayout}
        onEditLayout={handleEditLayout}
      />
    </>
  );
};

export default Dashboard;
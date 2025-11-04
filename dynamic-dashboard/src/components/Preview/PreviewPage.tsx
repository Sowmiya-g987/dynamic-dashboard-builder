// src/components/Preview/PreviewPage.tsx

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Workspace from "../Workspace/Workspace";
import type { WorkspaceRef } from "../Workspace/Workspace";

const PreviewPage: React.FC = () => {
  const { layoutId } = useParams<{ layoutId: string }>();
  const workspaceRef = useRef<WorkspaceRef>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (layoutId && workspaceRef.current) {
      console.log("[PreviewPage] Loading layout:", layoutId);
      setIsLoading(true);
      
     
      workspaceRef.current.loadLayout(layoutId).then(() => {
        console.log(" [PreviewPage] Layout loaded successfully");
        setIsLoading(false);
        
        
        setTimeout(() => {
          if (workspaceRef.current) {
            console.log(" [PreviewPage] Fetching live data");
            workspaceRef.current.refreshData();
          }
        }, 500);
      }).catch((error) => {
        console.error(" [PreviewPage] Error loading layout:", error);
        setIsLoading(false);
      });
    }
  }, [layoutId]);




  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
     
      <div
        style={{
          padding: "1rem 2rem",
          backgroundColor: "#fff",
          borderBottom: "2px solid #dee2e6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ margin: 0, color: "#333", fontSize: "20px", fontWeight: "700" }}>
           Layout Preview {isLoading && <span style={{ fontSize: "14px", color: "#666" }}>Loading...</span>}
        </h3>
        <div style={{ display: "flex", gap: "0.75rem" }}>
         
     
        </div>
      </div>

      {/* Workspace */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Workspace ref={workspaceRef} isPreviewMode={true} />
      </div>
    </div>
  );
};

export default PreviewPage;
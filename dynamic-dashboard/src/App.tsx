import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PreviewPage from "./components/Preview/PreviewPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "@progress/kendo-theme-default/dist/all.css";

import "react-toastify/dist/ReactToastify.css";
const App: React.FC = () => {
  return (
    <>
          <ToastContainer position="top-right" autoClose={3000} />
           <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/preview/:layoutId" element={<PreviewPage />} />
      </Routes>
    </Router>
</>
  );
};
export default App;
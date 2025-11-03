import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PreviewPage from "./components/Preview/PreviewPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import '@progress/kendo-theme-default/dist/all.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KindoReact from "./components/Charts/KindoReact";
import mockData from "./components/data/mockData";
const App: React.FC = () => {
  return (
    <>
          <ToastContainer position="top-right" autoClose={3000} />
           <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/preview/:layoutId" element={<PreviewPage />} />
        <Route path="/kindo" element={<KindoReact data={mockData} />} />
      </Routes>
    </Router>
</>
  );
};
export default App;
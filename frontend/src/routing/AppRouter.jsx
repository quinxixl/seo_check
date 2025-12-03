import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import Pricing from "../pages/Pricing/Pricing.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Report from "../pages/Report/Report.jsx";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute.jsx";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
  </Routes>
);

export default AppRouter;

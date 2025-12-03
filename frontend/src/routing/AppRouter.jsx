import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Report from "../pages/Report/Report.jsx";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute.jsx";
import Payment from "../pages/Payment/Payment.jsx";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
  </Routes>
);

export default AppRouter;

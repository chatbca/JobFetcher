import React, { createContext, useContext, useEffect, useState } from "react";
import { adminLogin as adminLoginApi, getAdminProfile } from "../services/api";

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const response = await getAdminProfile();
        setAdmin(response.data);
      } catch (error) {
        localStorage.removeItem("adminToken");
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await adminLoginApi(email, password);
    localStorage.setItem("adminToken", response.data.token);
    setAdmin(response.data.recruiter);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
  };

  const value = {
    admin,
    login,
    logout,
    loading,
    isAuthenticated: !!admin
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

// Base URL is handled by Vite proxy in development
// axios.defaults.baseURL = "http://localhost:8000";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set Authorization header for all requests
  const setAuthHeader = (jwtToken) => {
    if (jwtToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("shophub_token");
      if (savedToken) {
        try {
          setAuthHeader(savedToken);
          const response = await axios.get("/api/v1/auth/me");
          setUser(response.data);
          setToken(savedToken);
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem("shophub_token");
          setAuthHeader(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (username, password) => {
    try {
      // API expects form urlencoded data for OAuth2 request form
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const response = await axios.post("/api/v1/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const accessToken = response.data.access_token;
      localStorage.setItem("shophub_token", accessToken);
      setAuthHeader(accessToken);

      // Fetch user profile info
      const profileResponse = await axios.get("/api/v1/auth/me");
      setUser(profileResponse.data);
      setToken(accessToken);
      return profileResponse.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error.response?.data?.detail || "Login failed. Please check credentials.";
    }
  };

  const register = async (username, email, password, admin_code = "") => {
    try {
      const payload = {
        username,
        email,
        password,
      };
      if (admin_code) {
        payload.admin_code = admin_code;
      }
      const response = await axios.post("/api/v1/auth/register", payload);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error.response?.data?.detail || "Registration failed.";
    }
  };

  const logout = () => {
    localStorage.removeItem("shophub_token");
    setAuthHeader(null);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin" || user?.is_admin === true,
        isShipper: user?.role === "shipper",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

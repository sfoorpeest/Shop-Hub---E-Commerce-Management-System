import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";

// Providers
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Components & Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import ShipperDashboard from "./pages/ShipperDashboard";
import ChatWidget from "./components/ChatWidget";

// Custom theme mapping to match HSL curated palettes & dark slate aesthetic
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6366f1", // Indigo 500
      light: "#818cf8",
      dark: "#4f46e5",
    },
    secondary: {
      main: "#10b981", // Emerald 500
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#0b0f19",
      paper: "rgba(30, 41, 59, 0.45)",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
  },
  typography: {
    fontFamily: "'Outfit', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
        },
      },
    },
  },
});

// Guard components for role restrictions
const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Don't redirect while checking auth state on reload
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired) {
    const hasAdminAccess = user?.role === "admin" || user?.is_admin === true;
    const hasShipperAccess = user?.role === "shipper";

    if (roleRequired === "admin" && !hasAdminAccess) {
      return <Navigate to="/" replace />;
    }

    if (roleRequired === "shipper" && !hasShipperAccess && !hasAdminAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Router>
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Customer protected routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin protected routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute roleRequired="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Shipper protected routes */}
                  <Route
                    path="/shipper"
                    element={
                      <ProtectedRoute roleRequired="shipper">
                        <ShipperDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
              <Footer />
              <ChatWidget />
            </Box>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

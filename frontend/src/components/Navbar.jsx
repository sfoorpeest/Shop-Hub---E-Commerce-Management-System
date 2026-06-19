import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  Tooltip,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShippingIcon from "@mui/icons-material/LocalShipping";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isShipper } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      className="glass-panel"
      sx={{
        backgroundColor: "rgba(15, 23, 42, 0.6) !important",
        backdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "none",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <StorefrontIcon sx={{ color: "#6366f1", fontSize: 28 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 800,
                letterSpacing: ".5px",
                color: "#fff",
                background: "linear-gradient(to right, #fff, #a5b4fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ShopHub
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              component={RouterLink}
              to="/products"
              sx={{ color: "#cbd5e1", fontWeight: 500, textTransform: "none" }}
            >
              Shop
            </Button>

            {isAuthenticated && (
              <Button
                component={RouterLink}
                to="/orders"
                sx={{ color: "#cbd5e1", fontWeight: 500, textTransform: "none" }}
              >
                My Orders
              </Button>
            )}

            {isAdmin && (
              <Button
                component={RouterLink}
                to="/admin"
                startIcon={<DashboardIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: "#818cf8",
                  fontWeight: 600,
                  textTransform: "none",
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  "&:hover": { backgroundColor: "rgba(99, 102, 241, 0.15)" },
                }}
              >
                Dashboard
              </Button>
            )}

            {isShipper && (
              <Button
                component={RouterLink}
                to="/shipper"
                startIcon={<ShippingIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: "#34d399",
                  fontWeight: 600,
                  textTransform: "none",
                  backgroundColor: "rgba(52, 211, 153, 0.08)",
                  "&:hover": { backgroundColor: "rgba(52, 211, 153, 0.15)" },
                }}
              >
                Shipper Portal
              </Button>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Cart Icon */}
            <IconButton
              component={RouterLink}
              to="/cart"
              sx={{
                color: "#cbd5e1",
                transition: "transform 0.2s ease-in-out",
                "&:hover": { color: "#6366f1", transform: "scale(1.05)" },
              }}
            >
              <Badge badgeContent={cartCount} color="error" overlap="circular">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Profile / Login */}
            {isAuthenticated ? (
              <Box>
                <Tooltip title="Account Options">
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: isAdmin ? "#6366f1" : isShipper ? "#10b981" : "#475569",
                        width: 36,
                        height: 36,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "#fff",
                        border: "2px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      {user?.username?.substring(0, 2).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    className: "glass-panel",
                    sx: {
                      mt: 1.5,
                      minWidth: 160,
                      backgroundColor: "rgba(15, 23, 42, 0.95) !important",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#f1f5f9",
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff" }}>
                      {user?.full_name || user?.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8", textTransform: "capitalize" }}>
                      Role: {user?.role}
                    </Typography>
                  </Box>
                  <MenuItem onClick={handleMenuClose} component={RouterLink} to="/orders" sx={{ py: 1 }}>
                    My Orders
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem onClick={handleMenuClose} component={RouterLink} to="/admin" sx={{ py: 1 }}>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  {isShipper && (
                    <MenuItem onClick={handleMenuClose} component={RouterLink} to="/shipper" sx={{ py: 1 }}>
                      Shipper Portal
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} sx={{ py: 1, color: "#ef4444", fontWeight: 500 }}>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="small"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "#6366f1",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "#4f46e5" },
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;

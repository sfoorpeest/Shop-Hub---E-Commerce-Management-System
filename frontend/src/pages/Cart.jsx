import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: "center" }}>
        <ShoppingCartOutlined sx={{ fontSize: 64, color: "#64748b", mb: 2 }} />
        <Typography variant="h5" sx={{ color: "#fff", mb: 2, fontWeight: 700 }}>
          Your Shopping Cart is Empty
        </Typography>
        <Typography variant="body1" sx={{ color: "#94a3b8", mb: 4 }}>
          Browse our high-quality catalog to add items to your cart.
        </Typography>
        <Button
          component={RouterLink}
          to="/products"
          variant="contained"
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: "12px",
            bgcolor: "#6366f1",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "#4f46e5" },
          }}
        >
          Start Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 4 }}>
        Shopping Cart ({cartCount} items)
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items List */}
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              backgroundColor: "rgba(30, 41, 59, 0.3)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              p: 2,
            }}
          >
            <List>
              {cart.map((item, idx) => (
                <Box key={item.product.id}>
                  {idx > 0 && <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.05)", my: 2 }} />}
                  <ListItem
                    disableGutters
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: 2,
                    }}
                  >
                    {/* Product Image */}
                    <Avatar
                      variant="rounded"
                      src={item.product.image_url || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=200"}
                      sx={{ width: 80, height: 80, border: "1px solid rgba(255, 255, 255, 0.08)" }}
                    />

                    {/* Product Title / Price */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        component={RouterLink}
                        to={`/products/${item.product.id}`}
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: "#fff",
                          textDecoration: "none",
                          "&:hover": { color: "#818cf8" },
                        }}
                      >
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.85rem", mb: 0.5 }}>
                        Category: {item.product.category}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#818cf8", fontWeight: 700 }}>
                        ${item.product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>

                    {/* Quantity Selector */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        sx={{ color: "#cbd5e1", border: "1px solid rgba(255, 255, 255, 0.1)", p: 0.5 }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 24, textAlign: "center", fontWeight: 700 }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        sx={{ color: "#cbd5e1", border: "1px solid rgba(255, 255, 255, 0.1)", p: 0.5 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Subtotal & Delete */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: { sm: 120 }, justifyContent: "space-between" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#fff", ml: { sm: "auto" } }}>
                        ${(item.product.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Typography>
                      <IconButton onClick={() => removeFromCart(item.product.id)} sx={{ color: "#ef4444" }}>
                        <DeleteOutlined />
                      </IconButton>
                    </Box>
                  </ListItem>
                </Box>
              ))}
            </List>
          </Box>
        </Grid>

        {/* Order Summary Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              backgroundColor: "rgba(30, 41, 59, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 3 }}>
              Order Summary
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>Subtotal</Typography>
              <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>Shipping</Typography>
              <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 600 }}>Free</Typography>
            </Box>

            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.06)", my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
              <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 700 }}>Total</Typography>
              <Typography variant="subtitle1" sx={{ color: "#818cf8", fontWeight: 800 }}>
                ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleCheckoutClick}
              endIcon={<ArrowForward />}
              sx={{
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#6366f1",
                "&:hover": { bgcolor: "#4f46e5" },
              }}
            >
              {isAuthenticated ? "Proceed to Checkout" : "Sign In to Checkout"}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;

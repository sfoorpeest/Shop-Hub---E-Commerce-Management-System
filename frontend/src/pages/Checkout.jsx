import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CheckCircle from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !city || !phone) {
      setError("Please fill in all shipping details.");
      return;
    }

    setLoading(true);
    setError(null);

    const fullShippingAddress = `${address.trim()}, ${city.trim()} (Phone: ${phone.trim()})`;

    try {
      const orderItems = cart.map((item) => ({
        variant_id: item.variant.id,
        quantity: item.quantity,
      }));

      await axios.post("/api/v1/orders/", {
        shipping_address: fullShippingAddress,
        items: orderItems,
      });

      setSuccess(true);
      clearCart(); // Reset shopping cart
    } catch (err) {
      console.error("Checkout order error:", err);
      setError(err.response?.data?.detail || "Checkout failed. Please check inventory levels.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
        <CheckCircle sx={{ fontSize: 64, color: "#10b981", mb: 2 }} />
        <Typography variant="h4" sx={{ color: "#fff", mb: 2, fontWeight: 700 }}>
          Order Placed Successfully!
        </Typography>
        <Typography variant="body1" sx={{ color: "#94a3b8", mb: 4 }}>
          Thank you for your purchase. Your order status is set to "Processing" and will be claimed by a shipper shortly.
        </Typography>
        <Button
          component={RouterLink}
          to="/orders"
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
          View My Orders
        </Button>
      </Container>
    );
  }

  if (cart.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
        <Typography variant="h6" sx={{ color: "#cbd5e1", mb: 3 }}>
          Your cart is empty. Cannot checkout.
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained">
          Back to Shop
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back Button */}
      <Button
        component={RouterLink}
        to="/cart"
        startIcon={<ArrowBack />}
        sx={{ color: "#cbd5e1", mb: 4, textTransform: "none" }}
      >
        Back to Cart
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 4 }}>
        Shipping & Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: "10px" }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Shipping Form */}
        <Grid item xs={12} md={7}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              backgroundColor: "rgba(30, 41, 59, 0.35)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "16px",
              p: 4,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 1 }}>
              Shipping Details
            </Typography>

            <TextField
              fullWidth
              label="Recipient Name"
              value={user?.full_name || ""}
              disabled
              variant="outlined"
              sx={{ bgcolor: "rgba(15,23,42,0.25)", borderRadius: "8px" }}
            />

            <TextField
              fullWidth
              label="Shipping Address"
              placeholder="e.g. 123 Nguyen Trai Street, District 1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              variant="outlined"
              sx={{ bgcolor: "rgba(15,23,42,0.25)", borderRadius: "8px" }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City / Province"
                  placeholder="e.g. Ho Chi Minh City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  variant="outlined"
                  sx={{ bgcolor: "rgba(15,23,42,0.25)", borderRadius: "8px" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  placeholder="e.g. 0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  variant="outlined"
                  sx={{ bgcolor: "rgba(15,23,42,0.25)", borderRadius: "8px" }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#6366f1",
                "&:hover": { bgcolor: "#4f46e5" },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Place Order"}
            </Button>
          </Box>
        </Grid>

        {/* Order Review List */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              p: 3,
              backgroundColor: "rgba(30, 41, 59, 0.45)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "16px",
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 3 }}>
              Review Items
            </Typography>

            <List disablePadding>
              {cart.map((item) => {
                const itemPrice = item.product.base_price + (item.variant.additional_price || 0);
                return (
                <ListItem key={`${item.product.id}-${item.variant.id}`} sx={{ px: 0, py: 1.5 }}>
                  <ListItemText
                    primary={item.product.name}
                    secondary={`${item.variant.size} - ${item.variant.color} | Qty: ${item.quantity}`}
                    primaryTypographyProps={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}
                    secondaryTypographyProps={{ color: "#94a3b8" }}
                  />
                  <Typography variant="body2" sx={{ color: "#fff", fontWeight: 700 }}>
                    ${(itemPrice * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Typography>
                </ListItem>
                );
              })}
            </List>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>Items Total</Typography>
              <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>Delivery Fee</Typography>
              <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 600 }}>Free</Typography>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 700 }}>Final Total</Typography>
              <Typography variant="subtitle1" sx={{ color: "#818cf8", fontWeight: 800 }}>
                ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;

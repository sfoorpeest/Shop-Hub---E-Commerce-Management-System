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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CheckCircle from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatVND } from "../utils/currency";

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
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [orderAmount, setOrderAmount] = useState(0);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

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

      const response = await axios.post("/api/v1/orders", {
        shipping_address: fullShippingAddress,
        payment_method: paymentMethod,
        items: orderItems,
      });

      clearCart(); // Reset shopping cart immediately after order creation

      if (paymentMethod === "VNPAY") {
        try {
          const vnpayRes = await axios.post(`/api/v1/payment/vnpay/create_url/${response.data.id}`);
          if (vnpayRes.data && vnpayRes.data.payment_url) {
            window.location.href = vnpayRes.data.payment_url;
            return;
          }
        } catch (paymentErr) {
          console.error("VNPay payment URL error:", paymentErr);
          setError(paymentErr.response?.data?.detail || "Could not start VNPay payment. Please try again.");
          setLoading(false);
          return;
        }
      }

      setCreatedOrderId(response.data.id);
      setOrderAmount(response.data.total_amount);
      setSuccess(true);
    } catch (err) {
      console.error("Checkout order error:", err);
      setError(err.response?.data?.detail || "Checkout failed. Please check inventory levels.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      await axios.put(`/api/v1/orders/${createdOrderId}/pay`);
      setIsPaymentConfirmed(true);
    } catch (err) {
      console.error("Confirm payment error:", err);
      setPaymentError(err.response?.data?.detail || "Could not confirm payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (success) {
    if (paymentMethod === "BANK_TRANSFER" && !isPaymentConfirmed) {
      const BANK_ID = import.meta.env.VITE_BANK_ID || "vietinbank";
      const BANK_ACCOUNT = import.meta.env.VITE_BANK_ACCOUNT || "10987654321";
      const BANK_ACCOUNT_NAME = import.meta.env.VITE_BANK_ACCOUNT_NAME || "SHOP HUB OUTLET";
      const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-compact2.png?amount=${orderAmount}&addInfo=SHOPHUB%20ORDER%20${createdOrderId}&accountName=${encodeURIComponent(BANK_ACCOUNT_NAME)}`;

      return (
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Box
            sx={{
              backgroundColor: "rgba(30, 41, 59, 0.45)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "20px",
              p: { xs: 3, md: 5 },
              textAlign: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <CheckCircle sx={{ fontSize: 56, color: "#10b981", mb: 2 }} />
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, mb: 1 }}>
              Order Created!
            </Typography>
            <Typography variant="body1" sx={{ color: "#94a3b8", mb: 4 }}>
              Order ID: #{createdOrderId}. Please transfer the payment to complete your order.
            </Typography>

            <Grid container spacing={4} sx={{ textAlign: "left", mb: 4 }}>
              <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#fff",
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    maxWidth: 280,
                    width: "100%",
                  }}
                >
                  <img
                    src={qrUrl}
                    alt="VietQR Payment Code"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2.5 }}>
                <Typography variant="h6" sx={{ color: "#818cf8", fontWeight: 700 }}>
                  Transfer Details
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 1.5 }}>
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>Bank:</Typography>
                  <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>{BANK_ID.toUpperCase()}</Typography>
                  
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>Account No:</Typography>
                  <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>{BANK_ACCOUNT}</Typography>
                  
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>Account Name:</Typography>
                  <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>{BANK_ACCOUNT_NAME}</Typography>
                  
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>Amount:</Typography>
                  <Typography variant="body2" sx={{ color: "#818cf8", fontWeight: 700, fontSize: "1.1rem" }}>
                  {formatVND(orderAmount)}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>Message:</Typography>
                  <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 700 }}>
                    SHOPHUB ORDER {createdOrderId}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {paymentError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: "10px", textAlign: "left" }}>
                {paymentError}
              </Alert>
            )}

            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleConfirmPayment}
                disabled={paymentLoading}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: "12px",
                  bgcolor: "#10b981",
                  "&:hover": { bgcolor: "#059669" },
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {paymentLoading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "I have completed the transfer"}
              </Button>
              <Button
                component={RouterLink}
                to="/orders"
                variant="outlined"
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: "12px",
                  color: "#cbd5e1",
                  borderColor: "rgba(255,255,255,0.15)",
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "rgba(255,255,255,0.05)" },
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Pay Later / View Orders
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
        <CheckCircle sx={{ fontSize: 64, color: "#10b981", mb: 2 }} />
        <Typography variant="h4" sx={{ color: "#fff", mb: 2, fontWeight: 700 }}>
          {paymentMethod === "BANK_TRANSFER" ? "Payment Confirmed!" : "Order Placed Successfully!"}
        </Typography>
        <Typography variant="body1" sx={{ color: "#94a3b8", mb: 4 }}>
          {paymentMethod === "BANK_TRANSFER"
            ? `Thank you! Your payment for order #${createdOrderId} has been confirmed. The order is now being processed.`
            : "Thank you for your purchase. Your order status is set to \"Processing\" and will be claimed by a shipper shortly."}
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

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 1 }} />

            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 1 }}>
              Payment Method
            </Typography>

            <FormControl component="fieldset">
              <RadioGroup
                aria-label="payment-method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <FormControlLabel
                  value="COD"
                  control={<Radio sx={{ color: "#6366f1", '&.Mui-checked': { color: "#6366f1" } }} />}
                  label={
                    <Box>
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>
                        Cash on Delivery (COD)
                      </Typography>
                      <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                        Pay with cash upon delivery
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="BANK_TRANSFER"
                  control={<Radio sx={{ color: "#6366f1", '&.Mui-checked': { color: "#6366f1" } }} />}
                  label={
                    <Box>
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>
                        Bank Transfer (VietQR)
                      </Typography>
                      <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                        Scan QR code to pay instantly from any bank app
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="VNPAY"
                  control={<Radio sx={{ color: "#6366f1", '&.Mui-checked': { color: "#6366f1" } }} />}
                  label={
                    <Box>
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>
                        VNPay E-Wallet
                      </Typography>
                      <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                        Pay securely via VNPay Gateway (Sandbox)
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

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
                      {formatVND(itemPrice * item.quantity)}
                    </Typography>
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>Items Total</Typography>
              <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                {formatVND(cartTotal)}
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
                {formatVND(cartTotal)}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;

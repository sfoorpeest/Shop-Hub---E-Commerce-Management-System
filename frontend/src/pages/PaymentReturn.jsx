import React, { useEffect, useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { Container, Box, Typography, Button, CircularProgress, Card } from "@mui/material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import axios from "axios";

const PaymentReturn = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const queryParams = location.search; // Includes ?vnp_Amount=...
        const response = await axios.get(`/api/v1/payment/vnpay/return${queryParams}`);
        
        if (response.data.success) {
          setStatus("success");
          setMessage("Your payment was processed successfully via VNPay.");
          setOrderId(response.data.order_id);
        } else {
          setStatus("error");
          setMessage(response.data.message || "Payment verification failed.");
          setOrderId(response.data.order_id);
        }
      } catch (err) {
        console.error("Payment return error:", err);
        setStatus("error");
        setMessage("An error occurred while verifying your payment.");
      } finally {
        setLoading(false);
      }
    };

    if (location.search) {
      verifyPayment();
    } else {
      setLoading(false);
      setStatus("error");
      setMessage("No payment data found.");
    }
  }, [location]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 2 }}>
        <CircularProgress sx={{ color: "#6366f1" }} />
        <Typography variant="body1" sx={{ color: "#94a3b8" }}>
          Verifying payment with VNPay...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 12 }}>
      <Card
        sx={{
          backgroundColor: "rgba(30, 41, 59, 0.45)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "20px",
          p: { xs: 3, md: 5 },
          textAlign: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        {status === "success" ? (
          <CheckCircle sx={{ fontSize: 64, color: "#10b981", mb: 2 }} />
        ) : (
          <Cancel sx={{ fontSize: 64, color: "#ef4444", mb: 2 }} />
        )}
        
        <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, mb: 2 }}>
          {status === "success" ? "Payment Successful!" : "Payment Failed"}
        </Typography>
        
        <Typography variant="body1" sx={{ color: "#94a3b8", mb: 4 }}>
          {message}
          {orderId && (
            <span style={{ display: "block", marginTop: "8px" }}>
              Order ID: #{orderId}
            </span>
          )}
        </Typography>

        <Button
          component={RouterLink}
          to="/orders"
          variant="contained"
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: "12px",
            bgcolor: status === "success" ? "#6366f1" : "#475569",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: status === "success" ? "#4f46e5" : "#334155" },
          }}
        >
          View My Orders
        </Button>
      </Card>
    </Container>
  );
};

export default PaymentReturn;

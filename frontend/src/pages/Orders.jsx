import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import CheckCircle from "@mui/icons-material/CheckCircle";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/v1/orders/my-orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching my orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)" };
      case "shipping":
        return { bg: "rgba(99, 102, 241, 0.15)", text: "#818cf8", border: "1px solid rgba(99, 102, 241, 0.3)" };
      case "processing":
        return { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)" };
      case "cancelled":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)" };
      default: // pending
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.3)" };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 4 }}>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Card
          sx={{
            py: 8,
            textAlign: "center",
            backgroundColor: "rgba(30, 41, 59, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
          }}
        >
          <ReceiptLongOutlined sx={{ fontSize: 48, color: "#64748b", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#fff", mb: 1, fontWeight: 700 }}>
            No Orders Yet
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Place orders from the catalog shopping cart to view them here.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {orders.map((order) => {
            const colors = getStatusColor(order.status);
            const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            
            return (
              <Accordion
                key={order.id}
                sx={{
                  backgroundColor: "rgba(30, 41, 59, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px !important",
                  overflow: "hidden",
                  color: "#fff",
                  boxShadow: "none",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "#94a3b8" }} />}
                  sx={{
                    px: 3,
                    py: 1,
                    "&.Mui-expanded": { minHeight: 64 },
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        Order #{order.id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        {orderDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5 }}>
                        Total: <span style={{ color: "#fff", fontWeight: 700 }}>${order.total_amount.toFixed(2)}</span>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={5} sx={{ textAlign: { sm: "right" } }}>
                      <Chip
                        label={order.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: colors.bg,
                          color: colors.text,
                          border: colors.border,
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      />
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.06)", mb: 2 }} />
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 0.5, fontWeight: 600 }}>
                        Shipping Address
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                        {order.shipping_address}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 0.5, fontWeight: 600 }}>
                        Payment Method
                      </Typography>
                      <Chip
                        label={order.payment_method === "BANK_TRANSFER" ? "VietQR / Bank" : "COD"}
                        size="small"
                        sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "#fff", fontWeight: 600 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 0.5, fontWeight: 600 }}>
                        Payment Status
                      </Typography>
                      <Chip
                        label={order.payment_status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: order.payment_status === "paid" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: order.payment_status === "paid" ? "#34d399" : "#fbbf24",
                          border: order.payment_status === "paid" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 1.5, fontWeight: 600 }}>
                    Items Ordered
                  </Typography>
                  <List disablePadding>
                    {order.items.map((item) => {
                      const productName = item.variant?.product?.name || `Product Variant #${item.variant_id}`;
                      const variantDetails = item.variant ? `Size: ${item.variant.size} - Color: ${item.variant.color}` : "";
                      return (
                        <ListItem key={item.id} sx={{ px: 0, py: 1.5 }}>
                          <ListItemText
                            primary={productName}
                            secondary={`${variantDetails} | Qty: ${item.quantity}`}
                            primaryTypographyProps={{ color: "#fff", fontWeight: 500, fontSize: "0.9rem" }}
                            secondaryTypographyProps={{ color: "#94a3b8" }}
                          />
                          <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                            ${(item.price_at_time * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </Typography>
                        </ListItem>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </Container>
  );
};

export default Orders;

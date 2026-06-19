import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import LocalShipping from "@mui/icons-material/LocalShipping";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Inventory from "@mui/icons-material/Inventory";
import Navigation from "@mui/icons-material/Navigation";
import History from "@mui/icons-material/History";
import axios from "axios";

const ShipperDashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchShipperData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch available orders
      const availRes = await axios.get("/api/v1/shipper/available-orders");
      setAvailableOrders(availRes.data);

      // 2. Fetch my deliveries
      const myRes = await axios.get("/api/v1/shipper/my-deliveries");
      setMyDeliveries(myRes.data);
    } catch (err) {
      console.error("Error loading shipper data:", err);
      setError("Failed to load shipper portal data. Verify your account has shipper/admin role permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipperData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setMessage(null);
  };

  // Claim order
  const handleClaimOrder = async (orderId) => {
    setError(null);
    setMessage(null);
    try {
      await axios.put(`/api/v1/shipper/orders/${orderId}/claim`);
      setMessage(`Successfully claimed Order #${orderId}! It has been added to your Active Deliveries.`);
      fetchShipperData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to claim order.");
    }
  };

  // Deliver order
  const handleDeliverOrder = async (orderId) => {
    setError(null);
    setMessage(null);
    try {
      await axios.put(`/api/v1/shipper/orders/${orderId}/deliver`);
      setMessage(`Order #${orderId} marked as successfully Delivered!`);
      fetchShipperData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to mark order as delivered.");
    }
  };

  // Filter deliveries
  const activeDeliveries = myDeliveries.filter((d) => d.status === "shipping");
  const completedDeliveries = myDeliveries.filter((d) => d.status === "delivered");

  if (loading && availableOrders.length === 0 && myDeliveries.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#34d399" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
        <LocalShipping sx={{ fontSize: 36, color: "#34d399" }} />
        Shipper Logistics Portal
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 4, borderRadius: "10px" }} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: "10px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "rgba(255, 255, 255, 0.06)", mb: 4 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ "& .MuiTab-root": { color: "#94a3b8", fontWeight: 600 }, "& .Mui-selected": { color: "#34d399 !important" } }}>
          <Tab label={`Available Packages (${availableOrders.length})`} />
          <Tab label={`My Active Deliveries (${activeDeliveries.length})`} />
          <Tab label={`Delivery History (${completedDeliveries.length})`} />
        </Tabs>
      </Box>

      {/* Tab 0: Available Packages */}
      {tabIndex === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {availableOrders.length === 0 ? (
            <Card sx={{ py: 8, textAlign: "center", backgroundColor: "rgba(30, 41, 59, 0.35)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px" }}>
              <Inventory sx={{ fontSize: 48, color: "#64748b", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                No Packages Waiting for Shipping
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                All current checkout orders have been claimed by shipping agents.
              </Typography>
            </Card>
          ) : (
            availableOrders.map((order) => (
              <Card key={order.id} sx={{ bgcolor: "rgba(30, 41, 59, 0.35)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", p: 1 }}>
                <CardContent sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" }, gap: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 700 }}>
                      Order #{order.id}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 1, display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                      <Navigation sx={{ fontSize: 16, mt: 0.3, color: "#a5b4fc" }} />
                      Destination: {order.shipping_address}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 0.5 }}>
                      Order Value: <span style={{ color: "#818cf8", fontWeight: 700 }}>${order.total_amount.toFixed(2)}</span>
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => handleClaimOrder(order.id)}
                    sx={{
                      bgcolor: "#34d399",
                      borderRadius: "10px",
                      fontWeight: 600,
                      textTransform: "none",
                      px: 3,
                      alignSelf: { xs: "flex-start", sm: "center" },
                      "&:hover": { bgcolor: "#059669" },
                    }}
                  >
                    Claim for Shipping
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Tab 1: Active Deliveries */}
      {tabIndex === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {activeDeliveries.length === 0 ? (
            <Card sx={{ py: 8, textAlign: "center", backgroundColor: "rgba(30, 41, 59, 0.35)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px" }}>
              <LocalShipping sx={{ fontSize: 48, color: "#64748b", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                No Active Shipments
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Claim orders from the Available Packages tab to start delivering.
              </Typography>
            </Card>
          ) : (
            activeDeliveries.map((order) => (
              <Card key={order.id} sx={{ bgcolor: "rgba(30, 41, 59, 0.35)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "16px", p: 1 }}>
                <CardContent sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" }, gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 700 }}>
                      Order #{order.id}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 1, display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                      <Navigation sx={{ fontSize: 16, mt: 0.3, color: "#a5b4fc" }} />
                      Deliver to: {order.shipping_address}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 0.5 }}>
                      Payout Cash: <span style={{ color: "#34d399", fontWeight: 700 }}>${order.total_amount.toFixed(2)}</span>
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => handleDeliverOrder(order.id)}
                    sx={{
                      bgcolor: "#10b981",
                      borderRadius: "10px",
                      fontWeight: 600,
                      textTransform: "none",
                      px: 3,
                      alignSelf: { xs: "flex-start", sm: "center" },
                      "&:hover": { bgcolor: "#059669" },
                    }}
                  >
                    Mark as Delivered
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Tab 2: Delivery History */}
      {tabIndex === 2 && (
        <Card sx={{ bgcolor: "rgba(30, 41, 59, 0.35)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", p: 2 }}>
          <CardContent sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <History sx={{ color: "#94a3b8" }} />
              Completed Shipments Log
            </Typography>

            {completedDeliveries.length === 0 ? (
              <Typography sx={{ color: "#64748b", py: 4, textAlign: "center" }}>
                No completed delivery history found.
              </Typography>
            ) : (
              <List disablePadding>
                {completedDeliveries.map((order, idx) => (
                  <Box key={order.id}>
                    {idx > 0 && <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", my: 1.5 }} />}
                    <ListItem disableGutters secondaryAction={
                      <Chip label="DELIVERED" color="success" size="small" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                    }>
                      <ListItemText
                        primary={`Order #${order.id}`}
                        secondary={`Address: ${order.shipping_address}`}
                        primaryTypographyProps={{ color: "#fff", fontWeight: 600 }}
                        secondaryTypographyProps={{ color: "#94a3b8" }}
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ShipperDashboard;

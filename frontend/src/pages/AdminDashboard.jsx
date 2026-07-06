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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachMoney from "@mui/icons-material/AttachMoney";
import ShoppingBag from "@mui/icons-material/ShoppingBag";
import Inventory from "@mui/icons-material/Inventory";
import People from "@mui/icons-material/People";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import axios from "axios";

const AdminDashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    category_id: "",
    image_url: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Stats
      const statsRes = await axios.get("/api/v1/admin/dashboard/stats");
      setStats(statsRes.data);

      // 2. Fetch Chart Data
      const chartRes = await axios.get("/api/v1/admin/dashboard/revenue-chart");
      setChartData(chartRes.data);

      // 3. Fetch Products (for listing in dashboard we fetch 50 items)
      const prodRes = await axios.get("/api/v1/products?limit=50");
      setProducts(prodRes.data.items);

      // 4. Fetch Users
      const usersRes = await axios.get("/api/v1/admin/users");
      setUsers(usersRes.data);

      const catRes = await axios.get("/api/v1/categories/");
      setCategories(catRes.data);

      const orderRes = await axios.get("/api/v1/admin/orders");
      setOrders(orderRes.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load administration data. Verify you are logged in as Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Open Product Create Modal
  const handleOpenCreateModal = () => {
    setSelectedProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      category_id: categories.length > 0 ? categories[0].id : "",
      image_url: "",
    });
    setProductModalOpen(true);
  };

  // Open Product Edit Modal
  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      quantity: product.quantity,
      category: product.category,
      image_url: product.image_url || "",
    });
    setProductModalOpen(true);
  };

  // Close Product Modal
  const handleCloseProductModal = () => {
    setProductModalOpen(false);
  };

  // Submit Product Form (Create / Edit)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        quantity: parseInt(productForm.quantity),
        category: productForm.category,
        image_url: productForm.image_url,
      };

      if (selectedProduct) {
        // Edit Mode
        await axios.put(`/api/v1/products/${selectedProduct.id}`, payload);
      } else {
        // Create Mode
        await axios.post("/api/v1/products/", payload);
      }

      handleCloseProductModal();
      fetchData(); // Reload stats and lists
    } catch (err) {
      alert("Error saving product: " + (err.response?.data?.detail || err.message));
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/v1/products/${id}`);
        fetchData();
      } catch (err) {
        alert("Error deleting product: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Update User Role
  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/v1/admin/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (err) {
      alert("Error updating user role: " + (err.response?.data?.detail || err.message));
    }
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 4 }}>
        Admin Operations Panel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: "10px" }}>
          {error}
        </Alert>
      )}

      {/* Metric Widgets Row */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { label: "Total Revenue", val: `$${stats.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: <AttachMoney sx={{ fontSize: 24, color: "#10b981" }} />, border: "#10b981" },
            { label: "Total Orders", val: stats.total_orders, icon: <ShoppingBag sx={{ fontSize: 24, color: "#6366f1" }} />, border: "#6366f1" },
            { label: "Active Products", val: stats.total_products, icon: <Inventory sx={{ fontSize: 24, color: "#f59e0b" }} />, border: "#f59e0b" },
            { label: "Total Users", val: stats.total_users, icon: <People sx={{ fontSize: 24, color: "#ec4899" }} />, border: "#ec4899" }
          ].map((widget, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                sx={{
                  bgcolor: "rgba(30, 41, 59, 0.45)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderLeft: `4px solid ${widget.border}`,
                  borderRadius: "16px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                      {widget.label}
                    </Typography>
                    <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, mt: 1 }}>
                      {widget.val}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {widget.icon}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: 1, borderColor: "rgba(255, 255, 255, 0.06)", mb: 4 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ "& .MuiTab-root": { color: "#94a3b8", fontWeight: 600 } }}>
          <Tab label="Analytics" />
          <Tab label="Products Manager" />
          <Tab label="Orders Manager" />
          <Tab label="Users & Roles" />
        </Tabs>
      </Box>

      {/* Analytics Tab */}
      {tabIndex === 0 && (
        <Card
          sx={{
            p: 3,
            backgroundColor: "rgba(30, 41, 59, 0.45)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
          }}
        >
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, mb: 4 }}>
            Revenue Performance Chart
          </Typography>
          <Box sx={{ height: 320 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: "0.8rem", fontWeight: 600 }} />
                  <YAxis stroke="#64748b" style={{ fontSize: "0.8rem", fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography sx={{ color: "#64748b", textAlign: "center", py: 8 }}>
                No chart data available.
              </Typography>
            )}
          </Box>
        </Card>
      )}

      {/* Products Manager Tab */}
      {tabIndex === 1 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
              Products List
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
              sx={{ bgcolor: "#6366f1", borderRadius: "10px", "&:hover": { bgcolor: "#4f46e5" }, textTransform: "none", fontWeight: 600 }}
            >
              Create Product
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", boxShadow: "none" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ "& th": { color: "#94a3b8", fontWeight: 600, borderColor: "rgba(255,255,255,0.06)" } }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock Quantity</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((prod) => (
                  <TableRow key={prod.id} sx={{ "& td": { color: "#fff", borderColor: "rgba(255,255,255,0.03)" }, "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                    <TableCell>{prod.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{prod.name}</TableCell>
                    <TableCell>{prod.category ? prod.category.name : "N/A"}</TableCell>
                    <TableCell>${prod.base_price ? prod.base_price.toFixed(2) : 0}</TableCell>
                    <TableCell>{prod.variants && prod.variants.length > 0 ? prod.variants.reduce((acc, v) => acc + v.stock_quantity, 0) : 0} units</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenEditModal(prod)} sx={{ color: "#818cf8" }}>
                        <EditIcon size="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteProduct(prod.id)} sx={{ color: "#ef4444" }}>
                        <DeleteIcon size="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Orders Manager Tab */}
      {tabIndex === 2 && (
        <Box>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, mb: 3 }}>
            Orders List
          </Typography>

          <TableContainer component={Paper} sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", boxShadow: "none" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ "& th": { color: "#94a3b8", fontWeight: 600, borderColor: "rgba(255,255,255,0.06)" } }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer ID</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((ord) => (
                  <TableRow key={ord.id} sx={{ "& td": { color: "#fff", borderColor: "rgba(255,255,255,0.03)" } }}>
                    <TableCell>#{ord.id}</TableCell>
                    <TableCell>{ord.user_id}</TableCell>
                    <TableCell>${ord.total_amount.toFixed(2)}</TableCell>
                    <TableCell>{ord.payment_method}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{
                        color: ord.status === 'delivered' ? '#34d399' : (ord.status === 'cancelled' ? '#ef4444' : '#818cf8'),
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>
                        {ord.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={ord.status}
                          onChange={async (e) => {
                            try {
                              await axios.put(`/api/v1/admin/orders/${ord.id}`, { status: e.target.value });
                              fetchData();
                            } catch (err) {
                              alert("Error updating order status.");
                            }
                          }}
                          sx={{
                            color: "#fff",
                            bgcolor: "rgba(15,23,42,0.2)",
                            "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                            fontWeight: 600,
                          }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="processing">Processing</MenuItem>
                          <MenuItem value="shipping">Shipping</MenuItem>
                          <MenuItem value="delivered">Delivered</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Users Manager Tab */}
      \n
      {tabIndex === 3 && (
        <Box>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, mb: 3 }}>
            User Accounts & Roles
          </Typography>

          <TableContainer component={Paper} sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", boxShadow: "none" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ "& th": { color: "#94a3b8", fontWeight: 600, borderColor: "rgba(255,255,255,0.06)" } }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>System Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((usr) => (
                  <TableRow key={usr.id} sx={{ "& td": { color: "#fff", borderColor: "rgba(255,255,255,0.03)" } }}>
                    <TableCell>{usr.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{usr.username}</TableCell>
                    <TableCell>{usr.email}</TableCell>
                    <TableCell>{usr.full_name || "N/A"}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={usr.role}
                          onChange={(e) => handleUserRoleChange(usr.id, e.target.value)}
                          sx={{
                            color: usr.role === "admin" ? "#818cf8" : usr.role === "shipper" ? "#34d399" : "#fff",
                            bgcolor: "rgba(15,23,42,0.2)",
                            "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                            fontWeight: 600,
                          }}
                        >
                          <MenuItem value="customer">Customer</MenuItem>
                          <MenuItem value="shipper">Shipper</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Create / Edit Product Dialog */}
      <Dialog
        open={productModalOpen}
        onClose={handleCloseProductModal}
        PaperProps={{
          className: "glass-panel",
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.98) !important",
            color: "#fff",
            borderRadius: "20px",
            minWidth: 420,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedProduct ? "Edit Product" : "Create Product"}
        </DialogTitle>
        <DialogContent component="form" onSubmit={handleProductSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1.5 }}>
          <TextField
            required
            fullWidth
            label="Product Name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            sx={{ bgcolor: "rgba(15,23,42,0.25)" }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            sx={{ bgcolor: "rgba(15,23,42,0.25)" }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Price ($)"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                sx={{ bgcolor: "rgba(15,23,42,0.25)" }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Stock Quantity"
                value={productForm.quantity}
                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                sx={{ bgcolor: "rgba(15,23,42,0.25)" }}
              />
            </Grid>
          </Grid>

          <FormControl fullWidth>
            <InputLabel id="dialog-cat-label" sx={{ color: "#94a3b8" }}>Category</InputLabel>
            <Select
              labelId="dialog-cat-label"
              value={productForm.category_id}
              label="Category"
              onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
              sx={{ color: "#fff", bgcolor: "rgba(15,23,42,0.25)" }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Image URL"
            value={productForm.image_url}
            onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
            sx={{ bgcolor: "rgba(15,23,42,0.25)" }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseProductModal} sx={{ color: "#cbd5e1", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleProductSubmit}
            variant="contained"
            sx={{ bgcolor: "#6366f1", borderRadius: "10px", "&:hover": { bgcolor: "#4f46e5" }, textTransform: "none", fontWeight: 600 }}
          >
            {selectedProduct ? "Save Changes" : "Create Product"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;

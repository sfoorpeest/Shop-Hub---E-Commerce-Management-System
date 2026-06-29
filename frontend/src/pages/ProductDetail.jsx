import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCartIcon from "@mui/icons-material/AddShoppingCart";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import axios from "axios";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState("");

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/products/${id}`);
        setProduct(response.data);
        if (response.data.variants && response.data.variants.length > 0) {
          setSelectedVariantId(response.data.variants[0].id);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Product not found or database is offline.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId);
  const displayPrice = product ? (product.base_price + (selectedVariant?.additional_price || 0)) : 0;
  const isOutOfStock = selectedVariant ? selectedVariant.stock_quantity <= 0 : true;
  const stockLimit = selectedVariant ? selectedVariant.stock_quantity : 0;

  const handleIncrement = () => {
    if (quantity < stockLimit) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product && selectedVariant) {
      addToCart(product, selectedVariant, quantity);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: "center" }}>
        <Typography variant="h5" sx={{ color: "#ef4444", mb: 3 }}>
          {error || "Product not found."}
        </Typography>
        <Button
          component={RouterLink}
          to="/products"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.15)" }}
        >
          Back to Catalog
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ color: "#cbd5e1", mb: 4, textTransform: "none" }}
      >
        Back
      </Button>

      <Grid container spacing={6}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
              bgcolor: "rgba(30, 41, 59, 0.2)",
            }}
          >
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800"}
              alt={product.name}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
              }}
            />
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Chip
                label={product.category?.name || "General"}
                sx={{
                  bgcolor: "rgba(99, 102, 241, 0.1)",
                  color: "#818cf8",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  mb: 1.5,
                }}
              />
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#fff", mb: 1, fontSize: { xs: "2rem", md: "2.5rem" } }}>
                {product.name}
              </Typography>
              <Typography variant="h4" sx={{ color: "#818cf8", fontWeight: 800 }}>
                ${displayPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

            <Box>
              <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 1, fontWeight: 600 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ color: "#cbd5e1", lineHeight: 1.7 }}>
                {product.description || "No description provided for this product."}
              </Typography>
            </Box>

            {product.variants && product.variants.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="variant-select-label" sx={{ color: "#94a3b8" }}>Select Variant</InputLabel>
                  <Select
                    labelId="variant-select-label"
                    value={selectedVariantId}
                    label="Select Variant"
                    onChange={(e) => {
                      setSelectedVariantId(e.target.value);
                      setQuantity(1); // Reset quantity when variant changes
                    }}
                    sx={{
                      bgcolor: "rgba(15,23,42,0.25)",
                      borderRadius: "8px",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.05)" },
                      color: "#fff",
                    }}
                  >
                    {product.variants.map((v) => (
                      <MenuItem key={v.id} value={v.id} disabled={v.stock_quantity <= 0}>
                        {v.size} - {v.color} {v.stock_quantity <= 0 ? "(Out of Stock)" : ""} {v.additional_price > 0 ? `(+$${v.additional_price})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mt: 2 }} />

            {/* Inventory Status */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isOutOfStock ? (
                <>
                  <Cancel sx={{ color: "#ef4444" }} />
                  <Typography variant="body2" sx={{ color: "#ef4444", fontWeight: 700 }}>
                    Out of stock
                  </Typography>
                </>
              ) : (
                <>
                  <CheckCircle sx={{ color: "#10b981" }} />
                  <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 700 }}>
                    In Stock ({stockLimit} units available)
                  </Typography>
                </>
              )}
            </Box>

            {/* Add to Cart Actions */}
            {!isOutOfStock && selectedVariant && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                    Quantity:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "rgba(30, 41, 59, 0.45)",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <IconButton size="small" onClick={handleDecrement} disabled={quantity <= 1} sx={{ color: "#fff" }}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ px: 2, fontWeight: 700, minWidth: 20, textAlign: "center" }}>
                      {quantity}
                    </Typography>
                    <IconButton size="small" onClick={handleIncrement} disabled={quantity >= stockLimit} sx={{ color: "#fff" }}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleAddToCart}
                  startIcon={<AddCartIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: "#6366f1",
                    "&:hover": { bgcolor: "#4f46e5" },
                    maxWidth: 240,
                  }}
                >
                  Add to Cart
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;

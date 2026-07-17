import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import AddShoppingCart from "@mui/icons-material/AddShoppingCart";
import ErrorOutlined from "@mui/icons-material/ErrorOutlined";
import { useCart } from "../context/CartContext";
import { formatVND } from "../utils/currency";

const ProductCard = ({ product }) => {
  const isOutOfStock = !product.is_active || (product.variants && product.variants.every(v => v.stock_quantity <= 0));

  const totalStock = product.variants ? product.variants.reduce((acc, v) => acc + v.stock_quantity, 0) : 0;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(30, 41, 59, 0.45)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-6px)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          boxShadow: "0 12px 20px -8px rgba(99, 102, 241, 0.3)",
          "& .product-img": {
            transform: "scale(1.06)",
          },
        },
      }}
    >
      {/* Category Chip */}
      <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 10 }}>
        <Chip
          label={product.category?.name || "General"}
          size="small"
          sx={{
            bgcolor: "rgba(15, 23, 42, 0.8)",
            color: "#a5b4fc",
            fontWeight: 600,
            fontSize: "0.75rem",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        />
      </Box>

      {/* Product Image */}
      <Box
        component={RouterLink}
        to={`/products/${product.id}`}
        sx={{ overflow: "hidden", position: "relative", pt: "75%", display: "block" }}
      >
        <CardMedia
          className="product-img"
          component="img"
          image={product.image_url || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500"}
          alt={product.name}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {isOutOfStock && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(15, 23, 42, 0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(2px)",
            }}
          >
            <Chip
              icon={<ErrorOutlined style={{ color: "#f87171" }} />}
              label="Out of Stock"
              sx={{
                bgcolor: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                fontWeight: 700,
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            />
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent
        component={RouterLink}
        to={`/products/${product.id}`}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 2.5,
          textDecoration: "none",
          color: "inherit",
          "&:last-child": { pb: 2 },
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          noWrap
          sx={{
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#fff",
            "&:hover": { color: "#818cf8" },
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#94a3b8",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: 40,
            fontSize: "0.85rem",
          }}
        >
          {product.description}
        </Typography>

        <Box sx={{ mt: "auto", pt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#818cf8", fontWeight: 800 }}>
            {formatVND(product.base_price)}
          </Typography>
          <Typography variant="caption" sx={{ color: isOutOfStock ? "#ef4444" : "#10b981", fontWeight: 600 }}>
            {isOutOfStock ? "Sold out" : `${totalStock} in stock`}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Button
          component={RouterLink}
          to={`/products/${product.id}`}
          fullWidth
          variant="contained"
          sx={{
            py: 1,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            bgcolor: isOutOfStock ? "rgba(148, 163, 184, 0.12)" : "#6366f1",
            "&:hover": { bgcolor: "#4f46e5" },
          }}
        >
          View Options
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;

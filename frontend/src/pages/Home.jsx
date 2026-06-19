import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import Link from "@mui/material/Link";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Security from "@mui/icons-material/Security";
import SupportAgent from "@mui/icons-material/SupportAgent";
import ArrowForward from "@mui/icons-material/ArrowForward";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get("/api/v1/products?limit=4");
        setFeaturedProducts(response.data.items);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: "Electronics", desc: "Top gadgets and smart devices", color: "#6366f1" },
    { name: "Fashion", desc: "Trendy footwear and straight jeans", color: "#10b981" },
    { name: "Home", desc: "High-power appliances and coffee gear", color: "#f59e0b" },
    { name: "Books", desc: "Productive habits and system architecture", color: "#ec4899" },
  ];

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(0, 0, 0, 0) 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  lineHeight: 1.2,
                  mb: 2,
                  color: "#fff",
                }}
              >
                Manage & Experience <br />
                <span style={{ background: "linear-gradient(to right, #818cf8, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  E-Commerce Smartly
                </span>
              </Typography>
              <Typography variant="h6" sx={{ color: "#94a3b8", mb: 4, fontWeight: 400, maxWidth: 540 }}>
                Welcome to ShopHub. Discover high-end electronics, modern clothing fashion, elegant home appliances, and expert technology books in one clean environment.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  component={RouterLink}
                  to="/products"
                  variant="contained"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: "#6366f1",
                    "&:hover": { bgcolor: "#4f46e5" },
                  }}
                >
                  Shop Catalog
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                    "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  Create Account
                </Button>
              </Box>
            </Grid>

            {/* Float Element (Abstract Demo Card) */}
            <Grid item xs={12} md={5} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
              <Box
                className="float-animation glow-animation"
                sx={{
                  width: 320,
                  height: 380,
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ef4444" }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#eab308" }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#22c55e" }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "#818cf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>
                    Real-time Dashboard
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#fff", fontWeight: 800, mt: 1 }}>
                    ShopHub Cloud
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mt: 2 }}>
                    Full integration with PostgreSQL database, JWT secure tokens, and automatic delivery claiming modules.
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ color: "#34d399", fontWeight: 700 }}>
                    FastAPI + React
                  </Typography>
                  <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Security sx={{ color: "#818cf8" }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust Highlights */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {[
            { icon: <LocalShipping sx={{ fontSize: 32, color: "#34d399" }} />, title: "Tracked Delivery", desc: "Claims handled instantly by certified shipper accounts" },
            { icon: <Security sx={{ fontSize: 32, color: "#6366f1" }} />, title: "Secure Cryptography", desc: "JWT role-based authorization gates restricted pathways" },
            { icon: <SupportAgent sx={{ fontSize: 32, color: "#f59e0b" }} />, title: "24/7 Live Support", desc: "Support team ready to assist you anytime" }
          ].map((item, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ bgcolor: "rgba(30, 41, 59, 0.25)", border: "1px solid rgba(255, 255, 255, 0.03)", borderRadius: "16px", p: 1.5 }}>
                <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  {item.icon}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#fff" }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
            Featured Catalog
          </Typography>
          <Link component={RouterLink} to="/products" sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#818cf8", display: "flex", alignItems: "center", gap: 0.5 }}>
            See All <ArrowForward fontSize="small" />
          </Link>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#6366f1" }} />
          </Box>
        ) : featuredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" sx={{ color: "#64748b", textAlign: "center", py: 4 }}>
            No products available.
          </Typography>
        )}
      </Container>

      {/* Quick Categories */}
      <Box sx={{ py: 8, bgcolor: "rgba(15, 23, 42, 0.3)" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 4, textAlign: "center" }}>
            Shop by Category
          </Typography>
          <Grid container spacing={3}>
            {categories.map((cat, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Box
                  component={RouterLink}
                  to={`/products?category=${cat.name}`}
                  sx={{
                    display: "block",
                    p: 4,
                    height: "100%",
                    borderRadius: "16px",
                    background: `linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.4) 100%)`,
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: cat.color,
                      "& .cat-title": { color: cat.color }
                    }
                  }}
                >
                  <Typography className="cat-title" variant="h6" sx={{ fontWeight: 700, color: "#fff", transition: "color 0.2s" }}>
                    {cat.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1 }}>
                    {cat.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;

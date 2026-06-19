import React from "react";
import { Box, Typography, Container, Grid, Link, IconButton } from "@mui/material";
import GitHub from "@mui/icons-material/GitHub";
import Twitter from "@mui/icons-material/Twitter";
import LinkedIn from "@mui/icons-material/LinkedIn";
import Storefront from "@mui/icons-material/Storefront";
import { Link as RouterLink } from "react-router-dom";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 6,
        px: 2,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Storefront sx={{ color: "#6366f1", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
                ShopHub
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2, maxWidth: 280 }}>
              An advanced full-stack management system providing an ultra-premium experience for customers, administrators, and delivery agents.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton size="small" sx={{ color: "#cbd5e1" }} href="https://github.com" target="_blank">
                <GitHub fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: "#cbd5e1" }} href="https://twitter.com" target="_blank">
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: "#cbd5e1" }} href="https://linkedin.com" target="_blank">
                <LinkedIn fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 600, mb: 2 }}>
              Catalog
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link component={RouterLink} to="/products" variant="body2" sx={{ color: "#94a3b8", textDecoration: "none", "&:hover": { color: "#818cf8" } }}>
                All Products
              </Link>
              <Link component={RouterLink} to="/products?category=Electronics" variant="body2" sx={{ color: "#94a3b8", textDecoration: "none", "&:hover": { color: "#818cf8" } }}>
                Electronics
              </Link>
              <Link component={RouterLink} to="/products?category=Fashion" variant="body2" sx={{ color: "#94a3b8", textDecoration: "none", "&:hover": { color: "#818cf8" } }}>
                Fashion
              </Link>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 600, mb: 2 }}>
              Account
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link component={RouterLink} to="/login" variant="body2" sx={{ color: "#94a3b8", textDecoration: "none", "&:hover": { color: "#818cf8" } }}>
                Sign In
              </Link>
              <Link component={RouterLink} to="/register" variant="body2" sx={{ color: "#94a3b8", textDecoration: "none", "&:hover": { color: "#818cf8" } }}>
                Register
              </Link>
              <Link component={RouterLink} to="/cart" variant="body2" sx={{ color: "#94a3b8", textDecoration: "none", "&:hover": { color: "#818cf8" } }}>
                View Cart
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 600, mb: 2 }}>
              E-Commerce Management System
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Vietnamese University Graduation Project. Built using Python FastAPI, SQLAlchemy ORM, ReactJS, Material-UI, and PostgreSQL.
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.05)", mt: 4, pt: 3, textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            &copy; {new Date().getFullYear()} ShopHub. All rights reserved. Made by pair programming.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

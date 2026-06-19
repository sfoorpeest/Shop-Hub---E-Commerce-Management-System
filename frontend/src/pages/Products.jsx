import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const limit = 8;

  // Sync category state if query params change (e.g. clicking category in home page)
  useEffect(() => {
    const cat = searchParams.get("category") || "All";
    setCategory(cat);
    setPage(1); // Reset page on category change
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const skip = (page - 1) * limit;
        const response = await axios.get("/api/v1/products", {
          params: {
            category: category === "All" ? "" : category,
            search: search,
            sort_by: sortBy,
            skip,
            limit,
          },
        });
        setProducts(response.data.items);
        setTotal(response.data.total);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [category, search, sortBy, page]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
    setSearchParams(cat === "All" ? {} : { category: cat });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const categories = ["All", "Electronics", "Fashion", "Home", "Books"];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        {/* Left Sidebar Filter (Desktop) */}
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              p: 3,
              borderRadius: "16px",
              backgroundColor: "rgba(30, 41, 59, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(8px)",
              position: "sticky",
              top: 100,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 2 }}>
              Categories
            </Typography>
            <List component="nav" sx={{ p: 0 }}>
              {categories.map((cat) => (
                <ListItemButton
                  key={cat}
                  selected={category === cat}
                  onClick={() => handleCategoryChange(cat)}
                  sx={{
                    borderRadius: "8px",
                    mb: 0.5,
                    color: category === cat ? "#818cf8" : "#cbd5e1",
                    backgroundColor: category === cat ? "rgba(99, 102, 241, 0.08) !important" : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                    },
                  }}
                >
                  <ListItemText primary={cat} primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Grid>

        {/* Right Product Grid & Search */}
        <Grid item xs={12} md={9}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
              Shop Products
            </Typography>

            {/* Filter controls row */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#64748b" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: "rgba(30, 41, 59, 0.45)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.05)",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="sort-select-label" sx={{ color: "#94a3b8" }}>Sort By</InputLabel>
                  <Select
                    labelId="sort-select-label"
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{
                      bgcolor: "rgba(30, 41, 59, 0.45)",
                      borderRadius: "12px",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.05)" },
                      color: "#fff",
                    }}
                  >
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="price_asc">Price: Low to High</MenuItem>
                    <MenuItem value="price_desc">Price: High to Low</MenuItem>
                    <MenuItem value="name_asc">Name: A to Z</MenuItem>
                    <MenuItem value="name_desc">Name: Z to A</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Product Cards Grid */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
              <CircularProgress sx={{ color: "#6366f1" }} />
            </Box>
          ) : products.length > 0 ? (
            <Box>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {total > limit && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                  <Pagination
                    count={Math.ceil(total / limit)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "#94a3b8",
                        fontWeight: 600,
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" sx={{ color: "#64748b" }}>
                No products found matching your criteria.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Products;

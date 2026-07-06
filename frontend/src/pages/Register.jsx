import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !fullName) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if ((role === "admin" || role === "shipper") && !adminCode) {
        setError(`${role === "admin" ? "Admin" : "Shipper"} registration code is required.`);
        setLoading(false);
        return;
      }
      
      const codeToSend = (role === "admin" || role === "shipper") ? adminCode : "";
      await register(username, email, password, codeToSend);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "rgba(30, 41, 59, 0.45)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "20px",
          p: 4,
          backdropFilter: "blur(12px)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <PersonAddOutlined sx={{ color: "#818cf8" }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>
          Create Account
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3, textAlign: "center" }}>
          Join ShopHub and explore our full-stack solution
        </Typography>

        {success && (
          <Alert severity="success" sx={{ width: "100%", mb: 3, borderRadius: "8px" }}>
            Account registered successfully! Redirecting to login...
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 3, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            sx={{ bgcolor: "rgba(15,23,42,0.25)", borderRadius: "8px" }}
          />

          <TextField
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            sx={{ bgcolor: "rgba(15,23,42,0.25)", borderRadius: "8px" }}
          />

          <TextField
            required
            fullWidth
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            variant="outlined"
            sx={{ bgcolor: "rgba(15,23,42,0.25)", borderRadius: "8px" }}
          />

          <TextField
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            sx={{ bgcolor: "rgba(15,23,42,0.25)", borderRadius: "8px" }}
          />

          <FormControl fullWidth>
            <InputLabel id="role-select-label" sx={{ color: "#94a3b8" }}>Account Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Account Role"
              onChange={(e) => setRole(e.target.value)}
              sx={{
                bgcolor: "rgba(15,23,42,0.25)",
                borderRadius: "8px",
                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                color: "#fff",
                "& .MuiSvgIcon-root": { color: "#94a3b8" },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    "& .MuiMenuItem-root": {
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      py: 1.5,
                      "&:hover": {
                        bgcolor: "rgba(99, 102, 241, 0.15)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(99, 102, 241, 0.25) !important",
                        color: "#a5b4fc",
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="customer">Customer (Standard User)</MenuItem>
              <MenuItem value="shipper">Shipper (Delivery Agent)</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </Select>
          </FormControl>

          {(role === "admin" || role === "shipper") && (
            <TextField
              required
              fullWidth
              label={role === "admin" ? "Admin Registration Code" : "Shipper Registration Code"}
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              variant="outlined"
              sx={{ bgcolor: "rgba(15,23,42,0.25)", borderRadius: "8px" }}
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || success}
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#6366f1",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Register"}
          </Button>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Already have an account?{" "}
              <Link component={RouterLink} to="/login" sx={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;

import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { ToastContext } from "./App";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Signup({ onSignup }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const showToast = useContext(ToastContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      showToast("Account created successfully");
      onSignup(data.token);
      navigate("/products");
    } catch {
      setError("Connection failed. Is the server running?");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#09090b",
        p: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400, p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Create account
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Get started with your free account
        </Typography>

        {error && (
          <Typography
            variant="body2"
            sx={{ color: "#ef4444", mb: 2, p: 1.5, bgcolor: "rgba(239,68,68,0.08)", borderRadius: 1, fontSize: "0.8rem" }}
          >
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Full name"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            sx={{ mb: 3 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    sx={{ color: "text.secondary" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ py: 1.3, mb: 2 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Create account"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", mb: 2 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#6366f1", fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>

        <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, border: "1px solid #27272a" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", textAlign: "center", lineHeight: 1.6 }}>
            To be an admin, go to the <Link to="/login" style={{ color: "#6366f1", fontWeight: 600 }}>login page</Link> and use the credentials:
            <br />
            <strong style={{ color: "#a1a1aa" }}>admin@demo.com / Admin@123</strong>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

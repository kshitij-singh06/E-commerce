import { useState, useContext } from "react";
import { Link } from "react-router-dom";
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
import { API } from "./api";



export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const showToast = useContext(ToastContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      showToast("Welcome back!");
      onLogin(data.token);
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
          Sign in
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Enter your credentials to continue
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
            {loading ? <CircularProgress size={22} color="inherit" /> : "Sign in"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
          No account?{" "}
          <Link to="/signup" style={{ color: "#6366f1", fontWeight: 600 }}>
            Sign up
          </Link>
        </Typography>

        <Box sx={{ mt: 3, p: 1.5, borderRadius: 1.5, border: "1px solid #27272a" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.6 }}>
            <strong style={{ color: "#a1a1aa" }}>Admin:</strong>
            <br />
            Email: admin@demo.com
            <br />
            Password: Admin@123
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

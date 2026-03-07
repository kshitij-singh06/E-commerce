import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, createContext, useCallback } from "react";

import Login from "./Login";
import Signup from "./Signup";
import ProductList from "./ProductList";
import Cart from "./Cart";
import Orders from "./Orders";
import AdminOrders from "./AdminOrders";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import ProductPage from "./ProductPage";
import DashboardLayout from "./layout/DashboardLayout";

import { ThemeProvider, createTheme, CssBaseline, Snackbar, Alert, Box, Typography, CircularProgress } from "@mui/material";

import { API, authHeaders } from "./api";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#09090b",
      paper: "#18181b",
    },
    primary: {
      main: "#6366f1",
    },
    text: {
      primary: "#fafafa",
      secondary: "#a1a1aa",
    },
    divider: "#27272a",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#18181b",
          border: "1px solid #27272a",
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: "#6366f1",
          "&:hover": { backgroundColor: "#4f46e5" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#27272a" },
            "&:hover fieldset": { borderColor: "#3f3f46" },
            "&.Mui-focused fieldset": { borderColor: "#6366f1" },
          },
        },
      },
    },
  },
});

export const ToastContext = createContext();
export const CartContext = createContext();

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [cartCount, setCartCount] = useState(0);
  const [backendReady, setBackendReady] = useState(false);
  const [showWaking, setShowWaking] = useState(false);

  // Cold-start detection: ping health endpoint, retry on failure
  useEffect(() => {
    let cancelled = false;
    const wakingTimer = setTimeout(() => setShowWaking(true), 2000);

    const ping = () => {
      fetch(`${API}/api/health`)
        .then((res) => {
          if (res.ok && !cancelled) {
            setBackendReady(true);
            clearTimeout(wakingTimer);
            setShowWaking(false);
          } else if (!cancelled) {
            setTimeout(ping, 3000);
          }
        })
        .catch(() => {
          if (!cancelled) setTimeout(ping, 3000);
        });
    };
    ping();

    return () => { cancelled = true; clearTimeout(wakingTimer); };
  }, []);

  const refreshCart = useCallback(() => {
    const t = localStorage.getItem("token");
    if (!t) { setCartCount(0); return; }
    fetch(`${API}/api/cart`, { headers: { Authorization: `Bearer ${t}` } })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const total = Array.isArray(data) ? data.reduce((sum, item) => sum + item.quantity, 0) : 0;
        setCartCount(total);
      })
      .catch(() => setCartCount(0));
  }, []);

  const isLoggedIn = !!token;

  const showToast = useCallback((message, severity = "success") => {
    setToast({ open: true, message, severity });
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        setUser(null);
        localStorage.removeItem("token");
        setToken(null);
      });
  }, [token]);

  useEffect(() => {
    if (token) refreshCart();
    else setCartCount(0);
  }, [token, refreshCart]);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContext.Provider value={showToast}>
          <CartContext.Provider value={{ cartCount, refreshCart }}>
            {!backendReady && showWaking && (
              <Box sx={{
                position: "fixed", inset: 0, zIndex: 9999,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                bgcolor: "#09090b",
              }}>
                <CircularProgress size={32} sx={{ color: "#6366f1", mb: 2 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#fafafa" }}>
                  Server is waking up...
                </Typography>
                <Typography variant="body2" sx={{ color: "#71717a", mt: 0.5 }}>
                  Free tier cold start — please wait a moment
                </Typography>
              </Box>
            )}
            <Routes>
              <Route
                path="/login"
                element={isLoggedIn ? <Navigate to="/products" /> : <Login onLogin={handleLoginSuccess} />}
              />
              <Route
                path="/signup"
                element={isLoggedIn ? <Navigate to="/products" /> : <Signup onSignup={handleLoginSuccess} />}
              />

              <Route element={
                isLoggedIn ? (
                  <DashboardLayout user={user} logout={handleLogout} cartCount={cartCount} />
                ) : (
                  <Navigate to="/login" />
                )
              }>
                <Route path="/products" element={<ProductList user={user} />} />
                <Route path="/product/:id" element={<ProductPage user={user} />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/admin/add-product" element={!user ? null : user.role === "ADMIN" ? <AddProduct /> : <Navigate to="/products" />} />
                <Route path="/admin/edit-product/:id" element={!user ? null : user.role === "ADMIN" ? <EditProduct /> : <Navigate to="/products" />} />
                <Route path="/admin/orders" element={!user ? null : user.role === "ADMIN" ? <AdminOrders /> : <Navigate to="/products" />} />
              </Route>

              <Route path="/" element={<Navigate to={isLoggedIn ? "/products" : "/login"} />} />
              <Route path="*" element={<Navigate to={isLoggedIn ? "/products" : "/login"} />} />
            </Routes>

            <Snackbar
              open={toast.open}
              autoHideDuration={3000}
              onClose={() => setToast((p) => ({ ...p, open: false }))}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Alert
                onClose={() => setToast((p) => ({ ...p, open: false }))}
                severity={toast.severity}
                variant="filled"
                sx={{ fontSize: "0.85rem" }}
              >
                {toast.message}
              </Alert>
            </Snackbar>
          </CartContext.Provider>
        </ToastContext.Provider>
      </ThemeProvider>
    </Router>
  );
}

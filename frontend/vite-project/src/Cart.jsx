import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  IconButton,
  Skeleton,
  Divider,
} from "@mui/material";
import {
  AddRounded,
  RemoveRounded,
  DeleteRounded,
  ShoppingCartRounded,
} from "@mui/icons-material";
import { ToastContext, CartContext } from "./App";
import { API, authHeaders, authJsonHeaders } from "./api";



export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);


  const navigate = useNavigate();
  const showToast = useContext(ToastContext);
  const { refreshCart } = useContext(CartContext);

  const loadCart = (showLoader = false) => {
    if (showLoader) setLoading(true);
    fetch(`${API}/api/cart`, {
      headers: authHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = Array.isArray(data) ? data.sort((a, b) => a.id - b.id) : [];
        setCart(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadCart(true);
  }, []);

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) return removeItem(id);
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
    await fetch(`${API}/api/cart/${id}`, {
      method: "PUT",
      headers: authJsonHeaders(),
      body: JSON.stringify({ quantity }),
    });
    refreshCart();
  };

  const removeItem = async (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    await fetch(`${API}/api/cart/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    showToast("Item removed", "info");
    refreshCart();
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.ok) {
        showToast("Order placed successfully", "success");
        setCart([]);
        refreshCart();
        navigate("/orders");
      } else {
        const data = await res.json();
        showToast(data.error || "Checkout failed", "error");
      }
    } catch {
      showToast("Checkout failed", "error");
    }
    setCheckingOut(false);
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: 2, bgcolor: "#27272a" }} />
        ))}
      </Box>
    );
  }

  if (cart.length === 0) {
    return (
      <Box className="empty-state">
        <ShoppingCartRounded sx={{ fontSize: 48, color: "#27272a", mb: 1.5 }} />
        <Typography variant="h6" sx={{ color: "#71717a", mb: 1 }}>
          Your cart is empty
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/products")} sx={{ mt: 1, color: "#a1a1aa", borderColor: "#27272a" }}>
          Browse products
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto" }}>
      {cart.map((item) => (
        <Card key={item.id} sx={{ mb: 1.5, p: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            component="img"
            src={item.product.imageUrl ? `${API}${item.product.imageUrl}` : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%2318181b"><rect width="80" height="80"/><text x="40" y="42" text-anchor="middle" fill="%2371717a" font-size="10" font-family="sans-serif">N/A</text></svg>')}`}
            alt={item.product.name}
            sx={{ width: 64, height: 64, borderRadius: 1.5, objectFit: "cover", flexShrink: 0 }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {item.product.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#71717a" }}>
              ₹{item.product.price.toLocaleString()} each
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              sx={{ color: "#a1a1aa", border: "1px solid #27272a", width: 28, height: 28 }}
            >
              <RemoveRounded sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography sx={{ minWidth: 28, textAlign: "center", fontSize: "0.85rem", fontWeight: 600 }}>
              {item.quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              sx={{ color: "#a1a1aa", border: "1px solid #27272a", width: 28, height: 28 }}
            >
              <AddRounded sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 70, textAlign: "right" }}>
            ₹{(item.product.price * item.quantity).toLocaleString()}
          </Typography>

          <IconButton size="small" onClick={() => removeItem(item.id)} sx={{ color: "#71717a", "&:hover": { color: "#ef4444" } }}>
            <DeleteRounded fontSize="small" />
          </IconButton>
        </Card>
      ))}

      <Divider sx={{ my: 2, borderColor: "#27272a" }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Total: ₹{total.toLocaleString()}
        </Typography>
        <Button
          variant="contained"
          onClick={handleCheckout}
          disabled={checkingOut}
          sx={{ px: 3 }}
        >
          {checkingOut ? "Processing..." : "Checkout"}
        </Button>
      </Box>
    </Box>
  );
}

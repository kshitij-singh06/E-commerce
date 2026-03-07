import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Skeleton,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  ArrowBackRounded,
  AddRounded,
  RemoveRounded,
} from "@mui/icons-material";
import { ToastContext, CartContext } from "./App";
import { API, authHeaders, authJsonHeaders } from "./api";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useContext(ToastContext);
  const { refreshCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/products/${id}`, { headers: authHeaders() })
      .then((res) => res.json())
      .then(setProduct);
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const res = await fetch(`${API}/api/cart/${id}`, {
        method: "POST",
        headers: authJsonHeaders(),
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Failed to add to cart", "error");
      } else {
        showToast(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart`, "success");
        refreshCart();
      }
    } catch {
      showToast("Failed to add to cart", "error");
    }
    setAdding(false);
  };

  if (!product) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" } }}>
          <Skeleton variant="rectangular" sx={{ width: { xs: "100%", md: 420 }, height: 380, borderRadius: 2, bgcolor: "#27272a" }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="80%" height={36} sx={{ bgcolor: "#27272a" }} />
            <Skeleton width="30%" height={36} sx={{ bgcolor: "#27272a", mt: 2 }} />
            <Skeleton width="100%" height={60} sx={{ bgcolor: "#27272a", mt: 2 }} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate("/products")}
          sx={{ color: "#71717a", textDecoration: "none", "&:hover": { color: "#6366f1" } }}
        >
          Products
        </Link>
        <Typography variant="body2">{product.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" } }}>
        <Card sx={{ flex: "0 0 auto", width: { xs: "100%", md: 420 }, overflow: "hidden" }}>
          <CardMedia
            component="img"
            image={
              product.imageUrl
                ? `${API}${product.imageUrl}`
                : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="450" height="400" fill="%2318181b"><rect width="450" height="400"/><text x="225" y="200" text-anchor="middle" fill="%2371717a" font-size="16" font-family="sans-serif">No Image</text></svg>')}`
            }
            alt={product.name}
            sx={{ height: 380, objectFit: "cover" }}
          />
        </Card>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {product.name}
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 700, mt: 1.5 }}>
            ₹{product.price.toLocaleString()}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1.5, color: product.stock > 0 ? "#22c55e" : "#ef4444" }}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </Typography>

          {product.description && (
            <Typography sx={{ mt: 2.5, color: "#a1a1aa", lineHeight: 1.7, fontSize: "0.9rem" }}>
              {product.description}
            </Typography>
          )}

          {product.stock > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ color: "#71717a", mb: 1 }}>
                Quantity
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                <IconButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  size="small"
                  sx={{ border: "1px solid #27272a", color: "#a1a1aa", "&:hover": { borderColor: "#3f3f46" } }}
                >
                  <RemoveRounded fontSize="small" />
                </IconButton>
                <Typography sx={{ minWidth: 36, textAlign: "center", fontWeight: 600 }}>
                  {quantity}
                </Typography>
                <IconButton
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  size="small"
                  sx={{ border: "1px solid #27272a", color: "#a1a1aa", "&:hover": { borderColor: "#3f3f46" } }}
                >
                  <AddRounded fontSize="small" />
                </IconButton>
              </Box>

              <Button
                variant="contained"
                onClick={handleAddToCart}
                disabled={adding}
                sx={{ py: 1.2, px: 3 }}
              >
                {adding ? "Adding..." : "Add to cart"}
              </Button>
            </Box>
          )}

          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate("/products")}
            sx={{ mt: 3, color: "#71717a", textTransform: "none" }}
          >
            Back to products
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

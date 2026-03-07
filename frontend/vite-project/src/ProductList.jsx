import { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  SearchRounded,
  DeleteRounded,
  EditRounded,
  ShoppingCartRounded,
} from "@mui/icons-material";
import { ToastContext, CartContext } from "./App";
import { API, authHeaders, imageUrl } from "./api";

export default function ProductList({ user }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });


  const navigate = useNavigate();
  const showToast = useContext(ToastContext);
  const { refreshCart } = useContext(CartContext);

  const loadProducts = useCallback(
    (query = "") => {
      setLoading(true);
      const url = query
        ? `${API}/api/products?search=${encodeURIComponent(query)}`
        : `${API}/api/products`;

      fetch(url, {
        headers: authHeaders(),
      })
        .then((res) => res.json())
        .then((data) => {
          setProducts(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [],
  );



  useEffect(() => {
    const timer = setTimeout(() => loadProducts(search), 400);
    return () => clearTimeout(timer);
  }, [search, loadProducts]);

  const handleDelete = async () => {
    const id = deleteDialog.product?.id;
    if (!id) return;

    const res = await fetch(`${API}/api/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (res.ok) {
      showToast("Product deleted", "success");
      loadProducts(search);
    } else {
      showToast("Failed to delete product", "error");
    }
    setDeleteDialog({ open: false, product: null });
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    const res = await fetch(`${API}/api/cart/${productId}`, {
      method: "POST",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Added to cart", "success");
      refreshCart();
    } else {
      showToast(data.error || "Failed to add", "error");
    }
  };

  return (
    <Box className="page-container">
      <TextField
        placeholder="Search products..."
        variant="outlined"
        fullWidth
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded sx={{ color: "#71717a", fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={2.5}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card>
                <Skeleton variant="rectangular" height={180} sx={{ bgcolor: "#27272a" }} />
                <CardContent>
                  <Skeleton width="70%" sx={{ bgcolor: "#27272a" }} />
                  <Skeleton width="40%" sx={{ bgcolor: "#27272a", mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))
          : products.map((p) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
              <Card
                onClick={() => navigate(`/product/${p.id}`)}
                sx={{
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "#3f3f46" },
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={
                    p.imageUrl
                      ? imageUrl(p.imageUrl)
                      : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" fill="%2318181b"><rect width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%2371717a" font-size="14" font-family="sans-serif">No Image</text></svg>')}`
                  }
                  alt={p.name}
                  sx={{ objectFit: "cover" }}
                />

                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.name}
                  </Typography>

                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#fafafa" }}>
                    ₹{p.price.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: p.stock > 0 ? "#22c55e" : "#ef4444", display: "block", mb: 1.5 }}>
                    {p.stock > 0 ? `${p.stock} in stock` : "Sold out"}
                  </Typography>

                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    disabled={p.stock <= 0}
                    onClick={(e) => handleAddToCart(e, p.id)}
                    startIcon={<ShoppingCartRounded sx={{ fontSize: 16 }} />}
                    sx={{ fontSize: "0.78rem", py: 0.6, mb: user?.role === "ADMIN" ? 1 : 0 }}
                  >
                    Add to cart
                  </Button>

                  {user?.role === "ADMIN" && (
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/edit-product/${p.id}`);
                        }}
                        sx={{ color: "#71717a", "&:hover": { color: "#6366f1" } }}
                      >
                        <EditRounded fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({ open: true, product: p });
                        }}
                        sx={{ color: "#71717a", "&:hover": { color: "#ef4444" } }}
                      >
                        <DeleteRounded fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {!loading && products.length === 0 && (
        <Box className="empty-state">
          <Typography variant="h6" sx={{ color: "#71717a", mb: 1 }}>
            {search ? `No results for "${search}"` : "No products yet"}
          </Typography>
        </Box>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        PaperProps={{ sx: { bgcolor: "#18181b", border: "1px solid #27272a" } }}
      >
        <DialogTitle sx={{ fontSize: "1rem" }}>Delete product</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#a1a1aa" }}>
            Are you sure you want to delete <strong>{deleteDialog.product?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialog({ open: false, product: null })} sx={{ color: "#a1a1aa" }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} size="small">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

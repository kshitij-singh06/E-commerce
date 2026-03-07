import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { CloudUploadRounded } from "@mui/icons-material";
import { ToastContext } from "./App";
import { API, authHeaders } from "./api";



export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();
  const showToast = useContext(ToastContext);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to add product", "error");
        setLoading(false);
        return;
      }
      showToast("Product added", "success");
      navigate("/products");
    } catch {
      showToast("Network error", "error");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Card sx={{ p: 3.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Add product
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Product name"
            fullWidth
            required
            size="small"
            sx={{ mb: 2 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Price (₹)"
              type="number"
              fullWidth
              required
              size="small"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <TextField
              label="Stock"
              type="number"
              fullWidth
              required
              size="small"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </Box>

          <TextField
            label="Description"
            multiline
            rows={3}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Box
            sx={{
              mb: 2.5,
              border: "1px dashed #3f3f46",
              borderRadius: 2,
              p: 2.5,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": { borderColor: "#6366f1" },
            }}
            onClick={() => document.getElementById("image-upload").click()}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            {preview ? (
              <Box component="img" src={preview} alt="Preview" sx={{ maxWidth: "100%", maxHeight: 180, borderRadius: 1.5, objectFit: "cover" }} />
            ) : (
              <>
                <CloudUploadRounded sx={{ fontSize: 32, color: "#71717a", mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: "#71717a" }}>
                  Click to upload image
                </Typography>
              </>
            )}
          </Box>

          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.2 }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "Add product"}
          </Button>
        </form>
      </Card>
    </Box>
  );
}

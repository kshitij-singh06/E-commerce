import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Collapse,
  IconButton,
  Skeleton,
  Divider,
} from "@mui/material";
import { ExpandMoreRounded, ExpandLessRounded, ReceiptLongRounded } from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  if (loading) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={72} sx={{ mb: 1.5, borderRadius: 2, bgcolor: "#27272a" }} />
        ))}
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box className="empty-state">
        <Typography variant="h6" sx={{ color: "#71717a" }}>No orders yet</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto" }}>
      {orders.map((order) => (
        <Card key={order.id} sx={{ mb: 1.5, overflow: "hidden" }}>
          <Box
            sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", "&:hover": { bgcolor: "#1f1f23" } }}
            onClick={() => toggle(order.id)}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ReceiptLongRounded sx={{ fontSize: 20, color: "#71717a" }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Order #{order.id}</Typography>
                <Typography variant="caption" sx={{ color: "#71717a" }}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ₹{order.totalAmount.toLocaleString()}
              </Typography>
              <IconButton size="small" sx={{ color: "#71717a" }}>
                {expanded[order.id] ? <ExpandLessRounded /> : <ExpandMoreRounded />}
              </IconButton>
            </Box>
          </Box>

          <Collapse in={expanded[order.id]}>
            <Divider sx={{ borderColor: "#27272a" }} />
            <Box sx={{ p: 2 }}>
              {order.orderItems.map((item) => (
                <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", py: 0.7 }}>
                  <Typography variant="body2" sx={{ color: "#a1a1aa" }}>
                    {item.product.name} × {item.quantity}
                  </Typography>
                  <Typography variant="body2">₹{(item.price * item.quantity).toLocaleString()}</Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Card>
      ))}
    </Box>
  );
}

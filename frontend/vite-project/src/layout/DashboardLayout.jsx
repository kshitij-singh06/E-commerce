import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Divider,
  Badge,
} from "@mui/material";
import {
  StorefrontRounded,
  ShoppingCartRounded,
  ReceiptLongRounded,
  AddBoxRounded,
  LogoutRounded,
  Inventory2Rounded,
  ListAltRounded,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const W = 240;

export default function DashboardLayout({ user, logout, cartCount = 0 }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = user?.role === "ADMIN";

  const nav = isAdmin
    ? [
      { label: "Products", icon: <Inventory2Rounded />, to: "/products" },
      { label: "Add Product", icon: <AddBoxRounded />, to: "/admin/add-product" },
      { label: "Orders", icon: <ListAltRounded />, to: "/admin/orders" },
    ]
    : [
      { label: "Products", icon: <Inventory2Rounded />, to: "/products" },
      {
        label: "Cart",
        icon: (
          <Badge badgeContent={cartCount} color="primary" max={99}>
            <ShoppingCartRounded />
          </Badge>
        ),
        to: "/cart",
      },
      { label: "Orders", icon: <ReceiptLongRounded />, to: "/orders" },
    ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: W,
          "& .MuiDrawer-paper": {
            width: W,
            bgcolor: "#111113",
            borderRight: "1px solid #27272a",
          },
        }}
      >
        <Box
          sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
          onClick={() => navigate("/products")}
        >
          <StorefrontRounded sx={{ fontSize: 26, color: "#6366f1" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            E-Commerce
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "#27272a" }} />

        <List sx={{ px: 1, py: 1.5, flex: 1 }}>
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <ListItemButton
                key={item.to}
                onClick={() => navigate(item.to)}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.3,
                  py: 1,
                  px: 1.5,
                  bgcolor: active ? "rgba(99,102,241,0.1)" : "transparent",
                  "&:hover": { bgcolor: active ? "rgba(99,102,241,0.14)" : "#1f1f23" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? "#6366f1" : "#71717a" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? "#fafafa" : "#a1a1aa",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ borderColor: "#27272a" }} />

        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1, mb: 0.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.8rem",
                fontWeight: 600,
                bgcolor: "#27272a",
                color: "#a1a1aa",
              }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8rem", lineHeight: 1.3 }} noWrap>
                {user?.name || "User"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#71717a", fontSize: "0.7rem" }}>
                {isAdmin ? "Admin" : "Customer"}
              </Typography>
            </Box>
          </Box>

          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: 1.5,
              py: 0.8,
              justifyContent: "center",
              "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
            }}
          >
            <LogoutRounded sx={{ fontSize: 16, mr: 1, color: "#71717a" }} />
            <Typography variant="body2" sx={{ color: "#71717a", fontSize: "0.8rem" }}>
              Sign out
            </Typography>
          </ListItemButton>
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: "#09090b", borderBottom: "1px solid #27272a" }}
        >
          <Toolbar sx={{ minHeight: "56px !important" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {getTitle(pathname)}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

function getTitle(p) {
  if (p.startsWith("/product/")) return "Product Details";
  if (p.startsWith("/admin/edit-product")) return "Edit Product";
  return {
    "/products": "Products",
    "/cart": "Cart",
    "/orders": "Orders",
    "/admin/add-product": "Add Product",
    "/admin/orders": "All Orders",
  }[p] || "";
}

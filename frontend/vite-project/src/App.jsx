import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./Login";
import Signup from "./Signup";
import ProductList from "./ProductList";
import Cart from "./Cart";
import Orders from "./Orders";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import ProductPage from "./ProductPage";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));  // <-- IMPORTANT
  const [user, setUser] = useState(null);

  const isLoggedIn = !!token;

  // Fetch user when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, [token]); // <--- IMPORTANT

  // Runs after Login success
  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);              // <-- CRITICAL
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);                  // <-- forces rerender correctly
    setUser(null);
  };

  return (
    <Router>
      <div>

        {/* NAVBAR */}
        {isLoggedIn && (
          <div className="navbar">
            <div className="nav-left">
              <Link to="/products"><button>Products</button></Link>
              <Link to="/cart"><button>Cart</button></Link>
              <Link to="/orders"><button>Orders</button></Link>

              {user?.role === "ADMIN" && (
                <Link to="/admin/add-product"><button>Add Product</button></Link>
              )}
            </div>

            <div className="nav-right">
              <span>{user?.role === "ADMIN" ? "Admin" : user?.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        )}

        <Routes>

          {/* LOGIN */}
          <Route
            path="/login"
            element={
              isLoggedIn ? <Navigate to="/products" /> : <Login onLogin={handleLoginSuccess} />
            }
          />

          {/* SIGNUP */}
          <Route
            path="/signup"
            element={
              isLoggedIn ? <Navigate to="/products" /> : <Signup onSignup={handleLoginSuccess} />
            }
          />

          {/* USER ROUTES */}
          <Route
            path="/products"
            element={isLoggedIn ? <ProductList user={user} /> : <Navigate to="/login" />}
          />

          <Route
  path="/product/:id"
  element={isLoggedIn ? <ProductPage user={user} /> : <Navigate to="/login" />}
/>

          <Route
            path="/cart"
            element={isLoggedIn ? <Cart /> : <Navigate to="/login" />}
          />
          <Route
            path="/orders"
            element={isLoggedIn ? <Orders /> : <Navigate to="/login" />}
          />

          {/* ADMIN ROUTES */}
          {user?.role === "ADMIN" && (
            <>
              <Route
                path="/admin/add-product"
                element={<AddProduct />}
              />

              <Route
                path="/admin/edit-product/:id"
                element={<EditProduct />}
              />
            </>
          )}

          {/* HOME */}
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? "/products" : "/login"} />}
          />

          

        </Routes>

      </div>
    </Router>
  );
}

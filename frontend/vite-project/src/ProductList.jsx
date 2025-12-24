import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProductList({ user }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Load products with optional filters
  const loadProducts = () => {
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (minPrice) params.push(`min=${minPrice}`);
    if (maxPrice) params.push(`max=${maxPrice}`);

    const queryString = params.length ? `?${params.join("&")}` : "";

    fetch(`http://localhost:5000/api/products${queryString}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(setProducts);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Add to cart
  const handleAddToCart = async (id) => {
    const res = await fetch(`http://localhost:5000/api/cart/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    alert(data.message || "Added to cart");
  };

  // Admin: Delete product
  const onDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    loadProducts();
  };

  // Admin: Go to edit page
  const onEdit = (product) => {
    navigate(`/admin/edit-product/${product.id}`);
  };

  return (
    <div>
      <h2 style={{ marginBottom: "10px" }}>Products</h2>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          placeholder="Search name…"
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="number"
          placeholder="Min ₹"
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max ₹"
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <button onClick={loadProducts}>Filter</button>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="card" style={{ flexDirection: "column", textAlign: "center" }}>
            
            {/* IMAGE */}
            {p.imageUrl ? (
              <img
                src={`http://localhost:5000${p.imageUrl}`}
                alt={p.name}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  marginBottom: "10px"
                }}
              />
            ) : (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "8px",
                  background: "#ddd",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#666"
                }}
              >
                No Image
              </div>
            )}

            <h3
  style={{ margin: "5px 0", cursor: "pointer" }}
  onClick={() => navigate(`/product/${p.id}`)}
>
  {p.name}
</h3>

            <p style={{ margin: "5px 0", fontWeight: "bold" }}>₹{p.price}</p>

            <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
              {/* Customer: Add to cart */}
              <button
                className="btn-success"
                onClick={() => handleAddToCart(p.id)}
              >
                Add to Cart
              </button>

              {/* Admin: Edit + Delete */}
              {user?.role === "ADMIN" && (
                <>
                  <button className="btn-primary" onClick={() => onEdit(p)}>
                    Edit
                  </button>

                  <button className="btn-danger" onClick={() => onDelete(p.id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

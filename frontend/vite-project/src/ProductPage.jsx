import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductPage({ user }) {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = () => {
    fetch(`http://localhost:5000/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    const res = await fetch(`http://localhost:5000/api/cart/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    alert(data.message || "Added to cart");
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      {/* IMAGE */}
      {product.imageUrl ? (
        <img
          src={`http://localhost:5000${product.imageUrl}`}
          alt={product.name}
          style={{
            width: "100%",
            maxWidth: "350px",
            borderRadius: "10px",
            objectFit: "cover",
            display: "block",
            margin: "auto"
          }}
        />
      ) : (
        <div
          style={{
            width: "350px",
            height: "350px",
            background: "#ddd",
            margin: "auto",
            borderRadius: "10px"
          }}
        />
      )}

      {/* DETAILS */}
      <h2 style={{ marginTop: "20px" }}>{product.name}</h2>
      <h3 style={{ color: "#3b82f6" }}>₹{product.price}</h3>

      <p style={{ marginTop: "10px", lineHeight: "1.6" }}>
        {product.description}
      </p>

      <p style={{ marginTop: "10px", fontWeight: "bold" }}>
        Stock: {product.stock}
      </p>

      {/* Buttons */}
      <div style={{ marginTop: "20px" }}>
        <button
          className="btn-success"
          onClick={addToCart}
          style={{ width: "150px" }}
        >
          Add to Cart
        </button>

        {user?.role === "ADMIN" && (
          <button
            className="btn-primary"
            style={{ marginLeft: "10px", width: "150px" }}
          >
            Edit Product
          </button>
        )}
      </div>
    </div>
  );
}

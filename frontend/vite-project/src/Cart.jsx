import { useEffect, useState } from "react";

export default function Cart({ onCheckout }) {
  const [cart, setCart] = useState([]);
  const token = localStorage.getItem("token");

  const loadCart = () => {
    fetch("http://localhost:5000/api/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCart(data));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) return removeItem(id);

    await fetch(`http://localhost:5000/api/cart/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    loadCart();
  };

  const removeItem = async (id) => {
    await fetch(`http://localhost:5000/api/cart/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadCart();
  };

  const handleCheckout = async () => {
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert(data.message);
    loadCart();
    onCheckout();
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <div>
      <h2>My Cart</h2>

      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="card">
              <span>
                {item.product.name} – ₹{item.product.price} x{" "}
                {item.quantity}
              </span>

              <div style={{ display: "flex", gap: "5px" }}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  –
                </button>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
                <button className="btn-danger" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          <h3>Total: ₹{calculateTotal()}</h3>

          <button className="btn-success" onClick={handleCheckout}>
            Checkout
          </button>
        </>
      )}
    </div>
  );
}

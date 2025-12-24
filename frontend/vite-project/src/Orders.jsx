import { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  return (
    <div>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders placed yet</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ marginBottom: "15px" }}>
            <strong>Order #{order.id}</strong> - ₹{order.totalAmount}
            <ul>
              {order.orderItems.map((item) => (
                <li key={item.id}>
                  {item.product.name} x {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

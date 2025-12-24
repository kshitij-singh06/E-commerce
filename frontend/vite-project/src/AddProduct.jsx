import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("description", description);
    if (image) formData.append("image", image);

    const res = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add product");
      return;
    }

    alert("Product added");
    navigate("/products");
  };

  return (
    <div>
      <h2>Add Product</h2>

      <form className="simple-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Stock"
          onChange={(e) => setStock(e.target.value)}
        />

        <textarea
          placeholder="Description"
          onChange={(e) => setDescription(e.target.value)}
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              marginTop: "10px",
              borderRadius: "8px"
            }}
          />
        )}

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}

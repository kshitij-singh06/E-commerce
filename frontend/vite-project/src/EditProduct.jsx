import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setName(data.name);
        setPrice(data.price);
        setStock(data.stock);
        setDescription(data.description || "");

        if (data.imageUrl) {
          setPreview(`http://localhost:5000${data.imageUrl}`);
        }
      });
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // IMPORTANT: Must use FormData
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("description", description);

    if (image) {
      formData.append("image", image);
    }

    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // DO NOT SEND Content-Type → browser sets boundary automatically
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("EDIT ERROR:", data);
      alert(data.error || "Update failed");
      return;
    }

    alert("Product updated!");
    navigate("/products");
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <h2>Edit Product</h2>

      <form className="simple-form" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name"
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
        />

        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
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

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

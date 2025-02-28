import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/styles.css"; 

const API_URL = "http://127.0.0.1:8000/api/products";

function AddProduct() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: null
    });

    const handleChange = (e) => {
        if (e.target.name === "image") {
            setFormData({ ...formData, image: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("stock", formData.stock);
        if (formData.image) {
            data.append("image", formData.image);
        }

        axios.post(API_URL, data, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(() => navigate("/"))
        .catch(error => console.error("Error al agregar producto:", error));
    };

    return (
        <div className="form-container">
            <h1>➕ Agregar Producto</h1>
            <form onSubmit={handleSubmit}>
                <label>Nombre</label>
                <input type="text" name="name" required onChange={handleChange} />

                <label>Descripción</label>
                <textarea name="description" onChange={handleChange}></textarea>

                <label>Precio</label>
                <input type="number" name="price" required onChange={handleChange} />

                <label>Stock</label>
                <input type="number" name="stock" required onChange={handleChange} />

                <label>Imagen</label>
                <input type="file" name="image" accept="image/*" onChange={handleChange} />

                <div className="form-buttons">
                    <button type="submit" className="btn btn-save">Guardar</button>
                    <button type="button" className="btn btn-cancel" onClick={() => navigate("/")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
}

export default AddProduct;

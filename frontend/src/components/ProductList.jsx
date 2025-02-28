import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css"; 

const API_URL = "http://127.0.0.1:8000/api/products";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [priceFilter, setPriceFilter] = useState("");
    const [stockFilter, setStockFilter] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios.get(API_URL)
            .then(response => setProducts(response.data))
            .catch(error => console.error("Error al obtener productos:", error));
    };

    const deleteProduct = (id) => {
        const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este producto?");
        if (confirmDelete) {
            axios.delete(`${API_URL}/${id}`)
                .then(() => fetchProducts())
                .catch(error => console.error("Error al eliminar producto:", error));
        }
    };    

    const filteredProducts = products.filter(product => {
        return (
            (priceFilter === "" || product.price <= parseFloat(priceFilter)) &&
            (stockFilter === "" || product.stock >= parseInt(stockFilter))
        );
    });

    

    return (
        <div className="container">
            <h1 className="title">📦 Productos</h1>
            <button 
                className="add-button" 
                onClick={() => navigate("/add-product")}
            >
                ➕ Agregar Producto
            </button>

            <div className="sidebar">
                <h3>🔍 Filtrar Productos</h3>
                <label>Precio Máximo:</label>
                <input
                    type="number"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    placeholder="Ej: 100"
                />

                <label>Stock Mínimo:</label>
                <input
                    type="number"
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    placeholder="Ej: 10"
                />

                <button 
                    className="clear-filters" 
                    onClick={() => {
                        setPriceFilter("");
                        setStockFilter("");
                    }}
                >
                    ❌ Limpiar Filtros
                </button>
            </div>

            <div className="product-grid">
                {filteredProducts.map(product => (
                    <div className="product-card" key={product.id}>
                        {product.image && (
                            <img 
                                src={`http://127.0.0.1:8000/storage/${product.image}`} 
                                alt={product.name} 
                                className="product-image"
                            />
                        )}
                        <div className="product-info">
                            <h5 className="product-title">{product.name}</h5>
                            <p className="product-price">💰 {product.price} €</p>
                            <p className="product-stock">📦 Stock: {product.stock}</p>
                            <button 
                                className="edit-button"
                                onClick={() => navigate(`/products/${product.id}`)}
                            >
                                ✏️ Editar
                            </button>
                            <button 
                                className="delete-button"
                                onClick={() => deleteProduct(product.id)}
                            >
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "../src/components/ProductList";
import AddProduct from "../src/components/AddProduct";
import "../src/css/styles.css"; 

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/add-product" element={<AddProduct />} />
            </Routes>
        </Router>
    );
}

export default App;

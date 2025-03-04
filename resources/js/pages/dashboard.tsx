import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import Spinner from '@/components/spinner'; // Importar spinner
import ProductImageCarousel from '@/components/carrusel';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión de Tienda',
        href: '/dashboard',
    },
];

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[] | null; // Cambiar 'image' a 'images'
    tipo: {
        nombre: string;
    } | null;
}

export default function Dashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [selectedType, setSelectedType] = useState('');
    const [searchName, setSearchName] = useState('');
    const [loading, setLoading] = useState(true); // Estado de carga

    useEffect(() => {
        axios.get("/api/products")
            .then(response => {
                console.log(response.data); // <-- Agregar esto para verificar
                setProducts(response.data);
                setFilteredProducts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                setLoading(false);
            });
    }, []);
    

    useEffect(() => {
        handleFilterChange();
    }, [selectedType, searchName ]);

    const deleteProduct = (id: number) => {
        setLoading(true); // Activar el estado de carga
        axios.delete(`/api/products/${id}`)
            .then(() => {
                setProducts(products.filter(product => product.id !== id));
                setFilteredProducts(filteredProducts.filter(product => product.id !== id));
                setProductToDelete(null);
                toast.success('Eliminado con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            })
            .catch(error => {
                console.error("Error al eliminar el producto:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleFilterChange = () => {
        let filtered = products;

        if (selectedType) {
            filtered = filtered.filter(product => product.tipo?.nombre === selectedType);
        }

        if (searchName) {
            filtered = filtered.filter(product => product.name.toLowerCase().includes(searchName.toLowerCase()));
        }
        setFilteredProducts(filtered);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Tienda" />
            <div className="flex min-h-screen">
                <div className="flex-1 p-6 bg-black text-white">
                    {loading ? (
                        <Spinner />
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-4xl font-bold text-white">Gestión de Tienda</h1>
                                <div className="flex space-x-4">
                                    <div className="flex flex-col">
                                        <label htmlFor="type" className="block text-sm font-medium text-gray-300">Tipo</label>
                                        <select 
                                            id="type" 
                                            value={selectedType} 
                                            onChange={(e) => setSelectedType(e.target.value)} 
                                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                        >
                                            <option value="">Todos</option>
                                            {products
                                                .map(product => product.tipo?.nombre)
                                                .filter((value, index, self) => value && self.indexOf(value) === index)
                                                .map((tipo, index) => (
                                                    <option key={index} value={tipo}>{tipo}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="searchName" className="block text-sm font-medium text-gray-300">Buscar por nombre</label>
                                        <input 
                                            type="text" 
                                            id="searchName" 
                                            value={searchName} 
                                            onChange={(e) => setSearchName(e.target.value)} 
                                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => (
                                        <div key={product.id} className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4 flex flex-col items-center">
                                            {product.images && product.images.length > 0 ? (
                                                    <ProductImageCarousel images={product.images} productName={product.name} />
                                                ) : (
                                                    <div className="w-40 h-40 bg-gray-600 flex items-center justify-center rounded-md mb-4"
                                                        style={{ width: '160px', height: '160px' }}>
                                                        <span className="text-gray-300">Sin imagen</span>
                                                    </div>
                                                )}
                                            <h2 className="text-lg font-semibold text-center text-white">{product.name}</h2>
                                            <p className="text-gray-400 text-sm text-center mt-2">{product.description}</p>
                                            <p className="text-yellow-400 text-lg font-bold mt-2">{product.price.toFixed(2)} €</p>
                                            <span className={`mt-2 text-sm ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                                                {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
                                            </span>
                                            <p className="text-gray-400 text-sm mt-2">Tipo: {product.tipo?.nombre || 'N/A'}</p>
                                            <p className="text-gray-400 text-sm mt-2">ID: {product.id}</p>
                                            <div className="flex gap-2 mt-4">
                                                <button 
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                                    onClick={() => router.visit(`/edit/${product.id}`)}>
                                                    Editar
                                                </button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button 
                                                            onClick={() => setProductToDelete(product)}
                                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogTitle>¿Estás seguro de que deseas eliminar este producto?</DialogTitle>
                                                        <DialogDescription>
                                                            Una vez que elimines este producto, todos sus datos se eliminarán permanentemente. Esta acción no se puede deshacer.
                                                        </DialogDescription>
                                                        <DialogFooter className="gap-2">
                                                            <DialogClose asChild>
                                                                <Button variant="secondary" onClick={() => setProductToDelete(null)}>
                                                                    Cancelar
                                                                </Button>
                                                            </DialogClose>
                                                            <Button variant="destructive" onClick={() => deleteProduct(product.id)}>
                                                                Eliminar
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="col-span-full text-center text-gray-400">No hay productos disponibles</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
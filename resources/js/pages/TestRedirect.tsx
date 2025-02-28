import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

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
    image: string | null;
}

interface Boton {
    title: string;
    url: string;
    icon: string | null;
}

const sidebarNavItems: Boton[] = [
    {
        title: 'Añadir Producto',
        url: '/create',
        icon: null,
    },
];

export default function Dashboard() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        axios.get("/api/test-redirect")
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, []);

    const deleteProduct = (id: number) => {
        axios.delete(`/api/products/${id}`)
            .then(() => {
                setProducts(products.filter(product => product.id !== id));
            })
            .catch(error => {
                console.error("Error al eliminar el producto:", error);
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Tienda" />
            <div className="p-6 bg-black min-h-screen text-white">
                <h1 className="text-4xl font-bold mb-6 text-center text-white">Gestión de Tienda</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.length > 0 ? (
                        products.map(product => (
                            <div key={product.id} className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4 flex flex-col items-center">
                                {product.image ? (
                                    <img 
                                        src={`/storage/${product.image}`} 
                                        alt={product.name} 
                                        className="w-40 h-40 object-cover rounded-md mb-4"
                                    />
                                ) : (
                                    <div className="w-40 h-40 bg-gray-600 flex items-center justify-center rounded-md mb-4">
                                        <span className="text-gray-300">Sin imagen</span>
                                    </div>
                                )}
                                <h2 className="text-lg font-semibold text-center text-white">{product.name}</h2>
                                <p className="text-gray-400 text-sm text-center mt-2">{product.description}</p>
                                <p className="text-yellow-400 text-lg font-bold mt-2">${product.price.toFixed(2)}</p>
                                <span className={`mt-2 text-sm ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                                    {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
                                </span>
                                <div className="flex gap-2 mt-4">
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => deleteProduct(product.id)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-400">No hay productos disponibles</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
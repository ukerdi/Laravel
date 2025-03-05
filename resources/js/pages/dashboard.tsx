import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import Spinner from '@/components/spinner';
import ProductImageCarousel from '@/components/carrusel';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Importar iconos para paginación

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
    images: string[] | null;
    tipo: {
        nombre: string;
    } | null;
}

const ITEMS_PER_PAGE = 8; // Constante para número de productos por página

export default function Dashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [selectedType, setSelectedType] = useState('');
    const [searchName, setSearchName] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        axios.get("/api/products")
            .then(response => {
                console.log(response.data);
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
    }, [selectedType, searchName]);

    // Efecto para manejar la paginación cuando cambian los productos filtrados o la página actual
    useEffect(() => {
        const total = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
        setTotalPages(total);
        
        // Asegurarse de que la página actual es válida
        if (currentPage > total && total > 0) {
            setCurrentPage(1);
        }
        
        // Calcular los productos para la página actual
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
    }, [filteredProducts, currentPage]);

    const deleteProduct = (id: number) => {
        setLoading(true);
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
        setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
    };

    // Funciones para paginación
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Generar los botones de página
    const renderPaginationButtons = () => {
        const buttons = [];
        
        // Mostrar máximo 5 botones de página
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        
        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        // Botón para primera página si estamos alejados
        if (startPage > 1) {
            buttons.push(
                <button 
                    key="first" 
                    onClick={() => goToPage(1)} 
                    className="px-3 py-1 mx-1 bg-gray-800 rounded text-gray-300 hover:bg-gray-700"
                >
                    1
                </button>
            );
            
            // Mostrar puntos suspensivos si hay un salto
            if (startPage > 2) {
                buttons.push(
                    <span key="ellipsis1" className="px-2 py-1 text-gray-500">...</span>
                );
            }
        }

        // Generar botones de página
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button 
                    key={i} 
                    onClick={() => goToPage(i)} 
                    className={`px-3 py-1 mx-1 rounded ${
                        currentPage === i 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Botón para última página si estamos alejados
        if (endPage < totalPages) {
            // Mostrar puntos suspensivos si hay un salto
            if (endPage < totalPages - 1) {
                buttons.push(
                    <span key="ellipsis2" className="px-2 py-1 text-gray-500">...</span>
                );
            }
            
            buttons.push(
                <button 
                    key="last" 
                    onClick={() => goToPage(totalPages)} 
                    className="px-3 py-1 mx-1 bg-gray-800 rounded text-gray-300 hover:bg-gray-700"
                >
                    {totalPages}
                </button>
            );
        }

        return buttons;
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
                            
                            {/* Información de paginación en formato texto */}
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-gray-400 text-sm">
                                    Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Página {currentPage} de {totalPages || 1}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {paginatedProducts.length > 0 ? (
                                    paginatedProducts.map(product => (
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
                            
                            {/* Controles de paginación */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center items-center">
                                    <button 
                                        onClick={goToPreviousPage} 
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-full mr-2 ${
                                            currentPage === 1 
                                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    <div className="flex">
                                        {renderPaginationButtons()}
                                    </div>
                                    
                                    <button 
                                        onClick={goToNextPage} 
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-full ml-2 ${
                                            currentPage === totalPages 
                                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
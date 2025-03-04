import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión de Tienda',
        href: '/dashboard',
    },
    {
        title: 'Editar Producto',
        href: '/edit',
    },
];

interface TipoProducto {
    id: number;
    nombre: string;
}

interface EditProductProps {
    productId: string;
}

export default function EditProduct(props: EditProductProps) {
    const productId = props.productId;
    const [tipos, setTipos] = useState<TipoProducto[]>([]);
    const { data, setData, errors, processing, setError } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        tipo_id: '',
        images: [] as File[],
        currentImages: [] as string[],
        imagesToRemove: [] as string[], // Cambiado a string[] para guardar las rutas completas
    });

    useEffect(() => {
        // Cargar los tipos de producto
        axios.get('/api/tipos')
            .then(response => {
                setTipos(response.data);
            })
            .catch(error => {
                console.error("Error al cargar tipos:", error);
            });

        if (productId) {
            axios.get(`/api/products/${productId}`)
                .then(response => {
                    console.log("Datos del producto:", response.data);
                    // Parseamos las imágenes si son un string JSON
                    let currentImages = [];
                    if (response.data.images) {
                        try {
                            if (typeof response.data.images === 'string') {
                                currentImages = JSON.parse(response.data.images);
                            } else {
                                currentImages = response.data.images;
                            }
                        } catch (e) {
                            console.error("Error parsing images:", e);
                            currentImages = [];
                        }
                    }
                    
                    setData({
                        name: response.data.name,
                        description: response.data.description,
                        price: response.data.price,
                        stock: response.data.stock,
                        tipo_id: response.data.tipo_id || '',
                        images: [],
                        currentImages: currentImages,
                        imagesToRemove: [],
                    });
                })
                .catch(error => {
                    console.error("Error al obtener producto:", error);
                });
        }
    }, [productId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('stock', data.stock);
        formData.append('tipo_id', data.tipo_id);
        
        // Añadir imágenes a eliminar - enviamos solo los nombres de archivo sin la ruta
        if (data.imagesToRemove.length > 0) {
            // Extraemos solo los nombres de archivo de las rutas completas
            const filenamesToRemove = data.imagesToRemove.map(path => {
                const parts = path.split('/');
                return parts[parts.length - 1];
            });
            formData.append('images_to_remove', JSON.stringify(filenamesToRemove));
        }
    
        // Añadir nuevas imágenes
        if (data.images.length > 0) {
            for (let i = 0; i < data.images.length; i++) {
                formData.append('images[]', data.images[i]);
            }
        }
        
        // Añadir flag para indicar que queremos mantener las imágenes existentes
        formData.append('keep_existing_images', 'true');
    
        // Añadir el método _method para simular PUT en Laravel
        formData.append('_method', 'PUT');
    
        // Imprimimos lo que estamos enviando para depuración
        console.log("Enviando datos:", {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            tipo_id: data.tipo_id,
            images_to_remove: data.imagesToRemove,
            new_images_count: data.images.length
        });
    
        axios.post(`/api/products/${productId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            }
        })
        .then(response => {
            console.log("Producto actualizado:", response.data);
            toast.success('Producto actualizado correctamente');
            router.visit('/dashboard');
        })
        .catch(error => {
            if (error.response?.data?.errors) {
                Object.keys(error.response.data.errors).forEach(key => {
                    setError(key as keyof typeof data, error.response.data.errors[key]);
                });
            } else {
                console.error("Error al actualizar producto:", error);
                toast.error('Error al actualizar el producto');
            }
        });
    };    

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('images', Array.from(e.target.files));
        }
    };

    const handleRemoveCurrentImage = (index: number, imagePath: string) => {
        // Asegurarse de que el path de imagen completo se guarde en el array de imágenes a eliminar
        console.log("Marcando imagen para eliminar:", imagePath);
        setData('imagesToRemove', [...data.imagesToRemove, imagePath]);
        
        // También la eliminamos del estado visual actual
        const updatedImages = [...data.currentImages];
        updatedImages.splice(index, 1);
        setData('currentImages', updatedImages);
    };

    const handleRemoveNewImage = (index: number) => {
        const updatedImages = [...data.images];
        updatedImages.splice(index, 1);
        setData('images', updatedImages);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Producto" />
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-center text-white mb-6">Editar Producto</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre</label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descripción</label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                            {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-300">Precio</label>
                            <input
                                type="number"
                                id="price"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                            {errors.price && <div className="text-red-500 text-sm mt-1">{errors.price}</div>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-300">Stock</label>
                            <input
                                type="number"
                                id="stock"
                                value={data.stock}
                                onChange={(e) => setData('stock', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                            {errors.stock && <div className="text-red-500 text-sm mt-1">{errors.stock}</div>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="tipo_id" className="block text-sm font-medium text-gray-300">Tipo de Producto</label>
                            <select
                                id="tipo_id"
                                value={data.tipo_id}
                                onChange={(e) => setData('tipo_id', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            >
                                <option value="">Seleccionar tipo</option>
                                {tipos.map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.tipo_id && <div className="text-red-500 text-sm mt-1">{errors.tipo_id}</div>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="images" className="block text-sm font-medium text-gray-300">Imágenes</label>
                            <input
                                type="file"
                                id="images"
                                multiple
                                onChange={handleImageChange}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                            {errors.images && <div className="text-red-500 text-sm mt-1">{errors.images}</div>}
                            
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-300 mb-2">Imágenes actuales</h3>
                                <div className="flex flex-wrap gap-4">
                                    {data.currentImages && data.currentImages.length > 0 ? (
                                        data.currentImages.map((image, index) => (
                                            <div key={`current-${index}`} className="relative">
                                                <img 
                                                    src={`/storage/${image}`}
                                                    alt={`Imagen ${index + 1}`} 
                                                    className="w-40 h-40 object-cover rounded-md"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                                                    onClick={() => handleRemoveCurrentImage(index, image)}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400">No hay imágenes disponibles</p>
                                    )}
                                </div>
                            </div>

                            {data.images.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-300 mb-2">Nuevas imágenes</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {data.images.map((image, index) => (
                                            <div key={`new-${index}`} className="relative">
                                                <img 
                                                    src={URL.createObjectURL(image)} 
                                                    alt={`Nueva imagen ${index + 1}`} 
                                                    className="w-40 h-40 object-cover rounded-md"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                                                    onClick={() => handleRemoveNewImage(index)}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                onClick={() => router.visit('/dashboard')}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                disabled={processing}
                            >
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
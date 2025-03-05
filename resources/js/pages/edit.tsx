import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Move, X } from 'lucide-react';
import Spinner from '@/components/spinner';

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
    const [loading, setLoading] = useState(true);
    
    // Estados para drag and drop de imágenes existentes
    const [draggedCurrentIndex, setDraggedCurrentIndex] = useState<number | null>(null);
    const [dragOverCurrentIndex, setDragOverCurrentIndex] = useState<number | null>(null);
    
    // Estados para drag and drop de nuevas imágenes
    const [draggedNewIndex, setDraggedNewIndex] = useState<number | null>(null);
    const [dragOverNewIndex, setDragOverNewIndex] = useState<number | null>(null);
    
    const { data, setData, errors, processing, setError } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        tipo_id: '',
        images: [] as File[],
        currentImages: [] as string[],
        imagesToRemove: [] as string[],
        // Campo para controlar el orden de las imágenes existentes
        imagesOrder: [] as number[],
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
                    
                    // Procesamos las imágenes de una manera compatible con el carrusel
                    let currentImages: string[] = [];
                    
                    if (response.data.images) {
                        try {
                            if (typeof response.data.images === 'string') {
                                // Intenta parsear como JSON
                                const parsed = JSON.parse(response.data.images);
                                currentImages = Array.isArray(parsed) ? parsed : [response.data.images];
                            } else if (Array.isArray(response.data.images)) {
                                // Si ya es un array, lo usamos directamente
                                currentImages = response.data.images;
                            } else {
                                // Si no es ni string ni array, lo tratamos como una sola imagen
                                currentImages = [String(response.data.images)];
                            }
                        } catch (e) {
                            console.error("Error parsing images:", e);
                            // Si hay error al parsear, tratamos como string directo
                            currentImages = typeof response.data.images === 'string' 
                                ? [response.data.images] 
                                : [];
                        }
                    }
                    
                    // Inicializar el array de orden con índices en secuencia
                    const initialOrder = currentImages.map((_, index) => index);
                    
                    setData({
                        name: response.data.name,
                        description: response.data.description,
                        price: response.data.price,
                        stock: response.data.stock,
                        tipo_id: response.data.tipo_id || '',
                        images: [],
                        currentImages: currentImages,
                        imagesToRemove: [],
                        imagesOrder: initialOrder,
                    });
                    
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error al obtener producto:", error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [productId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
    
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('stock', data.stock);
        formData.append('tipo_id', data.tipo_id);
        
        // Añadir imágenes a eliminar
        if (data.imagesToRemove.length > 0) {
            // Extraemos solo los nombres de archivo de las rutas completas
            const filenamesToRemove = data.imagesToRemove.map(path => {
                // Si el path ya incluye /storage/, lo extraemos
                if (path.includes('/storage/')) {
                    return path.split('/storage/')[1];
                }
                // Si no, usamos el último segmento del path
                const parts = path.split('/');
                return parts[parts.length - 1];
            });
            formData.append('images_to_remove', JSON.stringify(filenamesToRemove));
        }
    
        // Añadir nuevas imágenes
        if (data.images.length > 0) {
            for (let i = 0; i < data.images.length; i++) {
                formData.append(`images[]`, data.images[i]);
            }
        }
        
        // Añadir el orden de las imágenes actuales
        if (data.currentImages.length > 0) {
            // Reordenar las imágenes actuales según el array de orden
            const orderedImages = data.imagesOrder.map(index => {
                return data.currentImages[index];
            }).filter(Boolean); // Filtramos valores undefined/null
            
            console.log("Imágenes ordenadas para enviar:", orderedImages);
            formData.append('images_order', JSON.stringify(orderedImages));
        }
       
        if (data.imagesOrder.length > 0) {
            // Usamos el primer elemento de imagesOrder para obtener su índice original
            const mainImageIndex = data.imagesOrder[0];
            if (mainImageIndex !== undefined && data.currentImages[mainImageIndex]) {
                const mainImage = data.currentImages[mainImageIndex];
                formData.append('main_image', mainImage);
                // Aseguramos que el servidor sepa que ésta es la imagen principal
                formData.append('main_image_path', mainImage);
                console.log("Imagen principal:", mainImage);
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
            new_images_count: data.images.length,
            images_order: data.imagesOrder
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
            setLoading(false);
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
            setData('images', [...data.images, ...Array.from(e.target.files)]);
        }
    };

    const handleRemoveCurrentImage = (index: number, imagePath: string) => {
        // Asegurarse de que el path de imagen completo se guarde en el array de imágenes a eliminar
        console.log("Marcando imagen para eliminar:", imagePath);
        
        // Aseguramos que la ruta sea compatible con el formato esperado por el servidor
        const pathToRemove = imagePath.startsWith('/storage/') ? imagePath : `/storage/${imagePath}`;
        
        setData('imagesToRemove', [...data.imagesToRemove, imagePath]);
        
        // También la eliminamos del estado visual actual
        const updatedImages = [...data.currentImages];
        updatedImages.splice(index, 1);
        setData('currentImages', updatedImages);
        
        // Actualizamos el orden de las imágenes para mantener la coherencia
        const newOrder = data.imagesOrder
            .filter(i => i !== index) // Eliminar el índice removido
            .map(i => i > index ? i - 1 : i); // Ajustar los índices posteriores
            
        setData('imagesOrder', newOrder);
    };

    const handleRemoveNewImage = (index: number) => {
        const updatedImages = [...data.images];
        updatedImages.splice(index, 1);
        setData('images', updatedImages);
    };

    // Función para construir la URL correcta para la vista previa
    const getImagePreviewUrl = (image: string): string => {
        // Si la imagen empieza con http o https o data:, ya es una URL completa
        if (image.startsWith('http') || image.startsWith('https') || image.startsWith('data:')) {
            return image;
        }
        
        // Si la imagen ya incluye /storage/, no lo añadimos de nuevo
        if (image.startsWith('/storage/')) {
            return image;
        }
        
        // Por defecto, añadimos el prefijo /storage/
        return `/storage/${image}`;
    };

    // Funciones para el drag and drop de imágenes actuales
    const handleDragStartCurrent = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedCurrentIndex(index);
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnterCurrent = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        setDragOverCurrentIndex(index);
        e.currentTarget.classList.add('bg-gray-600');
    };

    const handleDragLeaveCurrent = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-600');
    };

    const handleDragOverCurrent = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEndCurrent = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('opacity-50');
        setDragOverCurrentIndex(null);
    };

    const handleDropCurrent = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-600');
        
        if (draggedCurrentIndex === null) return;
        
        // Reordenar los índices en el array de orden
        const newOrder = [...data.imagesOrder];
        const draggedOrder = newOrder[draggedCurrentIndex];
        newOrder.splice(draggedCurrentIndex, 1);
        newOrder.splice(dropIndex, 0, draggedOrder);
        
        console.log("Orden anterior:", data.imagesOrder);
        console.log("Nuevo orden después de arrastrar:", newOrder);
        
        // Reordenar las imágenes actuales para que coincidan con el nuevo orden
        const orderedImages = newOrder.map(index => data.currentImages[index]).filter(Boolean);
        console.log("Imágenes ordenadas:", orderedImages);
        console.log("Imagen principal ahora será:", orderedImages[0]);
        
        // Actualizar tanto el orden como las propias imágenes
        setData('imagesOrder', newOrder);
        
        setDraggedCurrentIndex(null);
        setDragOverCurrentIndex(null);
    }

    // Funciones para el drag and drop de nuevas imágenes
    const handleDragStartNew = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedNewIndex(index);
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnterNew = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        setDragOverNewIndex(index);
        e.currentTarget.classList.add('bg-gray-600');
    };

    const handleDragLeaveNew = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-600');
    };

    const handleDragOverNew = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEndNew = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('opacity-50');
        setDragOverNewIndex(null);
    };

    const handleDropNew = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-600');
        
        if (draggedNewIndex === null) return;
        
        // Reordenar las imágenes nuevas
        const newImages = [...data.images];
        const [movedImage] = newImages.splice(draggedNewIndex, 1);
        newImages.splice(dropIndex, 0, movedImage);
        
        setData('images', newImages);
        setDraggedNewIndex(null);
        setDragOverNewIndex(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Producto" />
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-center text-white mb-6">Editar Producto</h2>
                    
                    {loading ? (
                            <Spinner/>
                    ) : (
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
                                <div className="mt-1 p-4 border-2 border-dashed border-gray-600 rounded-md">
                                    <div className="flex justify-center">
                                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition duration-300">
                                            <span>Seleccionar imágenes</span>
                                            <input
                                                type="file"
                                                id="images"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                multiple
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-400 text-center mt-2">
                                        Puedes seleccionar múltiples imágenes. Arrastra para reordenar.
                                    </p>
                                </div>
                                {errors.images && <div className="text-red-500 text-sm mt-1">{errors.images}</div>}
                                
                                {/* Imágenes actuales arrastrables */}
                                {data.currentImages && data.currentImages.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium text-gray-300 mb-2">Imágenes actuales</h3>
                                        <p className="text-xs text-gray-400 mb-4">
                                            <span className="inline-flex items-center">
                                                <Move className="w-4 h-4 mr-1" /> 
                                                Arrastra las imágenes para reordenarlas. La primera imagen será la principal.
                                            </span>
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-4">
                                            {data.imagesOrder.map((originalIndex, currentIndex) => {
                                                const image = data.currentImages[originalIndex];
                                                if (!image) return null; // Protección contra índices no válidos
                                                return (
                                                    <div
                                                        key={`current-${originalIndex}-${currentIndex}`}
                                                        className={`relative w-28 h-28 rounded-lg overflow-hidden border ${
                                                            dragOverCurrentIndex === currentIndex ? 'border-indigo-500' : 'border-gray-600'
                                                        }`}
                                                        draggable
                                                        onDragStart={(e) => handleDragStartCurrent(e, currentIndex)}
                                                        onDragEnter={(e) => handleDragEnterCurrent(e, currentIndex)}
                                                        onDragLeave={handleDragLeaveCurrent}
                                                        onDragOver={handleDragOverCurrent}
                                                        onDragEnd={handleDragEndCurrent}
                                                        onDrop={(e) => handleDropCurrent(e, currentIndex)}
                                                    >
                                                        <div className="w-full h-full bg-gray-700">
                                                            <img 
                                                                src={getImagePreviewUrl(image)}
                                                                alt={`Imagen ${currentIndex + 1}`} 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.src = "https://via.placeholder.com/160x160?text=Error";
                                                                }}
                                                            />
                                                            <div 
                                                                className="absolute top-2 left-2 p-1 bg-black/50 rounded-full cursor-move opacity-50 hover:opacity-100 transition-opacity"
                                                            >
                                                                <Move className="w-4 h-4 text-white" />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveCurrentImage(originalIndex, image)}
                                                                className="absolute top-2 right-2 p-1 bg-red-600/70 hover:bg-red-600 rounded-full transition-colors"
                                                            >
                                                                <X className="w-4 h-4 text-white" />
                                                            </button>
                                                            {currentIndex === 0 && (
                                                                <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-xs py-1 text-center">
                                                                    Principal
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {/* Nuevas imágenes arrastrables */}
                                {data.images.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium text-gray-300 mb-2">Nuevas imágenes</h3>
                                        <p className="text-xs text-gray-400 mb-4">
                                            <span className="inline-flex items-center">
                                                <Move className="w-4 h-4 mr-1" /> 
                                                Arrastra las imágenes para reordenarlas.
                                            </span>
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-4">
                                            {data.images.map((image, index) => (
                                                <div
                                                    key={`new-${index}`}
                                                    className={`relative w-28 h-28 rounded-lg overflow-hidden border ${
                                                        dragOverNewIndex === index ? 'border-indigo-500' : 'border-gray-600'
                                                    }`}
                                                    draggable
                                                    onDragStart={(e) => handleDragStartNew(e, index)}
                                                    onDragEnter={(e) => handleDragEnterNew(e, index)}
                                                    onDragLeave={handleDragLeaveNew}
                                                    onDragOver={handleDragOverNew}
                                                    onDragEnd={handleDragEndNew}
                                                    onDrop={(e) => handleDropNew(e, index)}
                                                >
                                                    <div className="w-full h-full bg-gray-700">
                                                        <img 
                                                            src={URL.createObjectURL(image)}
                                                            alt={`Nueva imagen ${index + 1}`} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div 
                                                            className="absolute top-2 left-2 p-1 bg-black/50 rounded-full cursor-move opacity-50 hover:opacity-100 transition-opacity"
                                                        >
                                                            <Move className="w-4 h-4 text-white" />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveNewImage(index)}
                                                            className="absolute top-2 right-2 p-1 bg-red-600/70 hover:bg-red-600 rounded-full transition-colors"
                                                        >
                                                            <X className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
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
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
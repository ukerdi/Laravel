import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Move, X } from 'lucide-react';
import Spinner from '@/components/spinner';
// Eliminar las importaciones de react-dnd que no se van a usar
// import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear Productos',
        href: '/create',
    },
];

interface Tipo {
    id: number;
    nombre: string;
}

// Eliminar estos comentarios ya que no usaremos estas bibliotecas
// // Primero, instala react-beautiful-dnd:
// // npm install react-beautiful-dnd
// // npm install @types/react-beautiful-dnd --save-dev

export default function CreateProduct() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        tipo_id: '',
        images: [] as File[],
    });

    const [tipos, setTipos] = useState<Tipo[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    // Estado para el drag and drop nativo
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        axios.get('/api/tipos')
            .then(response => {
                setTipos(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching tipos:', error);
                setLoading(false);
            });
    }, []);

    // Crear URLs para previsualizar imágenes cuando cambia 'data.images'
    useEffect(() => {
        // Limpiar URLs anteriores para evitar memory leaks
        if (previewImages.length > 0) {
            previewImages.forEach(url => URL.revokeObjectURL(url));
        }
        
        const urls = Array.from(data.images).map(file => URL.createObjectURL(file));
        setPreviewImages(urls);
        
        // Limpiar URLs cuando el componente se desmonte
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [data.images]);

    const handleSubmit = (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('stock', data.stock.toString());
        formData.append('tipo_id', data.tipo_id);
        
        // Añadir todas las imágenes al formData en el orden en que aparecen
        data.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });

        axios.post('/api/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            console.log("Producto creado:", response.data);
            toast.success('Producto creado correctamente', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            router.visit('/dashboard');
        })
        .catch((error) => {
            if (error.response && error.response.data && error.response.data.errors) {
                const validationErrors = error.response.data.errors;
                Object.keys(validationErrors).forEach((key) => {
                    setData(key as keyof typeof data, validationErrors[key][0]);
                });
            } else {
                console.error("Errores de validación:", error);
            }
        })
        .finally(() => {
            setLoading(false);
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setData('images', [...data.images, ...filesArray]);
        }
    };

    // Funciones para el drag and drop nativo
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
        e.currentTarget.classList.add('bg-gray-600');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-600');
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('opacity-50');
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-600');
        
        if (draggedIndex === null) return;
        
        // Reordenar las imágenes
        const newImages = [...data.images];
        const [movedImage] = newImages.splice(draggedIndex, 1);
        newImages.splice(dropIndex, 0, movedImage);
        
        setData('images', newImages);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Función para eliminar una imagen
    const removeImage = (index: number) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Producto" />
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-full max-w-2xl p-6 bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-center text-white mb-6">Crear Producto</h2>
                    {loading ? (
                        <Spinner />
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
                                <label htmlFor="tipo_id" className="block text-sm font-medium text-gray-300">Tipo</label>
                                <select
                                    id="tipo_id"
                                    value={data.tipo_id}
                                    onChange={(e) => setData('tipo_id', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                >
                                    <option value="">Seleccione un tipo</option>
                                    {tipos.map(tipo => (
                                        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
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
                            </div>
                            
                            {/* Previsualizaciones de imágenes arrastrables con HTML5 Drag and Drop */}
                            {data.images.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-300 mb-2">Previsualización de imágenes</h3>
                                    <p className="text-xs text-gray-400 mb-4">
                                        <span className="inline-flex items-center">
                                            <Move className="w-4 h-4 mr-1" /> 
                                            Arrastra las imágenes para reordenarlas. La primera imagen será la principal.
                                        </span>
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        {data.images.map((image, index) => (
                                            <div
                                                key={`image-${index}`}
                                                className={`relative group w-28 h-28 rounded-lg overflow-hidden border ${
                                                    dragOverIndex === index ? 'border-indigo-500' : 'border-gray-600'
                                                }`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragEnter={(e) => handleDragEnter(e, index)}
                                                onDragLeave={handleDragLeave}
                                                onDragOver={handleDragOver}
                                                onDragEnd={handleDragEnd}
                                                onDrop={(e) => handleDrop(e, index)}
                                            >
                                                <div className="w-full h-full bg-gray-700">
                                                    <img 
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Imagen ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div 
                                                        className="absolute top-2 left-2 p-1 bg-black/50 rounded-full cursor-move opacity-50 hover:opacity-100 transition-opacity"
                                                    >
                                                        <Move className="w-4 h-4 text-white" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-2 right-2 p-1 bg-red-600/70 hover:bg-red-600 rounded-full transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                    {index === 0 && (
                                                        <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-xs py-1 text-center">
                                                            Principal
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                    disabled={processing}
                                >
                                    {processing ? 'Creando...' : 'Crear Producto'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
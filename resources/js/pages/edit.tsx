import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react'; // Importando router
import { useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Importando toast

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Editar Producto',
        href: '/edit',
    },
];

interface EditProductProps {
    productId: string;
}

export default function EditProduct(props: EditProductProps) {
    const productId = props.productId;
    const { data, setData, errors, processing, setError } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        images: [] as File[], // Definiendo imágenes como array de archivos
        imageUrl: '', // URL para la imagen
        remove_image: false as boolean, // Indicador para eliminar imagen
    });

    useEffect(() => {
        if (productId) {
            axios.get(`/api/products/${productId}`)
                .then(response => {
                    console.log("Datos del producto:", response.data);
                    setData({
                        name: response.data.name,
                        description: response.data.description,
                        price: response.data.price,
                        stock: response.data.stock,
                        images: [],
                        imageUrl: response.data.image ? `/storage/${response.data.image}` : '', // URL de la imagen
                        remove_image: false,
                    });
                })
                .catch(error => {
                    console.error("Error al obtener producto:", error);
                });
        }
    }, [productId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Creando un objeto para los datos
        const updatedData: {
            name: string;
            description: string;
            price: string;
            stock: string;
            remove_image: boolean;
            image?: File;
        } = {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            remove_image: data.remove_image, // Incluyendo la bandera para eliminar la imagen
        };

        if (data.images.length > 0) {
            // Subiendo la imagen
            updatedData.image = data.images[0]; // Esto debe ser la imagen en formato File
        }

        // Usando axios para enviar el PUT con los datos
        axios.put(`/api/products/${productId}`, updatedData)
            .then(response => {
                console.log("Producto actualizado:", response.data);
                // Mostrar mensaje de éxito
                toast.success('Producto actualizado correctamente', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                // Redirigir al panel de administración
                router.visit('/dashboard');
            })
            .catch(error => {
                if (error.response && error.response.data && error.response.data.errors) {
                    Object.keys(error.response.data.errors).forEach(key => {
                        setError(key as keyof typeof data, error.response.data.errors[key]);
                    });
                } else {
                    console.error("Errores de validación:", error);
                }
            });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('images', Array.from(e.target.files));
            setData('remove_image', false);  // Resetear bandera de eliminación cuando subes una nueva imagen
        }
    };

    const handleRemoveImage = () => {
        setData('remove_image', true); // Marcar para eliminar la imagen
        setData('imageUrl', ''); // Limpiar la URL de la imagen
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
                            <label htmlFor="images" className="block text-sm font-medium text-gray-300">Imágenes</label>
                            <input
                                type="file"
                                id="images"
                                multiple
                                onChange={handleImageChange}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                            {errors.images && <div className="text-red-500 text-sm mt-1">{errors.images}</div>}
                            <div className="flex flex-wrap gap-4 mt-4">
                                {data.imageUrl ? (
                                    <div className="relative">
                                        <img src={data.imageUrl} alt="Imagen actual" className="w-40 h-40 object-cover rounded-md mb-4" />
                                        <button
                                            type="button"
                                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                                            onClick={handleRemoveImage}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-gray-400">No hay imágenes disponibles</p>
                                )}
                                {data.images.length > 0 && data.images.map((image, index) => (
                                    <img key={index} src={URL.createObjectURL(image)} alt={`Imagen ${index + 1}`} className="w-40 h-40 object-cover rounded-md mb-4" />
                                ))}
                            </div>
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

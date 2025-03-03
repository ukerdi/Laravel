import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Spinner from '@/components/spinner'; // Importar spinner

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

export default function CreateProduct() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        tipo_id: '',
        images: [] as File[], // Cambiar de 'image' a 'images' para permitir múltiples archivos
    });

    const [tipos, setTipos] = useState<Tipo[]>([]);
    const [loading, setLoading] = useState(true); // Estado de carga

    useEffect(() => {
        axios.get('/api/tipos')
            .then(response => {
                setTipos(response.data);
                setLoading(false); // Desactivar el estado de carga
            })
            .catch(error => {
                console.error('Error fetching tipos:', error);
                setLoading(false); // Desactivar el estado de carga
            });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('stock', data.stock.toString());
        formData.append('tipo_id', data.tipo_id);
        
        // Añadir todas las imágenes al formData
        data.images.forEach((image, index) => {
            formData.append('images[]', image);
        });

        axios.post('/api/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response: { data: any }) => {
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
        .catch((error: any) => {
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
            setLoading(false); // Desactivar el estado de carga
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setData('images', filesArray); // Guardar todas las imágenes seleccionadas
        }
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
                                <input
                                    type="file"
                                    id="images"
                                    onChange={handleImageChange}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                    multiple
                                />
                                {errors.images && <div className="text-red-500 text-sm mt-1">{errors.images}</div>}
                            </div>
                            {data.images.length > 0 && (
                                <div className="mb-4 flex flex-wrap justify-center">
                                    {data.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={URL.createObjectURL(image)}
                                            alt={`Previsualización de la imagen ${index + 1}`}
                                            className="w-32 h-auto rounded-md mx-2 my-2"
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
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
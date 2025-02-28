import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear Productos',
        href: '/create',
    },
];

export default function CreateProduct() {
    const { data, setData, post, errors } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api/products');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Producto" />
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-full max-w-2xl p-6 bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-center text-white mb-6">Crear Producto</h2>
                    <form onSubmit={handleSubmit}>
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
                            <label htmlFor="image" className="block text-sm font-medium text-gray-300">Imagen</label>
                            <input
                                type="file"
                                id="image"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setData('image', e.target.files[0]);
                                    }
                                }}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                            {errors.image && <div className="text-red-500 text-sm mt-1">{errors.image}</div>}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                                Crear Producto
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import Spinner from '@/components/spinner'; // Importar Spinner

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: '/clientes',
    },
    {
        title: 'Editar Cliente',
        href: '/clientes/editar',
    },
];

interface Cliente {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
}

export default function EditarClientePage() {
    const { id } = usePage().props;
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [loading, setLoading] = useState(true); // Estado de carga

    useEffect(() => {
        axios.get(`/api/clients/${id}`)
            .then(response => {
                const clienteData = response.data;
                setCliente(clienteData);
                setNombre(clienteData.nombre);
                setEmail(clienteData.email);
                setTelefono(clienteData.telefono || '');
                setDireccion(clienteData.direccion || '');
                setLoading(false); // Desactivar el estado de carga
            })
            .catch(error => {
                console.error('Error fetching client:', error);
                setLoading(false); // Desactivar el estado de carga
            });
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Activar el estado de carga
        axios.put(`/api/clients/${id}`, { nombre, email, telefono, direccion })
            .then(() => {
                toast.success('Cliente actualizado con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                router.visit('/clientes'); // Redirigir a la página de clientes después de guardar
            })
            .catch(error => {
                console.error('Error updating client:', error);
                toast.error('Error al actualizar el cliente', {
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
            .finally(() => {
                setLoading(false); // Desactivar el estado de carga
            });
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Cliente" />
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-full max-w-2xl p-6 bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-center text-white mb-6">Editar Cliente</h2>
                    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
                        <div className="mb-4">
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-300">Nombre</label>
                            <input 
                                type="text" 
                                id="nombre" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="telefono" className="block text-sm font-medium text-gray-300">Teléfono</label>
                            <input 
                                type="text" 
                                id="telefono" 
                                value={telefono} 
                                onChange={(e) => setTelefono(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="direccion" className="block text-sm font-medium text-gray-300">Dirección</label>
                            <textarea 
                                id="direccion" 
                                value={direccion} 
                                onChange={(e) => setDireccion(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                        </div>
                        <div className="flex justify-between">
                            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white rounded-lg" onClick={() => router.visit('/clientes')}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
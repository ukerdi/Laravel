import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Link } from '@inertiajs/react';
import { FaSearch } from 'react-icons/fa';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: '/clientes',
    },
];

interface Cliente {
    id: number;
    nombre: string;
    email: string;
}

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        axios.get('/api/clients')
            .then(response => {
                setClientes(response.data);
                setFilteredClientes(response.data);
            })
            .catch(error => console.error('Error fetching clients:', error));
    }, []);

    useEffect(() => {
        handleFilterChange();
    }, [searchName]);

    const handleFilterChange = () => {
        let filtered = clientes;

        if (searchName) {
            filtered = filtered.filter(cliente => cliente.nombre.toLowerCase().includes(searchName.toLowerCase()));
        }

        setFilteredClientes(filtered);
    };

    const deleteClient = (id: number) => {
        axios.delete(`/api/clients/${id}`)
            .then(() => {
                setClientes(clientes.filter(cliente => cliente.id !== id));
                setFilteredClientes(filteredClientes.filter(cliente => cliente.id !== id));
                setClienteToDelete(null);
                toast.success('Cliente eliminado con éxito', {
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
                console.error('Error deleting client:', error);
                toast.error('Error al eliminar el cliente', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Clientes" />
            <div className="flex min-h-screen">
                <div className="flex-1 p-6 bg-black text-white">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-bold text-white">Clientes</h1>
                    </div>
                    <div className="flex justify-center mb-6">
                        <div className="relative w-full max-w-md">
                            <input 
                                type="text" 
                                id="searchName" 
                                value={searchName} 
                                onChange={(e) => setSearchName(e.target.value)} 
                                className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-white text-lg"
                                placeholder="Buscar por nombre"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredClientes.length > 0 ? (
                            filteredClientes.map(cliente => (
                                <div key={cliente.id} className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4 flex flex-col items-center">
                                    <h2 className="text-lg font-semibold text-center text-white">{cliente.nombre}</h2>
                                    <p className="text-gray-400 text-sm text-center mt-2">{cliente.email}</p>
                                    <p className="text-gray-400 text-sm mt-2">ID: {cliente.id}</p>
                                    <div className="flex gap-2 mt-4">
                                        <Link href={`/clientes/${cliente.id}/edit`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                            Editar
                                        </Link>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button 
                                                    onClick={() => setClienteToDelete(cliente)}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                                >
                                                    Eliminar
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogTitle>¿Estás seguro de que deseas eliminar este cliente?</DialogTitle>
                                                <DialogDescription>
                                                    Una vez que elimines este cliente, todos sus datos se eliminarán permanentemente. Esta acción no se puede deshacer.
                                                </DialogDescription>
                                                <DialogFooter className="gap-2">
                                                    <DialogClose asChild>
                                                        <Button variant="secondary" onClick={() => setClienteToDelete(null)}>
                                                            Cancelar
                                                        </Button>
                                                    </DialogClose>
                                                    <Button variant="destructive" onClick={() => deleteClient(cliente.id)}>
                                                        Eliminar
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-400">No hay clientes disponibles</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
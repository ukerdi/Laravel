import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';
import { useState, useEffect } from 'react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

const productTypes = [
    { label: 'Todos', value: '' },
    { label: 'Electrónica', value: 'electronica' },
    { label: 'Ropa', value: 'ropa' },
    { label: 'Hogar', value: 'hogar' },
];

export function AppSidebar({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
    const [selectedType, setSelectedType] = useState('');
    const [searchName, setSearchName] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [inStock, setInStock] = useState(false);

    useEffect(() => {
        onFilterChange({
            type: selectedType,
            name: searchName,
            minPrice: minPrice,
            maxPrice: maxPrice,
            inStock: inStock,
        });
    }, [selectedType, searchName, minPrice, maxPrice, inStock]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Filtros</h3>
                    <div className="mb-4">
                        <label htmlFor="type" className="block text-sm font-medium text-gray-300">Tipo</label>
                        <select 
                            id="type" 
                            value={selectedType} 
                            onChange={(e) => setSelectedType(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        >
                            {productTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="searchName" className="block text-sm font-medium text-gray-300">Buscar por nombre</label>
                        <input 
                            type="text" 
                            id="searchName" 
                            value={searchName} 
                            onChange={(e) => setSearchName(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="minPrice" className="block text-sm font-medium text-gray-300">Precio mínimo</label>
                        <input 
                            type="number" 
                            id="minPrice" 
                            value={minPrice} 
                            onChange={(e) => setMinPrice(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-300">Precio máximo</label>
                        <input 
                            type="number" 
                            id="maxPrice" 
                            value={maxPrice} 
                            onChange={(e) => setMaxPrice(e.target.value)} 
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="inStock" className="block text-sm font-medium text-gray-300">En stock</label>
                        <input 
                            type="checkbox" 
                            id="inStock" 
                            checked={inStock} 
                            onChange={(e) => setInStock(e.target.checked)} 
                            className="mt-1"
                        />
                    </div>
                </div>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
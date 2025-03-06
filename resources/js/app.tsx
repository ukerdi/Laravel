import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    // Reemplazar este resolve con el mejorado para manejar subdirectorios
    resolve: (name) => {
        // Soporte para formato jerárquico auth/reset-password
        const parts = name.split('/');
        if (parts.length > 1) {
            return resolvePageComponent(`./pages/${parts.join('/')}.tsx`, import.meta.glob('./pages/**/*.tsx'));
        }
        return resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'));
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <ToastContainer />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Inicializar el tema después de que la aplicación esté configurada
initializeTheme();
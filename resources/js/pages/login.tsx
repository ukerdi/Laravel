import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { LoaderCircle, Mail, KeyRound, CheckCircle, XCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: any;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    // Estados para controlar la visibilidad de los mensajes de error
    const [showEmailError, setShowEmailError] = useState(false);
    const [showPasswordError, setShowPasswordError] = useState(false);
    const [showStatusMessage, setShowStatusMessage] = useState(!!status);
    const [showPassword, setShowPassword] = useState(false);

    // Efecto para controlar la aparición y desaparición de los errores
    useEffect(() => {
        if (errors.email) {
            setShowEmailError(true);
            const timer = setTimeout(() => {
                setShowEmailError(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [errors.email]);

    useEffect(() => {
        if (errors.password) {
            setShowPasswordError(true);
            const timer = setTimeout(() => {
                setShowPasswordError(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [errors.password]);

    useEffect(() => {
        if (status) {
            setShowStatusMessage(true);
            const timer = setTimeout(() => {
                setShowStatusMessage(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout>            
            {/* Loader overlay */}
            {processing && (
                <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-700/50 flex flex-col items-center gap-4">
                        <div className="relative w-16 sm:w-20 h-16 sm:h-20">
                            <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-r-2 border-indigo-500 animate-spin"></div>
                            <div className="absolute inset-3 rounded-full border-b-2 border-r-2 border-purple-500 animate-spin-slow"></div>
                            <div className="absolute inset-6 rounded-full border-t-2 border-l-2 border-cyan-500 animate-spin-reverse"></div>
                        </div>
                        <span className="text-white text-lg sm:text-xl font-light tracking-wider">Iniciando Sesion...</span>
                    </div>
                </div>
            )}
            
            {/* Contenedor principal adaptativo */}
            <div className="w-full sm:max-w-md mx-auto relative px-4 sm:px-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 blur-xl rounded-3xl"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-850 to-gray-800 backdrop-blur-lg overflow-hidden rounded-xl sm:rounded-3xl shadow-xl border border-gray-700/50">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 blur-2xl rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative p-6 sm:p-8 z-10">
                        <div className="flex flex-col items-center mb-6 sm:mb-8">
                            {/* Logo - tamaño reducido en móvil */}
                            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                <img 
                                    src="/images/logo.png" 
                                    alt="Logo" 
                                    className="w-10 sm:w-14 h-10 sm:h-14 object-contain" 
                                />
                            </div>
                            {/* Título y descripción - centrados */}
                            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide text-center">Bienvenido</h1>
                            <p className="text-gray-400 mt-2 text-sm text-center">Inicia sesión para continuar</p>
                        </div>
                        
                        <form onSubmit={submit} className="space-y-5 sm:space-y-6">
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="tu@correo.com"
                                        className="pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800/40 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 hover:bg-gray-800/60"
                                    />
                                </div>
                                {showEmailError && errors.email && (
                                    <div className="pl-2 text-red-400 text-sm flex items-center gap-1 slide-in-bottom">
                                        <XCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>Credenciales incorrectas</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex justify-between items-center mb-1">
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 pr-12 py-2.5 sm:py-3 bg-gray-800/40 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 hover:bg-gray-800/60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        <span className="text-xs font-medium">
                                            {showPassword ? "Ocultar" : "Mostrar"}
                                        </span>
                                    </button>
                                </div>
                                {showPasswordError && (
                                    <div className="pl-2 text-red-400 text-sm flex items-center gap-1 slide-in-bottom">
                                        <XCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{errors.password}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Checkbox y enlace olvidaste tu contraseña con mejor responsive */}
                            <div className="flex flex-col w-full sm:flex-row items-start sm:items-center justify-between gap-y-3 sm:gap-y-0">
                                <div className="flex items-center">
                                    <Checkbox 
                                        id="remember" 
                                        name="remember" 
                                        tabIndex={3}
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', !!checked)}
                                        className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                    />
                                    <Label htmlFor="remember" className="text-gray-300 text-sm ml-2">
                                        Mantener sesión iniciada
                                    </Label>
                                </div>

                                <TextLink 
                                    href={route('password.request')} 
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors ml-[30px] sm:mr-0 sm:ml-[90px]"
                                    tabIndex={5}
                                >
                                    ¿Olvidaste tu contraseña?
                                </TextLink>
                            </div>
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 sm:py-3 rounded-xl shadow-lg shadow-indigo-700/20 transition-all duration-200 hover:shadow-indigo-700/40" 
                                tabIndex={4} 
                                disabled={processing}
                            >
                                Iniciar sesión
                            </Button>
                        </form>
                        
                        {showStatusMessage && status && (
                            <div className="mt-6 p-3 bg-green-900/30 border border-green-700/50 rounded-lg flex items-center gap-2 slide-in-bottom">
                                <CheckCircle className="text-green-400 h-4 w-4 flex-shrink-0" />
                                <p className="text-green-400 text-sm">{status}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-reverse {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                @keyframes slide-in-bottom {
                    from { 
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
                .animate-spin-reverse {
                    animation: spin-reverse 2s linear infinite;
                }
                .slide-in-bottom {
                    animation: slide-in-bottom 0.3s ease-out forwards;
                }
            `}</style>
        </AuthLayout>
    );
}
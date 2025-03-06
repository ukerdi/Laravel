import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { KeyRound, Mail, Eye, EyeOff, XCircle } from 'lucide-react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/auth-layout';
import { toast } from 'react-toastify';

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
    [key: string]: string;
}

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [showErrors, setShowErrors] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const newShowErrors: Record<string, boolean> = {};
        Object.keys(errors).forEach(key => {
            newShowErrors[key] = true;
            const timer = setTimeout(() => {
                setShowErrors(prev => ({ ...prev, [key]: false }));
            }, 3000);
            return () => clearTimeout(timer);
        });
        if (Object.keys(newShowErrors).length > 0) {
            setShowErrors(prev => ({ ...prev, ...newShowErrors }));
        }
    }, [errors]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onSuccess: () => {
                toast.success('¡Contraseña cambiada con éxito!', {
                    autoClose: 3000, 
                    position: "top-right"
                });
                
                setTimeout(() => {
                    router.visit(route('home')); // Cambiado a login en lugar de home
                }, 2500);
            },
            onError: (errors) => {
                if (Object.keys(errors).length > 0) {
                    toast.error('Ha ocurrido un error. Por favor, verifica los campos.', {
                        autoClose: 3000,
                        position: "top-right"
                    });
                }
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout>
            <Head title="Cambiar contraseña" />
            {processing && (
                <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-700/50 flex flex-col items-center gap-4">
                        <div className="relative w-16 sm:w-20 h-16 sm:h-20">
                            <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-r-2 border-indigo-500 animate-spin"></div>
                            <div className="absolute inset-3 rounded-full border-b-2 border-r-2 border-purple-500 animate-spin-slow"></div>
                            <div className="absolute inset-6 rounded-full border-t-2 border-l-2 border-cyan-500 animate-spin-reverse"></div>
                        </div>
                        <span className="text-white text-lg sm:text-xl font-light tracking-wider">Cambiando contraseña...</span>
                    </div>
                </div>
            )}
            
            <div className="w-full sm:max-w-md mx-auto relative px-4 sm:px-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 blur-xl rounded-3xl"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-850 to-gray-800 backdrop-blur-lg overflow-hidden rounded-xl sm:rounded-3xl shadow-xl border border-gray-700/50">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 blur-2xl rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative p-6 sm:p-8 z-10">
                        <div className="flex flex-col items-center mb-6 sm:mb-8">
                            {/* Logo */}
                            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                <img 
                                    src="/images/logo.png" 
                                    alt="Logo" 
                                    className="w-10 sm:w-14 h-10 sm:h-14 object-contain" 
                                />
                            </div>
                            {/* Título y descripción - centrados */}
                            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide text-center">Cambiar Contraseña</h1>
                            <p className="text-gray-400 mt-2 text-sm text-center w-full">
                                Crea una nueva contraseña para tu cuenta
                            </p>
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
                                        readOnly
                                        value={data.email}
                                        className="pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800/40 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 opacity-70"
                                    />
                                </div>
                                {showErrors.email && errors.email && (
                                    <div className="pl-2 text-red-400 text-sm slide-in-bottom">
                                        {errors.email}
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Nueva contraseña"
                                        className="pl-10 pr-12 py-2.5 sm:py-3 bg-gray-800/40 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 hover:bg-gray-800/60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? 
                                            <EyeOff className="h-4 sm:h-5 w-4 sm:w-5" /> : 
                                            <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
                                        }
                                    </button>
                                </div>
                                {showErrors.password && errors.password && (
                                    <div className="pl-2 text-red-400 text-sm flex items-center gap-1 slide-in-bottom">
                                        <XCircle className="w-4 h-4" />
                                        <span>{errors.password}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                                    </div>
                                    <Input
                                        id="password_confirmation"
                                        type={showPasswordConfirmation ? "text" : "password"}
                                        required
                                        tabIndex={2}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirmar contraseña"
                                        className="pl-10 pr-12 py-2.5 sm:py-3 bg-gray-800/40 border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 hover:bg-gray-800/60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        {showPasswordConfirmation ? 
                                            <EyeOff className="h-4 sm:h-5 w-4 sm:w-5" /> : 
                                            <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
                                        }
                                    </button>
                                </div>
                                {showErrors.password_confirmation && errors.password_confirmation && (
                                    <div className="pl-2 text-red-400 text-sm flex items-center gap-1 slide-in-bottom">
                                        <XCircle className="w-4 h-4" />
                                        <span>{errors.password_confirmation}</span>
                                    </div>
                                )}
                            </div>
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 sm:py-3 rounded-xl shadow-lg shadow-indigo-700/20 transition-all duration-200 hover:shadow-indigo-700/40" 
                                tabIndex={3} 
                                disabled={processing}
                            >
                                Cambiar contraseña
                            </Button>
                            
                            <div className="text-center w-full">
                                <TextLink 
                                    href={route('home')}
                                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors inline-block"
                                    tabIndex={4}
                                >
                                    Volver a iniciar sesión
                                </TextLink>
                            </div>
                        </form>
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
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import HeadingSmall from '@/components/heading-small';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function EliminarUsuario() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destruir, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const eliminarUsuario: FormEventHandler = (e) => {
        e.preventDefault();

        destruir(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => cerrarModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const cerrarModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Eliminar cuenta" description="Elimina tu cuenta y todos sus recursos" />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Advertencia</p>
                    <p className="text-sm">Procede con precaución, esta acción no se puede deshacer.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Eliminar cuenta</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>¿Estás seguro de que deseas eliminar tu cuenta?</DialogTitle>
                        <DialogDescription>
                            Una vez que elimines tu cuenta, todos sus recursos y datos también se eliminarán permanentemente. Ingresa tu contraseña
                            para confirmar que deseas eliminar tu cuenta de forma permanente.
                        </DialogDescription>
                        <form className="space-y-6" onSubmit={eliminarUsuario}>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    Contraseña
                                </Label>

                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Contraseña"
                                    autoComplete="current-password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={cerrarModal}>
                                        Cancelar
                                    </Button>
                                </DialogClose>

                                <Button variant="destructive" disabled={processing} asChild>
                                    <button type="submit">Eliminar cuenta</button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

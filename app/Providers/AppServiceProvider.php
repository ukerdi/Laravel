<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Database\SQLiteConnection;
use Illuminate\Support\Facades\DB;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        // Cambiado: Usar unprepared en lugar de statement con DB::raw
        if (DB::connection() instanceof SQLiteConnection) {
            DB::unprepared('PRAGMA foreign_keys=ON');
        }
        
        ResetPassword::toMailUsing(function ($notifiable, $token) {
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));
            
            return (new MailMessage)
                ->subject('Restablecimiento de Contraseña')
                ->greeting('¡Hola!')
                ->line('Hemos recibido una solicitud para restablecer tu contraseña.')
                ->line('Usa el botón de abajo para crear una nueva contraseña.')
                ->action('Restablecer Contraseña', $url)
                ->line('Este enlace de restablecimiento expirará en 60 minutos.')
                ->line('Si no has solicitado este cambio, no es necesario realizar ninguna acción.');
        });
    }
}
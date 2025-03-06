<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as LaravelResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPassword extends LaravelResetPassword
{
    protected function buildMailMessage($url)
    {
        return (new MailMessage)
            ->subject('Recuperación de Contraseña')
            ->greeting('¡Hola!')
            ->line('Has recibido este correo porque solicitaste recuperar tu contraseña.')
            ->action('Cambiar Contraseña', $url)
            ->line('Este enlace expirará en 60 minutos.')
            ->line('Si no solicitaste cambiar tu contraseña, no es necesario realizar ninguna acción.');
    }
}
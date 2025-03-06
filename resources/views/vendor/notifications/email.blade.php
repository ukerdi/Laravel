@component('mail::message')
{{-- Saludo --}}
@if (! empty($greeting))
# {{ $greeting }}
@else
# <span style="color: #3d4852; font-size: 25px;">¡Hola! 👋</span>
@endif

<div style="background-color: #f8fafc; border-left: 4px solid #5661b3; padding: 15px; margin: 15px 0;">
{{-- Intro Lines personalizadas --}}
<p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
<p>Usa el botón de abajo para crear una nueva contraseña.</p>
</div>

{{-- Action Button --}}
@isset($actionText)
<?php
    $color = match ($level) {
        'success' => 'success',
        'error' => 'error',
        default => 'primary',
    };
    // Sobreescribe el texto del botón
    $actionText = 'Restablecer Contraseña';
?>
<div style="text-align: center; margin: 30px 0;">
@component('mail::button', ['url' => $actionUrl, 'color' => $color])
{{ $actionText }}
@endcomponent
</div>
@endisset

<div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
{{-- Texto fijo en español en lugar del bucle foreach --}}
<p>Este enlace de restablecimiento expirará en 60 minutos.</p>
<p>Si no has solicitado este cambio, no es necesario realizar ninguna acción.</p>
</div>

{{-- Salutation --}}
<div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e8e5ef;">
@if (! empty($salutation))
{{ $salutation }}
@else
<span style="font-weight: 600;">Atentamente,</span><br>
<span style="color: #5661b3; font-weight: bold;">{{ config('app.name') }}</span>
@endif
</div>

{{-- Subcopy --}}
@isset($actionText)
@slot('subcopy')
<div style="font-size: 0.9em; line-height: 1.5em; color: #718096; margin-top: 10px;">
@lang(
    "Si tienes problemas haciendo clic en el botón \":actionText\", copia y pega la siguiente URL\n".
    'en tu navegador:',
    [
        'actionText' => $actionText,
    ]
) <span class="break-all">[{{ $displayableActionUrl }}]({{ $actionUrl }})</span>
</div>
@endslot
@endisset
@endcomponent
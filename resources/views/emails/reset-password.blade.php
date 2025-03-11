<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Recuperación de Contraseña</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        h1 {
            color: #2a41e8;
            margin-top: 0;
        }
        .code-container {
            background-color: #ffffff;
            border: 2px dashed #2a41e8;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        .verification-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #2a41e8;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Recuperación de Contraseña</h1>
        </div>
        
        <p>Hola {{ $userName ?? 'estimado usuario' }},</p>
        
        <p>Recibimos una solicitud para restablecer tu contraseña. Por favor, utiliza el siguiente código de verificación para completar el proceso:</p>
        
        <div class="code-container">
            <div class="verification-code">{{ $code }}</div>
        </div>
        
        <p>El código expirará en 60 minutos.</p>
        
        <p>Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña seguirá siendo la misma.</p>
        
        <p>Saludos,<br>El equipo de Tu Tienda</p>
        
        <div class="footer">
            <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>
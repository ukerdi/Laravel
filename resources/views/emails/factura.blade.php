<!DOCTYPE html>
<html>
<head>
    <title>Confirmación de Compra</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-radius: 0 0 5px 5px;
        }
        h1 {
            color: #2b5797;
        }
        .order-number {
            font-weight: bold;
            font-size: 18px;
            color: #2b5797;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #f2f2f2;
            text-align: left;
            padding: 10px;
        }
        td {
            border-bottom: 1px solid #ddd;
            padding: 10px;
            vertical-align: middle;
        }
        .total-row {
            font-weight: bold;
        }
        /* Estilos mejorados para las imágenes */
        .producto-celda {
            display: flex;
            align-items: center;
        }
        .imagen-container {
            width: 50px;
            height: 50px;
            min-width: 50px;
            min-height: 50px;
            display: inline-block;
            margin-right: 12px;
            border: 1px solid #eee;
            border-radius: 4px;
            overflow: hidden;
            background-color: #f9f9f9;
            text-align: center;
            vertical-align: middle;
        }
        .producto-img {
            max-width: 46px;
            max-height: 46px;
            vertical-align: middle;
            display: inline-block;
        }
        .producto-nombre {
            display: inline-block;
            vertical-align: middle;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>¡Gracias por tu compra!</h1>
    </div>
    
    <div class="content">
        <p>Hola {{ $cliente ? $cliente['nombre'] : 'Estimado cliente' }},</p>
        
        <p>Hemos recibido tu pedido correctamente. A continuación, encontrarás los detalles de tu compra:</p>
        
        <p class="order-number">Número de pedido: #{{ $compra['id'] }}</p>
        <p>Fecha: {{ $compra['fecha'] }}</p>
        
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($compra['productos'] as $producto)
                <tr>
                    <td>
                        <div class="producto-celda">
                            <div class="imagen-container">
                                @if(isset($producto['imagen']) && !empty($producto['imagen']))
                                    <img src="{{ $producto['imagen'] }}" 
                                        alt="{{ $producto['nombre'] }}" 
                                        class="producto-img"
                                        onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=\'color:#ccc;font-size:24px;line-height:48px;\'>&#128247;</span>';">
                                @else
                                    <span style="color:#ccc;font-size:24px;line-height:48px;">&#128247;</span>
                                @endif
                            </div>
                            <span class="producto-nombre">{{ $producto['nombre'] }}</span>
                        </div>
                    </td>
                    <td>{{ $producto['cantidad'] }}</td>
                    <td>{{ $producto['precio_unitario'] }}€</td>
                    <td>{{ $producto['subtotal'] }}€</td>
                </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Total:</td>
                    <td>{{ $compra['total'] }}€</td>
                </tr>
            </tbody>
        </table>
        
        <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
        
        <p>Saludos cordiales,<br>El equipo de Tu Tienda</p>
    </div>
    
    <div class="footer">
        <p>© {{ date('Y') }} Tu Tienda. Todos los derechos reservados.</p>
        <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
    </div>
</body>
</html>
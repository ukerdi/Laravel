<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class FacturaCompra extends Mailable
{
    use Queueable, SerializesModels;

    public $compraData;
    public $clienteInfo;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($compraData, $clienteInfo = null)
    {
        $this->compraData = $compraData;
        $this->clienteInfo = $clienteInfo;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Confirmación de compra - Tu Tienda')
                    ->view('emails.factura')
                    ->with([
                        'compra' => $this->compraData,
                        'cliente' => $this->clienteInfo
                    ]);
    }
}
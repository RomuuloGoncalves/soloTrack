<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInsumoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Mude para true, senão o Laravel vai bloquear todo mundo de salvar!
        return true; 
    }

    public function rules(): array
    {
        // Aqui você define os nomes exatos que o seu banco espera.
        // Se precisar, ajuste os nomes (ex: nome_fertilizante, preco_pago, etc).
        return [
            'nome_fertilizante' => 'required|string|max:255',
            'quantidade'        => 'required|numeric|min:0', // Nossa quantidade aqui!
            'unidade_medida'    => 'required|string|max:50',
            'preco_pago'        => 'required|numeric|min:0',
        ];
    }
}
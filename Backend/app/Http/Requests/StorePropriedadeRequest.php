<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropriedadeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome'             => 'required|string|max:255',
            'cidade'           => 'nullable|string|max:255',
            'estado'           => 'nullable|string|size:2',
            'latitude'         => 'nullable|numeric|between:-90,90',
            'longitude'        => 'nullable|numeric|between:-180,180',
            'tamanho_hectares' => 'nullable|numeric|min:0',
            'usuario_id'       => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required'          => 'O nome da propriedade é obrigatório.',
            'nome.max'               => 'O nome não pode ter mais de 255 caracteres.',
            'cidade.max'             => 'A cidade não pode ter mais de 255 caracteres.',
            'estado.size'            => 'O estado deve conter exatamente 2 letras (ex: SP).',
            'latitude.numeric'       => 'A latitude deve ser um número.',
            'latitude.between'       => 'A latitude deve estar entre -90 e 90.',
            'longitude.numeric'      => 'A longitude deve ser um número.',
            'longitude.between'      => 'A longitude deve estar entre -180 e 180.',
            'tamanho_hectares.numeric' => 'O tamanho deve ser um número.',
            'tamanho_hectares.min'   => 'O tamanho não pode ser negativo.',
        ];
    }
}

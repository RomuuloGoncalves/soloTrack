<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAreaPlantioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome_area'       => 'sometimes|required|string|max:255',
            'tamanho_area_m2' => 'nullable|numeric|min:0',
            'latitude'        => 'nullable|numeric|between:-90,90',
            'longitude'       => 'nullable|numeric|between:-180,180',
        ];
    }

    public function messages(): array
    {
        return [
            'nome_area.required'      => 'O nome da área é obrigatório.',
            'nome_area.max'           => 'O nome não pode ter mais de 255 caracteres.',
            'tamanho_area_m2.numeric' => 'O tamanho deve ser um número.',
            'tamanho_area_m2.min'     => 'O tamanho não pode ser negativo.',
            'latitude.numeric'        => 'A latitude deve ser um número.',
            'latitude.between'        => 'A latitude deve estar entre -90 e 90.',
            'longitude.numeric'       => 'A longitude deve ser um número.',
            'longitude.between'       => 'A longitude deve estar entre -180 e 180.',
        ];
    }
}

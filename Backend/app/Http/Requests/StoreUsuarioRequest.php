<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:usuarios,email',
            'password'              => 'required|min:8|confirmed',
            'password_confirmation' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required'                  => 'O nome é obrigatório.',
            'nome.max'                       => 'O nome não pode ter mais de 255 caracteres.',

            'email.required'                 => 'O e-mail é obrigatório.',
            'email.email'                    => 'O e-mail deve ser válido.',
            'email.unique'                   => 'Este e-mail já está em uso.',

            'password.required'              => 'A senha é obrigatória.',
            'password.min'                   => 'A senha deve ter no mínimo 8 caracteres.',
            'password.confirmed'             => 'As senhas não coincidem.',
            'password_confirmation.required' => 'A confirmação de senha é obrigatória.',
        ];
    }
}

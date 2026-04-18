<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use App\Http\Requests\StoreUsuarioRequest;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->success(Usuario::all(), "Usuários encontrados");
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUsuarioRequest $request)
    {
        $usuario = Usuario::create($request->validated());

        return $this->success($usuario, 'Usuário criado', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $usuario = Usuario::find($id);
        if(!$usuario){
            return $this->error("Usuário não encontrado");
        }
        return $this->success($usuario, "Usuário encontrado");
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return $this->error('Usuário não encontrado', 404);
        }

        if ($request->user()->id !== $usuario->id) {
            return $this->error('Sem permissão para alterar este usuário', 403);
        }

        $dados = $request->validate([
            'nome'                  => 'sometimes|string|max:255',
            'email'                 => 'sometimes|email|unique:usuarios,email,' . $usuario->id,
            'password'              => 'sometimes|min:8|confirmed',
            'password_confirmation' => 'sometimes',
        ], [
            'nome.max'               => 'O nome não pode ter mais de 255 caracteres.',
            'email.email'            => 'O e-mail deve ser válido.',
            'email.unique'           => 'Este e-mail já está em uso.',
            'password.min'           => 'A senha deve ter no mínimo 8 caracteres.',
            'password.confirmed'     => 'As senhas não coincidem.',
        ]);

        $usuario->update($dados);

        return $this->success($usuario->fresh(), 'Dados atualizados com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Equipamento;
use Illuminate\Http\Request;

class EquipamentoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $equipamentos = Equipamento::where('usuario_id', $request->user()->id)->get();
        return $this->success($equipamentos, "Equipamentos encontrados");
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
    public function store(Request $request)
    {
        $dados = $request->validate([
            'mac_address' => 'required|string|max:17|unique:equipamentos,mac_address',
            'nome_apelido' => 'nullable|string|max:255',
        ]);

        $dados['usuario_id'] = $request->user()->id;

        $equipamento = Equipamento::create($dados);

        return $this->success($equipamento, 'Equipamento criado', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $equipamento = Equipamento::where('usuario_id', $request->user()->id)->find($id);
        if (!$equipamento) {
            return $this->error("Equipamento não encontrado", 404);
        }
        return $this->success($equipamento, "Equipamento encontrado");
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
        $equipamento = Equipamento::where('usuario_id', $request->user()->id)->find($id);
        if (!$equipamento) {
            return $this->error("Equipamento não encontrado", 404);
        }

        $dados = $request->validate([
            'mac_address' => 'sometimes|required|string|max:17|unique:equipamentos,mac_address,' . $id,
            'nome_apelido' => 'nullable|string|max:255',
        ]);

        $equipamento->update($dados);

        return $this->success($equipamento->fresh(), 'Equipamento atualizado');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $equipamento = Equipamento::where('usuario_id', $request->user()->id)->find($id);
        if (!$equipamento) {
            return $this->error("Equipamento não encontrado", 404);
        }
        $equipamento->delete();
        return $this->success($equipamento, "Equipamento deletado com sucesso");
    }
}

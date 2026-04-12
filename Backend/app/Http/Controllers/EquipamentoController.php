<?php

namespace App\Http\Controllers;

use App\Models\Equipamento;
use Illuminate\Http\Request;

class EquipamentoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->success(Equipamento::all(), "Equipamentos encontrados");
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
        $equipamento = Equipamento::create($request->validated());

        return $this->success($equipamento, 'Equipamento criado', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $equipamento = Equipamento::find($id);
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $equipamento = Equipamento::find($id);
        if (!$equipamento) {
            return $this->error("Equipamento não encontrado", 404);
        }
        $equipamento->delete();
        return $this->success($equipamento, "Equipamento deletado com sucesso");
    }
}

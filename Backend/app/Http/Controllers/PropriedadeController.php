<?php

namespace App\Http\Controllers;

use App\Models\Propriedade;
use App\Http\Requests\StorePropriedadeRequest;
use App\Http\Requests\UpdatePropriedadeRequest;

class PropriedadeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->success(Propriedade::all(), "Propriedades encontradas");
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
        $validated = $request->validated();
        $usuarioId = $request->input('usuario_id');

        $propriedade = Propriedade::create($validated);

        if ($usuarioId) {
            $propriedade->usuarios()->attach($usuarioId, ['nivel_acesso' => 'admin']);
        }

        return $this->success($propriedade, 'Propriedade criada', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $propriedade = Propriedade::find($id);
        if (!$propriedade) {
            return $this->error("Propriedade não encontrada", 404);
        }
        return $this->success($propriedade, "Propriedade encontrada");
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
        $propriedade = Propriedade::find($id);
        if (!$propriedade) {
            return $this->error("Propriedade não encontrada", 404);
        }

        $propriedade->update($request->validated());

        return $this->success($propriedade, 'Propriedade atualizada');
    }

    public function destroy(string $id)
    {
        $propriedade = Propriedade::find($id);
        if (!$propriedade) {
            return $this->error("Propriedade não encontrada", 404);
        }
        $propriedade->delete();
        return $this->success($propriedade, "Propriedade deletada com sucesso");
    }
}

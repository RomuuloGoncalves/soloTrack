<?php

namespace App\Http\Controllers;

use App\Models\Propriedade;
use Illuminate\Http\Request;

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
        $propriedade = Propriedade::create($request->validated());

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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
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

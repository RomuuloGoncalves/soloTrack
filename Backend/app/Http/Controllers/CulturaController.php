<?php

namespace App\Http\Controllers;

use App\Models\Cultura;
use Illuminate\Http\Request;

class CulturaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->success(Cultura::all(), "Culturas encontradas");
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
        $cultura = Cultura::create($request->validated());

        return $this->success($cultura, 'Cultura criada', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $cultura = Cultura::find($id);
        if (!$cultura) {
            return $this->error("Cultura não encontrada", 404);
        }
        return $this->success($cultura, "Cultura encontrada");
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
        $cultura = Cultura::find($id);
        if (!$cultura) {
            return $this->error("Cultura não encontrada", 404);
        }
        $cultura->delete();
        return $this->success($cultura, "Cultura deletada com sucesso");
    }
}

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
        return Propriedade::all();
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
        $propriedade = Propriedade :: create($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(Propriedade $propriedade)
    {
        return Propriedade :: findOrFail($propriedade);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Propriedade $propriedade)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Propriedade $propriedade)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Propriedade $propriedade)
    {
        $propriedade->delete();
        return $this->sucess($propriedade, "deletado com sucesso.")
    }
}

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
        return Cultura::all();
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
        $cultura = Cultura :: create($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(Cultura $cultura)
    {
        return Cultura :: findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Cultura $cultura)
    {

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cultura $cultura)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cultura $cultura)
    {
        $cultura->delete();
        return $this->sucesso($cultura, "deletado com sucesso");
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Insumo;
use Illuminate\Http\Request;
use App\Http\Requests\StoreInsumoRequest;

class InsumoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 100) : 10;

        $insumos = Insumo::query()
            ->where('usuario_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return $this->success($insumos, "Insumos encontrados");
    }

    public function resumo(Request $request)
    {
        $query = Insumo::query()->where('usuario_id', $request->user()->id);

        $patrimonioTotal = (float) $query->sum(\DB::raw('quantidade * preco_pago'));
        $tiposDeInsumos = (int) $query->count();

        return $this->success([
            'patrimonio_total' => round($patrimonioTotal, 2),
            'tipos_de_insumos' => $tiposDeInsumos,
            'economia_estimada' => 0,
        ], 'Resumo financeiro gerado');
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

    public function store(StoreInsumoRequest $request)
    {
        $dados = $request->validated();
        $dados['usuario_id'] = $request->user()->id;

        $insumo = Insumo::create($dados);

        return $this->success($insumo, 'Insumo criado', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $insumo = Insumo::where('usuario_id', $request->user()->id)->find($id);
        if (!$insumo) {
            return $this->error("Insumo não encontrado", 404);
        }
        return $this->success($insumo, "Insumo encontrado");
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
        $insumo = Insumo::where('usuario_id', $request->user()->id)->find($id);

        if (!$insumo) {
            return $this->error("Insumo não encontrado", 404);
        }

        $dados = $request->validate([
            'nome_fertilizante' => 'sometimes|required|string|max:255',
            'quantidade' => 'sometimes|required|numeric|min:0',
            'unidade_medida' => 'sometimes|required|string|max:50',
            'preco_pago' => 'sometimes|required|numeric|min:0',
        ]);

        $insumo->update($dados);

        return $this->success($insumo->fresh(), 'Insumo atualizado');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $insumo = Insumo::where('usuario_id', $request->user()->id)->find($id);
        if (!$insumo) {
            return $this->error("Insumo não encontrado", 404);
        }
        $insumo->delete();
        return $this->success($insumo, "Insumo deletado com sucesso");
    }
}

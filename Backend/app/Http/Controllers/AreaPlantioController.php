<?php

namespace App\Http\Controllers;

use App\Models\AreaPlantio;
use App\Http\Requests\StoreAreaPlantioRequest;
use App\Http\Requests\UpdateAreaPlantioRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AreaPlantioController extends Controller
{
    public function index(Request $request)
    {
        $query = AreaPlantio::query();

        if ($request->filled('propriedade_id')) {
            $query->where('propriedade_id', $request->propriedade_id);
        }

        return $this->success($query->get(), "Áreas encontradas");
    }

    public function create()
    {
        //
    }

    public function store(StoreAreaPlantioRequest $request)
    {
        $dados = $request->validated();
        $dados['qr_code_hash'] = Str::uuid()->toString();

        $area = AreaPlantio::create($dados);

        return $this->success($area, 'Área criada', 201);
    }

    public function show(AreaPlantio $areaPlantio)
    {
        return $this->success($areaPlantio, "Área encontrada");
    }

    public function edit(AreaPlantio $areaPlantio)
    {
        //
    }

    public function update(UpdateAreaPlantioRequest $request, AreaPlantio $areaPlantio)
    {
        $areaPlantio->update($request->validated());

        return $this->success($areaPlantio, 'Área atualizada');
    }

    public function destroy(AreaPlantio $areaPlantio)
    {
        $areaPlantio->delete();
        return $this->success($areaPlantio, "Área deletada com sucesso");
    }
}

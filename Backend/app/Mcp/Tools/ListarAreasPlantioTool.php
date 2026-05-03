<?php

namespace App\Mcp\Tools;

use App\Models\AreaPlantio;

class ListarAreasPlantioTool
{
    public static function definition(): array
    {
        return [
            'name' => 'listar_areas_plantio',
            'description' => 'Retorna a lista de todas as áreas de plantio cadastradas no sistema SoloTrack, incluindo seus IDs, nomes e a qual propriedade (propriedade_id) pertencem.',
            'parameters' => [
                'type' => 'object',
                'properties' => (object) [],
            ],
        ];
    }

    public static function execute(array $args = [])
    {
        return AreaPlantio::all(['id', 'propriedade_id', 'nome_area', 'tamanho_area_m2'])->toArray();
    }
}

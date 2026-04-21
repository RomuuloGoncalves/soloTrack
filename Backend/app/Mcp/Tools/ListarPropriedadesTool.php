<?php

namespace App\Mcp\Tools;

use App\Models\Propriedade;

class ListarPropriedadesTool
{
    public static function definition(): array
    {
        return [
            'name' => 'listar_propriedades',
            'description' => 'Retorna a lista de todas as propriedades cadastradas no sistema SoloTrack, incluindo seus IDs, nomes, cidade, estado e tamanho em hectares.',
            'parameters' => [
                'type' => 'object',
                'properties' => (object) [],
            ],
        ];
    }

    public static function execute(array $args = [])
    {
        return Propriedade::all(['id', 'nome', 'cidade', 'estado', 'tamanho_hectares'])->toArray();
    }
}

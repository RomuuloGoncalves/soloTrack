<?php

namespace App\Mcp\Tools;

use App\Models\AreaPlantio;
use Illuminate\Support\Facades\Validator;

class ExcluirAreaPlantioTool
{
    public static function definition(): array
    {
        return [
            'name' => 'excluir_area_plantio',
            'description' => 'Exclui uma área de plantio existente no sistema SoloTrack. Para usar essa ferramenta, é necessário saber o ID da área de plantio, que pode ser obtido através de outras ferramentas de listagem.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'id' => [
                        'type' => 'integer',
                        'description' => 'ID da área de plantio a ser excluída (obrigatório)',
                    ],
                ],
                'required' => ['id'],
            ],
        ];
    }

    public static function execute(array $args = [])
    {
        $validator = Validator::make($args, [
            'id' => 'required|integer|exists:area_plantios,id',
        ]);

        if ($validator->fails()) {
            return [
                'sucesso' => false,
                'erros' => $validator->errors()->toArray(),
            ];
        }

        $area = AreaPlantio::find($args['id']);
        $areaNome = $area->nome_area;
        $area->delete();

        return [
            'sucesso' => true,
            'mensagem' => "Área de plantio '{$areaNome}' excluída com sucesso!",
        ];
    }
}

<?php

namespace App\Mcp\Tools;

use App\Models\AreaPlantio;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CriarAreaPlantioTool
{
    public static function definition(): array
    {
        return [
            'name' => 'criar_area_plantio',
            'description' => 'Cria uma nova área de plantio vinculada a uma propriedade existente no sistema SoloTrack. Use listar_propriedades antes para obter o ID da propriedade correta caso não saiba.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'propriedade_id' => [
                        'type' => 'integer',
                        'description' => 'ID da propriedade onde a área será criada (obrigatório)',
                    ],
                    'nome_area' => [
                        'type' => 'string',
                        'description' => 'Nome da área de plantio (obrigatório)',
                    ],
                    'tamanho_area_m2' => [
                        'type' => 'number',
                        'description' => 'Tamanho da área em metros quadrados',
                    ],
                    'latitude' => [
                        'type' => 'number',
                        'description' => 'Latitude geográfica (valor entre -90 e 90)',
                    ],
                    'longitude' => [
                        'type' => 'number',
                        'description' => 'Longitude geográfica (valor entre -180 e 180)',
                    ],
                ],
                'required' => ['propriedade_id', 'nome_area'],
            ],
        ];
    }

    public static function execute(array $args = [])
    {
        $validator = Validator::make($args, [
            'propriedade_id'  => 'required|integer|exists:propriedades,id',
            'nome_area'       => 'required|string|max:255',
            'tamanho_area_m2' => 'nullable|numeric|min:0',
            'latitude'        => 'nullable|numeric|between:-90,90',
            'longitude'       => 'nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return [
                'sucesso' => false,
                'erros' => $validator->errors()->toArray(),
            ];
        }

        $dados = $validator->validated();
        $dados['qr_code_hash'] = Str::uuid()->toString();

        $area = AreaPlantio::create($dados);

        return [
            'sucesso' => true,
            'mensagem' => "Área de plantio '{$area->nome_area}' criada com sucesso!",
            'area' => $area->toArray(),
        ];
    }
}

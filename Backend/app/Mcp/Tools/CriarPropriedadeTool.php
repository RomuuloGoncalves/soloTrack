<?php

namespace App\Mcp\Tools;

use App\Models\Propriedade;
use Illuminate\Support\Facades\Validator;

class CriarPropriedadeTool
{
    public static function definition(): array
    {
        return [
            'name' => 'criar_propriedade',
            'description' => 'Cria uma nova propriedade rural no sistema SoloTrack. Use esta ferramenta quando o usuário pedir para cadastrar ou criar uma fazenda/propriedade.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'nome' => [
                        'type' => 'string',
                        'description' => 'Nome da propriedade (obrigatório)',
                    ],
                    'cidade' => [
                        'type' => 'string',
                        'description' => 'Cidade onde a propriedade está localizada',
                    ],
                    'estado' => [
                        'type' => 'string',
                        'description' => 'Estado com sigla de 2 letras (ex: SP, MG, PR)',
                    ],
                    'latitude' => [
                        'type' => 'number',
                        'description' => 'Latitude geográfica (valor entre -90 e 90)',
                    ],
                    'longitude' => [
                        'type' => 'number',
                        'description' => 'Longitude geográfica (valor entre -180 e 180)',
                    ],
                    'tamanho_hectares' => [
                        'type' => 'number',
                        'description' => 'Tamanho total da propriedade em hectares',
                    ],
                ],
                'required' => ['nome'],
            ],
        ];
    }

    public static function execute(array $args = [])
    {
        $validator = Validator::make($args, [
            'nome'             => 'required|string|max:255',
            'cidade'           => 'nullable|string|max:255',
            'estado'           => 'nullable|string|size:2',
            'latitude'         => 'nullable|numeric|between:-90,90',
            'longitude'        => 'nullable|numeric|between:-180,180',
            'tamanho_hectares' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return [
                'sucesso' => false,
                'erros' => $validator->errors()->toArray(),
            ];
        }

        $propriedade = Propriedade::create($validator->validated());

        return [
            'sucesso' => true,
            'mensagem' => "Propriedade '{$propriedade->nome}' criada com sucesso!",
            'propriedade' => $propriedade->toArray(),
        ];
    }
}

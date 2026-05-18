<?php

namespace App\Mcp\Tools;

use App\Models\Insumo;
use Illuminate\Support\Facades\Validator;

class CriarInsumoTool
{
    public static function definition(): array
    {
        return [
            'name' => 'criar_insumo',
            'description' => 'Cadastra/Cria um novo insumo ou fertilizante financeiro no estoque do galpão no sistema SoloTrack.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'usuario_id' => [
                        'type' => 'integer',
                        'description' => 'ID do usuário logado que está cadastrando o insumo (obrigatório)',
                    ],
                    'nome_fertilizante' => [
                        'type' => 'string',
                        'description' => 'Nome do insumo ou tipo de fertilizante (ex: Ureia, NPK 10-10-10) (obrigatório)',
                    ],
                    'preco_pago' => [
                        'type' => 'number',
                        'description' => 'Preço pago por unidade (ex: 4.50) (obrigatório)',
                    ],
                    'unidade_medida' => [
                        'type' => 'string',
                        'description' => 'Unidade de medida (ex: Kg, Sacos, Litros) (obrigatório)',
                    ],
                    'quantidade' => [
                        'type' => 'number',
                        'description' => 'Quantidade total do insumo em estoque (ex: 50) (obrigatório)',
                    ],
                ],
                'required' => ['usuario_id', 'nome_fertilizante', 'preco_pago', 'unidade_medida', 'quantidade'],
            ],
        ];
    }

    public static function execute(array $args = [])
    {
        $validator = Validator::make($args, [
            'usuario_id'        => 'required|integer|exists:usuarios,id',
            'nome_fertilizante' => 'required|string|max:255',
            'preco_pago'        => 'required|numeric|min:0',
            'unidade_medida'    => 'required|string|max:255',
            'quantidade'        => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return [
                'sucesso' => false,
                'erros' => $validator->errors()->toArray(),
            ];
        }

        $insumo = Insumo::create($validator->validated());

        return [
            'sucesso' => true,
            'mensagem' => "Insumo '{$insumo->nome_fertilizante}' cadastrado com sucesso!",
            'insumo' => $insumo->toArray(),
        ];
    }
}

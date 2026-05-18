<?php

namespace App\Mcp\Tools;

use App\Models\Insumo;
use Illuminate\Support\Facades\Validator;

class ListarInsumosTool
{
    public static function definition(): array
    {
        return [
            'name' => 'listar_insumos',
            'description' => 'Retorna a lista de todos os insumos e fertilizantes cadastrados no estoque do galpão para o usuário logado.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'usuario_id' => [
                        'type' => 'integer',
                        'description' => 'ID do usuário logado para listar os insumos correspondentes (obrigatório)',
                    ],
                ],
                'required' => ['usuario_id'],
            ],
        ];
    }

    public static function execute(array $args = [])
    {
        $validator = Validator::make($args, [
            'usuario_id' => 'required|integer|exists:usuarios,id',
        ]);

        if ($validator->fails()) {
            return [
                'sucesso' => false,
                'erros' => $validator->errors()->toArray(),
            ];
        }

        $insumos = Insumo::where('usuario_id', $args['usuario_id'])->get();

        return [
            'sucesso' => true,
            'insumos' => $insumos->toArray(),
        ];
    }
}

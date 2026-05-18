<?php

namespace App\Mcp\Tools;

use App\Models\Equipamento;
use Illuminate\Support\Facades\Validator;

class ListarEquipamentosTool
{
    public static function definition(): array
    {
        return [
            'name' => 'listar_equipamentos',
            'description' => 'Retorna a lista de todos os equipamentos e dispositivos IoT cadastrados para o usuário logado.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'usuario_id' => [
                        'type' => 'integer',
                        'description' => 'ID do usuário logado para listar os equipamentos correspondentes (obrigatório)',
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

        $equipamentos = Equipamento::where('usuario_id', $args['usuario_id'])->get();

        return [
            'sucesso' => true,
            'equipamentos' => $equipamentos->toArray(),
        ];
    }
}

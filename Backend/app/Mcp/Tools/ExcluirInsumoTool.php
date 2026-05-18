<?php

namespace App\Mcp\Tools;

use App\Models\Insumo;
use Illuminate\Support\Facades\Validator;

class ExcluirInsumoTool
{
    public static function definition(): array
    {
        return [
            'name' => 'excluir_insumo',
            'description' => 'Exclui um insumo ou fertilizante específico do estoque do galpão no sistema SoloTrack.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'id' => [
                        'type' => 'integer',
                        'description' => 'ID do insumo a ser excluído (obrigatório)',
                    ],
                    'usuario_id' => [
                        'type' => 'integer',
                        'description' => 'ID do usuário logado para verificar a propriedade do registro (obrigatório)',
                    ],
                ],
                'required' => ['id', 'usuario_id'],
            ],
        ];
    }

    public static function execute(array $args = [])
    {
        $validator = Validator::make($args, [
            'id'         => 'required|integer|exists:insumos,id',
            'usuario_id' => 'required|integer|exists:usuarios,id',
        ]);

        if ($validator->fails()) {
            return [
                'sucesso' => false,
                'erros' => $validator->errors()->toArray(),
            ];
        }

        $insumo = Insumo::where('id', $args['id'])
            ->where('usuario_id', $args['usuario_id'])
            ->first();

        if (!$insumo) {
            return [
                'sucesso' => false,
                'mensagem' => 'Insumo não encontrado ou você não tem permissão para excluí-lo.',
            ];
        }

        $nome = $insumo->nome_fertilizante;
        $insumo->delete();

        return [
            'sucesso' => true,
            'mensagem' => "Insumo '{$nome}' excluído com sucesso!",
        ];
    }
}

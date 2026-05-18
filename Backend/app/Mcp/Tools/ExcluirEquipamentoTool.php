<?php

namespace App\Mcp\Tools;

use App\Models\Equipamento;
use Illuminate\Support\Facades\Validator;

class ExcluirEquipamentoTool
{
    public static function definition(): array
    {
        return [
            'name' => 'excluir_equipamento',
            'description' => 'Exclui um dispositivo ou equipamento IoT específico da fazenda no sistema SoloTrack.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'id' => [
                        'type' => 'integer',
                        'description' => 'ID do equipamento a ser excluído (obrigatório)',
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
            'id'         => 'required|integer|exists:equipamentos,id',
            'usuario_id' => 'required|integer|exists:usuarios,id',
        ]);

        if ($validator->fails()) {
            return [
                'sucesso' => false,
                'erros' => $validator->errors()->toArray(),
            ];
        }

        $equipamento = Equipamento::where('id', $args['id'])
            ->where('usuario_id', $args['usuario_id'])
            ->first();

        if (!$equipamento) {
            return [
                'sucesso' => false,
                'mensagem' => 'Dispositivo não encontrado ou você não tem permissão para excluí-lo.',
            ];
        }

        $nome = $equipamento->nome_apelido;
        $mac = $equipamento->mac_address;
        $equipamento->delete();

        return [
            'sucesso' => true,
            'mensagem' => "Dispositivo '{$nome}' (MAC: {$mac}) excluído com sucesso!",
        ];
    }
}

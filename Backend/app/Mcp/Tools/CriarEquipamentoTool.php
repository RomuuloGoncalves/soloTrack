<?php

namespace App\Mcp\Tools;

use App\Models\Equipamento;
use Illuminate\Support\Facades\Validator;

class CriarEquipamentoTool
{
    public static function definition(): array
    {
        return [
            'name' => 'criar_equipamento',
            'description' => 'Cadastra/Cria um novo dispositivo ou equipamento IoT (como estações de sensores) no sistema SoloTrack.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'usuario_id' => [
                        'type' => 'integer',
                        'description' => 'ID do usuário logado que está cadastrando o equipamento (obrigatório)',
                    ],
                    'mac_address' => [
                        'type' => 'string',
                        'description' => 'Endereço MAC físico exclusivo do dispositivo com 17 caracteres (ex: 00:1A:C2:7B:00:47) (obrigatório)',
                    ],
                    'nome_apelido' => [
                        'type' => 'string',
                        'description' => 'Nome amigável ou apelido para o dispositivo (ex: Estufa Norte, Estação Lateral)',
                    ],
                ],
                'required' => ['usuario_id', 'mac_address'],
            ],
        ];
    }

    public static function execute(array $args = [])
    {
        $validator = Validator::make($args, [
            'usuario_id'   => 'required|integer|exists:usuarios,id',
            'mac_address'  => 'required|string|size:17|unique:equipamentos,mac_address',
            'nome_apelido' => 'nullable|string|max:255',
        ], [
            'mac_address.unique' => 'Este endereço MAC já está cadastrado no sistema.',
        ]);

        if ($validator->fails()) {
            return [
                'sucesso' => false,
                'erros' => $validator->errors()->toArray(),
            ];
        }

        $equipamento = Equipamento::create($validator->validated());

        return [
            'sucesso' => true,
            'mensagem' => "Dispositivo '{$equipamento->nome_apelido}' (MAC: {$equipamento->mac_address}) cadastrado com sucesso!",
            'equipamento' => $equipamento->toArray(),
        ];
    }
}

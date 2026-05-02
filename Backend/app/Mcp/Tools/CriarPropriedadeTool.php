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
                    'usuario_id' => [
                        'type' => 'integer',
                        'description' => 'ID do usuário logado para vincular à propriedade',
                    ],
                    'confirmar_atualizacao' => [
                        'type' => 'boolean',
                        'description' => 'Passe true se o usuário confirmou que deseja atualizar a propriedade existente',
                    ],
                ],
                'required' => ['nome', 'usuario_id'],
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
            'usuario_id'       => 'required|integer',
            'confirmar_atualizacao' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return [
                'sucesso' => false,
                'erros' => $validator->errors()->toArray(),
            ];
        }

        $validated = $validator->validated();
        $usuarioId = $validated['usuario_id'];
        $confirmarAtualizacao = $validated['confirmar_atualizacao'] ?? false;
        
        unset($validated['usuario_id']);
        unset($validated['confirmar_atualizacao']);
        
        $usuario = \App\Models\Usuario::find($usuarioId);
        $propriedadeExistente = $usuario ? $usuario->propriedades()->first() : null;

        if ($propriedadeExistente && !$confirmarAtualizacao) {
            return [
                'sucesso' => false,
                'mensagem' => "O usuário já possui a fazenda '{$propriedadeExistente->nome}'. Você DEVE perguntar se ele deseja atualizar os dados dela. Não crie uma nova. Se ele disser sim, chame a ferramenta novamente com 'confirmar_atualizacao' = true.",
            ];
        }

        if ($propriedadeExistente && $confirmarAtualizacao) {
            $propriedadeExistente->update($validated);
            return [
                'sucesso' => true,
                'mensagem' => "Fazenda '{$propriedadeExistente->nome}' atualizada com sucesso!",
                'propriedade' => $propriedadeExistente->toArray(),
            ];
        }
        
        $propriedade = Propriedade::create($validated);
        $propriedade->usuarios()->attach($usuarioId, ['nivel_acesso' => 'admin']);

        return [
            'sucesso' => true,
            'mensagem' => "Propriedade '{$propriedade->nome}' criada com sucesso!",
            'propriedade' => $propriedade->toArray(),
        ];
    }
}

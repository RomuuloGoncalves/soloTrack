<?php

namespace App\Mcp\Tools;

use App\Models\Usuario;

class ListarUsuariosTool
{
    /**
     * Retorna a definição da ferramenta no formato MCP/Gemini.
     */
    public static function definition(): array
    {
        return [
            'name' => 'listar_usuarios',
            'description' => 'Retorna a lista de todos os usuários cadastrados no sistema SoloTrack para análise.',
            'parameters' => [
                'type' => 'object',
                'properties' => (object) [],
            ],
        ];
    }

    /**
     * Executa a lógica da ferramenta.
     */
    public static function execute()
    {
        return Usuario::all()->toArray();
    }
}

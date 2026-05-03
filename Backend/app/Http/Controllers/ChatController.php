<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use App\Mcp\Tools\ListarUsuariosTool;
use App\Mcp\Tools\ListarPropriedadesTool;
use App\Mcp\Tools\CriarPropriedadeTool;
use App\Mcp\Tools\CriarAreaPlantioTool;
use App\Mcp\Tools\ListarAreasPlantioTool;
use App\Mcp\Tools\ExcluirAreaPlantioTool;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected GeminiService $gemini;

    protected array $toolMap = [
        'listar_usuarios'    => ListarUsuariosTool::class,
        'listar_propriedades' => ListarPropriedadesTool::class,
        'criar_propriedade'  => CriarPropriedadeTool::class,
        'criar_area_plantio' => CriarAreaPlantioTool::class,
        'listar_areas_plantio'=> ListarAreasPlantioTool::class,
        'excluir_area_plantio'=> ExcluirAreaPlantioTool::class,
    ];

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
        ]);

        $tools = array_map(
            fn($class) => $class::definition(),
            $this->toolMap
        );

        $currentMessages = $request->input('messages');
        $maxIterations = 5;

        try {
            for ($i = 0; $i < $maxIterations; $i++) {
                $response = $this->gemini->chat($currentMessages, array_values($tools));

                if (empty($response['candidates'])) {
                    $reason = $response['promptFeedback']['blockReason'] ?? 'Desconhecido';
                    throw new \Exception("A IA não gerou uma resposta válida. Motivo: $reason");
                }

                $candidate = $response['candidates'][0]['content'] ?? null;
                $parts = $candidate['parts'] ?? [];

                $functionCalls = array_filter($parts, fn($p) => isset($p['functionCall']));

                if (empty($functionCalls)) {
                    return response()->json($response);
                }

                // Normaliza args para objeto JSON antes de adicionar ao histórico
                $aiModelMessage = $candidate;
                foreach ($aiModelMessage['parts'] as &$historyPart) {
                    if (isset($historyPart['functionCall'])) {
                        $historyPart['functionCall']['args'] = (object)($historyPart['functionCall']['args'] ?? []);
                    }
                }
                unset($historyPart); // Quebra a referência para evitar corrupção do histórico
                $currentMessages[] = $aiModelMessage;

                // Executa cada ferramenta chamada e adiciona o resultado ao histórico
                foreach ($functionCalls as $callPart) {
                    $functionName = $callPart['functionCall']['name'];
                    $args = (array) ($callPart['functionCall']['args'] ?? []);

                    $toolClass = $this->toolMap[$functionName] ?? null;
                    $toolResult = $toolClass ? $toolClass::execute($args) : ['erro' => "Ferramenta '$functionName' não encontrada."];

                    $currentMessages[] = [
                        'role' => 'function',
                        'parts' => [
                            [
                                'functionResponse' => [
                                    'name' => $functionName,
                                    'response' => ['content' => $toolResult],
                                ],
                            ],
                        ],
                    ];
                }
            }

            throw new \Exception('Limite de iterações de ferramentas atingido.');

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

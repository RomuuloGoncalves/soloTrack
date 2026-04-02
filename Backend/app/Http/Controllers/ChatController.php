<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use App\Mcp\Tools\ListarUsuariosTool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    protected GeminiService $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    /**
     * Endpoint principal para conversa com a IA e análise de dados (MCP).
     */
    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
        ]);

        $userMessages = $request->input('messages');
        
        // Define as ferramentas MCP disponíveis
        $tools = [
            ListarUsuariosTool::definition()
        ];

        try {
            // 1. Enviar mensagem para o Gemini com as ferramentas
            $response = $this->gemini->chat($userMessages, $tools);

            // 2. Verificar se o Gemini retornou candidatos
            if (empty($response['candidates'])) {
                $finishReason = $response['promptFeedback']['blockReason'] ?? 'Desconhecido';
                throw new \Exception("A IA não gerou uma resposta válida. Motivo: $finishReason");
            }

            $candidate = $response['candidates'][0]['content'] ?? null;
            $parts = $candidate['parts'] ?? [];

            foreach ($parts as $part) {
                if (isset($part['functionCall'])) {
                    $functionName = $part['functionCall']['name'];
                    
                    // Executar a ferramenta correspondente
                    if ($functionName === 'listar_usuarios') {
                        $toolResult = ListarUsuariosTool::execute();

                        // 3. Usar o conteúdo original da IA para o histórico, corrigindo apenas o formato dos args
                        $aiModelMessage = $candidate;
                        foreach ($aiModelMessage['parts'] as &$tempPart) {
                            if (isset($tempPart['functionCall'])) {
                                $tempPart['functionCall']['args'] = !empty($tempPart['functionCall']['args']) 
                                    ? $tempPart['functionCall']['args'] 
                                    : new \stdClass();
                            }
                        }

                        $toolResponseMessage = [
                            'role' => 'function',
                            'parts' => [
                                [
                                    'functionResponse' => [
                                        'name' => $functionName,
                                        'response' => ['content' => $toolResult]
                                    ]
                                ]
                            ]
                        ];

                        $allMessages = $userMessages;
                        $allMessages[] = $aiModelMessage;
                        $allMessages[] = $toolResponseMessage;

                        $finalResponse = $this->gemini->chat($allMessages, $tools);
                        return response()->json($finalResponse);
                    }
                }
            }

            // Se não houve chamada de ferramenta, apenas retorna a resposta da IA
            return response()->json($response);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

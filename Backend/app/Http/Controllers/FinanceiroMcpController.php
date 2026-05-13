<?php

namespace App\Http\Controllers;

use App\Mcp\Tools\ResumoFinanceiroTool;
use App\Services\GeminiService;
use Illuminate\Http\Request;

class FinanceiroMcpController extends Controller
{
    public function __construct(protected GeminiService $gemini)
    {
    }

    public function resumo(Request $request)
    {
        $resumo = ResumoFinanceiroTool::execute([
            'usuario_id' => $request->user()->id,
        ]);

        if (($resumo['sucesso'] ?? false) !== true) {
            return response()->json($resumo, 422, [], JSON_UNESCAPED_UNICODE);
        }

        return $this->success($resumo, 'Resumo financeiro gerado');
    }

    public function analisar(Request $request)
    {
        $validated = $request->validate([
            'mensagem' => 'nullable|string|max:2000',
        ]);

        $resumo = ResumoFinanceiroTool::execute([
            'usuario_id' => $request->user()->id,
        ]);

        if (($resumo['sucesso'] ?? false) !== true) {
            return response()->json($resumo, 422, [], JSON_UNESCAPED_UNICODE);
        }

        $mensagem = trim($validated['mensagem'] ?? '');
        $pedidoUsuario = $mensagem !== ''
            ? $mensagem
            : 'Explique a comparação financeira, destaque o valor real investido, o valor teorico ideal e recomende a proxima acao.';

        $response = $this->gemini->chat([
            [
                'role' => 'user',
                'parts' => [[
                    'text' => 'Voce e um analista financeiro do SoloTrack. Use apenas os dados do resumo abaixo para responder em portugues claro, sem inventar valores. Se nao houver base teorica suficiente, explique isso objetivamente. Resumo financeiro: ' . json_encode($resumo, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\nPergunta do usuario: {$pedidoUsuario}",
                ]],
            ],
        ]);

        if (empty($response['candidates'])) {
            $reason = $response['promptFeedback']['blockReason'] ?? 'Desconhecido';
            return response()->json([
                'error' => "A IA não gerou uma resposta válida. Motivo: $reason",
            ], 500, [], JSON_UNESCAPED_UNICODE);
        }

        return response()->json($response, 200, [], JSON_UNESCAPED_UNICODE);
    }
}
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
    }

    /**
     * Envia uma mensagem para o Gemini e processa possíveis chamadas de ferramentas (MCP).
     */
    public function chat(array $messages, array $tools = [])
    {
        $payload = [
            'contents' => $messages,
        ];

        if (!empty($tools)) {
            $payload['tools'] = [
                ['function_declarations' => $tools]
            ];
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($this->baseUrl . '?key=' . $this->apiKey, $payload);

        if ($response->failed()) {
            Log::error('Gemini API Error: ' . $response->body());
            throw new \Exception('Erro ao comunicar com a IA: ' . $response->json('error.message', 'Erro desconhecido'));
        }

        return $response->json();
    }
}

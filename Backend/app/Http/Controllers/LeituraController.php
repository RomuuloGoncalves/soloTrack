<?php

namespace App\Http\Controllers;

use App\Models\Leitura;
use App\Models\Equipamento;
use App\Models\AreaPlantio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeituraController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Traz as leituras ordenadas pelas mais recentes e com os relacionamentos de área e culturas da área
        $leituras = Leitura::with(['areaPlantio.culturas', 'tipoSensor'])
            ->orderBy('created_at', 'desc')
            ->get();

        $grouped = [];

        foreach ($leituras as $leitura) {
            // A chave agrupa leituras do mesmo pacote (mesmo instante de tempo e mesma área)
            $key = $leitura->area_plantio_id . '_' . $leitura->created_at->format('Y-m-d H:i');
            
            if (!isset($grouped[$key])) {
                // Tenta pegar a cultura atual (a primeira da relação daquela área que esteja vinculada)
                $culturaAtual = 'Sem cultura';
                if ($leitura->areaPlantio && $leitura->areaPlantio->culturas->isNotEmpty()) {
                    $culturaAtual = $leitura->areaPlantio->culturas->first()->nome_cultura;
                }

                $grouped[$key] = [
                    'id' => 'LEIT-' . str_pad($leitura->id, 6, '0', STR_PAD_LEFT), // Pega o ID da primeira leitura do pacote
                    'date' => $leitura->created_at->format('d/m/Y'),
                    'time' => $leitura->created_at->format('H:i'),
                    'origin' => $leitura->areaPlantio->nome_area ?? 'Desconhecida',
                    'cultura' => $culturaAtual,
                    'temp' => '-',
                    'humAir' => '-',
                    'humSoil' => '-',
                    'ph' => '-',
                    'status' => 'Normal'
                ];
            }

            $grandeza = strtolower($leitura->tipoSensor->grandeza ?? '');
            
            if (str_contains($grandeza, 'temp')) {
                $grouped[$key]['temp'] = $leitura->valor_lido . ' °C';
                if ($leitura->valor_lido > 35) $grouped[$key]['status'] = 'Alerta';
            } elseif (str_contains($grandeza, 'umidade do ar')) {
                $grouped[$key]['humAir'] = $leitura->valor_lido . '%';
            } elseif (str_contains($grandeza, 'umidade do solo')) {
                $grouped[$key]['humSoil'] = $leitura->valor_lido . '%';
                if ($leitura->valor_lido < 30) $grouped[$key]['status'] = 'Alerta';
            } elseif (str_contains($grandeza, 'ph')) {
                $grouped[$key]['ph'] = $leitura->valor_lido;
                if ($leitura->valor_lido < 5.5 || $leitura->valor_lido > 7.5) $grouped[$key]['status'] = 'Alerta';
            }
        }

        // Retorna um array indexado (sem as chaves do agrupamento)
        return response()->json(array_values($grouped), 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Leitura $leitura)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Leitura $leitura)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Leitura $leitura)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Leitura $leitura)
    {
        //
    }

    /**
     * Recebe e processa os dados advindos do Hardware (ESP32/Arduino)
     * Rota desprotegida por sanctum (usa o MAC Address como identificador)
     */
    public function receberDadosIot(Request $request)
    {
        // 1. Validação pesada para garantir a integridade dos dados EAV
        $request->validate([
            'mac_address' => 'required|string|exists:equipamentos,mac_address',
            'qr_code_hash' => 'required|string|exists:area_plantios,qr_code_hash',
            'leituras' => 'required|array|min:1',
            'leituras.*.tipo_sensor_id' => 'required|exists:tipo_sensors,id',
            'leituras.*.valor' => 'required|numeric',
        ]);

        try {
            // 2. Busca o Equipamento e a Área no banco de dados (fail se não achar, mesmo validando antes, é boa prática)
            $equipamento = Equipamento::where('mac_address', $request->mac_address)->firstOrFail();
            $area = AreaPlantio::where('qr_code_hash', $request->qr_code_hash)->firstOrFail();

            $novasLeituras = [];

            // 3. Inicia uma transação no banco (Se der erro no meio do loop, ele desfaz tudo para não sujar o banco)
            DB::beginTransaction();

            foreach ($request->leituras as $leituraItem) {
                // Empilha a leitura no modelo EAV
                $novaLeitura = Leitura::create([
                    'area_plantio_id' => $area->id,
                    'equipamento_id'  => $equipamento->id,
                    'tipo_sensor_id'  => $leituraItem['tipo_sensor_id'],
                    'valor_lido'      => $leituraItem['valor']
                ]);

                $novasLeituras[] = $novaLeitura;
            }

            // Confirma as inserções no banco
            DB::commit();

            // 4. Retorna sucesso para o Arduino
            return response()->json([
                'status' => 'success',
                'message' => 'Leituras registradas com sucesso!',
                'total_registros_inseridos' => count($novasLeituras)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno ao processar leituras do IoT.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }
}

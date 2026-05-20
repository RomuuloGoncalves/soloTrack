<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VisaoGeralController extends Controller
{
    public function obterDadosDashboard(Request $request)
    {
        $areaId = $request->query('area_id', 'todas'); 
        $dataInicio = $request->query('data_inicio', '2026-05-01'); 
        $dataFim = $request->query('data_fim', '2026-05-31');
        $sensorId = $request->query('sensor_id', 4); // 4 = pH

        // Adicionando horas para garantir que o whereBetween pegue o dia todo
        $inicioDia = $dataInicio . ' 00:00:00';
        $fimDia = $dataFim . ' 23:59:59';

        // =========================================================
        // GRÁFICO 1: Comparação de Custos (Barras)
        // =========================================================
        $custosAgrupados = DB::table('area_insumo')
            ->join('insumos', 'area_insumo.insumo_id', '=', 'insumos.id')
            ->whereBetween('area_insumo.created_at', [$inicioDia, $fimDia])
            ->when($areaId !== 'todas', function ($query) use ($areaId) {
                return $query->where('area_insumo.area_plantio_id', $areaId);
            })
            ->select(
                DB::raw('STRFTIME("%m", area_insumo.created_at) as mes'),
                DB::raw('SUM(area_insumo.quantidade_aplicada * insumos.preco_pago) as custo_usado'),
                DB::raw('SUM((area_insumo.quantidade_padrao * 1.10) * insumos.preco_pago) as custo_esperado')
            )
            ->groupBy('mes')
            ->get()
            ->keyBy('mes');

        $mesesNomes = ['01'=>'Jan','02'=>'Fev','03'=>'Mar','04'=>'Abr','05'=>'Mai','06'=>'Jun','07'=>'Jul','08'=>'Ago','09'=>'Set','10'=>'Out','11'=>'Nov','12'=>'Dez'];
        
        $dadosComparacao = [];
        $mesInicio = (int) Carbon::parse($dataInicio)->format('m');
        $mesFim = (int) Carbon::parse($dataFim)->format('m');

        for ($m = $mesInicio; $m <= $mesFim; $m++) {
            $mesKey = str_pad($m, 2, '0', STR_PAD_LEFT);
            $dadosComparacao[] = [
                'name' => $mesesNomes[$mesKey],
                'esperado' => isset($custosAgrupados[$mesKey]) ? round($custosAgrupados[$mesKey]->custo_esperado, 2) : 0,
                'usado' => isset($custosAgrupados[$mesKey]) ? round($custosAgrupados[$mesKey]->custo_usado, 2) : 0,
            ];
        }

        // =========================================================
        // GRÁFICO 2: Evolução dos Nutrientes no Tempo (Linhas)
        // =========================================================
        $dadosEvolucao = [];
        $valorIdeal = 6.5; // Fallback padrão para pH

        if ($areaId !== 'todas') {
            // Valor ideal da cultura ESPECÍFICA plantada nesta estufa
            $parametroCultura = DB::table('area_cultura')
                ->join('cultura_parametros', 'area_cultura.cultura_id', '=', 'cultura_parametros.cultura_id')
                ->where('area_cultura.area_plantio_id', $areaId)
                ->where('cultura_parametros.tipo_sensor_id', $sensorId)
                ->select('valor_minimo', 'valor_maximo')
                ->first();

            if ($parametroCultura) {
                $valorIdeal = ($parametroCultura->valor_minimo + $parametroCultura->valor_maximo) / 2;
            }
        } else {
            // Se for "Todas", calcula a média ideal de TODAS as culturas cadastradas
            $mediaParametros = DB::table('cultura_parametros')
                ->where('tipo_sensor_id', $sensorId)
                ->selectRaw('AVG((valor_minimo + valor_maximo) / 2) as media_ideal')
                ->first();
                
            $valorIdeal = $mediaParametros && $mediaParametros->media_ideal ? $mediaParametros->media_ideal : 6.5;
        }

        // Busca as leituras diárias reais (CORRIGIDO PARA BUSCAR PELA COLUNA created_at)
        $leiturasQuery = DB::table('leituras')
            ->where('tipo_sensor_id', $sensorId)
            ->whereBetween('created_at', [$inicioDia, $fimDia]);

        // Aplica o filtro de estufa somente se não for "todas"
        if ($areaId !== 'todas') {
            $leiturasQuery->where('area_plantio_id', $areaId);
        }

        $leiturasDiarias = $leiturasQuery->select(
                DB::raw('DATE(created_at) as data_formatada'),
                DB::raw('AVG(valor_lido) as valor_medio')
            )
            ->groupBy('data_formatada')
            ->orderBy('data_formatada')
            ->get();

        foreach ($leiturasDiarias as $leitura) {
            $dadosEvolucao[] = [
                'name' => Carbon::parse($leitura->data_formatada)->format('d/m'), // Ex: 15/05
                'ideal' => round($valorIdeal, 2),
                'real' => round($leitura->valor_medio, 2),
            ];
        }

// 1. KPI Economia
        $totalEsperado = array_sum(array_column($dadosComparacao, 'esperado'));
        $totalUsado = array_sum(array_column($dadosComparacao, 'usado'));
        
        $economiaReais = $totalEsperado - $totalUsado;
        $economiaPercentual = 0;
        
        if ($totalEsperado > 0) {
            // Se gastou menos que o esperado, a porcentagem economizada é positiva
            $economiaPercentual = (($totalEsperado - $totalUsado) / $totalEsperado) * 100;
        }
        
        // Evita exibir porcentagem negativa no Donut (caso de prejuízo)
        $donutEconomia = $economiaPercentual > 0 ? min(100, round($economiaPercentual)) : 0;

        // 2. KPI Score de Fertilidade (0 a 10)
        // Quanto menor a diferença entre o Real e o Ideal no gráfico de linhas, maior o score.
        $totalDias = count($dadosEvolucao);
        $somaDesvios = 0;
        
        foreach ($dadosEvolucao as $dia) {
            $somaDesvios += abs($dia['ideal'] - $dia['real']);
        }
        
        $mediaDesvio = $totalDias > 0 ? $somaDesvios / $totalDias : 0;
        
        // Fórmula de Score: Perde 2.5 pontos para cada 1 unidade de desvio do pH/Nutriente
        $score = max(0, 10 - ($mediaDesvio * 2.5));
        $donutScore = round(($score / 10) * 100);

        return response()->json([
            'dadosComparacao' => $dadosComparacao,
            'dadosEvolucao' => $dadosEvolucao,
            'kpis' => [
                'economia_reais' => round($economiaReais, 2),
                'economia_percentual' => $donutEconomia,
                'score_fertilidade' => round($score, 1),
                'score_percentual' => $donutScore
            ]
        ]);
    }

    public function obterFiltros()
    {
        // Busca todas as áreas criadas pela Seeder/Usuário
        $areas = DB::table('area_plantios')->select('id', 'nome_area')->get();
        
        // Busca todos os sensores (Temperatura, Umidade, pH, etc)
        $sensores = DB::table('tipo_sensors')->select('id', 'grandeza')->get();

        return response()->json([
            'areas' => $areas,
            'sensores' => $sensores
        ]);
    }
}
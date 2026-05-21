<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VisaoGeralController extends Controller
{
    public function obterFiltros()
    {
        $areas = DB::table('area_plantios')->select('id', 'nome_area')->get();
        $sensores = DB::table('tipo_sensors')->select('id', 'grandeza')->get();

        return response()->json([
            'areas' => $areas,
            'sensores' => $sensores
        ]);
    }

    public function obterDadosDashboard(Request $request)
    {
        $areaId = $request->query('area_id', 'todas'); 
        $dataInicio = $request->query('data_inicio', '2026-05-01'); 
        $dataFim = $request->query('data_fim', '2026-05-31');
        $sensorId = $request->query('sensor_id', 4); 

        $inicioDia = $dataInicio . ' 00:00:00';
        $fimDia = $dataFim . ' 23:59:59';

        // =========================================================
        // GRÁFICO 1: Comparação de Custos (Barras) - AGNOSTICO DE DB
        // =========================================================
        $insumosAplicados = DB::table('area_insumo')
            ->join('insumos', 'area_insumo.insumo_id', '=', 'insumos.id')
            ->whereBetween('area_insumo.created_at', [$inicioDia, $fimDia])
            ->when($areaId !== 'todas', function ($query) use ($areaId) {
                return $query->where('area_insumo.area_plantio_id', $areaId);
            })
            ->select(
                'area_insumo.created_at',
                'area_insumo.quantidade_aplicada',
                'area_insumo.quantidade_padrao',
                'insumos.preco_pago'
            )
            ->get();

        $custosAgrupados = [];
        foreach ($insumosAplicados as $item) {
            $mes = Carbon::parse($item->created_at)->format('m');
            if (!isset($custosAgrupados[$mes])) {
                $custosAgrupados[$mes] = (object) ['custo_usado' => 0, 'custo_esperado' => 0];
            }
            $custosAgrupados[$mes]->custo_usado += ($item->quantidade_aplicada * $item->preco_pago);
            $custosAgrupados[$mes]->custo_esperado += (($item->quantidade_padrao * 1.10) * $item->preco_pago);
        }

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
        $valorIdeal = 6.5; 

        if ($areaId !== 'todas') {
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
            $mediaParametros = DB::table('cultura_parametros')
                ->where('tipo_sensor_id', $sensorId)
                ->selectRaw('AVG((valor_minimo + valor_maximo) / 2) as media_ideal')
                ->first();
                
            $valorIdeal = $mediaParametros && $mediaParametros->media_ideal ? $mediaParametros->media_ideal : 6.5;
        }

        $leiturasQuery = DB::table('leituras')
            ->where('tipo_sensor_id', $sensorId)
            ->whereBetween('created_at', [$inicioDia, $fimDia]);

        if ($areaId !== 'todas') {
            $leiturasQuery->where('area_plantio_id', $areaId);
        }

        $leiturasBrutas = $leiturasQuery->select('created_at', 'valor_lido')->get();
        $leiturasAgrupadas = [];
        
        foreach ($leiturasBrutas as $leitura) {
            $dataFormato = Carbon::parse($leitura->created_at)->format('Y-m-d');
            if (!isset($leiturasAgrupadas[$dataFormato])) {
                $leiturasAgrupadas[$dataFormato] = ['soma' => 0, 'count' => 0];
            }
            $leiturasAgrupadas[$dataFormato]['soma'] += $leitura->valor_lido;
            $leiturasAgrupadas[$dataFormato]['count'] += 1;
        }

        ksort($leiturasAgrupadas);

        foreach ($leiturasAgrupadas as $data => $valores) {
            $media = $valores['soma'] / $valores['count'];
            $dadosEvolucao[] = [
                'name' => Carbon::parse($data)->format('d/m'), 
                'ideal' => round($valorIdeal, 2),
                'real' => round($media, 2),
            ];
        }

        // =========================================================
        // CÁLCULO DOS KPIs DINÂMICOS
        // =========================================================
        $totalEsperado = array_sum(array_column($dadosComparacao, 'esperado'));
        $totalUsado = array_sum(array_column($dadosComparacao, 'usado'));
        
        $economiaReais = $totalEsperado - $totalUsado;
        $economiaPercentual = 0;
        
        if ($totalEsperado > 0) {
            $economiaPercentual = (($totalEsperado - $totalUsado) / $totalEsperado) * 100;
        }
        
        $donutEconomia = $economiaPercentual > 0 ? min(100, round($economiaPercentual)) : 0;

        $totalDias = count($dadosEvolucao);
        $somaDesvios = 0;
        
        foreach ($dadosEvolucao as $dia) {
            $somaDesvios += abs($dia['ideal'] - $dia['real']);
        }
        
        $mediaDesvio = $totalDias > 0 ? $somaDesvios / $totalDias : 0;
        
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
}
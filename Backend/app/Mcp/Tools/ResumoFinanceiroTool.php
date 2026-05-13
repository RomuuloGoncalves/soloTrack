<?php

namespace App\Mcp\Tools;

use App\Models\AreaPlantio;
use App\Models\Insumo;

class ResumoFinanceiroTool
{
    public static function definition(): array
    {
        return [
            'name' => 'resumo_financeiro',
            'description' => 'Calcula o valor real investido em insumos e compara com o valor teorico ideal baseado nos padroes cadastrados por area de plantio.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'usuario_id' => [
                        'type' => 'integer',
                        'description' => 'ID do usuario logado. Pode ser informado pela IA ou inferido da autenticacao.',
                    ],
                ],
            ],
        ];
    }

    public static function execute(array $args = [])
    {
        $usuarioId = (int) ($args['usuario_id'] ?? auth()->id() ?? 0);

        if ($usuarioId <= 0) {
            return [
                'sucesso' => false,
                'mensagem' => 'Usuario nao identificado para o resumo financeiro.',
            ];
        }

        $insumos = Insumo::query()
            ->where('usuario_id', $usuarioId)
            ->get();

        $valorRealInvestido = $insumos->sum(function (Insumo $insumo) {
            return (float) $insumo->quantidade * (float) ($insumo->preco_pago ?? 0);
        });

        $areas = AreaPlantio::query()
            ->whereHas('propriedade.usuarios', function ($query) use ($usuarioId) {
                $query->where('usuarios.id', $usuarioId);
            })
            ->with([
                'propriedade:id,nome',
                'insumos:id,nome_fertilizante,preco_pago',
            ])
            ->get();

        $valorTeoricoIdeal = 0.0;
        $detalhesAreas = [];

        foreach ($areas as $area) {
            $valorArea = 0.0;
            $insumosDaArea = [];

            foreach ($area->insumos as $insumo) {
                $quantidadePadrao = (float) ($insumo->pivot->quantidade_padrao ?? 0);
                $precoUnitario = (float) ($insumo->preco_pago ?? 0);
                $valorItem = round($quantidadePadrao * $precoUnitario, 2);

                $valorArea += $valorItem;
                $insumosDaArea[] = [
                    'id' => $insumo->id,
                    'nome_fertilizante' => $insumo->nome_fertilizante,
                    'quantidade_padrao' => $quantidadePadrao,
                    'preco_pago' => round($precoUnitario, 2),
                    'valor_teorico' => $valorItem,
                ];
            }

            if ($valorArea <= 0) {
                continue;
            }

            $valorTeoricoIdeal += $valorArea;
            $detalhesAreas[] = [
                'id' => $area->id,
                'nome_area' => $area->nome_area,
                'propriedade' => $area->propriedade?->nome,
                'tamanho_area_m2' => $area->tamanho_area_m2,
                'valor_teorico' => round($valorArea, 2),
                'insumos' => $insumosDaArea,
            ];
        }

        $valorRealInvestido = round((float) $valorRealInvestido, 2);
        $valorTeoricoIdeal = round((float) $valorTeoricoIdeal, 2);
        $diferencaAbsoluta = round($valorRealInvestido - $valorTeoricoIdeal, 2);
        $economiaEstimativa = round(max($valorTeoricoIdeal - $valorRealInvestido, 0), 2);
        $sobrecustoEstimado = round(max($valorRealInvestido - $valorTeoricoIdeal, 0), 2);
        $diferencaPercentual = $valorTeoricoIdeal > 0
            ? round((($valorRealInvestido - $valorTeoricoIdeal) / $valorTeoricoIdeal) * 100, 2)
            : 0.0;

        if ($valorTeoricoIdeal > 0) {
            if ($diferencaAbsoluta > 0) {
                $statusComparacao = 'acima_do_ideal';
                $resumo = 'O valor real investido esta acima do padrao teorico cadastrado.';
            } elseif ($diferencaAbsoluta < 0) {
                $statusComparacao = 'abaixo_do_ideal';
                $resumo = 'O valor real investido esta abaixo do padrao teorico cadastrado.';
            } else {
                $statusComparacao = 'em_equilibrio';
                $resumo = 'O valor real investido esta alinhado com o padrao teorico cadastrado.';
            }
        } else {
            $statusComparacao = 'sem_base_teorica';
            $resumo = 'Nao existem vinculos suficientes de area e insumo para calcular um valor teorico ideal.';
        }

        return [
            'sucesso' => true,
            'usuario_id' => $usuarioId,
            'patrimonio_total' => $valorRealInvestido,
            'valor_real_investido' => $valorRealInvestido,
            'valor_teorico_ideal' => $valorTeoricoIdeal,
            'diferenca_absoluta' => $diferencaAbsoluta,
            'diferenca_percentual' => $diferencaPercentual,
            'economia_estimada' => $economiaEstimativa,
            'sobrecusto_estimado' => $sobrecustoEstimado,
            'tipos_de_insumos' => (int) $insumos->count(),
            'areas_com_parametro' => (int) count($detalhesAreas),
            'status_comparacao' => $statusComparacao,
            'resumo' => $resumo,
            'detalhes_areas' => $detalhesAreas,
        ];
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Usuario;
use App\Models\Propriedade;
use App\Models\AreaPlantio;
use App\Models\TipoSensor;
use App\Models\Equipamento;
use App\Models\Leitura;
use App\Models\Insumo;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        
        DB::table('leituras')->delete();
        DB::table('area_insumo')->delete();

        $user = Usuario::updateOrCreate(
            ['email' => 'a@a.a'],
            ['nome' => 'usuario', 'password' => bcrypt('asdasdasd'), 'email_verified_at' => $now]
        );

        $propriedade = Propriedade::updateOrCreate(
            ['nome' => 'Fazenda SoloTrack'],
            ['tamanho_hectares' => 150, 'cidade' => 'Sorocaba', 'estado' => 'SP', 'latitude' => '-23.550529', 'longitude' => '-46.633308']
        );

        DB::table('propriedade_user')->updateOrInsert(
            ['usuario_id' => $user->id, 'propriedade_id' => $propriedade->id],
            ['nivel_acesso' => 'admin', 'created_at' => $now, 'updated_at' => $now]
        );

        $areas = [
            ['nome_area' => 'Estufa A - Morango', 'tamanho_area_m2' => '250'],
            ['nome_area' => 'Estufa B - Tomate', 'tamanho_area_m2' => '180'],
            ['nome_area' => 'Campo Aberto - Milho', 'tamanho_area_m2' => '500'],
            ['nome_area' => 'Hidroponia - Alface', 'tamanho_area_m2' => '100'],
            ['nome_area' => 'Setor Leste - Soja', 'tamanho_area_m2' => '2000'],
        ];

        $areasCriadas = [];
        foreach ($areas as $idx => $area) {
            $areasCriadas[] = AreaPlantio::updateOrCreate(
                ['propriedade_id' => $propriedade->id, 'nome_area' => $area['nome_area']],
                array_merge($area, ['qr_code_hash' => Str::uuid()->toString(), 'latitude' => '-23.550'.(520+$idx), 'longitude' => '-46.633'.(309+$idx)])
            );
        }

        $insumos = [
            ['nome_fertilizante' => 'NPK 10-10-10', 'preco_pago' => 145.90, 'unidade_medida' => 'saco', 'quantidade' => 50],
            ['nome_fertilizante' => 'Calcário Dolomítico', 'preco_pago' => 52.50, 'unidade_medida' => 'saco', 'quantidade' => 100],
            ['nome_fertilizante' => 'Ureia Agrícola', 'preco_pago' => 178.40, 'unidade_medida' => 'saco', 'quantidade' => 30],
            ['nome_fertilizante' => 'Adubo Orgânico', 'preco_pago' => 39.90, 'unidade_medida' => 'kg', 'quantidade' => 500],
            ['nome_fertilizante' => 'Fertilizante Foliar', 'preco_pago' => 84.75, 'unidade_medida' => 'litro', 'quantidade' => 80],
        ];

        $insumosCriados = [];
        foreach ($insumos as $dadosInsumo) {
            $insumosCriados[] = Insumo::updateOrCreate(
                ['usuario_id' => $user->id, 'nome_fertilizante' => $dadosInsumo['nome_fertilizante']],
                $dadosInsumo
            );
        }

        for ($mes = 1; $mes <= 5; $mes++) {
            foreach ($areasCriadas as $area) {
                for ($k = 0; $k < 2; $k++) {
                    $insumo = $insumosCriados[array_rand($insumosCriados)];
                    $padrao = rand(10, 50) / 10; 
                    $aplicado = rand(80, 120) / 100 * $padrao; 
                    
                    $dataRetroativa = Carbon::create(2026, $mes, rand(1, 28), rand(8, 17), 0, 0);

                    DB::table('area_insumo')->insert([
                        'area_plantio_id' => $area->id,
                        'insumo_id' => $insumo->id,
                        'quantidade_padrao' => round($padrao, 2),
                        'quantidade_aplicada' => round($aplicado, 2),
                        'created_at' => $dataRetroativa,
                        'updated_at' => $dataRetroativa,
                    ]);
                }
            }
        }

        $sensorTemp = $this->upsertTipoSensor('Temperatura', '°C', $now);
        $sensorUmidAr = $this->upsertTipoSensor('Umidade do Ar', '%', $now);
        $sensorUmidSolo = $this->upsertTipoSensor('Umidade do Solo', '%', $now);
        $sensorPh = $this->upsertTipoSensor('pH', '', $now);
        $sensores = [$sensorTemp, $sensorUmidAr, $sensorUmidSolo, $sensorPh];

        $culturaMorango = $this->upsertCultura('Morango', $now);
        $culturaTomate = $this->upsertCultura('Tomate', $now);
        $culturaMilho = $this->upsertCultura('Milho', $now);
        $culturaAlface = $this->upsertCultura('Alface', $now);
        $culturaSoja = $this->upsertCultura('Soja', $now);

        $culturasArea = [
            $areasCriadas[0]->id => $culturaMorango->id,
            $areasCriadas[1]->id => $culturaTomate->id,
            $areasCriadas[2]->id => $culturaMilho->id,
            $areasCriadas[3]->id => $culturaAlface->id,
            $areasCriadas[4]->id => $culturaSoja->id,
        ];

        foreach ($culturasArea as $aId => $cId) {
            DB::table('area_cultura')->updateOrInsert(
                ['area_plantio_id' => $aId, 'cultura_id' => $cId],
                ['data_plantio' => Carbon::create(2026, 1, 15), 'data_colheita' => null, 'created_at' => $now, 'updated_at' => $now]
            );
        }

        $parametros = [
            ['cultura_id' => $culturaTomate->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 6.0, 'valor_maximo' => 6.8],
            ['cultura_id' => $culturaMorango->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 5.5, 'valor_maximo' => 6.5],
            ['cultura_id' => $culturaMilho->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 5.8, 'valor_maximo' => 7.0],
            ['cultura_id' => $culturaAlface->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 6.0, 'valor_maximo' => 7.0],
            ['cultura_id' => $culturaSoja->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 6.0, 'valor_maximo' => 6.5],
        ];

        foreach ($parametros as $parametro) {
            DB::table('cultura_parametros')->updateOrInsert(
                ['cultura_id' => $parametro['cultura_id'], 'tipo_sensor_id' => $parametro['tipo_sensor_id']],
                ['valor_minimo' => $parametro['valor_minimo'], 'valor_maximo' => $parametro['valor_maximo'], 'created_at' => $now, 'updated_at' => $now]
            );
        }

        $equipamento = Equipamento::updateOrCreate(
            ['usuario_id' => $user->id, 'mac_address' => 'A1:B2:C3:D4:E5:F6'],
            ['nome_apelido' => 'Bastão Principal SoloTrack']
        );

        foreach ([
            ['tipo_sensor_id' => $sensorTemp->id, 'porta_conexao' => 1],
            ['tipo_sensor_id' => $sensorUmidAr->id, 'porta_conexao' => 2],
            ['tipo_sensor_id' => $sensorUmidSolo->id, 'porta_conexao' => 3],
            ['tipo_sensor_id' => $sensorPh->id, 'porta_conexao' => 4],
        ] as $sensorEquip) {
            DB::table('equipamento_sensor')->updateOrInsert(
                ['equipamento_id' => $equipamento->id, 'tipo_sensor_id' => $sensorEquip['tipo_sensor_id']],
                ['porta_conexao' => $sensorEquip['porta_conexao'], 'created_at' => $now, 'updated_at' => $now]
            );
        }

        $dataInicioLeituras = Carbon::create(2026, 1, 1);
        $dataFimLeituras = Carbon::create(2026, 5, 31);
        
        $leiturasToInsert = [];
        for ($data = clone $dataInicioLeituras; $data->lte($dataFimLeituras); $data->addDays(2)) {
            foreach ($areasCriadas as $area) {
                foreach ($sensores as $sensor) {
                    $valor = 0;
                    switch ($sensor->grandeza) {
                        case 'Temperatura': $valor = rand(220, 360) / 10; break;
                        case 'Umidade do Ar': $valor = rand(400, 850) / 10; break;
                        case 'Umidade do Solo': $valor = rand(300, 700) / 10; break;
                        case 'pH': $valor = rand(55, 72) / 10; break;
                    }

                    $ruido = (rand(-5, 5) / 10);
                    $valor = max(0, $valor + $ruido);

                    $leiturasToInsert[] = [
                        'area_plantio_id' => $area->id,
                        'equipamento_id'  => $equipamento->id,
                        'tipo_sensor_id'  => $sensor->id,
                        'valor_lido'      => round($valor, 2),
                        'created_at'      => $data->format('Y-m-d H:i:s'),
                        'updated_at'      => $data->format('Y-m-d H:i:s'),
                    ];
                }
            }
        }
        
        foreach (array_chunk($leiturasToInsert, 500) as $chunk) {
            DB::table('leituras')->insert($chunk);
        }

        $this->command->info('Banco populado com histórico completo de Jan-Mai 2026!');
    }

    private function upsertTipoSensor(string $grandeza, string $unidadeMedida, Carbon $now)
    {
        DB::table('tipo_sensors')->updateOrInsert(
            ['grandeza' => $grandeza, 'unidade_medida' => $unidadeMedida],
            ['created_at' => $now, 'updated_at' => $now]
        );
        return DB::table('tipo_sensors')->where('grandeza', $grandeza)->where('unidade_medida', $unidadeMedida)->first();
    }

    private function upsertCultura(string $nomeCultura, Carbon $now)
    {
        DB::table('culturas')->updateOrInsert(
            ['nome_cultura' => $nomeCultura],
            ['descricao' => null, 'created_at' => $now, 'updated_at' => $now]
        );
        return DB::table('culturas')->where('nome_cultura', $nomeCultura)->first();
    }
}
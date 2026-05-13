<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
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
    /**
     * Seed the application's database.
     */
    public function run(): void

    {
        $now = now();

        // Recria o conjunto de dados de demonstração sem duplicar registros.
        DB::table('leituras')->delete();

        // 1. Criar Usuário Base
        $user = Usuario::updateOrCreate(
            ['email' => 'a@a.a'],
            [
                'nome' => 'usuario',
                'password' => bcrypt('asdasdasd'),
                'email_verified_at' => $now,
            ]
        );

        // 2. Criar Propriedade
        $propriedade = Propriedade::updateOrCreate(
            ['nome' => 'Fazenda SoloTrack'],
            [
                'tamanho_hectares' => 150,
                'cidade'           => 'Sorocaba',
                'estado'           => 'SP',
                'latitude'         => '-23.550529',
                'longitude'        => '-46.633308',
            ]
        );

        DB::table('propriedade_user')->updateOrInsert(
            [
                'usuario_id'     => $user->id,
                'propriedade_id' => $propriedade->id,
            ],
            [
                'nivel_acesso' => 'admin',
                'created_at'   => $now,
                'updated_at'   => $now,
            ]
        );

        // 3. Criar Áreas de Plantio
        $areas = [
            [
                'propriedade_id'  => $propriedade->id,
                'qr_code_hash'    => Str::uuid()->toString(),
                'nome_area'       => 'Estufa A - Morango',
                'tamanho_area_m2' => '250',
                'latitude'        => '-23.550520',
                'longitude'       => '-46.633309',
            ],
            [
                'propriedade_id'  => $propriedade->id,
                'qr_code_hash'    => Str::uuid()->toString(),
                'nome_area'       => 'Estufa B - Tomate',
                'tamanho_area_m2' => '180',
                'latitude'        => '-23.550850',
                'longitude'       => '-46.633100',
            ],
            [
                'propriedade_id'  => $propriedade->id,
                'qr_code_hash'    => Str::uuid()->toString(),
                'nome_area'       => 'Campo Aberto - Milho',
                'tamanho_area_m2' => '500',
                'latitude'        => '-23.551200',
                'longitude'       => '-46.634500',
            ],
        ];

        $areasCriadas = [];
        foreach ($areas as $area) {
            $areasCriadas[] = AreaPlantio::updateOrCreate(
                [
                    'propriedade_id' => $area['propriedade_id'],
                    'nome_area'      => $area['nome_area'],
                ],
                $area
            );
        }

        // 3.1 Criar insumos para a tela de Finanças (todos vinculados ao usuário base)
        $insumos = [
            [
                'usuario_id' => $user->id,
                'nome_fertilizante' => 'NPK 10-10-10',
                'preco_pago' => 145.90,
                'unidade_medida' => 'saco',
                'quantidade' => 12,
            ],
            [
                'usuario_id' => $user->id,
                'nome_fertilizante' => 'Calcário Dolomítico',
                'preco_pago' => 52.50,
                'unidade_medida' => 'saco',
                'quantidade' => 30,
            ],
            [
                'usuario_id' => $user->id,
                'nome_fertilizante' => 'Ureia Agrícola',
                'preco_pago' => 178.40,
                'unidade_medida' => 'saco',
                'quantidade' => 8,
            ],
            [
                'usuario_id' => $user->id,
                'nome_fertilizante' => 'Adubo Orgânico',
                'preco_pago' => 39.90,
                'unidade_medida' => 'kg',
                'quantidade' => 120,
            ],
            [
                'usuario_id' => $user->id,
                'nome_fertilizante' => 'Fertilizante Foliar',
                'preco_pago' => 84.75,
                'unidade_medida' => 'litro',
                'quantidade' => 25,
            ],
        ];

        $insumosCriados = [];
        foreach ($insumos as $dadosInsumo) {
            $insumosCriados[] = Insumo::updateOrCreate(
                [
                    'usuario_id' => $dadosInsumo['usuario_id'],
                    'nome_fertilizante' => $dadosInsumo['nome_fertilizante'],
                ],
                $dadosInsumo
            );
        }

        foreach ([
            [
                'area_plantio_id' => $areasCriadas[0]->id,
                'insumo_id' => $insumosCriados[0]->id,
                'quantidade_padrao' => 2.5,
            ],
            [
                'area_plantio_id' => $areasCriadas[1]->id,
                'insumo_id' => $insumosCriados[2]->id,
                'quantidade_padrao' => 1.8,
            ],
            [
                'area_plantio_id' => $areasCriadas[2]->id,
                'insumo_id' => $insumosCriados[1]->id,
                'quantidade_padrao' => 3.2,
            ],
            [
                'area_plantio_id' => $areasCriadas[0]->id,
                'insumo_id' => $insumosCriados[4]->id,
                'quantidade_padrao' => 0.8,
            ],
        ] as $vinculoInsumo) {
            DB::table('area_insumo')->updateOrInsert(
                [
                    'area_plantio_id' => $vinculoInsumo['area_plantio_id'],
                    'insumo_id' => $vinculoInsumo['insumo_id'],
                ],
                [
                    'quantidade_padrao' => $vinculoInsumo['quantidade_padrao'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        // 4. Criar Tipos de Sensores
        $sensorTemp = $this->upsertTipoSensor('Temperatura', '°C', $now);
        $sensorUmidAr = $this->upsertTipoSensor('Umidade do Ar', '%', $now);
        $sensorUmidSolo = $this->upsertTipoSensor('Umidade do Solo', '%', $now);
        $sensorPh = $this->upsertTipoSensor('pH', '', $now);
        $sensores = [$sensorTemp, $sensorUmidAr, $sensorUmidSolo, $sensorPh];

        // 4.1 Criar Culturas
        $culturaMorango = $this->upsertCultura('Morango', $now);
        $culturaTomate = $this->upsertCultura('Tomate', $now);
        $culturaMilho = $this->upsertCultura('Milho', $now);

        // 4.2 Relacionar Culturas com Áreas (area_cultura)
        DB::table('area_cultura')->updateOrInsert(
            ['area_plantio_id' => $areasCriadas[0]->id, 'cultura_id' => $culturaMorango->id],
            ['data_plantio' => Carbon::now()->subDays(30), 'data_colheita' => null, 'created_at' => $now, 'updated_at' => $now]
        );
        DB::table('area_cultura')->updateOrInsert(
            ['area_plantio_id' => $areasCriadas[1]->id, 'cultura_id' => $culturaTomate->id],
            ['data_plantio' => Carbon::now()->subDays(45), 'data_colheita' => null, 'created_at' => $now, 'updated_at' => $now]
        );
        DB::table('area_cultura')->updateOrInsert(
            ['area_plantio_id' => $areasCriadas[2]->id, 'cultura_id' => $culturaMilho->id],
            ['data_plantio' => Carbon::now()->subDays(60), 'data_colheita' => null, 'created_at' => $now, 'updated_at' => $now]
        );

        // 4.3 Vincular Parâmetros Ideais (cultura_parametros)
        // Tomate Ideal: Temp (20 a 30), Umidade Solo (60 a 80), pH (6.0 a 6.8)
        $parametros = [
            ['cultura_id' => $culturaTomate->id, 'tipo_sensor_id' => $sensorTemp->id, 'valor_minimo' => 20.0, 'valor_maximo' => 30.0],
            ['cultura_id' => $culturaTomate->id, 'tipo_sensor_id' => $sensorUmidSolo->id, 'valor_minimo' => 60.0, 'valor_maximo' => 80.0],
            ['cultura_id' => $culturaTomate->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 6.0, 'valor_maximo' => 6.8],
            ['cultura_id' => $culturaMorango->id, 'tipo_sensor_id' => $sensorTemp->id, 'valor_minimo' => 15.0, 'valor_maximo' => 25.0],
            ['cultura_id' => $culturaMorango->id, 'tipo_sensor_id' => $sensorUmidSolo->id, 'valor_minimo' => 65.0, 'valor_maximo' => 85.0],
            ['cultura_id' => $culturaMorango->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 5.5, 'valor_maximo' => 6.5],
            ['cultura_id' => $culturaMilho->id, 'tipo_sensor_id' => $sensorTemp->id, 'valor_minimo' => 25.0, 'valor_maximo' => 35.0],
            ['cultura_id' => $culturaMilho->id, 'tipo_sensor_id' => $sensorUmidSolo->id, 'valor_minimo' => 50.0, 'valor_maximo' => 70.0],
            ['cultura_id' => $culturaMilho->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 5.8, 'valor_maximo' => 7.0],
        ];

        foreach ($parametros as $parametro) {
            DB::table('cultura_parametros')->updateOrInsert(
                ['cultura_id' => $parametro['cultura_id'], 'tipo_sensor_id' => $parametro['tipo_sensor_id']],
                [
                    'valor_minimo' => $parametro['valor_minimo'],
                    'valor_maximo' => $parametro['valor_maximo'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        // 5. Criar Equipamentos
        $equipamento = Equipamento::updateOrCreate(
            [
                'usuario_id' => $user->id,
                'mac_address' => 'A1:B2:C3:D4:E5:F6',
            ],
            [
                'nome_apelido' => 'Bastão Principal SoloTrack',
            ]
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

        // 6. Criar Leituras Fakes (20 pacotes de leituras, 1 pacote = 4 sensores = 80 linhas)
        for ($i = 0; $i < 20; $i++) {
            $areaAleatoria = $areasCriadas[array_rand($areasCriadas)];
            $dataLeitura = Carbon::now()->subDays(rand(0, 15))->subHours(rand(0, 24))->subMinutes(rand(0, 60));

            foreach ($sensores as $sensor) {
                $valor = 0;
                switch ($sensor->grandeza) {
                    case 'Temperatura': $valor = rand(220, 360) / 10; break; // 22.0 a 36.0
                    case 'Umidade do Ar': $valor = rand(400, 850) / 10; break; // 40.0 a 85.0
                    case 'Umidade do Solo': $valor = rand(300, 700) / 10; break; // 30.0 a 70.0
                    case 'pH': $valor = rand(55, 75) / 10; break; // 5.5 a 7.5
                }

                // Cria uma chance de 10% de gerar um valor de alerta (anomalia)
                if (rand(1, 100) <= 10) {
                    if ($sensor->grandeza == 'Temperatura') $valor = 40.5;
                    if ($sensor->grandeza == 'Umidade do Solo') $valor = 15.0;
                }

                Leitura::create([
                    'area_plantio_id' => $areaAleatoria->id,
                    'equipamento_id'  => $equipamento->id,
                    'tipo_sensor_id'  => $sensor->id,
                    'valor_lido'      => $valor,
                    'created_at'      => $dataLeitura,
                    'updated_at'      => $dataLeitura,
                ]);
            }
        }

        $this->command->info('Banco populado com sucesso: Usuário, Propriedades, Sensores, Equipamentos e 20 pacotes de leituras EAV!');
    }

    private function upsertTipoSensor(string $grandeza, string $unidadeMedida, Carbon $now)
    {
        DB::table('tipo_sensors')->updateOrInsert(
            ['grandeza' => $grandeza, 'unidade_medida' => $unidadeMedida],
            ['created_at' => $now, 'updated_at' => $now]
        );

        return DB::table('tipo_sensors')
            ->where('grandeza', $grandeza)
            ->where('unidade_medida', $unidadeMedida)
            ->first();
    }

    private function upsertCultura(string $nomeCultura, Carbon $now)
    {
        DB::table('culturas')->updateOrInsert(
            ['nome_cultura' => $nomeCultura],
            ['descricao' => null, 'created_at' => $now, 'updated_at' => $now]
        );

        return DB::table('culturas')
            ->where('nome_cultura', $nomeCultura)
            ->first();
    }
}
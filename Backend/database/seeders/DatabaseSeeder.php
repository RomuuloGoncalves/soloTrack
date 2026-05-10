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
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void

    {
        // 1. Criar Usuário Base
        $user = Usuario::create([
            'nome' => 'usuario',
            'email' => 'a@a.a',
            'password' => bcrypt('asdasdasd'),
            'email_verified_at' => now(),
        ]);

        // 2. Criar Propriedade
        $propriedade = Propriedade::create([
            'nome'             => 'Fazenda SoloTrack',
            'tamanho_hectares' => 150,
            'cidade'           => 'Sorocaba',
            'estado'           => 'SP',
            'latitude'         => '-23.550529',
            'longitude'        => '-46.633308',
        ]);

        DB::table('propriedade_user')->insert([
            'usuario_id'     => $user->id, 
            'propriedade_id' => $propriedade->id,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

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
            $areasCriadas[] = AreaPlantio::create($area);
        }

        // 4. Criar Tipos de Sensores
        $sensorTemp = TipoSensor::create(['grandeza' => 'Temperatura', 'unidade_medida' => '°C']);
        $sensorUmidAr = TipoSensor::create(['grandeza' => 'Umidade do Ar', 'unidade_medida' => '%']);
        $sensorUmidSolo = TipoSensor::create(['grandeza' => 'Umidade do Solo', 'unidade_medida' => '%']);
        $sensorPh = TipoSensor::create(['grandeza' => 'pH', 'unidade_medida' => '']);
        $sensores = [$sensorTemp, $sensorUmidAr, $sensorUmidSolo, $sensorPh];

        // 4.1 Criar Culturas
        $culturaMorango = \App\Models\Cultura::create(['nome_cultura' => 'Morango']);
        $culturaTomate = \App\Models\Cultura::create(['nome_cultura' => 'Tomate']);
        $culturaMilho = \App\Models\Cultura::create(['nome_cultura' => 'Milho']);

        // 4.2 Relacionar Culturas com Áreas (area_cultura)
        DB::table('area_cultura')->insert([
            ['area_plantio_id' => $areasCriadas[0]->id, 'cultura_id' => $culturaMorango->id, 'data_plantio' => Carbon::now()->subDays(30), 'data_colheita' => null],
            ['area_plantio_id' => $areasCriadas[1]->id, 'cultura_id' => $culturaTomate->id, 'data_plantio' => Carbon::now()->subDays(45), 'data_colheita' => null],
            ['area_plantio_id' => $areasCriadas[2]->id, 'cultura_id' => $culturaMilho->id, 'data_plantio' => Carbon::now()->subDays(60), 'data_colheita' => null],
        ]);

        // 4.3 Vincular Parâmetros Ideais (cultura_parametros)
        // Tomate Ideal: Temp (20 a 30), Umidade Solo (60 a 80), pH (6.0 a 6.8)
        DB::table('cultura_parametros')->insert([
            ['cultura_id' => $culturaTomate->id, 'tipo_sensor_id' => $sensorTemp->id, 'valor_minimo' => 20.0, 'valor_maximo' => 30.0],
            ['cultura_id' => $culturaTomate->id, 'tipo_sensor_id' => $sensorUmidSolo->id, 'valor_minimo' => 60.0, 'valor_maximo' => 80.0],
            ['cultura_id' => $culturaTomate->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 6.0, 'valor_maximo' => 6.8],
            
            // Morango Ideal: Temp (15 a 25), Umidade Solo (65 a 85), pH (5.5 a 6.5)
            ['cultura_id' => $culturaMorango->id, 'tipo_sensor_id' => $sensorTemp->id, 'valor_minimo' => 15.0, 'valor_maximo' => 25.0],
            ['cultura_id' => $culturaMorango->id, 'tipo_sensor_id' => $sensorUmidSolo->id, 'valor_minimo' => 65.0, 'valor_maximo' => 85.0],
            ['cultura_id' => $culturaMorango->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 5.5, 'valor_maximo' => 6.5],

            // Milho Ideal: Temp (25 a 35), Umidade Solo (50 a 70), pH (5.8 a 7.0)
            ['cultura_id' => $culturaMilho->id, 'tipo_sensor_id' => $sensorTemp->id, 'valor_minimo' => 25.0, 'valor_maximo' => 35.0],
            ['cultura_id' => $culturaMilho->id, 'tipo_sensor_id' => $sensorUmidSolo->id, 'valor_minimo' => 50.0, 'valor_maximo' => 70.0],
            ['cultura_id' => $culturaMilho->id, 'tipo_sensor_id' => $sensorPh->id, 'valor_minimo' => 5.8, 'valor_maximo' => 7.0],
        ]);

        // 5. Criar Equipamentos
        $equipamento = Equipamento::create([
            'usuario_id' => $user->id,
            'mac_address' => 'A1:B2:C3:D4:E5:F6',
            'nome_apelido' => 'Bastão Principal SoloTrack',
        ]);

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
}
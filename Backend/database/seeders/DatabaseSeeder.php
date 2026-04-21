<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Usuario;
use App\Models\Propriedade;
use App\Models\AreaPlantio;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = Usuario::create([
            'nome' => 'usuario',
            'email' => 'a@a.a',
            'password' => bcrypt('asdasdasd'),
            'email_verified_at' => now(),
        ]);
$propriedade = Propriedade::create([
            'nome'             => 'Fazenda dos Pássaros',
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

        $areas = [
            [
                'propriedade_id'  => $propriedade->id,
                'qr_code_hash'    => Str::uuid()->toString(),
                'nome_area'       => 'Estufa norte',
                'tamanho_area_m2' => '250',
                'latitude'        => '-23.550520',
                'longitude'       => '-46.633309',
            ],
            [
                'propriedade_id'  => $propriedade->id,
                'qr_code_hash'    => Str::uuid()->toString(),
                'nome_area'       => 'Setor Sul',
                'tamanho_area_m2' => '180',
                'latitude'        => '-23.550850',
                'longitude'       => '-46.633100',
            ],
            [
                'propriedade_id'  => $propriedade->id,
                'qr_code_hash'    => Str::uuid()->toString(),
                'nome_area'       => 'Campo Aberto',
                'tamanho_area_m2' => '500',
                'latitude'        => '-23.551200',
                'longitude'       => '-46.634500',
            ],
            [
                'propriedade_id'  => $propriedade->id,
                'qr_code_hash'    => Str::uuid()->toString(),
                'nome_area'       => 'Berçário de Mudas',
                'tamanho_area_m2' => '50',
                'latitude'        => null,
                'longitude'       => null,
            ],
        ];

        foreach ($areas as $area) {
            AreaPlantio::create($area);
        }

        $this->command->info('Banco populado com sucesso: Usuário, Propriedade e Áreas criados!');
    }
}
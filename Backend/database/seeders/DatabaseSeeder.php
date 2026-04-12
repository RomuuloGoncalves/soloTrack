<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criação do usuário específico solicitado
        \App\Models\Usuario::create([
            'nome' => 'usuario',
            'email' => 'a@a.a',
            'password' => bcrypt('asdasdasd'),
            'email_verified_at' => now(),
        ]);

        // Criação de usuários fakes adicionais
        \App\Models\Usuario::factory(10)->create();
    }
}

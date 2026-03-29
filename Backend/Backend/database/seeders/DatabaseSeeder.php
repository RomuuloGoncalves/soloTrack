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
        // Usuario::factory(10)->create();

        // Usuario::factory()->create([
        //     'nome' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $usuarios = [
            ['nome' => 'Ana Silva', 'email' => 'ana.silva@example.com', 'password' => bcrypt('senha123')],
            ['nome' => 'Carlos Santos', 'email' => 'carlos.santos@example.com', 'password' => bcrypt('senha123')],
            ['nome' => 'Beatriz Oliveira', 'email' => 'beatriz.oliveira@example.com', 'password' => bcrypt('senha123')],
            ['nome' => 'Daniel Costa', 'email' => 'daniel.costa@example.com', 'password' => bcrypt('senha123')],
            ['nome' => 'Eduardo Pereira', 'email' => 'eduardo.pereira@example.com', 'password' => bcrypt('senha123')],
            ['nome' => 'Fernanda Lima', 'email' => 'fernanda.lima@example.com', 'password' => bcrypt('senha123')],
            ['nome' => 'Gabriel Souza', 'email' => 'gabriel.souza@example.com', 'password' => bcrypt('senha123')],
            ['nome' => 'Helena Rodrigues', 'email' => 'helena.rodrigues@example.com', 'password' => bcrypt('senha123')],
            ['nome' => 'Igor Almeida', 'email' => 'igor.almeida@example.com', 'password' => bcrypt('senha123')],
            ['nome' => 'Juliana Ferreira', 'email' => 'juliana.ferreira@example.com', 'password' => bcrypt('senha123')],
        ];

        foreach ($usuarios as $usuario) {
            \App\Models\Usuario::create([
                'nome' => $usuario['nome'],
                'email' => $usuario['email'],
                'password' => $usuario['password'],
                'email_verified_at' => now(),
            ]);
        }
    }
}

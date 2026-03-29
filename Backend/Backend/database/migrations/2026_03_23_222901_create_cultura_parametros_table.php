<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cultura_parametros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cultura_id')->constrained()->onDelete('cascade');
            $table->foreignId('tipo_sensor_id')->constrained()->onDelete('cascade');
            $table->decimal('valor_minimo', 10, 2);
            $table->decimal('valor_maximo', 10, 2);
            $table->unique(['cultura_id', 'tipo_sensor_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cultura_parametros');
    }
};

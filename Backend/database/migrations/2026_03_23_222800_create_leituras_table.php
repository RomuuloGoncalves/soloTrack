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
        Schema::create('leituras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_plantio_id')->constrained()->onDelete('cascade');
            $table->foreignId('equipamento_id')->constrained()->onDelete('cascade');
            $table->foreignId('tipo_sensor_id')->constrained()->onDelete('restrict');
            $table->decimal('valor_lido', 10, 4);
            $table->timestamp('data_leitura')->nullable()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leituras');
    }
};

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
        Schema::create('area_plantios', function (Blueprint $table) {
            $table->id();
            $table->id('propriedade_id');
            $table->strind('qr_code_hash');
            $table->string('nome_area');
            $table->decimal('tamanho_area_m2', 10, 2);
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->timestamps();
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('area_plantios');
    }
};

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
            $table->foreignId('propriedade_id')->constrained()->onDelete('cascade');
            $table->string('qr_code_hash')->unique();
            $table->string('nome_area');
            $table->decimal('tamanho_area_m2', 10, 2)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
            $table->softDeletes();
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

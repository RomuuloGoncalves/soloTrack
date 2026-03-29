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
        Schema::create('area_cultura', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_plantio_id')->constrained()->onDelete('cascade');
            $table->foreignId('cultura_id')->constrained()->onDelete('cascade');
            $table->date('data_plantio');
            $table->date('data_colheita')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('area_cultura');
    }
};

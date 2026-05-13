<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('insumos', function (Blueprint $table) {
            $table->decimal('quantidade', 10, 2)->default(0)->after('unidade_medida');
        });
    }

    public function down(): void
    {
        Schema::table('insumos', function (Blueprint $table) {
            $table->dropColumn('quantidade');
        });
    }
};
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AreaPlantio extends Model
{
    protected $fillable = [
        'qr_code_hash',
        'propriedade_id',
        'nome_area',
        'tamanho_area_m2',
        'latitude',
        'longitude',
    ];
}

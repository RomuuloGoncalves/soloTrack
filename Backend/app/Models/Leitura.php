<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leitura extends Model
{
    protected $fillable = [
        'area_id',
        'equipamento_id',
        'tipo_sensor_id',
        'valor_lido',
    ];
}

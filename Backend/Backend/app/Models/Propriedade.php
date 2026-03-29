<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Propriedade extends Model
{
    protected $fillable = [
        'nome',
        'cidade',
        'estado',
        'latitude',
        'longitude',
        'tamanho_hectares',
    ];
}

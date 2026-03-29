<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipamento extends Model
{
    protected $fillable = [
        'usuario_id',
        'mac_address',
        'nome_apelido',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Insumo extends Model
{
    protected $fillable = [
        'usuario_id',
        'nome_fertilizante',
        'preco_pago',
        'unidade_medida',
    ];
}

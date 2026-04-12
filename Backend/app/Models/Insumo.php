<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Insumo extends Model
{
    protected $fillable = [
        'usuario_id',
        'nome_fertilizante',
        'preco_pago',
        'unidade_medida',
    ];

    // ===================== RELACIONAMENTOS =====================

    /**
     * belongsTo porque cada insumo é cadastrado por um único usuário.
     * Um usuário pode cadastrar vários insumos, mas o insumo só tem um dono.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * belongsToMany porque um insumo pode ser aplicado em várias áreas de plantio,
     * e uma área de plantio pode receber vários insumos diferentes.
     * A tabela pivot 'area_insumo' guarda a quantidade padrão de aplicação por área.
     */
    public function areasPlantio(): BelongsToMany
    {
        return $this->belongsToMany(AreaPlantio::class, 'area_insumo', 'insumo_id', 'area_plantio_id')
            ->withPivot('quantidade_padrao')
            ->withTimestamps();
    }
}

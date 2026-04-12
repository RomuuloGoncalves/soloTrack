<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    // ===================== RELACIONAMENTOS =====================

    /**
     * belongsTo porque cada área de plantio pertence a uma única propriedade.
     * Uma propriedade pode ter várias áreas, mas a área só pertence a uma propriedade.
     */
    public function propriedade(): BelongsTo
    {
        return $this->belongsTo(Propriedade::class, 'propriedade_id');
    }

    /**
     * hasMany porque uma área de plantio pode ter várias leituras de sensores,
     * mas cada leitura é registrada em apenas uma área (via area_plantio_id).
     */
    public function leituras(): HasMany
    {
        return $this->hasMany(Leitura::class, 'area_plantio_id');
    }

    /**
     * belongsToMany porque uma área de plantio pode cultivar várias culturas (em épocas diferentes),
     * e uma mesma cultura pode ser plantada em várias áreas.
     * A tabela pivot 'area_cultura' guarda as datas de plantio e colheita de cada cultivo.
     */
    public function culturas(): BelongsToMany
    {
        return $this->belongsToMany(Cultura::class, 'area_cultura', 'area_plantio_id', 'cultura_id')
            ->withPivot('data_plantio', 'data_colheita')
            ->withTimestamps();
    }

    /**
     * belongsToMany porque uma área de plantio pode receber vários insumos,
     * e um insumo pode ser aplicado em várias áreas diferentes.
     * A tabela pivot 'area_insumo' guarda a quantidade padrão de aplicação.
     */
    public function insumos(): BelongsToMany
    {
        return $this->belongsToMany(Insumo::class, 'area_insumo', 'area_plantio_id', 'insumo_id')
            ->withPivot('quantidade_padrao')
            ->withTimestamps();
    }
}

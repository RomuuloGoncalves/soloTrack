<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Cultura extends Model
{
    protected $fillable = [
        'nome',
    ];

    // ===================== RELACIONAMENTOS =====================

    /**
     * belongsToMany porque uma cultura pode ser plantada em várias áreas,
     * e uma área pode cultivar várias culturas ao longo do tempo.
     * A tabela pivot 'area_cultura' guarda as datas de plantio e colheita.
     */
    public function areasPlantio(): BelongsToMany
    {
        return $this->belongsToMany(AreaPlantio::class, 'area_cultura', 'cultura_id', 'area_plantio_id')
            ->withPivot('data_plantio', 'data_colheita')
            ->withTimestamps();
    }

    /**
     * belongsToMany porque uma cultura tem parâmetros ideais para vários tipos de sensores,
     * e um tipo de sensor pode ter parâmetros definidos para várias culturas.
     * A tabela pivot 'cultura_parametros' guarda os valores mínimo e máximo ideais.
     */
    public function tipoSensores(): BelongsToMany
    {
        return $this->belongsToMany(TipoSensor::class, 'cultura_parametros', 'cultura_id', 'tipo_sensor_id')
            ->withPivot('valor_minimo', 'valor_maximo')
            ->withTimestamps();
    }
}

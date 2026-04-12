<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Leitura extends Model
{
    protected $fillable = [
        'area_plantio_id',
        'equipamento_id',
        'tipo_sensor_id',
        'valor_lido',
    ];

    // ===================== RELACIONAMENTOS =====================

    /**
     * belongsTo porque cada leitura é feita em uma única área de plantio.
     * Uma área pode ter várias leituras, mas a leitura pertence a apenas uma área.
     */
    public function areaPlantio(): BelongsTo
    {
        return $this->belongsTo(AreaPlantio::class, 'area_plantio_id');
    }

    /**
     * belongsTo porque cada leitura é feita por um único equipamento.
     * Um equipamento pode gerar várias leituras, mas a leitura vem de apenas um equipamento.
     */
    public function equipamento(): BelongsTo
    {
        return $this->belongsTo(Equipamento::class, 'equipamento_id');
    }

    /**
     * belongsTo porque cada leitura é de um único tipo de sensor (ex: temperatura, umidade).
     * Um tipo de sensor pode ter várias leituras, mas a leitura é de apenas um tipo.
     */
    public function tipoSensor(): BelongsTo
    {
        return $this->belongsTo(TipoSensor::class, 'tipo_sensor_id');
    }
}

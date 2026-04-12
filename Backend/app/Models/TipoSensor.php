<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoSensor extends Model
{
    protected $fillable = [
        'grandeza',
        'unidade_de_medida',
    ];

    // ===================== RELACIONAMENTOS =====================

    /**
     * hasMany porque um tipo de sensor pode gerar várias leituras,
     * mas cada leitura é de apenas um tipo de sensor (via tipo_sensor_id).
     */
    public function leituras(): HasMany
    {
        return $this->hasMany(Leitura::class, 'tipo_sensor_id');
    }

    /**
     * belongsToMany porque um tipo de sensor pode estar conectado em vários equipamentos,
     * e um equipamento pode ter vários tipos de sensores.
     * A tabela pivot 'equipamento_sensor' guarda a porta de conexão física.
     */
    public function equipamentos(): BelongsToMany
    {
        return $this->belongsToMany(Equipamento::class, 'equipamento_sensor', 'tipo_sensor_id', 'equipamento_id')
            ->withPivot('porta_conexao')
            ->withTimestamps();
    }

    /**
     * belongsToMany porque um tipo de sensor pode ter parâmetros ideais definidos para várias culturas,
     * e uma cultura pode definir parâmetros para vários tipos de sensores.
     * A tabela pivot 'cultura_parametros' guarda os valores mínimo e máximo ideais.
     */
    public function culturas(): BelongsToMany
    {
        return $this->belongsToMany(Cultura::class, 'cultura_parametros', 'tipo_sensor_id', 'cultura_id')
            ->withPivot('valor_minimo', 'valor_maximo')
            ->withTimestamps();
    }
}

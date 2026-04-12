<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipamento extends Model
{
    protected $fillable = [
        'usuario_id',
        'mac_address',
        'nome_apelido',
    ];

    // ===================== RELACIONAMENTOS =====================

    /**
     * belongsTo porque cada equipamento pertence a um único usuário.
     * Um usuário pode ter vários equipamentos, mas o equipamento só tem um dono.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * hasMany porque um equipamento pode gerar várias leituras ao longo do tempo,
     * mas cada leitura é feita por apenas um equipamento (via equipamento_id).
     */
    public function leituras(): HasMany
    {
        return $this->hasMany(Leitura::class, 'equipamento_id');
    }

    /**
     * belongsToMany porque um equipamento pode ter vários tipos de sensores conectados,
     * e um tipo de sensor pode estar presente em vários equipamentos.
     * A tabela pivot 'equipamento_sensor' guarda a porta de conexão de cada sensor no equipamento.
     */
    public function tipoSensores(): BelongsToMany
    {
        return $this->belongsToMany(TipoSensor::class, 'equipamento_sensor', 'equipamento_id', 'tipo_sensor_id')
            ->withPivot('porta_conexao')
            ->withTimestamps();
    }
}

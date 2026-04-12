<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    // ===================== RELACIONAMENTOS =====================

    /**
     * belongsToMany porque uma propriedade pode ser acessada por vários usuários,
     * e um usuário pode ter acesso a várias propriedades.
     * A tabela pivot 'propriedade_user' guarda o nível de acesso (ex: 'admin', 'leitor').
     */
    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'propriedade_user', 'propriedade_id', 'usuario_id')
            ->withPivot('nivel_acesso')
            ->withTimestamps();
    }

    /**
     * hasMany porque uma propriedade pode ter várias áreas de plantio,
     * mas cada área de plantio pertence a apenas uma propriedade (via propriedade_id).
     */
    public function areasPlantio(): HasMany
    {
        return $this->hasMany(AreaPlantio::class, 'propriedade_id');
    }
}

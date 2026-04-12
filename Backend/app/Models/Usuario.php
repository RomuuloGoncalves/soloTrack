<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UsuarioFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    /** @use HasFactory<UsuarioFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'usuarios';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ===================== RELACIONAMENTOS =====================

    /**
     * hasMany porque um usuário pode ter vários equipamentos,
     * mas cada equipamento pertence a apenas um usuário (via usuario_id).
     */
    public function equipamentos(): HasMany
    {
        return $this->hasMany(Equipamento::class, 'usuario_id');
    }

    /**
     * hasMany porque um usuário pode cadastrar vários insumos,
     * mas cada insumo pertence a apenas um usuário (via usuario_id).
     */
    public function insumos(): HasMany
    {
        return $this->hasMany(Insumo::class, 'usuario_id');
    }

    /**
     * belongsToMany porque um usuário pode ter acesso a várias propriedades,
     * e uma propriedade pode ser acessada por vários usuários.
     * A tabela pivot 'propriedade_user' guarda o nível de acesso de cada relação.
     */
    public function propriedades(): BelongsToMany
    {
        return $this->belongsToMany(Propriedade::class, 'propriedade_user', 'usuario_id', 'propriedade_id')
            ->withPivot('nivel_acesso')
            ->withTimestamps();
    }
}

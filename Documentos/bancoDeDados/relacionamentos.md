# Relacionamentos do Banco de Dados — SoloTrack

Documentação dos relacionamentos Eloquent definidos nos Models, baseado no DER (Diagrama Entidade-Relacionamento) e nas migrations do projeto.

---

## Visão Geral

O sistema possui **8 tabelas principais** e **4 tabelas pivot** (associativas) que conectam entidades com relações N:N.

### Tabelas Principais
`usuarios`, `propriedades`, `area_plantios`, `equipamentos`, `insumos`, `culturas`, `tipo_sensors`, `leituras`

### Tabelas Pivot (Associativas)
`propriedade_user`, `area_cultura`, `area_insumo`, `equipamento_sensor`, `cultura_parametros`

---

## Diagrama Simplificado das Relações

```
                          ┌─────────────┐
                          │   Usuario   │
                          └──────┬──────┘
                     ┌───────────┼───────────┐
                     │ 1:N       │ N:N       │ 1:N
                     ▼           ▼           ▼
              ┌──────────┐ ┌───────────┐ ┌────────┐
              │Equipament│ │Propriedade│ │ Insumo │
              └────┬─────┘ └─────┬─────┘ └───┬────┘
                   │             │            │
              ┌────┤        1:N  │            │
         N:N  │    │ 1:N         ▼            │ N:N
              ▼    │      ┌────────────┐      │
        ┌──────────┤      │AreaPlantio │◄─────┘
        │TipoSensor│      └──────┬─────┘
        └────┬─────┘        ┌────┼────┐
             │          N:N │ 1:N│    │ N:N
             │ N:N          ▼    │    ▼
             │       ┌────────┐  │  ┌────────┐
             └──────►│Cultura │  │  │ Insumo │
                     └────────┘  │  └────────┘
                                 ▼
                          ┌──────────┐
                          │ Leitura  │
                          └──────────┘
```

---

## Relacionamentos Detalhados

### 1. Usuario ↔ Equipamento (1:N)

| Lado | Tipo | Método |
|---|---|---|
| Usuario | `hasMany` | `equipamentos()` |
| Equipamento | `belongsTo` | `usuario()` |

**Explicação:** Um usuário pode cadastrar vários equipamentos (dispositivos IoT), mas cada equipamento pertence a um único usuário. A FK `usuario_id` na tabela `equipamentos` garante essa ligação direta.

---

### 2. Usuario ↔ Insumo (1:N)

| Lado | Tipo | Método |
|---|---|---|
| Usuario | `hasMany` | `insumos()` |
| Insumo | `belongsTo` | `usuario()` |

**Explicação:** Um usuário pode cadastrar vários insumos/fertilizantes, mas cada insumo é registrado por um único usuário. A FK `usuario_id` na tabela `insumos` faz essa ligação.

---

### 3. Usuario ↔ Propriedade (N:N) — via `propriedade_user`

| Lado | Tipo | Método |
|---|---|---|
| Usuario | `belongsToMany` | `propriedades()` |
| Propriedade | `belongsToMany` | `usuarios()` |

**Tabela Pivot:** `propriedade_user`

| Campo | Descrição |
|---|---|
| `usuario_id` | FK para `usuarios` |
| `propriedade_id` | FK para `propriedades` |
| `nivel_acesso` | Nível de permissão (`'leitor'`, `'admin'`, etc.) |

**Explicação:** Um usuário pode ter acesso a várias propriedades (ex: um agrônomo que gerencia múltiplas fazendas), e uma propriedade pode ser gerenciada por vários usuários (ex: dono + funcionários). O campo `nivel_acesso` na pivot controla o que cada usuário pode fazer naquela propriedade.

---

### 4. Propriedade ↔ AreaPlantio (1:N)

| Lado | Tipo | Método |
|---|---|---|
| Propriedade | `hasMany` | `areasPlantio()` |
| AreaPlantio | `belongsTo` | `propriedade()` |

**Explicação:** Uma propriedade pode ser dividida em várias áreas de plantio (talhões), mas cada área pertence a uma única propriedade. A FK `propriedade_id` na tabela `area_plantios` faz essa ligação. Se a propriedade for deletada, todas as áreas são removidas em cascata.

---

### 5. AreaPlantio ↔ Cultura (N:N) — via `area_cultura`

| Lado | Tipo | Método |
|---|---|---|
| AreaPlantio | `belongsToMany` | `culturas()` |
| Cultura | `belongsToMany` | `areasPlantio()` |

**Tabela Pivot:** `area_cultura`

| Campo | Descrição |
|---|---|
| `area_plantio_id` | FK para `area_plantios` |
| `cultura_id` | FK para `culturas` |
| `data_plantio` | Data em que a cultura foi plantada na área |
| `data_colheita` | Data da colheita (nullable — pode ainda não ter sido colhida) |

**Explicação:** Uma área de plantio pode receber diversas culturas ao longo do tempo (rotação de culturas), e uma mesma cultura pode ser plantada em várias áreas simultaneamente. Os campos de data na pivot permitem rastrear o histórico de cada ciclo de cultivo.

---

### 6. AreaPlantio ↔ Insumo (N:N) — via `area_insumo`

| Lado | Tipo | Método |
|---|---|---|
| AreaPlantio | `belongsToMany` | `insumos()` |
| Insumo | `belongsToMany` | `areasPlantio()` |

**Tabela Pivot:** `area_insumo`

| Campo | Descrição |
|---|---|
| `area_plantio_id` | FK para `area_plantios` |
| `insumo_id` | FK para `insumos` |
| `quantidade_padrao` | Quantidade padrão de aplicação do insumo na área |

**Explicação:** Uma área pode receber vários insumos diferentes (NPK, calcário, etc.), e um mesmo insumo pode ser aplicado em várias áreas. A `quantidade_padrao` na pivot define a dosagem recomendada daquele insumo para aquela área específica.

---

### 7. AreaPlantio ↔ Leitura (1:N)

| Lado | Tipo | Método |
|---|---|---|
| AreaPlantio | `hasMany` | `leituras()` |
| Leitura | `belongsTo` | `areaPlantio()` |

**Explicação:** Uma área de plantio pode ter centenas de leituras de sensores ao longo do tempo, mas cada leitura é registrada em apenas uma área. A FK `area_plantio_id` na tabela `leituras` identifica onde a leitura foi feita.

---

### 8. Equipamento ↔ Leitura (1:N)

| Lado | Tipo | Método |
|---|---|---|
| Equipamento | `hasMany` | `leituras()` |
| Leitura | `belongsTo` | `equipamento()` |

**Explicação:** Um equipamento pode gerar várias leituras ao longo do tempo (cada vez que mede algo), mas cada leitura é produzida por um único equipamento. A FK `equipamento_id` na tabela `leituras` identifica qual dispositivo fez a medição.

---

### 9. Equipamento ↔ TipoSensor (N:N) — via `equipamento_sensor`

| Lado | Tipo | Método |
|---|---|---|
| Equipamento | `belongsToMany` | `tipoSensores()` |
| TipoSensor | `belongsToMany` | `equipamentos()` |

**Tabela Pivot:** `equipamento_sensor`

| Campo | Descrição |
|---|---|
| `equipamento_id` | FK para `equipamentos` |
| `tipo_sensor_id` | FK para `tipo_sensors` |
| `porta_conexao` | Porta física onde o sensor está conectado no equipamento |

**Explicação:** Um equipamento (ex: ESP32) pode ter vários sensores conectados (temperatura, umidade, pH), e um mesmo tipo de sensor pode estar presente em vários equipamentos. A `porta_conexao` na pivot identifica em qual pino/porta física o sensor está plugado.

---

### 10. TipoSensor ↔ Leitura (1:N)

| Lado | Tipo | Método |
|---|---|---|
| TipoSensor | `hasMany` | `leituras()` |
| Leitura | `belongsTo` | `tipoSensor()` |

**Explicação:** Um tipo de sensor (ex: sensor de umidade) pode ter milhares de leituras registradas, mas cada leitura é de apenas um tipo de sensor. A FK `tipo_sensor_id` na tabela `leituras` identifica qual grandeza foi medida. O `onDelete` é `restrict` para impedir a exclusão de um tipo de sensor que já possui leituras.

---

### 11. Cultura ↔ TipoSensor (N:N) — via `cultura_parametros`

| Lado | Tipo | Método |
|---|---|---|
| Cultura | `belongsToMany` | `tipoSensores()` |
| TipoSensor | `belongsToMany` | `culturas()` |

**Tabela Pivot:** `cultura_parametros`

| Campo | Descrição |
|---|---|
| `cultura_id` | FK para `culturas` |
| `tipo_sensor_id` | FK para `tipo_sensors` |
| `valor_minimo` | Valor mínimo ideal para a cultura naquele tipo de sensor |
| `valor_maximo` | Valor máximo ideal para a cultura naquele tipo de sensor |

**Explicação:** Cada cultura tem faixas ideais para diferentes grandezas (ex: soja precisa de pH entre 6.0 e 7.0, temperatura entre 20°C e 30°C), e cada tipo de sensor pode ter parâmetros definidos para várias culturas. Isso permite ao sistema alertar quando uma leitura está fora da faixa ideal para a cultura daquela área.

---

## Tabela Resumo Completa

| Model | Método | Tipo | Destino | Pivot | Campos Pivot |
|---|---|---|---|---|---|
| **Usuario** | `equipamentos()` | `hasMany` | Equipamento | — | — |
| **Usuario** | `insumos()` | `hasMany` | Insumo | — | — |
| **Usuario** | `propriedades()` | `belongsToMany` | Propriedade | `propriedade_user` | `nivel_acesso` |
| **Propriedade** | `usuarios()` | `belongsToMany` | Usuario | `propriedade_user` | `nivel_acesso` |
| **Propriedade** | `areasPlantio()` | `hasMany` | AreaPlantio | — | — |
| **AreaPlantio** | `propriedade()` | `belongsTo` | Propriedade | — | — |
| **AreaPlantio** | `leituras()` | `hasMany` | Leitura | — | — |
| **AreaPlantio** | `culturas()` | `belongsToMany` | Cultura | `area_cultura` | `data_plantio`, `data_colheita` |
| **AreaPlantio** | `insumos()` | `belongsToMany` | Insumo | `area_insumo` | `quantidade_padrao` |
| **Equipamento** | `usuario()` | `belongsTo` | Usuario | — | — |
| **Equipamento** | `leituras()` | `hasMany` | Leitura | — | — |
| **Equipamento** | `tipoSensores()` | `belongsToMany` | TipoSensor | `equipamento_sensor` | `porta_conexao` |
| **Insumo** | `usuario()` | `belongsTo` | Usuario | — | — |
| **Insumo** | `areasPlantio()` | `belongsToMany` | AreaPlantio | `area_insumo` | `quantidade_padrao` |
| **Cultura** | `areasPlantio()` | `belongsToMany` | AreaPlantio | `area_cultura` | `data_plantio`, `data_colheita` |
| **Cultura** | `tipoSensores()` | `belongsToMany` | TipoSensor | `cultura_parametros` | `valor_minimo`, `valor_maximo` |
| **TipoSensor** | `leituras()` | `hasMany` | Leitura | — | — |
| **TipoSensor** | `equipamentos()` | `belongsToMany` | Equipamento | `equipamento_sensor` | `porta_conexao` |
| **TipoSensor** | `culturas()` | `belongsToMany` | Cultura | `cultura_parametros` | `valor_minimo`, `valor_maximo` |
| **Leitura** | `areaPlantio()` | `belongsTo` | AreaPlantio | — | — |
| **Leitura** | `equipamento()` | `belongsTo` | Equipamento | — | — |
| **Leitura** | `tipoSensor()` | `belongsTo` | TipoSensor | — | — |

---

## Regras de Deleção (onDelete)

| Tabela | FK | onDelete | Motivo |
|---|---|---|---|
| `equipamentos` | `usuario_id` | `cascade` | Se deletar o usuário, os equipamentos dele não fazem sentido sozinhos |
| `insumos` | `usuario_id` | `cascade` | Insumos são cadastrados pelo usuário, sem ele não há dono |
| `area_plantios` | `propriedade_id` | `cascade` | Áreas pertencem à propriedade, sem ela não existem |
| `leituras` | `area_plantio_id` | `cascade` | Leituras são da área, sem a área perdem o contexto |
| `leituras` | `equipamento_id` | `cascade` | Leituras vieram do equipamento, sem ele perdem a origem |
| `leituras` | `tipo_sensor_id` | `restrict` | **Impede** deletar um tipo de sensor que já tem leituras registradas |
| `propriedade_user` | ambas FKs | `cascade` | Se deletar o usuário ou propriedade, a associação é removida |
| `area_cultura` | ambas FKs | `cascade` | Se deletar a área ou cultura, o vínculo é removido |
| `area_insumo` | ambas FKs | `cascade` | Se deletar a área ou insumo, o vínculo é removido |
| `equipamento_sensor` | ambas FKs | `cascade` | Se deletar o equipamento ou tipo de sensor, o vínculo é removido |
| `cultura_parametros` | ambas FKs | `cascade` | Se deletar a cultura ou tipo de sensor, os parâmetros são removidos |

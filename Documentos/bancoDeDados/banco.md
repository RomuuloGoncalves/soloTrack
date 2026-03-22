# Estrutura do Banco de Dados Modular (SoloTrack)

## 1. Tabelas Normais (Entidades Principais)

### `usuario`
*Armazena as credenciais de acesso ao sistema.*
* **id** (BIGINT, Primary Key, Auto-Increment)
* **nome** (VARCHAR) - Nome completo do usuário
* **email** (VARCHAR, Unique) - E-mail para login
* **password** (VARCHAR) - Senha criptografada
* **created_at** / **updated_at** (TIMESTAMP)

### `propriedades`
*Armazena os dados físicos, geográficos e as coordenadas centrais da propriedade.*
* **id** (BIGINT, Primary Key, Auto-Increment)
* **nome** (VARCHAR) - Nome da propriedade (Ex: Sítio São João)
* **cidade** (VARCHAR) - Base para a API de clima e Benchmarking
* **estado** (VARCHAR) - Base para Benchmarking Regional
* **latitude** (DECIMAL 10,8, Nullable) - Coordenada GPS exata (Eixo Y)
* **longitude** (DECIMAL 11,8, Nullable) - Coordenada GPS exata (Eixo X)
* **tamanho_hectares** (DECIMAL) - Área total da fazenda
* **created_at** / **updated_at** (TIMESTAMP)

### `areas_plantio`
*Os canteiros, estufas ou talhões onde o sensor fará as leituras.*
* **id** (BIGINT, Primary Key, Auto-Increment)
* **propriedade_id** (BIGINT, Foreign Key) - A qual fazenda pertence
* **nome_area** (VARCHAR) - Nome do canteiro (Ex: Estufa 1)
* **tamanho_area_m2** (DECIMAL) - Tamanho específico da área
* **latitude** / **longitude** (DECIMAL, Nullable) - Coordenadas exatas do canteiro
* **qr_code_hash** (VARCHAR, Unique) - Código único gerado para a etiqueta
* **created_at** / **updated_at** (TIMESTAMP)

### `culturas`
*O cadastro base da planta. Os limites químicos não ficam mais aqui, foram movidos para uma tabela relacional para garantir a modularidade.*
* **id** (BIGINT, Primary Key, Auto-Increment)
* **nome_cultura** (VARCHAR) - Ex: Tomate, Milho, Alface
* **created_at** / **updated_at** (TIMESTAMP)

### `tipos_sensores` (NOVA TABELA)
*O catálogo de grandezas que o sistema é capaz de medir. Se no futuro quiser medir temperatura do ar, basta adicionar uma linha aqui, sem mexer no código do banco.*
* **id** (BIGINT, Primary Key, Auto-Increment)
* **grandeza** (VARCHAR) - Ex: Nitrogênio, Fósforo, Potássio, pH, Umidade do Solo, Temperatura
* **unidade_medida** (VARCHAR) - Ex: mg/kg, pH, %, °C
* **created_at** / **updated_at** (TIMESTAMP)

### `insumos`
*Catálogo privado de fertilizantes do usuário para o cálculo de impacto financeiro.*
* **id** (BIGINT, Primary Key, Auto-Increment)
* **user_id** (BIGINT, Foreign Key) - Dono do insumo
* **nome_fertilizante** (VARCHAR) - Ex: NPK 10-10-10, Ureia
* **preco_pago** (DECIMAL 10,2) - Valor monetário pago
* **unidade_medida** (VARCHAR) - Ex: Saco 50kg, Tonelada
* **created_at** / **updated_at** (TIMESTAMP)

### `equipamentos`
*Registro do hardware central (ESP32) para garantir segurança e rastreabilidade.*
* **id** (BIGINT, Primary Key, Auto-Increment)
* **user_id** (BIGINT, Foreign Key) - Produtor dono do hardware
* **mac_address** (VARCHAR 17, Unique) - Endereço MAC do Bluetooth (Ex: A1:B2:C3:D4:E5:F6)
* **nome_apelido** (VARCHAR) - Ex: Bastão Principal
* **created_at** / **updated_at** (TIMESTAMP)

### `leituras` (ATUALIZADA PARA O MODELO EAV)
*Tabela transacional. Agora guarda um único valor por linha, permitindo infinitos tipos de sensores.*
* **id** (BIGINT, Primary Key, Auto-Increment)
* **area_id** (BIGINT, Foreign Key) - Em qual canteiro foi lido
* **equipamento_id** (BIGINT, Foreign Key) - Qual ESP32 centralizou a leitura
* **tipo_sensor_id** (BIGINT, Foreign Key) - Qual grandeza está sendo medida nesta linha
* **valor_lido** (DECIMAL) - O número captado (Ex: 40.5)
* **created_at** (TIMESTAMP) - Data/Hora exata da coleta
* **updated_at** (TIMESTAMP)

---

## 2. Tabelas Relacionais (Pivot / Relacionamentos N:M)

### `cultura_parametros` (NOVA TABELA PIVOT)
*Substitui as colunas fixas da tabela culturas. Define qual é o limite ideal de cada sensor para cada planta.*
* **Explicação do Relacionamento:** Uma cultura (Tomate) possui vários parâmetros de sensores (Umidade, Nitrogênio), e cada parâmetro define seu limite aceitável.
* **cultura_id** (BIGINT, Foreign Key)
* **tipo_sensor_id** (BIGINT, Foreign Key)
* **valor_minimo** (DECIMAL) - Limite inferior aceitável para a planta
* **valor_maximo** (DECIMAL) - Limite superior aceitável para a planta
* *(Primary Key Composta: cultura_id + tipo_sensor_id)*

### `equipamento_sensor` (NOVA TABELA PIVOT)
*Mapeamento lógico de qual sensor está plugado em qual ESP32 naquele momento.*
* **Explicação do Relacionamento:** Um hardware central (ESP32) pode ter vários sensores espetados nele.
* **equipamento_id** (BIGINT, Foreign Key)
* **tipo_sensor_id** (BIGINT, Foreign Key)
* **porta_conexao** (VARCHAR) - Onde fisicamente o fio foi ligado (Ex: Pino_34, I2C, Porta Analógica 1)
* *(Primary Key Composta: equipamento_id + tipo_sensor_id)*

### `propriedade_usuario`
*Liga os usuários às fazendas, permitindo múltiplos acessos (donos e técnicos).*
* **propriedade_id** (BIGINT, Foreign Key)
* **user_id** (BIGINT, Foreign Key)
* **nivel_acesso** (ENUM) - Ex: 'admin' (Dono), 'leitor' (Técnico)
* *(Primary Key Composta: propriedade_id + user_id)*

### `area_cultura`
*Histórico de plantio. Liga a Área à Cultura ao longo do tempo (rotação de culturas).*
* **id** (BIGINT, Primary Key, Auto-Increment)
* **area_id** (BIGINT, Foreign Key)
* **cultura_id** (BIGINT, Foreign Key)
* **data_plantio** (DATE) - Data de início do cultivo
* **data_colheita** (DATE, Nullable) - Data de fim (Nulo = cultivo atual)
* **created_at** / **updated_at** (TIMESTAMP)

### `area_insumo`
*Liga a Área aos Insumos cadastrados, definindo a "receita" de adubação daquele canteiro.*
* **area_id** (BIGINT, Foreign Key)
* **insumo_id** (BIGINT, Foreign Key)
* **quantidade_padrao** (DECIMAL) - Quantidade padrão utilizada na área
* *(Primary Key Composta: area_id + insumo_id)*
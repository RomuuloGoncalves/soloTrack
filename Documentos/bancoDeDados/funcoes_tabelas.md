# Documentação do Banco de Dados: Arquitetura Modular IoT (SoloTrack)

Esta documentação descreve a modelagem do banco de dados relacional (MySQL) para o sistema SoloTrack. A arquitetura utiliza o padrão **EAV (Entity-Attribute-Value)** para a tabela de leituras, garantindo que o sistema seja 100% modular e capaz de receber novos tipos de sensores no futuro sem necessidade de alterar a estrutura do banco.

---

## 1. Cadastros Base (Entidades Principais)

### `users`
**O que faz:** Armazena os dados de quem acessa o sistema (produtores, administradores, agrônomos).
**Exemplo Prático (Como fica no banco):**
| id | nome | email | password |
| :--- | :--- | :--- | :--- |
| 1 | Carlos Silva | carlos@fazenda.com | *hash_secreto* |
| 2 | João Agrônomo | joao@consultoria.com | *hash_secreto* |

### `propriedades`
**O que faz:** Guarda a representação física da fazenda como um todo. Possui latitude e longitude centrais para visualização em mapas regionais.
**Exemplo Prático:**
| id | nome | cidade | estado | latitude | longitude |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 10 | Sítio São João | Tatuí | SP | -23.3333 | -47.8500 |

### `areas_plantio`
**O que faz:** Divide a fazenda em pedaços menores (estufas, canteiros). É a tabela que gera o QR Code e possui coordenadas específicas para mapas de calor detalhados.
**Exemplo Prático:**
| id | propriedade_id | nome_area | qr_code_hash | latitude | longitude |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 105 | 10 | Estufa 1 - Norte | *abc123xyz* | -23.3334 | -47.8501 |
| 106 | 10 | Horta Sul | *def456uvw* | -23.3338 | -47.8505 |

### `culturas`
**O que faz:** O dicionário base do que pode ser plantado. (Os limites químicos ficam em uma tabela separada para garantir a modularidade).
**Exemplo Prático:**
| id | nome_cultura |
| :--- | :--- |
| 1 | Tomate |
| 2 | Milho |

### `insumos`
**O que faz:** O catálogo financeiro de cada produtor. Serve para a IA e o sistema calcularem em Reais (R$) a economia gerada.
**Exemplo Prático:**
| id | user_id | nome_fertilizante | preco_pago | unidade_medida |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | NPK 10-10-10 | 180.50 | Saco 50kg |
| 2 | 1 | Ureia | 210.00 | Saco 50kg |

---

## 2. O Coração Modular (Hardware e IoT)



### `equipamentos`
**O que faz:** Representa a placa central de processamento (o ESP32). A identificação é feita via MAC Address pelo Bluetooth, garantindo que o sistema saiba de quem é a leitura.
**Exemplo Prático:**
| id | user_id | mac_address | nome_apelido |
| :--- | :--- | :--- | :--- |
| 5 | 1 | A1:B2:C3:D4:E5:F6 | Bastão Principal |

### `tipos_sensores`
**O que faz:** É o "Catálogo/Cardápio" do sistema. Diz para a aplicação QUAIS grandezas físicas o sistema entende. Para adicionar medição de temperatura no futuro, basta inserir uma linha aqui.
**Exemplo Prático:**
| id | grandeza | unidade_medida |
| :--- | :--- | :--- |
| 1 | Nitrogênio (N) | mg/kg |
| 2 | Fósforo (P) | mg/kg |
| 3 | Potássio (K) | mg/kg |
| 4 | Umidade do Solo | % |

---

## 3. A Transação (Onde os dados da roça vivem)

### `leituras` (Padrão EAV)
**O que faz:** A tabela mais importante do sistema. Em vez de ter colunas engessadas, ela empilha cada valor lido em uma nova linha, apontando para o catálogo de `tipos_sensores`.
**Exemplo Prático (O ESP32 enviou um pacote de dados da Estufa 1):**
| id | area_id | equipamento_id | tipo_sensor_id | valor_lido | data_coleta |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 5001 | 105 | 5 | **1** *(Nitrogênio)* | 40.0 | 22/03/2026 08:00 |
| 5002 | 105 | 5 | **2** *(Fósforo)* | 15.5 | 22/03/2026 08:00 |
| 5003 | 105 | 5 | **3** *(Potássio)* | 80.0 | 22/03/2026 08:00 |
| 5004 | 105 | 5 | **4** *(Umidade)* | 65.0 | 22/03/2026 08:00 |
*Nota: A leitura gerou 4 linhas no banco, permitindo filtrar e cruzar dados com facilidade.*

---

## 4. Tabelas Relacionais (As "Pontes" / Pivot)

### `propriedade_user`
**O que faz:** Permite que uma fazenda seja vista por várias pessoas (O dono Carlos e o agrônomo João).
**Exemplo Prático:**
| propriedade_id | user_id | nivel_acesso |
| :--- | :--- | :--- |
| 10 | 1 | admin |
| 10 | 2 | leitor |

### `area_cultura`
**O que faz:** Mantém a linha do tempo do que foi plantado. Se a colheita acabar, a data de fim é preenchida e uma nova linha é criada para a próxima safra.
**Exemplo Prático:**
| area_id | cultura_id | data_plantio | data_colheita |
| :--- | :--- | :--- | :--- |
| 105 | 1 *(Tomate)* | 01/01/2026 | 01/03/2026 |
| 105 | 2 *(Milho)* | 05/03/2026 | *NULL* *(Atual)* |

### `cultura_parametros`
**O que faz:** A "Receita do Bolo". Cruza o tipo de planta com os sensores, definindo qual o número ideal que o sensor deve ler para aquela planta estar saudável.
**Exemplo Prático (O Tomate precisa desses níveis):**
| cultura_id | tipo_sensor_id | valor_minimo | valor_maximo |
| :--- | :--- | :--- | :--- |
| 1 *(Tomate)* | 1 *(Nitrogênio)* | 30.0 | 50.0 |
| 1 *(Tomate)* | 4 *(Umidade)* | 60.0 | 80.0 |

### `equipamento_sensor`
**O que faz:** O mapeamento físico. Diz ao sistema qual componente está espetado em qual porta do hardware ESP32.
**Exemplo Prático:**
| equipamento_id | tipo_sensor_id | porta_conexao |
| :--- | :--- | :--- |
| 5 | 1 *(Nitrogênio)* | RS485 |
| 5 | 4 *(Umidade)* | Porta_Analógica_34 |

### `area_insumo`
**O que faz:** Vincula qual adubo o usuário costuma usar em qual estufa, e qual a quantidade padrão, para gerar o cálculo de gastos futuros.
**Exemplo Prático:**
| area_id | insumo_id | quantidade_padrao |
| :--- | :--- | :--- |
| 105 | 1 *(NPK)* | 10.0 |
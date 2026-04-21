# Manual Completo: Integracao de IA e Protocolo MCP (SoloTrack)

Este documento e a unica referencia sobre a integracao de Inteligencia Artificial no SoloTrack.
Ele explica o conceito geral do protocolo, o motivo da criacao de cada arquivo, a logica de
funcionamento de cada funcao, cada parametro e as justificativas tecnicas das decisoes de implementacao.

---

## 1. Por Que a IA Precisa do Protocolo MCP?

Modelos de Inteligencia Artificial como o Google Gemini possuem conhecimento geral gerado a partir
de bilhoes de textos publicos da internet. Entretanto, eles nao possuem, e nunca irao possuir,
conhecimento sobre os dados privados do seu sistema.

Isso significa que, sem integracao, voce nao pode perguntar para a IA:
- "Quantos usuarios temos cadastrados?"
- "Quais sao os dados do usuario Joao?"
- "Quantas fazendas estao registradas no sistema?"

A IA simplesmente nao sabe. Ela esta isolada no servidor do Google.

O **Protocolo MCP (Model Context Protocol)** e o conjunto de regras que cria uma ponte controlada
entre a IA e o banco de dados do SoloTrack. Essa ponte funciona da seguinte forma: a IA nao acessa
o banco diretamente, ela "pede" ao servidor do SoloTrack que busque os dados por ela. O servidor
decide se permite ou nao, busca os dados, e os entrega para a IA formatar e responder ao usuario.

Isso garante seguranca (a IA nunca ve mais do que deve) e organizacao (cada tipo de dado e uma
ferramenta separada).

Com a evolucao do sistema, as ferramentas passaram a nao apenas **consultar** dados, mas tambem
**criar** novos registros. Isso significa que o usuario pode pedir para a IA, em linguagem natural,
coisas como "Crie uma propriedade chamada Fazenda Norte em Sao Paulo" ou "Adicione uma area de
plantio chamada Talhao Sul na minha fazenda", e a IA vai executar essas acoes diretamente no banco.

---

## 2. Arquitetura do Sistema

O sistema e composto por tres camadas:

- **Frontend (React):** A interface onde o usuario digita e le as respostas.
- **Backend (Laravel):** O servidor que recebe a pergunta, conversa com a IA e executa as
  ferramentas de banco de dados.
- **API do Google Gemini:** O modelo de IA externo que processa linguagem natural e decide quando
  e necessario buscar ou criar dados no sistema.

---

## 3. Detalhamento de Cada Arquivo

---

### 3.1. config/services.php

**Motivo da criacao:** O Laravel utiliza o arquivo `config/services.php` como o repositorio
central de credenciais de servicos externos (ex: pagamentos, e-mail, IA). Ao registrar o Gemini
aqui, a chave de API fica acessivel em qualquer parte do projeto atraves da funcao
`config('services.gemini.key')`, sem que a chave seja escrita diretamente no codigo-fonte.

**Codigo relevante:**

```php
'gemini' => [
    'key' => env('GEMINI_API_KEY'),
],
```

- **`'gemini'`:** E o identificador do servico. Pode ser qualquer nome, mas deve ser unico dentro
  do array de servicos.
- **`'key'`:** E o nome do campo que armazena a chave de API.
- **`env('GEMINI_API_KEY')`:** A funcao `env()` le o valor da variavel `GEMINI_API_KEY` do arquivo
  `.env`. Isso significa que a chave real nunca fica no codigo — ela fica em um arquivo separado que
  nao e versionado pelo Git.

---

### 3.2. routes/api.php

**Motivo da modificacao:** Para que o frontend possa enviar mensagens para o sistema de IA, e
necessario existir um "endereco" (rota) no servidor que receba essa requisicao.

**Codigo relevante:**

```php
Route::post('/mcp/chat', [ChatController::class, 'chat']);
```

- **`Route::post`:** Define que esta rota so aceita requisicoes do tipo `POST`. Utilizamos `POST`
  (e nao `GET`) porque mensagens de chat podem ser longas e conter o historico completo da conversa,
  o que nao caberia em uma URL.
- **`'/mcp/chat'`:** O caminho da rota. O prefixo `/api` e adicionado automaticamente pelo Laravel
  para todas as rotas do arquivo `api.php`, entao o endereco final e `POST /api/mcp/chat`.
- **`[ChatController::class, 'chat']`:** Instrui o Laravel a chamar o metodo `chat()` dentro da
  classe `ChatController` quando esta rota for acessada.

---

### 3.3. app/Services/GeminiService.php

**Motivo da criacao:** E necessario um componente dedicado exclusivamente a comunicacao com a API
externa do Google. Centralizar essa logica em um "Servico" e uma boa pratica que facilita a
manutencao. Se o Google mudar a URL da API ou o formato do payload, so e necessario alterar este
arquivo.

**Codigo completo e explicado:**

```php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
```

- **`namespace App\Services`:** Define o "endereco" desta classe dentro do projeto. O Laravel usa
  namespaces para encontrar arquivos sem precisar de caminhos absolutos.
- **`use Illuminate\Support\Facades\Http`:** Importa o cliente HTTP do Laravel, que e a ferramenta
  usada para fazer requisicoes para a API do Google.
- **`use Illuminate\Support\Facades\Log`:** Importa o sistema de logs do Laravel para registrar
  erros da API no arquivo `storage/logs/laravel.log`.

```php
protected string $apiKey;
protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';
```

- **`$apiKey`:** Propriedade que armazenara a chave de API lida do arquivo de configuracao.
- **`$baseUrl`:** E o endereco completo da API do Google Gemini.
  - **`v1beta`:** Esta versao da API e obrigatoria para suportar o recurso de ferramentas (Function
    Calling) e as assinaturas de pensamento (Thought Signatures) do Gemini 3.1. A versao `v1` (sem
    `beta`) nao suporta esses recursos.
  - **`gemini-3.1-flash-lite-preview`:** E o modelo selecionado. O sufixo `flash-lite` indica a
    versao mais rapida e economica do modelo, que e a recomendada para tarefas agenticas no plano
    gratuito.
  - **`:generateContent`:** E o endpoint especifico da API que gera respostas de texto.

```php
public function __construct()
{
    $this->apiKey = config('services.gemini.key');
}
```

- **`__construct()`:** E executado automaticamente quando o Laravel instancia esta classe. Ele le a
  chave do Gemini do arquivo `config/services.php` e a armazena na propriedade `$apiKey`.

```php
public function chat(array $messages, array $tools = [])
```

- **`$messages`:** Array com o historico completo da conversa. Cada item do array e um objeto com
  os campos `role` (quem disse) e `parts` (o que foi dito). A IA usa esse historico para entender
  o contexto antes de responder.
- **`$tools = []`:** Array com as definicoes de ferramentas que a IA pode usar. O valor padrao e
  um array vazio (`[]`), tornando as ferramentas opcionais. Quando preenchido, a IA sabe que pode
  "pedir" ao servidor para executar funcoes especificas.

```php
$payload = [
    'contents' => $messages,
];

if (!empty($tools)) {
    $payload['tools'] = [
        ['function_declarations' => $tools]
    ];
}
```

- **`'contents'`:** Campo obrigatorio pela API do Google. Contem o historico de mensagens.
- **`'tools'`:** Campo adicionado apenas se houver ferramentas. Contem o campo
  `function_declarations`, que e o formato especifico que o Google exige para declarar as funcoes
  disponiveis para a IA.
- **`['function_declarations' => $tools]`:** O Google exige que a lista de funcoes esteja aninhada
  dentro de um array de objetos de ferramentas. Esse formato permite que no futuro sejam adicionados
  outros tipos de ferramentas alem de funcoes.

```php
$response = Http::withHeaders([
    'Content-Type' => 'application/json',
])->post($this->baseUrl . '?key=' . $this->apiKey, $payload);
```

- **`Http::withHeaders`:** Adiciona cabecalhos HTTP a requisicao. O cabecalho `Content-Type:
  application/json` informa ao Google que o corpo da requisicao esta no formato JSON.
- **`->post(...)`:** Realiza a requisicao HTTP do tipo POST.
- **`$this->baseUrl . '?key=' . $this->apiKey`:** Concatena a URL base com a chave de API como
  parametro de URL. O Google Gemini exige autenticacao por parametro de URL (`?key=`), e nao por
  cabecalho de autorizacao.

```php
if ($response->failed()) {
    Log::error('Gemini API Error: ' . $response->body());
    throw new \Exception('Erro ao comunicar com a IA: ' . $response->json('error.message', 'Erro desconhecido'));
}
```

- **`$response->failed()`:** Retorna `true` se o servidor respondeu com um codigo de erro HTTP
  (4xx ou 5xx), como `429` (cota excedida) ou `404` (modelo nao encontrado).
- **`Log::error(...)`:** Registra o corpo completo do erro no arquivo de log para facilitar o
  diagnostico.
- **`throw new \Exception(...)`:** Lanca uma excecao que sera capturada pelo `ChatController`,
  que ira retornar a mensagem de erro ao frontend.
- **`$response->json('error.message', 'Erro desconhecido')`:** Extrai o campo `error.message` do
  JSON de resposta do Google. O segundo parametro (`'Erro desconhecido'`) e o valor padrao caso
  o campo nao exista.

---

### 3.4. app/Mcp/Tools/ListarUsuariosTool.php

**Motivo da criacao:** Para que a IA possa consultar a lista de usuarios, e necessario existir um
componente que saiba: (a) como explicar essa capacidade para a IA, e (b) como realmente buscar os
dados no banco. Essa separacao em arquivo proprio garante que adicionar uma nova ferramenta (ex:
listar colheitas) seja tao simples quanto criar um novo arquivo com a mesma estrutura.

**Codigo completo e explicado:**

```php
namespace App\Mcp\Tools;

use App\Models\Usuario;
```

- **`namespace App\Mcp\Tools`:** Define a localizacao logica da classe. O diretorio `Mcp/Tools`
  foi criado especificamente para organizar todas as ferramentas do protocolo MCP.
- **`use App\Models\Usuario`:** Importa o Model Eloquent `Usuario`, que e a interface entre o PHP
  e a tabela `usuarios` do banco de dados.

```php
public static function definition(): array
{
    return [
        'name' => 'listar_usuarios',
        'description' => 'Retorna a lista de todos os usuários cadastrados no sistema SoloTrack para análise.',
        'parameters' => [
            'type' => 'object',
            'properties' => (object) [],
        ],
    ];
}
```

- **`static`:** O metodo e estatico, o que significa que pode ser chamado sem criar uma instancia
  da classe (`ListarUsuariosTool::definition()` em vez de `new ListarUsuariosTool()->definition()`).
  Isso e mais eficiente para funcoes utilitarias que nao dependem de estado interno.
- **`'name' => 'listar_usuarios'`:** E o identificador da funcao. A IA usa exatamente este nome
  quando decide que quer chamar a ferramenta. O `ChatController` tambem usa este nome para saber
  qual codigo executar.
- **`'description'`:** E a instrucao em linguagem natural para a IA. O modelo le este texto para
  decidir quando usar esta ferramenta. Uma descricao clara e objetiva e essencial para que a IA
  utilize a ferramenta no momento certo.
- **`'parameters'`:** Descreve os dados de entrada que a funcao aceita. Mesmo que esta ferramenta
  nao precise de nenhum parametro de entrada, o campo `parameters` precisa existir com um `type`
  e `properties` para que a API do Google valide o esquema corretamente.
- **`'properties' => (object) []`:** O cast `(object)` converte o array vazio `[]` em um objeto
  PHP. Isso garante que o `json_encode` do PHP gere `{}` (objeto JSON vazio) e nao `[]` (lista
  JSON vazia). O Google exige `{}` neste campo — enviar `[]` causa erro de validacao.

```php
public static function execute(array $args = [])
{
    return Usuario::all()->toArray();
}
```

- **`array $args = []`:** Parametro opcional adicionado para manter a assinatura consistente com
  todas as demais ferramentas do sistema. Ferramentas de consulta sem parametros ignoram o `$args`,
  mas ferramentas de criacao (como `CriarPropriedadeTool`) precisam receber os dados informados
  pelo usuario. Ter a mesma assinatura permite que o `ChatController` chame todas as ferramentas
  de forma uniforme, sem precisar saber quais aceitam ou nao argumentos.
- **`Usuario::all()`:** Chama o Model Eloquent para buscar todos os registros da tabela `usuarios`
  no banco de dados. Retorna uma Collection do Laravel.
- **`->toArray()`:** Converte a Collection Eloquent em um array PHP simples. Isso e necessario
  porque o array sera serializado para JSON e enviado de volta a API do Google como resultado da
  ferramenta.

---

### 3.5. app/Mcp/Tools/ListarPropriedadesTool.php

**Motivo da criacao:** Para que a IA possa criar uma area de plantio, ela precisa primeiro saber
qual e o `id` da propriedade onde a area sera criada. Como a IA nao conhece os IDs do banco de
dados, ela precisa de uma ferramenta que retorne a lista de propriedades com seus identificadores.
Alem disso, usuarios podem perguntar sobre suas fazendas diretamente no chat.

**Codigo completo e explicado:**

```php
namespace App\Mcp\Tools;

use App\Models\Propriedade;
```

- **`use App\Models\Propriedade`:** Importa o Model Eloquent `Propriedade`, que representa a tabela
  `propriedades` no banco de dados.

```php
public static function definition(): array
{
    return [
        'name' => 'listar_propriedades',
        'description' => 'Retorna a lista de todas as propriedades cadastradas no sistema SoloTrack, incluindo seus IDs, nomes, cidade, estado e tamanho em hectares.',
        'parameters' => [
            'type' => 'object',
            'properties' => (object) [],
        ],
    ];
}
```

- **`'name' => 'listar_propriedades'`:** Nome pelo qual a IA identifica e solicita esta ferramenta.
- **`'description'`:** Menciona explicitamente que o retorno inclui os **IDs**. Isso e intencional:
  a IA le a descricao para saber que, apos chamar esta ferramenta, ela tera o `id` necessario para
  criar uma area de plantio vinculada a propriedade correta.

```php
public static function execute(array $args = [])
{
    return Propriedade::all(['id', 'nome', 'cidade', 'estado', 'tamanho_hectares'])->toArray();
}
```

- **`Propriedade::all([...])`:** Busca todos os registros da tabela `propriedades`, mas seleciona
  apenas as colunas especificadas no array. Retornar somente os campos necessarios reduz o tamanho
  do payload enviado de volta a API do Google, economizando tokens.
- **Colunas selecionadas:** `id` (necessario para criar areas), `nome` (para o usuario identificar
  a propriedade), `cidade`, `estado` e `tamanho_hectares` (informacoes relevantes para o contexto
  da conversa).

---

### 3.6. app/Mcp/Tools/CriarPropriedadeTool.php

**Motivo da criacao:** Permite que o usuario crie uma nova propriedade rural diretamente pelo chat,
sem precisar navegar ate a tela de gestao. A IA coleta os dados em linguagem natural (ex: "Crie
uma fazenda chamada Boa Vista em Ribeirao Preto, SP, com 200 hectares"), extrai os campos e chama
esta ferramenta com os valores estruturados.

**Codigo completo e explicado:**

```php
namespace App\Mcp\Tools;

use App\Models\Propriedade;
use Illuminate\Support\Facades\Validator;
```

- **`use App\Models\Propriedade`:** Importa o Model para criar o registro no banco.
- **`use Illuminate\Support\Facades\Validator`:** Importa o sistema de validacao do Laravel.
  A validacao e necessaria porque os dados vem da IA (que pode interpretar erroneamente o que o
  usuario disse) e precisam ser verificados antes de serem gravados no banco.

```php
public static function definition(): array
{
    return [
        'name' => 'criar_propriedade',
        'description' => 'Cria uma nova propriedade rural no sistema SoloTrack. Use esta ferramenta quando o usuário pedir para cadastrar ou criar uma fazenda/propriedade.',
        'parameters' => [
            'type' => 'object',
            'properties' => [
                'nome' => [
                    'type' => 'string',
                    'description' => 'Nome da propriedade (obrigatório)',
                ],
                'cidade' => [
                    'type' => 'string',
                    'description' => 'Cidade onde a propriedade está localizada',
                ],
                'estado' => [
                    'type' => 'string',
                    'description' => 'Estado com sigla de 2 letras (ex: SP, MG, PR)',
                ],
                'latitude' => [
                    'type' => 'number',
                    'description' => 'Latitude geográfica (valor entre -90 e 90)',
                ],
                'longitude' => [
                    'type' => 'number',
                    'description' => 'Longitude geográfica (valor entre -180 e 180)',
                ],
                'tamanho_hectares' => [
                    'type' => 'number',
                    'description' => 'Tamanho total da propriedade em hectares',
                ],
            ],
            'required' => ['nome'],
        ],
    ];
}
```

- **`'properties'`:** Diferente das ferramentas de consulta, esta ferramenta declara cada campo
  que a IA deve preencher. O Google Gemini usa essas declaracoes para saber quais informacoes
  extrair da mensagem do usuario antes de chamar a ferramenta.
- **Cada propriedade** possui `type` (o tipo de dado esperado) e `description` (instrucao para a
  IA sobre o que aquele campo significa). A IA le essas descricoes para mapear corretamente o que
  o usuario disse para os campos certos.
- **`'required' => ['nome']`:** Lista os campos obrigatorios. Se o usuario nao informar o nome
  da propriedade, a IA deve solicitar essa informacao antes de chamar a ferramenta, em vez de
  tentar criar um registro incompleto.

```php
public static function execute(array $args = [])
{
    $validator = Validator::make($args, [
        'nome'             => 'required|string|max:255',
        'cidade'           => 'nullable|string|max:255',
        'estado'           => 'nullable|string|size:2',
        'latitude'         => 'nullable|numeric|between:-90,90',
        'longitude'        => 'nullable|numeric|between:-180,180',
        'tamanho_hectares' => 'nullable|numeric|min:0',
    ]);

    if ($validator->fails()) {
        return [
            'sucesso' => false,
            'erros' => $validator->errors()->toArray(),
        ];
    }

    $propriedade = Propriedade::create($validator->validated());

    return [
        'sucesso' => true,
        'mensagem' => "Propriedade '{$propriedade->nome}' criada com sucesso!",
        'propriedade' => $propriedade->toArray(),
    ];
}
```

- **`$args`:** Contem os campos extraidos pela IA da mensagem do usuario (ex:
  `['nome' => 'Fazenda Boa Vista', 'cidade' => 'Ribeirao Preto', 'estado' => 'SP']`).
- **`Validator::make($args, [...])`:** Valida os dados recebidos da IA com as mesmas regras
  definidas no `StorePropriedadeRequest`. Isso garante consistencia: dados criados pelo chat
  passam pelas mesmas validacoes que dados criados pelo formulario da tela de gestao.
- **`if ($validator->fails())`:** Se a validacao falhar (ex: estado com mais de 2 letras), o
  metodo retorna um array de erros em vez de um registro invalido. A IA recebe esse array, le
  os erros e informa o usuario sobre o que esta incorreto, possibilitando a correcao.
- **`$validator->validated()`:** Retorna apenas os campos que passaram na validacao, descartando
  qualquer campo extra que a IA possa ter incluido incorretamente.
- **`Propriedade::create(...)`:** Insere o novo registro na tabela `propriedades` do banco de dados
  usando o Model Eloquent.
- **Retorno estruturado:** O retorno inclui `sucesso`, uma `mensagem` legivel e os dados do
  registro criado (`propriedade`). A IA usa esses dados para confirmar ao usuario o que foi
  criado, incluindo o `id` gerado automaticamente pelo banco.

---

### 3.7. app/Mcp/Tools/CriarAreaPlantioTool.php

**Motivo da criacao:** Permite que o usuario crie uma nova area de plantio dentro de uma
propriedade existente, diretamente pelo chat. Como a area precisa estar vinculada a uma
propriedade, o fluxo tipico envolve dois passos automaticos: a IA primeiro chama
`listar_propriedades` para descobrir o `id` da propriedade correta, e depois chama
`criar_area_plantio` com esse `id`. Esse encadeamento de ferramentas e gerenciado
automaticamente pelo `ChatController`.

**Codigo completo e explicado:**

```php
namespace App\Mcp\Tools;

use App\Models\AreaPlantio;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
```

- **`use App\Models\AreaPlantio`:** Importa o Model para criar o registro no banco.
- **`use Illuminate\Support\Str`:** Importa a classe de utilitarios de string do Laravel.
  Necessaria para gerar o `qr_code_hash` com `Str::uuid()`.

```php
public static function definition(): array
{
    return [
        'name' => 'criar_area_plantio',
        'description' => 'Cria uma nova área de plantio vinculada a uma propriedade existente no sistema SoloTrack. Use listar_propriedades antes para obter o ID da propriedade correta caso não saiba.',
        'parameters' => [
            'type' => 'object',
            'properties' => [
                'propriedade_id' => [
                    'type' => 'integer',
                    'description' => 'ID da propriedade onde a área será criada (obrigatório)',
                ],
                'nome_area' => [
                    'type' => 'string',
                    'description' => 'Nome da área de plantio (obrigatório)',
                ],
                'tamanho_area_m2' => [
                    'type' => 'number',
                    'description' => 'Tamanho da área em metros quadrados',
                ],
                'latitude' => [
                    'type' => 'number',
                    'description' => 'Latitude geográfica (valor entre -90 e 90)',
                ],
                'longitude' => [
                    'type' => 'number',
                    'description' => 'Longitude geográfica (valor entre -180 e 180)',
                ],
            ],
            'required' => ['propriedade_id', 'nome_area'],
        ],
    ];
}
```

- **`'description'`:** Instrui explicitamente a IA a chamar `listar_propriedades` antes caso ela
  nao saiba o `id`. Isso e necessario porque a IA nao tem acesso direto ao banco — ela precisa
  consultar antes de agir.
- **`'propriedade_id'`:** Campo do tipo `integer`. O Google Gemini vai garantir que este campo
  seja um numero inteiro ao preenchê-lo, o que e importante para que a validacao e a busca no
  banco funcionem corretamente.
- **`'required' => ['propriedade_id', 'nome_area']`:** Ambos sao obrigatorios. Sem o
  `propriedade_id`, nao e possivel criar a area (a chave estrangeira seria violada). Sem o
  `nome_area`, o registro nao teria identificacao.

```php
public static function execute(array $args = [])
{
    $validator = Validator::make($args, [
        'propriedade_id'  => 'required|integer|exists:propriedades,id',
        'nome_area'       => 'required|string|max:255',
        'tamanho_area_m2' => 'nullable|numeric|min:0',
        'latitude'        => 'nullable|numeric|between:-90,90',
        'longitude'       => 'nullable|numeric|between:-180,180',
    ]);

    if ($validator->fails()) {
        return [
            'sucesso' => false,
            'erros' => $validator->errors()->toArray(),
        ];
    }

    $dados = $validator->validated();
    $dados['qr_code_hash'] = Str::uuid()->toString();

    $area = AreaPlantio::create($dados);

    return [
        'sucesso' => true,
        'mensagem' => "Área de plantio '{$area->nome_area}' criada com sucesso!",
        'area' => $area->toArray(),
    ];
}
```

- **`'exists:propriedades,id'`:** Regra de validacao que consulta o banco para verificar se
  existe uma linha na tabela `propriedades` com aquele `id`. Isso evita criar uma area orfã
  (sem propriedade valida) caso a IA tenha passado um `id` incorreto.
- **`$dados['qr_code_hash'] = Str::uuid()->toString()`:** Gera um UUID v4 unico (ex:
  `"550e8400-e29b-41d4-a716-446655440000"`) e o adiciona aos dados antes da insercao. O
  `qr_code_hash` e obrigatorio pela estrutura da tabela mas nao deve ser informado pelo usuario
  — por isso ele e gerado automaticamente aqui, da mesma forma que o `AreaPlantioController`
  faz ao criar via formulario.
- **`AreaPlantio::create($dados)`:** Insere o registro na tabela `area_plantios` com todos os
  campos validados mais o `qr_code_hash` gerado.
- **Retorno:** Assim como em `CriarPropriedadeTool`, o retorno inclui os dados do registro
  criado com seu `id`, permitindo que a IA confirme ao usuario os detalhes da area criada.

---

### 3.8. app/Http/Controllers/ChatController.php

**Motivo da criacao:** E o orquestrador central do protocolo MCP. Ele e necessario porque o fluxo
de comunicacao com a IA envolve multiplos passos: enviar a pergunta, verificar se a IA quer dados
ou quer criar algo, executar a ferramenta, e continuar o ciclo ate a IA ter todas as informacoes
necessarias para formular a resposta final. Nenhum outro componente do sistema seria responsavel
por coordenar todas essas etapas.

**Codigo completo e explicado:**

```php
use App\Mcp\Tools\ListarUsuariosTool;
use App\Mcp\Tools\ListarPropriedadesTool;
use App\Mcp\Tools\CriarPropriedadeTool;
use App\Mcp\Tools\CriarAreaPlantioTool;
```

- Cada ferramenta disponivel no sistema e importada aqui. Para adicionar uma nova ferramenta ao
  chat, basta importar sua classe nesta secao e registra-la no `$toolMap` (explicado a seguir).

```php
protected array $toolMap = [
    'listar_usuarios'     => ListarUsuariosTool::class,
    'listar_propriedades' => ListarPropriedadesTool::class,
    'criar_propriedade'   => CriarPropriedadeTool::class,
    'criar_area_plantio'  => CriarAreaPlantioTool::class,
];
```

- **`$toolMap`:** E um mapa que associa o **nome da ferramenta** (como a IA a conhece) a
  **classe PHP** responsavel por executa-la. Antes, o controlador usava `if/else` para cada
  ferramenta — o que significava que adicionar uma nova ferramenta exigia editar a logica do
  `if/else`. Com o `$toolMap`, adicionar uma ferramenta e apenas incluir uma nova linha neste
  array. O restante do codigo funciona automaticamente para qualquer ferramenta registrada.
- **A chave do array** (ex: `'criar_area_plantio'`) deve ser identica ao campo `'name'` definido
  no metodo `definition()` da ferramenta correspondente. E por este nome que a IA solicita a
  execucao da ferramenta.
- **`::class`:** E a forma do PHP de referenciar uma classe sem instancia-la. Retorna a string
  com o nome completo da classe, ex: `'App\Mcp\Tools\CriarPropriedadeTool'`.

```php
$tools = array_map(
    fn($class) => $class::definition(),
    $this->toolMap
);
```

- **`array_map`:** Percorre o `$toolMap` e chama `definition()` em cada classe, gerando
  automaticamente o array de definicoes de ferramentas que sera enviado ao Google Gemini. Isso
  elimina a necessidade de manter uma lista separada de definicoes — ao registrar uma ferramenta
  no `$toolMap`, ela automaticamente e incluida nas instrucoes enviadas a IA.

```php
$currentMessages = $request->input('messages');
$maxIterations = 5;
```

- **`$currentMessages`:** Começa com o historico enviado pelo frontend e vai sendo expandido a
  cada iteracao do loop conforme a IA chama ferramentas e recebe resultados.
- **`$maxIterations = 5`:** Limite de segurança para evitar loops infinitos. Em situacoes
  normais, o fluxo e concluido em 2 ou 3 iteracoes. O limite de 5 garante que, mesmo em casos
  inesperados, o servidor nao fique preso em um ciclo eterno de chamadas a API do Google.

```php
for ($i = 0; $i < $maxIterations; $i++) {
    $response = $this->gemini->chat($currentMessages, array_values($tools));
```

- **Loop principal:** A novidade central do controlador. Em vez de fazer apenas uma ou duas
  chamadas fixas ao Gemini, o controlador entra em um loop que repete enquanto a IA continuar
  solicitando ferramentas. Isso permite fluxos com multiplos passos, como: (1) a IA lista as
  propriedades para descobrir o ID, (2) a IA cria a area com o ID encontrado, (3) a IA formula
  a resposta final — tudo automaticamente em uma unica mensagem do usuario.
- **`array_values($tools)`:** Garante que o array de definicoes seja enviado como uma lista
  indexada (`[0, 1, 2, ...]`), que e o formato esperado pelo Google. Sem isso, o PHP poderia
  enviar um objeto com chaves string (`{'listar_usuarios': {...}, ...}`), que o Google recusaria.

```php
    $functionCalls = array_filter($parts, fn($p) => isset($p['functionCall']));

    if (empty($functionCalls)) {
        return response()->json($response);
    }
```

- **`array_filter`:** Filtra as partes da resposta da IA, mantendo apenas aquelas que contem um
  `functionCall`. Se nenhuma parte conter um `functionCall`, significa que a IA terminou seu
  raciocinio e gerou uma resposta em texto puro. Nesse caso, o loop e encerrado e a resposta
  final e retornada ao frontend.

```php
    $aiModelMessage = $candidate;
    foreach ($aiModelMessage['parts'] as &$historyPart) {
        if (isset($historyPart['functionCall'])) {
            $historyPart['functionCall']['args'] = (object)($historyPart['functionCall']['args'] ?? []);
        }
    }
    unset($historyPart);
    $currentMessages[] = $aiModelMessage;
```

- **Preservacao do Contexto Original:** O controlador reutiliza a mensagem original da IA
  (`$candidate`) em vez de reconstrui-la do zero. Isso e fundamental porque o Gemini 3.1 inclui
  um campo `thought` (com o raciocinio interno da IA) e uma `thought_signature` (uma assinatura
  criptografica desse raciocinio). Se esses campos forem omitidos ao reenviar, o Google recusa
  a requisicao com erro de seguranca.
- **`&$historyPart`:** O `&` (passagem por referencia) garante que as modificacoes feitas dentro
  do `foreach` sejam refletidas no array original `$aiModelMessage`. Sem o `&`, estaremos
  modificando uma copia temporaria que e descartada ao final de cada iteracao.
- **`(object)($historyPart['functionCall']['args'] ?? [])`:** Garante que o campo `args` seja
  sempre um objeto JSON (`{}`), nunca uma lista (`[]`). O cast `(object)` converte tanto arrays
  vazios quanto arrays associativos em `stdClass`, que o PHP serializa como objeto JSON. Isso e
  obrigatorio: a API do Google define `args` como um campo do tipo mapa (objeto), e enviar uma
  lista causa erro de validacao com a mensagem `"Proto field is not repeating, cannot start list"`.
- **`unset($historyPart)`:** Esta linha e critica. Em PHP, quando um `foreach` usa passagem por
  referencia (`&`), a variavel do loop continua existindo como referencia ao ultimo elemento
  do array apos o termino do `foreach`. Se essa variavel for reutilizada em um `foreach`
  subsequente (mesmo sem `&`), o PHP escrevera atraves da referencia, corrompendo o ultimo
  elemento de `$aiModelMessage['parts']` com um valor errado. O `unset` quebra essa referencia
  imediatamente, tornando `$historyPart` uma variavel inexistente e eliminando o risco.

```php
    foreach ($functionCalls as $callPart) {
        $functionName = $callPart['functionCall']['name'];
        $args = (array) ($callPart['functionCall']['args'] ?? []);

        $toolClass = $this->toolMap[$functionName] ?? null;
        $toolResult = $toolClass ? $toolClass::execute($args) : ['erro' => "Ferramenta '$functionName' não encontrada."];

        $currentMessages[] = [
            'role' => 'function',
            'parts' => [[
                'functionResponse' => [
                    'name' => $functionName,
                    'response' => ['content' => $toolResult],
                ],
            ]],
        ];
    }
```

- **`$callPart`:** Nome de variavel diferente de `$historyPart` para deixar claro que este
  `foreach` opera sobre os dados originais de `$functionCalls` (antes da normalizacao), enquanto
  o anterior operava sobre `$aiModelMessage` para preparar o historico. O uso de nomes distintos
  tambem evita qualquer confusao com as referencias do `foreach` anterior.
- **`$args = (array)(...)`:** Converte os argumentos fornecidos pela IA (que podem ser um array
  associativo PHP ou um objeto `stdClass`) em um array PHP simples. Esse e o formato que os
  metodos `execute()` das ferramentas esperam receber.
- **`$this->toolMap[$functionName] ?? null`:** Busca a classe correspondente ao nome da ferramenta
  solicitada pela IA. Se o nome nao existir no mapa (o que nao deveria acontecer, mas e tratado
  por seguranca), retorna `null` e um erro e incluido no resultado.
- **`$toolClass::execute($args)`:** Chama o metodo estatico `execute()` da ferramenta,
  passando os argumentos extraidos pela IA. O resultado pode ser uma lista de dados (para
  ferramentas de consulta) ou um objeto com `sucesso` e os dados criados (para ferramentas
  de criacao).
- **`'role' => 'function'`:** Informa ao Google que esta mensagem e a resposta de uma ferramenta,
  nao do usuario nem do modelo de IA.
- **`'functionResponse'`:** Estrutura obrigatoria para enviar o resultado de uma ferramenta de
  volta a IA.
- **`'name' => $functionName`:** Deve ser exatamente o mesmo nome da funcao que foi solicitada
  pela IA. O Google usa este campo para associar a resposta a solicitacao original.
- **`'response' => ['content' => $toolResult]`:** O campo `response` encapsula o resultado da
  ferramenta. O subcampo `content` contem os dados retornados pela ferramenta (dados do banco
  ou confirmacao de criacao).
- **Loop continua:** Apos adicionar todos os resultados ao historico, o `for` executa nova
  iteracao, chama `GeminiService::chat()` novamente com o historico atualizado, e a IA processa
  os resultados das ferramentas para decidir o proximo passo.

```php
throw new \Exception('Limite de iterações de ferramentas atingido.');
```

- Se o loop chegar ao limite de 5 iteracoes sem que a IA produza uma resposta de texto,
  o controlador lanca uma excecao. Isso protege contra situacoes em que a IA ficasse chamando
  ferramentas indefinidamente.

```php
} catch (\Exception $e) {
    return response()->json(['error' => $e->getMessage()], 500);
}
```

- **Tratamento de Erros:** Qualquer excecao lancada (seja pelo `GeminiService`, por erros de
  banco de dados, ou pelo limite de iteracoes) e capturada aqui. O controlador retorna uma
  resposta JSON com o campo `error` contendo a mensagem do problema e o codigo HTTP `500`
  (erro interno do servidor).

---

## 4. Fluxo Completo de uma Mensagem (Passo a Passo)

### Exemplo 1: Consulta simples

1. O usuario digita "Quantos usuarios temos?" no chat e pressiona Enter.
2. O Frontend envia uma requisicao `POST /api/mcp/chat` com o historico da conversa.
3. O `ChatController` monta as definicoes de ferramentas a partir do `$toolMap` e chama
   `GeminiService::chat()`.
4. O Google Gemini analisa a pergunta, percebe que nao sabe a resposta e retorna um `functionCall`
   para `listar_usuarios`.
5. O `ChatController` detecta o `functionCall`, localiza `ListarUsuariosTool` no `$toolMap`,
   chama `execute([])` e obtem a lista de usuarios do banco de dados.
6. O controlador normaliza os `args` para `{}` e adiciona a mensagem da IA e a resposta da
   ferramenta ao historico.
7. O controlador faz uma segunda chamada ao Gemini com o historico completo.
8. O Google Gemini nao retorna nenhum `functionCall`. Gera uma resposta em texto: "O sistema
   possui X usuarios cadastrados".
9. O controlador detecta que nao ha mais `functionCall`s, sai do loop e retorna a resposta ao
   Frontend.
10. O Frontend exibe a mensagem no chat.

### Exemplo 2: Criacao de area de plantio (fluxo com dois passos)

1. O usuario digita "Crie uma area chamada Talhao Norte de 5000m2 na Fazenda Santa Clara".
2. O Frontend envia a requisicao `POST /api/mcp/chat`.
3. O `ChatController` chama o Gemini — **1a iteracao do loop**.
4. O Gemini percebe que precisa do `id` da "Fazenda Santa Clara" e retorna um `functionCall`
   para `listar_propriedades`.
5. O controlador executa `ListarPropriedadesTool::execute([])`, que retorna todas as propriedades
   com seus IDs. Suponha que a "Fazenda Santa Clara" tenha `id = 3`.
6. O controlador adiciona a mensagem da IA e o resultado da ferramenta ao historico e retorna
   ao inicio do loop — **2a iteracao**.
7. O Gemini recebe a lista de propriedades, identifica que `id = 3` corresponde a "Fazenda
   Santa Clara" e retorna um `functionCall` para `criar_area_plantio` com os argumentos:
   `{'propriedade_id': 3, 'nome_area': 'Talhao Norte', 'tamanho_area_m2': 5000}`.
8. O controlador executa `CriarAreaPlantioTool::execute($args)`, que valida os dados, gera um
   `qr_code_hash` e insere o registro no banco. Retorna a confirmacao com os dados criados.
9. O controlador adiciona a mensagem da IA e o resultado ao historico — **3a iteracao**.
10. O Gemini nao retorna mais `functionCall`s. Gera a resposta final: "A area de plantio
    'Talhao Norte' foi criada com sucesso na Fazenda Santa Clara!".
11. O controlador sai do loop e retorna a resposta ao Frontend.
12. O Frontend exibe a confirmacao no chat.

---

## 5. Configuracao de Ambiente

### Variaveis de Ambiente (.env)

```env
GEMINI_API_KEY=sua_chave_aqui
```

A chave de API e obtida no Google AI Studio (aistudio.google.com). Para que as cotas sejam
desbloqueadas (saindo do "limite zero" do Tier 0), e necessario vincular uma conta de faturamento
no Google Cloud Console. O uso dentro dos limites do Tier 1 (15 requisicoes por minuto) continua
sendo gratuito.

---

## 6. Como Adicionar uma Nova Ferramenta

Para que a IA possa executar uma nova acao ou consultar outros dados do sistema:

1. Criar um novo arquivo em `app/Mcp/Tools/`, ex: `ListarColheitasTool.php`.
2. Implementar o metodo `definition()` com o nome, descricao e parametros da ferramenta.
3. Implementar o metodo `execute(array $args = [])` com a logica de consulta ou criacao.
4. No `ChatController`, importar a nova classe com `use` e adicionar uma linha no `$toolMap`:

```php
protected array $toolMap = [
    // ... ferramentas existentes ...
    'listar_colheitas' => ListarColheitasTool::class,
];
```

A IA aprendera automaticamente a usar a nova ferramenta nas proximas conversas, sem nenhuma
outra alteracao necessaria no controlador.

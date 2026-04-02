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

---

## 2. Arquitetura do Sistema

O sistema e composto por tres camadas:

- **Frontend (React):** A interface onde o usuario digita e le as respostas.
- **Backend (Laravel):** O servidor que recebe a pergunta, conversas com a IA e executa as
  ferramentas de banco de dados.
- **API do Google Gemini:** O modelo de IA externo que processa linguagem natural e decide quando
  e necesario buscar dados do sistema.

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
  que ira retorna a mensagem de erro ao frontend.
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
public static function execute()
{
    return Usuario::all()->toArray();
}
```

- **`Usuario::all()`:** Chama o Model Eloquent para buscar todos os registros da tabela `usuarios`
  no banco de dados. Retorna uma Collection do Laravel.
- **`->toArray()`:** Converte a Collection Eloquent em um array PHP simples. Isso e necessario
  porque o array sera serializado para JSON e enviado de volta a API do Google como resultado da
  ferramenta.

---

### 3.5. app/Http/Controllers/ChatController.php

**Motivo da criacao:** E o orquestrador central do protocolo MCP. Ele e necessario porque o fluxo
de comunicacao com a IA envolve multiplos passos: enviar a pergunta, verificar se a IA quer dados,
buscar os dados, e enviar a resposta final. Nenhum outro componente do sistema seria responsavel
por coordenar todas essas etapas.

**Codigo completo e explicado:**

```php
protected GeminiService $gemini;

public function __construct(GeminiService $gemini)
{
    $this->gemini = $gemini;
}
```

- **Injecao de Dependencia:** O Laravel injeta automaticamente uma instancia de `GeminiService`
  no construtor. Isso significa que o `ChatController` nao precisa criar o servico manualmente
  com `new GeminiService()`. O Laravel instancia e gerencia o ciclo de vida do servico.
- **`$this->gemini`:** Armazena a instancia do servico para uso nos metodos da classe.

```php
public function chat(Request $request)
{
    $request->validate([
        'messages' => 'required|array',
    ]);
```

- **`validate`:** Garante que o frontend enviou o campo `messages` e que ele e um array. Se a
  validacao falhar, o Laravel automaticamente retorna um erro `422` para o frontend sem executar
  o resto do codigo.

```php
$userMessages = $request->input('messages');
```

- **`$request->input('messages')`:** Extrai o valor do campo `messages` do corpo da requisicao
  JSON enviada pelo frontend.

```php
$tools = [
    ListarUsuariosTool::definition()
];
```

- **`$tools`:** Array com todas as ferramentas que a IA pode usar nesta sessao. Cada ferramenta
  e representada pelo retorno do seu metodo `definition()`. Para adicionar uma nova ferramenta
  ao sistema, basta adicionar uma nova linha aqui.

```php
$response = $this->gemini->chat($userMessages, $tools);
```

- **Primeira Chamada a IA:** Envia o historico de mensagens e a lista de ferramentas para o
  Gemini. O modelo analisa a pergunta e decide o que fazer: responder diretamente ou pedir
  dados atraves de uma ferramenta.

```php
if (empty($response['candidates'])) {
    $finishReason = $response['promptFeedback']['blockReason'] ?? 'Desconhecido';
    throw new \Exception("A IA não gerou uma resposta válida. Motivo: $finishReason");
}
```

- **`$response['candidates']`:** O Google retorna as respostas possiveis dentro de um array
  chamado `candidates`. Em situacoes normais, sempre existe pelo menos um candidato.
- **Verificacao de Bloqueio:** Se o array `candidates` vier vazio, significa que o Google bloqueou
  a resposta (por filtros de conteudo ou por excesso de cota). O sistema tenta ler o motivo do
  bloqueio em `promptFeedback.blockReason` e lanca uma excecao com essa informacao.

```php
$candidate = $response['candidates'][0]['content'] ?? null;
$parts = $candidate['parts'] ?? [];
```

- **`$response['candidates'][0]`:** Acessa o primeiro (e geralmente unico) candidato de resposta.
- **`['content']`:** Cada candidato possui um campo `content` que contem o `role` (quem gerou
  a resposta) e os `parts` (o conteudo em si). O operador `??` significa que se o campo nao
  existir, o valor sera `null`.
- **`$parts`:** Array com as "partes" do conteudo gerado. A IA pode gerar multiplas partes em
  uma unica resposta: um texto, um pensamento, uma chamada de funcao, etc.

```php
foreach ($parts as $part) {
    if (isset($part['functionCall'])) {
        $functionName = $part['functionCall']['name'];
```

- **`foreach`:** Percorre cada parte da resposta da IA em busca de uma solicitacao de ferramenta.
- **`isset($part['functionCall'])`:** Verifica se aquela parte especifica contem uma solicitacao
  de chamada de função. Se a IA decidiu que precisa de dados, ela insere um `functionCall` em uma
  das partes da resposta.
- **`$functionName`:** Extrai o nome da ferramenta que a IA quer usar (ex: `'listar_usuarios'`).

```php
if ($functionName === 'listar_usuarios') {
    $toolResult = ListarUsuariosTool::execute();
```

- **Despacho da Ferramenta:** Compara o nome solicitado pela IA com os nomes das ferramentas
  disponiveis. Se coincidir, executa o metodo `execute()` da ferramenta correspondente, que faz
  a consulta real no banco de dados.

```php
$aiModelMessage = $candidate;
foreach ($aiModelMessage['parts'] as &$tempPart) {
    if (isset($tempPart['functionCall'])) {
        $tempPart['functionCall']['args'] = !empty($tempPart['functionCall']['args'])
            ? $tempPart['functionCall']['args']
            : new \stdClass();
    }
}
```

- **Preservacao do Contexto Original:** O controlador reutiliza a mensagem original da IA
  (`$candidate`) em vez de reconstrui-la do zero. Isso e fundamental porque o Gemini 3.1 inclui
  um campo `thought` (com o raciocinio interno da IA) e uma `thought_signature` (uma assinatura
  criptografica desse raciocinio). Se esses campos forem omitidos ao reenvivar, o Google recusa
  a requisicao com erro de seguranca.
- **`&$tempPart`:** O `&` (passagem por referencia) garante que as modificacoes feitas em
  `$tempPart` dentro do foreach sejam refletidas no array original `$aiModelMessage`.
- **`new \stdClass()`:** O PHP representa objetos como `stdClass`. Quando o campo `args` da
  funcao e vazio, o PHP o serializa como `[]` (lista) em JSON. A API do Google exige que argumentos
  vazios sejam `{}` (objeto). `new \stdClass()` forcca o PHP a gerar `{}` no JSON.

```php
$toolResponseMessage = [
    'role' => 'function',
    'parts' => [
        [
            'functionResponse' => [
                'name' => $functionName,
                'response' => ['content' => $toolResult]
            ]
        ]
    ]
];
```

- **`'role' => 'function'`:** Informa ao Google que esta mensagem e a resposta de uma ferramenta,
  nao do usuario nem do modelo de IA.
- **`'functionResponse'`:** Estrutura obrigatoria para enviar o resultado de uma ferramenta de
  volta a IA.
- **`'name' => $functionName`:** Deve ser exatamente o mesmo nome da funcao que foi solicitada
  pela IA. O Google usa este campo para associar a resposta a solicitacao original.
- **`'response' => ['content' => $toolResult]`:** O campo `response` encapsula o resultado da
  ferramenta. O subcampo `content` contem os dados brutos retornados pelo banco de dados.

```php
$allMessages = $userMessages;
$allMessages[] = $aiModelMessage;
$allMessages[] = $toolResponseMessage;

$finalResponse = $this->gemini->chat($allMessages, $tools);
return response()->json($finalResponse);
```

- **Segunda Chamada a IA:** O controlador monta o historico completo: as mensagens originais
  do usuario, a resposta da IA que solicitou a ferramenta, e o resultado da ferramenta. Envia
  esse historico de volta para o Gemini.
- **Resposta Final:** Com o historico completo, o Gemini agora tem os dados que precisava. Ele
  gera uma resposta em linguagem natural (ex: "Existem 3 usuarios: Joao, Maria e Jose") que e
  retornada ao frontend.

```php
} catch (\Exception $e) {
    return response()->json([
        'error' => $e->getMessage()
    ], 500);
}
```

- **Tratamento de Erros:** Qualquer excecao lancada (seja pelo `GeminiService` ou por erros de
  banco de dados) e capturada aqui. O controlador retorna uma resposta JSON com o campo `error`
  contendo a mensagem do problema e o codigo HTTP `500` (erro interno do servidor).

---

## 4. Fluxo Completo de uma Mensagem (Passo a Passo)

1. O usuario digita "Quantos usuarios temos?" no chat e pressiona Enter.
2. O Frontend envia uma requisicao `POST /api/mcp/chat` com o historico da conversa.
3. O `ChatController` valida a requisicao e chama `GeminiService::chat()` com as mensagens e
   as ferramentas disponiveis.
4. O Google Gemini analisa a pergunta, percebe que nao sabe a resposta e retorna um `functionCall`
   para `listar_usuarios`.
5. O `ChatController` detecta o `functionCall`, chama `ListarUsuariosTool::execute()` e obtem
   a lista de usuarios do banco de dados.
6. O controlador preserva o conteudo original da IA (incluindo o `thought` e o `thought_signature`)
   e adiciona a resposta da ferramenta ao historico.
7. O controlador faz uma segunda chamada ao Gemini com o historico completo.
8. O Google Gemini processa os dados recebidos e gera uma resposta em portugues: "O sistema
   possui X usuarios cadastrados".
9. O controlador retorna essa resposta ao Frontend.
10. O Frontend exibe a mensagem no chat.

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

Para que a IA possa consultar outros dados do sistema (ex: fazendas, colheitas):

1. Criar um novo arquivo em `app/Mcp/Tools/`, ex: `ListarPropriedadesTool.php`.
2. Implementar o metodo `definition()` com o nome e a descricao da nova funcao.
3. Implementar o metodo `execute()` com a consulta Eloquent correspondente.
4. Adicionar `ListarPropriedadesTool::definition()` ao array `$tools` no `ChatController`.

A IA aprendera automaticamente a usar a nova ferramenta nas proximas conversas.

# Mapeamento de Telas (UI/UX) - SoloTrack

## 1. Autenticação e Entrada
* **Tela de Login**
    * Campo de E-mail
    * Campo de Senha
    * Botão "Entrar"
    * Link "Esqueci minha senha"
    * Link "Ainda não tem conta? Cadastre-se"

* **Tela de Cadastro**
    * Nome Completo
    * E-mail
    * Senha e Confirmação de Senha
    * Botão "Criar Conta"

## 2. Dashboard Central (Home)
*A tela principal ao logar. Focada em dar um panorama rápido da saúde da fazenda.*
* **Filtros Globais**
    * Seletor de Período (Data Inicial - Data Final)
    * Seletor de Aparelho (Qual ESP32 gerou os dados)
    * Seletor de Área (Ex: Apenas dados da "Estufa 1")
* **Cards de Resumo (KPIs)**
    * Score Geral de Fertilidade (0 a 100)
    * Economia Financeira Estimada (R$ economizados em adubo)
* **Área de Gráficos**
    * Gráfico de Linha: Evolução dos nutrientes no tempo (N, P, K, Umidade)
    * Gráfico de Barras: Comparativo do valor lido vs. valor ideal da cultura

## 3. Gestão da Fazenda (Propriedades e Áreas)
*Onde o usuário espelha a realidade física do seu terreno no app.*
* **Tela Minha Fazenda**
    * Dados da Propriedade (Nome, Cidade, Estado, Hectares)
    * Localização (Captura automática de Latitude/Longitude)
* **Tela Áreas de Plantio (Estufas/Canteiros)**
    * Listagem das áreas existentes
    * Botão "Nova Área"
    * **Modal de Nova Área:**
        * Nome da Área (Ex: Horta Sul)
        * Cultura Atual (Dropdown puxando da tabela `culturas`, ex: Tomate)
        * Tamanho (m²)
* **Tela de Detalhes da Área (Onde o QR Code vive)**
    * Histórico de culturas daquela área
    * Receita de Insumos da área
    * **Botão "Gerar Etiqueta (QR Code)"** para impressão

## 4. Hardware e Sensores (Dispositivos)
*Onde o hardware burro ganha inteligência.*
* **Tela Listagem de Dispositivos**
    * Lista de ESP32 cadastrados e status (Ativo/Inativo)
    * Botão "Adicionar Novo Equipamento"
* **Tela Adicionar/Editar Dispositivo**
    * Nome/Apelido (Ex: Bastão Principal)
    * **Botão "Sincronizar via Bluetooth"** (Puxa o MAC Address automaticamente)
* **Mapeamento Modular (Configuração de Portas)**
    * Seleção de quais sensores estão plugados neste ESP32:
        * *Ex: "Na porta 1 está o Sensor de Nitrogênio"*
        * *Ex: "Na porta 2 está o Sensor de Umidade"*
    * Botão Excluir Equipamento

## 5. Ação de Campo (Nova Leitura)
*A tela mais usada no dia a dia. Focada em agilidade.*
* **Tela de Escaneamento**
    * Abertura da câmera do celular
    * Leitura do QR Code da Estufa para identificar o local (`area_id`)
* **Tela de Sincronização (Pós-QR Code)**
    * Feedback visual: "Conectando ao Bastão Principal..."
    * Painel mostrando os dados sendo puxados via Bluetooth em tempo real (Valores brutos de N, P, K, etc.)
    * Botão "Salvar Leitura no Banco de Dados"

## 6. Configurações e Finanças (Perfil)
* **Configurações do Usuário**
    * Edição de Nome, E-mail, Senha
* **Gestão de Insumos (O Segredo da Economia)**
    * Listagem de fertilizantes que o produtor tem no galpão
    * Modal Inserir/Editar Insumo:
        * Nome (Ex: NPK 10-10-10)
        * Preço Pago (R$)
        * Unidade de Medida (Saco 50kg)

## 7. Dados e Exportação (Relatórios)
* **Tela Lista de Relatórios**
    * Tabela completa com o histórico bruto de todas as leituras
    * Filtros avançados (Por estufa, por cultura, por data)
    * Botão "Exportar para Excel / CSV"
    * Botão "Exportar Laudo em PDF"

## 8. Assistente de IA (Chatbot)
* **Interface de Suporte Agronômico**
    * Janela de Chat estilo WhatsApp
    * Mensagens integradas com o contexto do banco (A IA já sabe os dados da fazenda)
    * *Ex de uso: "Minha estufa 1 tá com Nitrogênio baixo, o que eu faço?"*
# Comandos e Guias do Docker (soloTrack)

Este projeto está configurado para iniciar o Backend (Laravel), Frontend (React/Vite) e o Banco de Dados (MySQL 8) através de containers do Docker, tudo isolado e sem sujar o seu computador local!

## Como Ligar o Projeto (Tudo de uma vez)
Acesse a raiz do projeto (onde está o arquivo `docker-compose.yml`) e rode:

```bash
docker compose up -d
```
> O `-d` faz os containers rodarem "escondidos" (em segundo plano), deixando o seu terminal livre para você continuar usando.

Em alguns segundos, seus aplicativos estarão online:
- **Frontend:** http://localhost:5173
- **Backend (API):** http://localhost:8000

---

## Como Desligar o Projeto (Tudo de uma vez)
Quando terminar de mexer no projeto, pode desligar e remover os containers temporários de forma segura:

```bash
docker compose down
```

---

## Como ver os Logs de Erro
Se precisar ver o console (pra ver erros no Laravel ou as mensagens de aviso do frontend):

```bash
# Ver os logs ao vivo de TODOS os containers misturados
docker compose logs -f

# Ouvir apenas os logs do Frontend
docker compose logs -f frontend

# Ouvir apenas os logs do Backend
docker compose logs -f backend
```
*(Para parar a "escuta" dos logs, basta apertar `Ctrl + C` no terminal).*

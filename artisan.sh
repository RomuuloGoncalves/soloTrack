#!/bin/bash

CONTAINER="solotrack-backend"

echo ""
echo "=========================================="
echo "  Assistente do Laravel no Docker"
echo "=========================================="
echo "Selecione o comando que deseja rodar na sua API:"

PS3="👉 Digite o número da opção e aperte Enter: "
opcoes=(
    "Instalar Dependências (composer install)"
    "Migrate (Criar tabelas novas)"
    "Migrate Fresh (Apaga TODAS as tabelas e recria do zero)"
    "Migrate Fresh + Seed (Apaga tudo, recria e popula com dados)"
    "DB Wipe (Apenas DELETAR todas as tabelas e deixar o banco vazio)"
    "Limpar Caches (Optimize Clear)"
    "Criar um Controller"
    "Criar um Model (com tabela)"
    "Abrir o Tinker (Terminal interativo do Laravel)"
    "Sair"
)

select opt in "${opcoes[@]}"
do
    case $opt in
        "Instalar Dependências (composer install)")
            echo "Rodando composer install no container..."
            docker exec -it $CONTAINER composer install
            break
            ;;
        "Migrate (Criar tabelas novas)")
            echo "Rodando php artisan migrate..."
            docker exec -it $CONTAINER php artisan migrate
            break
            ;;
        "Migrate Fresh (Apaga TODAS as tabelas e recria do zero)")
            echo "Aviso: Isso apagará TODOS os dados e tabelas do banco!"
            read -p "Tem certeza? (s/N): " conf
            if [[ $conf == "s" || $conf == "S" ]]; then
                docker exec -it $CONTAINER php artisan migrate:fresh
            else
                echo "Cancelado."
            fi
            break
            ;;
        "Migrate Fresh + Seed (Apaga tudo, recria e popula com dados)")
            echo "Aviso: Isso apagará o banco inteiro e usará os seeders!"
            read -p "Tem certeza? (s/N): " conf
            if [[ $conf == "s" || $conf == "S" ]]; then
                docker exec -it $CONTAINER php artisan migrate:fresh --seed
            else
                echo "Cancelado."
            fi
            break
            ;;
        "DB Wipe (Apenas DELETAR todas as tabelas e deixar o banco vazio)")
            echo "PERIGO: ISSO VAI EVAPORAR TODAS AS SUAS TABELAS E DADOS!"
            read -p "VOCÊ TEM CERTEZA ABSOLUTA? (s/N): " conf
            if [[ $conf == "s" || $conf == "S" ]]; then
                docker exec -it $CONTAINER php artisan db:wipe
                echo "Banco de dados exterminado com sucesso. Deixado em branco."
            else
                echo "Cancelado."
            fi
            break
            ;;
        "Limpar Caches (Optimize Clear)")
            docker exec -it $CONTAINER php artisan optimize:clear
            break
            ;;
        "Criar um Controller")
            read -p "Qual o nome do Controller? (ex: UserController): " nome
            docker exec -it $CONTAINER php artisan make:controller "$nome"
            break
            ;;
        "Criar um Model (com tabela)")
            read -p "Qual o nome do Model? (ex: Produto): " nome
            docker exec -it $CONTAINER php artisan make:model "$nome" -m
            break
            ;;
        "Abrir o Tinker (Terminal interativo do Laravel)")
            docker exec -it $CONTAINER php artisan tinker
            break
            ;;
        "Sair")
            echo "Saindo... Bom código!"
            break
            ;;
        *) 
            echo "Opção inválida: $REPLY. Tente novamente."
            ;;
    esac
done

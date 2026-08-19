<div align="center">

# 🎨 TCC UNIVAP 2025

## Centralização e Automação de Demandas Criativas

**Uma plataforma web para organização, automação e rastreabilidade de solicitações criativas.**

![Status](https://img.shields.io/badge/status-concluído-success)
![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-database-4479A1?logo=mysql&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-automação-EA4B71?logo=n8n&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-integração-25D366?logo=whatsapp&logoColor=white)

**Trabalho de Conclusão de Curso — Técnico em Informática**

Colégio Técnico "Antônio Teixeira Fernandes"  
Fundação Valeparaibana de Ensino — UNIVAP

**2025**

</div>

---

## 📌 Sobre o projeto

Este projeto foi desenvolvido para solucionar um problema presente no fluxo de trabalho de uma empresa de design: a dificuldade de **organizar, acompanhar e não perder solicitações de clientes**.

Antes da plataforma, as demandas eram recebidas principalmente por **e-mail e formulários**, fazendo com que informações ficassem espalhadas entre diferentes canais. Com o volume de solicitações, isso dificultava o acompanhamento dos pedidos, aumentava o retrabalho e tornava a comunicação entre cliente e empresa menos eficiente.

A solução desenvolvida centraliza essas demandas em uma única plataforma e automatiza etapas do processo utilizando **n8n, WhatsApp, MySQL e Trello**.

O resultado é um fluxo mais organizado, rastreável e integrado, desde o contato inicial do cliente até o acompanhamento da solicitação pela equipe.

---

## ✨ Principais funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 📋 **Solicitações** | Cadastro, visualização, aprovação, rejeição e acompanhamento de demandas |
| 💬 **Bot de WhatsApp** | Coleta informações do cliente e registra a solicitação automaticamente |
| 👥 **Clientes** | Cadastro, consulta e gerenciamento de clientes |
| 👤 **Usuários** | Login, autenticação e controle de acesso |
| 📊 **Dashboard** | Indicadores e gráficos sobre as solicitações |
| 🔄 **Automação** | Processamento e encaminhamento das demandas através do n8n |
| 📌 **Trello** | Organização visual das demandas em fluxo Kanban |
| 🗄️ **Banco de dados** | Armazenamento estruturado das informações utilizando MySQL |
| 📝 **Histórico** | Registro e acompanhamento das alterações e etapas das solicitações |

---

## 🔄 Como funciona?

O sistema integra diferentes ferramentas para automatizar o fluxo de uma demanda:

```text
                    👤 CLIENTE
                        │
              ┌─────────┴─────────┐
              │                   │
        📝 Formulário         💬 WhatsApp
              │                   │
              │            Evolution API
              │                   │
              └─────────┬─────────┘
                        ↓
                   ⚙️ n8n
                        │
             Processamento e automação
                        │
                ┌───────┴───────┐
                ↓               ↓
            🗄️ MySQL         📌 Trello
                │               │
                └───────┬───────┘
                        ↓
                 🌐 Plataforma Web
                        │
                        ↓
                 📊 Acompanhamento
                   da demanda

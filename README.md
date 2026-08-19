<div align="center">

# TCC UNIVAP 2025

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

## Sobre o projeto

Este projeto foi desenvolvido para solucionar um problema presente no fluxo de trabalho de uma empresa de design: a dificuldade de **organizar, acompanhar e não perder solicitações de clientes**.

Antes da plataforma, as demandas eram recebidas principalmente por **e-mail e formulários**, fazendo com que informações ficassem espalhadas entre diferentes canais. Com o volume de solicitações, isso dificultava o acompanhamento dos pedidos, aumentava o retrabalho e tornava a comunicação entre cliente e empresa menos eficiente.

A solução desenvolvida centraliza essas demandas em uma única plataforma e automatiza etapas do processo utilizando **n8n, WhatsApp, MySQL e Trello**.

O resultado é um fluxo mais organizado, rastreável e integrado, desde o contato inicial do cliente até o acompanhamento da solicitação pela equipe.

---

## Como funciona?

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
```

O cliente pode enviar uma solicitação por formulário ou pelo bot de WhatsApp. Os dados são processados pelas automações, registrados no banco de dados e encaminhados para organização e acompanhamento pela equipe.

## Tecnologias utilizadas

| 💻 Desenvolvimento | 🗄️ Banco de dados | ⚙️ Automação e integrações | 🖥️ Ambiente |
|---|---|---|---|
| **PHP**<br>Back-end | **MySQL / MariaDB** | **n8n**<br>Automação dos processos | **XAMPP** |
| **JavaScript**<br>Funcionalidades e interações | | **Evolution API**<br>Integração com WhatsApp | **Apache** |
| **HTML5**<br>Estrutura das páginas | | **Trello**<br>Gerenciamento das demandas | 
| **CSS3**<br>Interface e estilização | | **ngrok**<br>Comunicação com serviços externos |
| **MVC**<br>Organização arquitetural | | | |

## Instalação

As instruções completas para instalação e configuração do projeto estão disponíveis no:

**[GUIA DE INSTALAÇÃO](docs/GUIA%20DE%20INSTALA%C3%87%C3%83O.txt)**

## Utilização

Após a instalação e configuração do projeto, a plataforma pode ser utilizada para **registrar, organizar e acompanhar as demandas criativas** da empresa.

As solicitações podem ser recebidas por meio do **formulário web** ou do **bot de WhatsApp**, sendo processadas automaticamente e encaminhadas para o fluxo de gerenciamento.

A equipe pode acompanhar as demandas pela plataforma, visualizando informações como:

- 👤 Cliente
- 📋 Solicitação
- 📅 Prazo
- 🔄 Status
- 📝 Observações
- 📊 Indicadores e acompanhamento das demandas

O sistema também permite o gerenciamento das solicitações e o acompanhamento de seu andamento desde o recebimento até a conclusão.

## Autores

Projeto desenvolvido por:

**Enzo Raphael Boquimpani de Moura Nascimento**  
**Julia Senra Torres**  
**Leonardo Martinelli de Oliveira Lima**
 **Contatos:**  
enzorapahelsjc@gmail.com · juliasenratorres@gmail.com · martinelliunivap@gmail.com

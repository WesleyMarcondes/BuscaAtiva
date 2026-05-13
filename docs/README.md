# Visão Geral do Sistema BuscaAtiva 2.0

Bem-vindo à documentação do **BuscaAtiva 2.0**! Este documento foi escrito para que qualquer pessoa — desde desenvolvedores até coordenadores pedagógicos — possa entender o que é este sistema e qual é o seu propósito.

## 🎯 O que é o sistema?
O BuscaAtiva é uma **aplicação web de gestão escolar** focada na comunicação direta e eficiente entre a escola e os pais/responsáveis. Ele permite que educadores e gestores monitorem a frequência dos alunos e disparem notificações de forma inteligente e semi-automatizada diretamente via WhatsApp.

## ⚠️ O problema que resolvemos
A comunicação escolar tradicional (cadernos de recado ou telefonemas) costuma ser demorada e ineficiente. O BuscaAtiva resolve as seguintes dores:
- **Lentidão na notificação de faltas:** Com o sistema, dezenas de mensagens de ausência podem ser disparadas em segundos.
- **Falta de Padronização:** O uso de "Templates de Mensagem" garante que a escola se comunique de maneira profissional e unificada.
- **Trabalho Braçal:** O sistema substitui as tags inteligentes (`[Aluno]`, `[Responsável]`, `[Data]`) automaticamente para cada contato, personalizando o atendimento sem esforço extra.

## 💻 Tecnologias Utilizadas

A aplicação foi construída utilizando ferramentas modernas e eficientes:

| Tecnologia | Função no Sistema | Por que foi escolhida? |
| :--- | :--- | :--- |
| **Next.js / React** | Frontend (A tela que você vê) | Cria uma interface super rápida, reativa e amigável para celulares e computadores. |
| **Node.js** | Ambiente de Execução | Permite rodar o JavaScript de forma robusta e gerenciar pacotes. |
| **Supabase** | Banco de Dados na Nuvem | (Quando conectado) Sincroniza e armazena os dados dos alunos com alta segurança. |
| **SQLite (Local)** | Banco de Dados Offline | Garante que o sistema continue funcionando e salvando dados na máquina local mesmo sem internet ou sem o Supabase configurado. |
| **Integração WhatsApp Web** | Disparo de Notificações | Utiliza a API pública de links do WhatsApp para abrir as mensagens pré-formatadas sem custo adicional. |

---
*Este é o documento principal. Navegue pelos outros arquivos nesta pasta para se aprofundar na arquitetura, banco de dados e regras de negócio do sistema.*

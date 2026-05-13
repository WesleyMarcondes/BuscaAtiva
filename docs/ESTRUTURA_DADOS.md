# Estrutura e Dicionário de Dados

Este documento explica como os dados dos alunos estão organizados e o funcionamento do mecanismo inteligente de substituição de textos (Tags).

## Dicionário da Tabela de Alunos (`Student`)

O sistema armazena as seguintes informações essenciais para cada registro escolar:

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | Número | Identificador único do aluno no sistema. |
| `name` | Texto | O nome completo do aluno. |
| `class` | Texto | A turma do aluno (ex: "5º Ano A"). |
| `responsible` | Texto | Nome do pai, mãe ou responsável legal. |
| `phone` | Texto | Número do WhatsApp de contato do responsável. |
| `absences` | Número | Total de faltas acumuladas no ano/semestre. |
| `consecutive` | Número | Faltas seguidas (usado para gerar alerta de status Crítico). |
| `status` | Texto | Estado atual: *Presente*, *Ausente*, *Crítico* ou *Atestado*. |
| `atestado_end_date`| Data | A data em que o atestado médico perde a validade. |

## O Sistema de Tags Inteligentes

Para permitir que a escola envie a mesma mensagem para 50 pais diferentes de forma personalizada, criamos as **Tags Inteligentes**. Elas funcionam como "espaços reservados" no texto.

Quando o usuário clica em "Confirmar e Enviar", o sistema lê a mensagem e faz a substituição milissegundo antes de abrir o WhatsApp:

- **`[Responsável]`** ➡️ É substituído pelo campo `responsible` do banco de dados.<br>
  *Ex: "Olá [Responsável]..." vira "Olá Maria Silva..."*
  
- **`[Aluno]`** ➡️ É substituído pelo campo `name` do banco de dados.<br>
  *Ex: "...o aluno [Aluno] faltou." vira "...o aluno João Pedro faltou."*
  
- **`[Data]`** ➡️ É substituído pela data atual em que a mensagem está sendo enviada.<br>
  *Ex: "...no dia [Data]." vira "...no dia 28/04/2026."*

### Por que isso é bom?
Isso evita o aspecto frio de "mensagem em massa" ou "spam". O pai ou mãe recebe uma mensagem formatada de forma carinhosa e individual, aumentando as chances de resposta e engajamento com a escola.

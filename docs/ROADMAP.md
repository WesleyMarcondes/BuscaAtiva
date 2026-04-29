# Roadmap do Produto (Cronograma de Evolução)

O BuscaAtiva não é um sistema estático; ele é um projeto vivo! Abaixo, desenhamos a visão de futuro e as etapas de crescimento da plataforma.

```mermaid
gantt
    title Evolução do BuscaAtiva 2.0
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%Y
    
    section Fase 1: MVP
    Base de Alunos (CRUD)      :done,    des1, 2026-04-01, 2026-04-15
    Chamada Digital            :done,    des2, 2026-04-10, 2026-04-20
    Envio de Texto Básico      :done,    des3, 2026-04-15, 2026-04-28
    Regras de Atestado         :active,  des4, 2026-04-25, 2026-04-30
    
    section Fase 2: Gestão
    Histórico de Envios        :         des5, 2026-05-01, 15d
    Relatórios em Gráficos     :         des6, after des5, 15d
    Múltiplos Contatos por Aluno:        des7, after des6, 20d
    
    section Fase 3: Automação
    Bot de Respostas (Webhook) :         des8, 2026-07-01, 30d
    Confirmação de Leitura     :         des9, after des8, 20d
    Disparo Automático Diário  :         des10, after des9, 20d
```

## O que cada fase significa?

### Fase 1 (MVP - Produto Mínimo Viável) - *ESTAMOS AQUI!*
O objetivo era criar uma ferramenta que já trouxesse valor no primeiro dia de uso. Conseguimos fazer a gestão de chamadas, controle de atestados e o disparo facilitado de mensagens.

### Fase 2 (Gestão e Visibilidade)
O foco será criar painéis. Queremos que a direção saiba exatamente "quantas mensagens enviamos esse mês" e "quais alunos têm o maior histórico de faltas recorrentes", transformando dados em informações visuais.

### Fase 3 (A Automação Total)
No futuro, o sistema poderá operar de forma totalmente independente, enviando as mensagens automaticamente num horário programado e recebendo a resposta dos pais através de integrações oficiais com a Meta/WhatsApp, anotando no sistema se a mensagem foi lida.

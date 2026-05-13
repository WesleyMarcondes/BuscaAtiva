# Fluxograma do Usuário

O diagrama abaixo representa a jornada padrão de um usuário (professor ou coordenador) ao utilizar o sistema para notificar pais sobre faltas ou eventos.

```mermaid
graph TD
    A([Início: Acessa o Sistema]) --> B{O que deseja fazer?}
    
    B -->|Realizar Chamada| C[Clica em 'Realizar Chamada']
    C --> D[Seleciona a Turma e Data]
    D --> E[Marca as Faltas na Lista]
    E --> F[Confirma a Chamada]
    F --> G([Alunos atualizados para Ausentes])
    
    B -->|Enviar Avisos Gerais| H[Clica em 'Avisos Gerais']
    H --> I[Seleciona Público-Alvo: Turma ou Todos]
    I --> J[Abre o Editor de Mensagens]
    
    B -->|Enviar Msg de Falta| K[Filtra alunos na Aba 'Ausentes']
    K --> L[Seleciona os alunos desejados]
    L --> M[Clica no botão 'Enviar']
    M --> J
    
    J --> N{Sistema: Tem aluno de Atestado?}
    
    N -->|Sim, e a msg é de Falta| O[Aviso: Alunos de atestado!]
    O --> P{Deseja remover da seleção?}
    P -->|Sim| Q[Remove atestados da lista]
    P -->|Não| R([Envio Cancelado])
    Q --> S
    
    N -->|Não / É Aviso Geral| S[Abre Editor de Templates]
    
    S --> T[Escolhe Template: Reunião, Ausência, etc]
    T --> U[Clica em 'Confirmar e Enviar']
    U --> V[Sistema substitui Tags e abre o WhatsApp Web]
    V --> W([Fim: Mensagens Enviadas])

    style A fill:#2D8A61,stroke:#fff,stroke-width:2px,color:#fff
    style W fill:#2D8A61,stroke:#fff,stroke-width:2px,color:#fff
    style R fill:#E53E3E,stroke:#fff,stroke-width:2px,color:#fff
```

## Resumo do Fluxo
A jornada foi desenhada para ser "à prova de erros". Note que o sistema sempre fará uma barreira de proteção (o losango `Tem aluno de Atestado?`) antes de permitir o envio de mensagens de ausência, garantindo que nenhum pai seja cobrado injustamente quando o filho está doente.

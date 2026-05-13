# Arquitetura Conceitual

Este mapa mental detalha como o sistema é estruturado internamente. A visualização a seguir divide a plataforma em 4 grandes áreas: Frontend, Backend, Banco de Dados e Integrações.

```mermaid
mindmap
  root((BuscaAtiva 2.0))
    Frontend (Interface do Usuário)
      Next.js e React
      Gestão de Estado (Alunos, Faltas)
      Modais (Avisos, Atestados)
      Filtros Inteligentes
    Backend (Lógica Oculta)
      API Routes (Next.js)
      Processamento de Arquivos XLSX
      Regras de Bloqueio (Ex: Atestados)
    Banco de Dados (Armazenamento)
      SQLite
        Modo Offline/Local
        Testes
      Supabase
        Nuvem
        Sincronização
    Integrações
      WhatsApp Web API
        Geração de Links Seguros
        Abertura em Lote
```

## Entendendo os componentes:
- **Frontend**: Tudo aquilo que o usuário clica e interage. É a nossa "vitrine".
- **Backend**: Fica escondido e processa os dados, garantindo que as regras (como não enviar mensagem de ausência para quem tem atestado) sejam cumpridas.
- **Banco de Dados**: Onde a memória da escola reside. A flexibilidade entre SQLite e Supabase permite que a escola escolha entre manter dados apenas no próprio computador ou na nuvem.
- **Integrações**: Como o sistema conversa com o mundo exterior (no caso, repassando o comando de envio para o WhatsApp).

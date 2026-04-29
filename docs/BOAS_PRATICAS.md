# Boas Práticas e Guia de Estilo

Este manual deve ser lido tanto por programadores que irão manter o código do sistema quanto pela equipe escolar que fará o disparo das mensagens.

---

## 💻 Para os Desenvolvedores: Código Limpo

1. **Responsividade em Primeiro Lugar**: O sistema pode ser aberto no computador da coordenação ou no celular do professor no pátio. Sempre utilize classes do Tailwind (ex: `flex-col sm:flex-row`) para garantir que as telas se adaptem.
2. **Alertas Claros**: Nunca deixe o sistema falhar silenciosamente. Use `alerts` ou *Toasts* para avisar o usuário se um salvamento falhou ou foi bem-sucedido.
3. **Privacidade (Local First)**: Lembre-se que lidamos com dados de menores de idade. A preferência é sempre processar os contatos no navegador (`localStorage` ou SQLite local) antes de qualquer envio para a nuvem.

---

## 👩‍🏫 Para a Equipe Escolar: O Tom de Voz

A comunicação pelo BuscaAtiva representa a voz oficial da escola. 

### 1. Seja Empático, não Punitivo
Quando um aluno falta, o primeiro contato nunca deve soar como uma cobrança ou ameaça. Deve ser um ato de acolhimento.
- ❌ **Ruim**: "O aluno [Aluno] não veio hoje. O senhor precisa justificar a falta imediatamente."
- ✅ **Bom**: "Olá [Responsável]! Notamos que o(a) [Aluno] não compareceu hoje. Está tudo bem por aí? Sentimos falta dele(a) nas atividades."

### 2. Evite o "Caps Lock" (Letras Maiúsculas)
Na linguagem da internet, escrever tudo em letras maiúsculas equivale a gritar. Use apenas para destacar datas ou horários muito importantes.

### 3. Ética e Privacidade
- Não utilize os números de telefone exportados do sistema para finalidades não ligadas à escola.
- Se for criar um recado geral sobre um surto de doença ou piolho, por exemplo, **jamais** cite o nome do aluno paciente zero no recado.

### 4. Aproveite as Templates
Em vez de digitar mensagens do zero, use a aba "Avisos Gerais" e selecione as opções de *Reunião de Pais* ou *Suspensão*. Isso garante que todas as turmas recebam o mesmo padrão de qualidade e evita erros de digitação.

# O que não fazer

Arquivo de limites: apenas o que você NÃO pode fazer neste repositório. Ele
fala do agente, não do projeto — por isso vale igual em qualquer stack. Se uma
linha começar a citar linguagem, pasta ou biblioteca, ela está no arquivo
errado (isso é AGENTS.md ou um ADR).

## Autoridade
- Não escreva ADR. Se encontrar uma decisão que precisa de um, descreva a
  decisão e as alternativas, e PARE. Quem decide é o time.
- Não contrarie o que está em docs/adr/. Se precisar contrariar, pare e diga.
- Não responda por conta própria o que o PRD deixou ambíguo. Liste as
  perguntas e espere.
- Não escolha biblioteca, serviço ou padrão que não esteja no ADR-001.
  Proponha e espere.

## Escopo
- Não altere arquivo fora do escopo da tarefa atual.
- Não crie estrutura de pastas nova que não esteja num plano aprovado.
- Não gere scaffold automático de framework sem mostrar antes o que ele vai criar.
- Não escreva código de funcionalidade sem uma spec correspondente em
  docs/specs/. O esqueleto do projeto (andar zero) é a única exceção.

## Ritmo
- Não escreva código antes de um plano aprovado. Escreva o plano, mostre, e espere.
- "Pode implementar" NÃO autoriza o plano inteiro: execute UMA tarefa, rode os
  checks, mostre o resultado e pare.
- Não relate sucesso parcial. Se um check falhou, a tarefa não terminou.

## Segredos
- Nunca invente credencial. Nunca leia, exiba ou commite o .env. O que entra no
  repositório é .env.example, sem valor real.
- Nunca escreva segredo em spec, PRD, ADR, AGENTS.md, handoff ou chat.
- A chave service_role do Supabase só pode existir nesta API; nunca no frontend.

## Precedência
- Se o código e uma spec discordarem sobre comportamento, a spec está certa até
  que alguém mude a spec.
- Se uma spec e um ADR discordarem, pare e avise. Não escolha um dos dois.

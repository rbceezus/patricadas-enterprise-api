# CLAUDE.md

O Claude Code carrega este arquivo em toda sessão, mas não carrega
`AGENTS.md` nem `rules/` sozinho. Sem estes imports, a regra que exige o
verificador antes de declarar uma spec pronta (`rules/spec-flow.md`) não
entra no contexto, e o gatilho volta a depender de alguém lembrar.

A fonte continua sendo `AGENTS.md` e `rules/`. Não escreva regra aqui.

@AGENTS.md
@rules/restrictions.md
@rules/spec-flow.md
@rules/checks.md
@rules/secrets.md

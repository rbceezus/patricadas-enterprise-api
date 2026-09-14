# Handoff

Registro efêmero de onde a sessão parou. Não é fonte de verdade de nada — pode
ser sobrescrito à vontade.

## Último estado
Estrutura do repositório organizada para a arquitetura de dois repositórios
(API + frontend), conforme a ADR-001 e as aulas 7 e 8:
- Conteúdo trazido para a raiz (este repositório = API).
- Materiais de aula consolidados em `docs/aulas/`; `layout.md` movido para `docs/`.
- Artefatos a priori escritos: `rules/restrictions.md`, `AGENTS.md` (v0),
  `docs/PRD.md`, `.env.example`, `.gitignore`, `rules/tests.md`.
- `docs/specs/` ainda vazio (a primeira spec vem depois do andar zero).

## Próximo passo
Andar zero (AZ-01..AZ-08): provar que a stack do ADR-001 sobe junta numa máquina
limpa. Exige plano aprovado antes de qualquer código (ver aula 8).

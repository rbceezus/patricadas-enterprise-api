# Spec 001 — Empréstimo de equipamentos (v1)

Status: rascunho — aguardando aprovação
Origem: docs/PRD.md (v1) · Stack: docs/adr/001-stack.md

## Objetivo
Substituir a planilha compartilhada: todo mundo vê o que está disponível,
pede e devolve pelo sistema, e Operações enxerga quem está com o quê.

## Atores
| Ator | Papel (membership) | Pode |
|---|---|---|
| Colaborador | `colaborador` | ver catálogo, solicitar, devolver os próprios, ver os próprios empréstimos |
| Operações | `operacoes` | tudo do colaborador + cadastrar equipamento, alterar situação, ver todos os empréstimos em aberto, registrar devolução de qualquer pessoa |

Tenant único na v1: `suporte_ti`. `tenant_id` e `user_id` vêm sempre do JWT.

## Modelo de domínio
**Equipamento**: `id`, `tenant_id`, `nome`, `categoria` (notebook | monitor | cabo | camera | outro),
`patrimonio` (único por tenant), `situacao` (disponivel | emprestado | manutencao), `criado_em`.

**Empréstimo**: `id`, `tenant_id`, `equipamento_id`, `usuario_id`, `retirado_em`,
`prazo_em` (= `retirado_em` + 14 dias), `devolvido_em` (nulo enquanto aberto),
`devolucao_registrada_por`.

Derivado: empréstimo **em atraso** = aberto e `agora > prazo_em`.

## Regras de negócio
- **RN-01** Uma pessoa tem no máximo **3** empréstimos abertos.
- **RN-02** Prazo padrão de devolução: **14 dias** a partir da retirada.
- **RN-03** Quem tem empréstimo em atraso não pode solicitar outro.
- **RN-04** Equipamento em `manutencao` nunca aparece como disponível e não pode ser emprestado.
- **RN-05** Só equipamento `disponivel` pode ser emprestado; ao emprestar vira `emprestado`,
  ao devolver volta a `disponivel`. Solicitação e mudança de situação acontecem na mesma transação
  (dois pedidos simultâneos pelo mesmo item: só um vence).
- **RN-06** Colaborador só devolve empréstimo próprio; Operações devolve qualquer um.
- **RN-07** Equipamento `emprestado` não pode ir para `manutencao` sem antes ser devolvido.

## Funcionalidades e critérios de aceite

### F1 — Login
- Supabase Auth, e-mail e senha, cadastro só por convite (ADR-001).
- Sem token válido, qualquer rota `/v1/*` responde 401.

### F2 — Catálogo
`GET /v1/equipamentos?situacao=&cursor=`
- Lista equipamentos do tenant com a situação. Paginação por cursor.
- Dado um item em manutenção, quando listo com `situacao=disponivel`, ele não aparece.

`POST /v1/equipamentos` (Operações) — cria com situação `disponivel`.
`PATCH /v1/equipamentos/:id` (Operações) — altera nome/categoria/situação, respeitando RN-07.

### F3 — Solicitar empréstimo
`POST /v1/emprestimos` `{ equipamentoId }`
- Sucesso: 201, empréstimo com `prazo_em` = retirada + 14 dias; item vira `emprestado`.
- Item não disponível → 409 (Problem Details, `type` = `equipamento-indisponivel`).
- 3 abertos → 422 `limite-emprestimos`.
- Algum em atraso → 422 `emprestimo-em-atraso`.

### F4 — Devolver
`POST /v1/emprestimos/:id/devolucao`
- Sucesso: 200, preenche `devolvido_em`; item volta a `disponivel`.
- Empréstimo de outra pessoa (colaborador) → 403. Já devolvido → 409.

### F5 — Meus empréstimos
`GET /v1/emprestimos/meus` — abertos e histórico do usuário logado, com flag `emAtraso`.

### F6 — Painel de Operações
`GET /v1/emprestimos?aberto=true&cursor=` (Operações) — todos os abertos, com pessoa,
item, prazo e `emAtraso`. Colaborador → 403.

## Requisitos não funcionais
- Erros em RFC 9457. Rotas com prefixo `/v1`. Validação com Zod.
- Teste de isolamento por endpoint: tenant A não enxerga dado de tenant B.
- Toda criação, devolução e mudança de situação grava auditoria (ator, tenant, ação, recurso).

## Fora do escopo (PRD)
Reserva com data futura · notificação por e-mail · importação da planilha.

## Perguntas em aberto (decidir antes do plano)
1. O empréstimo é aprovado automaticamente ou Operações precisa confirmar a retirada no balcão?
   (Esta spec assume automático.)
2. Operações também pode pegar itens emprestados e cai nas mesmas regras?
3. Dá para renovar o prazo? (Assumido: não na v1.)
4. Equipamento pode ser excluído, ou só desativado?
5. Precisa de campos além de nome/categoria/patrimônio (nº de série, observações)?
6. "Atraso" conta por dia (fim do dia do prazo) ou pela hora exata da retirada?

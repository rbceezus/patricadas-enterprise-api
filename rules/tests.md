# Testes — convenções

Como os testes funcionam neste repositório. Ainda não há código nem suíte: esta
página será preenchida com fatos verificáveis (comando para rodar, banco de
teste, padrão adotado) depois do andar zero — ver AZ-06 em
`docs/aulas/aula8-greenfield-ordem.html`.

## Decisões já registradas no ADR-001 (contexto, não instrução verificável ainda)
- Unitário do backend: Jest.
- API sobre Nest: supertest.
- Integração de banco: Testcontainers com PostgreSQL real (sem mock de Prisma).
- E2E: Playwright.
- Todo endpoint de domínio precisa provar que o tenant A não acessa dados do
  tenant B.
- Sem meta percentual de cobertura; caminhos críticos são obrigatórios.

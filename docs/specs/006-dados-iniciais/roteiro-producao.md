# Roteiro de produção — specs 006 e 001

Executado por uma pessoa. O agente não escreve em produção (regra da
prática, `rules/restrictions.md`). Cada passo diz o que confirma que deu
certo. Nenhum valor secreto vai para arquivo: as variáveis são definidas só
no terminal e apagadas no fim.

## 0. Antes de começar

- Troque a chave secreta do Supabase que apareceu no chat (API Keys → New
  secret key; apague a antiga). Use a nova daqui para frente.
- Faça o merge, nesta ordem: API `feat/skill-imagens-equipamentos` →
  `feat/006-dados-iniciais` → `main`; front `feat/001-login-real` → `main`.

## 1. Variáveis na Vercel

Projeto da API:

| variável | valor |
|---|---|
| `SUPABASE_URL` | `https://lofpoupzjigpsqwnzrwa.supabase.co` |
| `DATABASE_URL` | conexão do pooler (porta 6543, `?pgbouncer=true&connection_limit=1`) |
| `FRONTEND_ORIGIN` | URL do front na Vercel, **sem barra no final** |

Projeto do front:

| variável | valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://lofpoupzjigpsqwnzrwa.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | a chave **publishable** (`sb_publishable_...`), nunca a secret |
| `VITE_API_BASE_URL` | URL da API na Vercel + `/v1` |

Depois de salvar, faça redeploy dos dois projetos.

## 2. Migration (PowerShell, pasta `api/`)

```powershell
$env:DATABASE_URL = "<conexão DIRETA do Supabase, porta 5432>"
$env:DIRECT_URL = $env:DATABASE_URL
npx prisma migrate deploy
```

Confirma: "All migrations have been successfully applied" com
`20261110123515_init` e `20261110180000_rls_deny_by_default`.

## 3. Seed (mesmo terminal)

```powershell
$env:IMAGENS_BASE_URL = "https://lofpoupzjigpsqwnzrwa.supabase.co/storage/v1/object/public/equipamentos"
npx ts-node prisma/seed.ts
npx ts-node prisma/seed.ts
```

Confirma: as duas execuções dizem "Equipamentos prontos: 12" (a segunda não
duplica nada — CA-06).

## 4. Conta do professor (mesmo terminal)

```powershell
$env:SUPABASE_URL = "https://lofpoupzjigpsqwnzrwa.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<a secret key NOVA>"
$env:PROFESSOR_SENHA = "<senha padrão da turma>"
npx ts-node prisma/criar-conta-professor.ts
```

Digite `lofpoupzjigpsqwnzrwa.supabase.co` quando pedir. Confirma: "Conta
criada: marcelo.grilo@institutojef.org.br · Colaborador · 0 empréstimo(s)".

## 5. Limpar o terminal

```powershell
Remove-Item Env:DATABASE_URL, Env:DIRECT_URL, Env:IMAGENS_BASE_URL, Env:SUPABASE_URL, Env:SUPABASE_SERVICE_ROLE_KEY, Env:PROFESSOR_SENHA
```

## 6. Conferir no link da Vercel

- Entrar com a conta do professor: deve cair em "Catálogo" com o nome e
  "Colaborador". Clicar em Sair. **Não** criar empréstimo com essa conta.
- Senha errada: aparece "E-mail ou senha incorretos.".
- As imagens: o agente roda `conferir.ts` (só leitura, sem login).

# Leitura em Família

Um app simples para um grupo pequeno (pensado para 3 pessoas) ler a Bíblia junto, dia a dia,
confirmar que leu a passagem do dia, e receber um breve devocional — comentário e aplicação
prática — escrito a partir da tradição reformada.

## O que o app faz

- **Plano de leitura de 180 dias**: Novo Testamento inteiro + Salmos, gerado
  automaticamente (`lib/plan.ts`) e distribuído dia a dia de forma equilibrada, mantendo a
  ordem canônica dos livros.
- **Devocional diário**: para cada um dos 180 dias, um título, um comentário (~150 palavras)
  e uma aplicação prática para o dia, com um tom cristocêntrico e reformado, em português
  (`data/devotionals/*.json`).
- **Confirmação de leitura**: cada membro entra com nome + PIN e marca "li hoje". O painel
  mostra quem do grupo já confirmou a leitura do dia.
- **Histórico**: uma tabela com todos os dias já percorridos pelo plano e quem confirmou cada um.
- Sem contas externas, sem envio de e-mail — pensado para rodar como um app pequeno e privado
  para o grupo.

## Como rodar localmente

```bash
npm install
cp .env.example .env.local   # ajuste os nomes e PINs dos 3 membros
npm run dev
```

Abra http://localhost:3000, escolha um nome e entre com o PIN configurado.

## Configuração (variáveis de ambiente)

Veja `.env.example`. As principais são:

- `MEMBER1_NAME` / `MEMBER1_PIN`, `MEMBER2_NAME` / `MEMBER2_PIN`, `MEMBER3_NAME` / `MEMBER3_PIN`:
  nome e PIN de cada pessoa do grupo. **Troque os valores padrão antes de usar de verdade.**
- `PLAN_START_DATE` (formato `AAAA-MM-DD`): data em que o dia 1 do plano começa. Só é lida na
  primeira vez que o app roda (fica gravada no banco depois disso); se não for definida, usa a
  data do primeiro acesso.
- `SESSION_SECRET`: chave usada para assinar o cookie de sessão. Defina um valor aleatório em
  produção.

Alterar o nome de uma pessoa em `MEMBER*_NAME` depois que o app já rodou cria um usuário novo
(não renomeia o existente) — troque com cuidado, ou apague `data/app.db` para recomeçar do zero.

## Dados e persistência

O app usa SQLite (`better-sqlite3`), com o arquivo do banco em `data/app.db` (criado
automaticamente na primeira execução, e ignorado pelo git — não é parte do código-fonte).
Esse arquivo guarda os 3 usuários (nome + PIN com hash), as confirmações de leitura de cada dia,
e a data de início do plano.

Os textos dos devocionais ficam em `data/devotionals/*.json` e fazem parte do repositório
(não são gerados em tempo de execução).

## Implantação (deploy)

Como o app grava em um arquivo SQLite local, ele precisa rodar em um servidor com sistema de
arquivos persistente entre as requisições — por exemplo Railway, Render, Fly.io ou uma VPS
comum, com:

```bash
npm run build
npm start
```

Isso **não** funciona bem em uma função serverless "pura" (como o runtime padrão da Vercel),
porque o sistema de arquivos não é garantido como persistente entre invocações. Se quiser usar
a Vercel, será necessário trocar o SQLite por um banco externo (ex. Postgres) — isso não está
implementado aqui.

Lembre-se de configurar as variáveis de ambiente (nomes/PINs reais e `SESSION_SECRET`) no
serviço de hospedagem antes de compartilhar o link com o grupo.

## Estrutura do código

- `lib/bibleBooks.ts`, `lib/plan.ts` — dados dos livros do NT e o algoritmo que gera o plano de
  180 dias.
- `lib/devotionals.ts` — carrega os textos devocionais de `data/devotionals/`.
- `lib/db.ts` — camada de banco de dados (usuários, confirmações, configurações).
- `lib/session.ts` — sessão simples baseada em cookie assinado (nome + PIN, sem senha de conta).
- `app/` — páginas (Next.js App Router): `/login`, `/` (dia atual), `/dia/[day]` (navegar por
  qualquer dia do plano), `/historico` (tabela de progresso do grupo).

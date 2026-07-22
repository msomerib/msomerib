# Monitor de ARTs

Aplicativo web simples para acompanhar vencimentos de ARTs (Anotação de
Responsabilidade Técnica), com alerta para vencimentos em até 10 dias e
geração de relatórios.

## Usar agora

Abra `index.html` diretamente no navegador — não precisa instalar nada nem
rodar servidor. Os dados iniciais vêm da planilha `ART_AR_SUL.xlsx` (24 ARTs)
e ficam salvos no navegador (localStorage) a partir da primeira alteração.

## Publicar no GitHub Pages (acesso pelo celular/qualquer navegador)

Este repositório já tem um workflow (`.github/workflows/deploy-pages.yml`)
que publica o site a cada push na branch `main`. Para ativar (só precisa
fazer uma vez):

1. No GitHub, vá em **Settings → Pages**.
2. Em "Build and deployment" → "Source", selecione **GitHub Actions**.
3. Dê um push na branch `main` (ou rode o workflow manualmente em
   **Actions → Deploy static site to GitHub Pages → Run workflow**).
4. O link do site aparece em Settings → Pages depois do primeiro deploy.

## Funcionalidades

- **Painel de resumo**: total de ARTs, válidas, vencendo em até 10 dias e
  vencidas.
- **Alerta automático** no topo da página sempre que houver ART vencendo em
  até 10 dias ou já vencida.
- **Cadastro completo**: adicionar, editar, excluir e renovar ARTs (o botão
  "Renovar" já sugere nova vigência de +1 ano a partir do vencimento atual).
- **Busca e filtros** por nome, número da ART, CNPJ, endereço ou status.
- **Importar planilha** (.xlsx/.xls/.csv) para adicionar ou substituir a
  lista atual — útil se você preferir continuar atualizando pela planilha.
- **Exportar Excel** e **Gerar relatório em PDF** (usa a função de impressão
  do navegador — escolha "Salvar como PDF" na janela de impressão).

## Usar em duas (ou mais) pessoas com dados sincronizados

Por padrão, os dados ficam só no navegador de cada pessoa (não sincronizam
sozinhos). Para que duas pessoas vejam e editem a mesma lista, com qualquer
alteração aparecendo automaticamente para a outra em poucos segundos, é
preciso um banco de dados compartilhado gratuito (Firebase Realtime
Database, do Google). Passo a passo:

1. Acesse **https://console.firebase.google.com** com uma conta Google e
   clique em **Adicionar projeto** (pode desativar o Google Analytics, não
   é necessário).
2. Dentro do projeto, no menu à esquerda vá em **Build → Realtime
   Database** e clique em **Criar banco de dados**. Escolha uma região e
   inicie em modo bloqueado ("locked mode").
3. Na aba **Regras** desse banco, substitua o conteúdo por:
   ```json
   {
     "rules": {
       "monitor-arts-af144b17f38c813c": {
         ".read": true,
         ".write": true
       },
       "$other": {
         ".read": false,
         ".write": false
       }
     }
   }
   ```
   e clique em **Publicar**.
4. Na aba **Dados**, copie a URL do banco (algo como
   `https://SEU-PROJETO-default-rtdb.firebaseio.com`).
5. Cole essa URL em `assets/firebase-config.js`, na linha
   `window.FIREBASE_DB_URL = "..."`, e publique a atualização (ou me envie
   a URL que eu faço essa parte).

Depois disso, todo mundo que abrir o link do app vai ver os mesmos dados,
e qualquer alteração feita por uma pessoa aparece para a outra em poucos
segundos (o app verifica atualizações automaticamente e também tem um
botão "Atualizar agora"). Sem essa configuração, o app continua funcionando
normalmente, só que cada aparelho guarda seus próprios dados.

**Nota sobre privacidade**: essas regras deixam os dados legíveis/editáveis
por qualquer pessoa que descubra essa URL específica (não aparece em
buscadores nem é compartilhada em lugar nenhum, mas não é uma senha real).
Para os dados de ARTs desse uso (nome, CNPJ, endereço, valor), esse nível
de proteção costuma ser suficiente; para algo mais sensível, dá para
adicionar login por e-mail/senha no Firebase — é só pedir.

## Sobre o aviso de 10 dias

Hoje o aviso é **dentro do app**: toda vez que você abrir a página, o
banner no topo mostra o que está vencendo. Como é um site estático (sem
servidor rodando o tempo todo), ele não manda notificação sozinho se
ninguém abrir a página.

Se no futuro você quiser um e-mail automático diário (mesmo sem abrir o
app), dá para configurar uma rotina agendada (GitHub Actions + envio de
e-mail) lendo os dados exportados — é só pedir que eu configuro. Isso exige
cadastrar uma credencial de e-mail como "secret" no repositório.

## Estrutura

```
index.html                  página principal
assets/app.js                lógica do app (dados, filtros, relatórios, sincronização)
assets/style.css             estilos
assets/seed-data.js          dados iniciais importados da planilha
assets/firebase-config.js    configuração do banco de dados compartilhado (opcional)
.github/workflows/           publicação automática no GitHub Pages
```

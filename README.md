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
index.html              página principal
assets/app.js           lógica do app (dados, filtros, relatórios)
assets/style.css        estilos
assets/seed-data.js     dados iniciais importados da planilha
.github/workflows/      publicação automática no GitHub Pages
```

# Sistema de Moradias - Versao Excel com VBA

## Como instalar (sem precisar de Python ou admin)

### Passo 1 - Habilitar Macros no Excel

1. Abra o Excel
2. Clique em **Arquivo** > **Opcoes**
3. Clique em **Central de Confiabilidade** > **Configuracoes da Central de Confiabilidade**
4. Clique em **Configuracoes de Macro**
5. Selecione **Habilitar todas as macros**
6. Clique OK em tudo

### Passo 2 - Criar o arquivo do sistema

1. Abra o Excel e crie uma pasta de trabalho em branco
2. Pressione **Alt + F11** (abre o editor VBA)
3. No menu do editor: **Inserir** > **Modulo**
4. Cole o conteudo de `modSetup.bas` no modulo e execute `CriarSistema`
5. Repita para os outros modulos:
   - modImoveis.bas
   - modContratos.bas
   - modLeiloes.bas
   - modOfertas.bas
   - modDashboard.bas

### Passo 3 - Salvar como macro

1. Pressione **Ctrl + S**
2. Escolha o formato: **Pasta de Trabalho Habilitada para Macro do Excel (.xlsm)**
3. Salve na pasta desejada

---

## Como usar o sistema

### Abas disponiveis:
- **Dashboard**: Visao geral com totais e alertas de vencimento
- **Imoveis**: Cadastro de todos os imoveis
- **Contratos**: Contratos de cessao onerosa e comodato
- **Leiloes**: Leiloes (ALN) cadastrados
- **Lotes_Leilao**: Lotes e arrematantes de cada leilao
- **Ofertas**: Ofertas de compra em andamento

### Botoes em cada aba:
- **+ Novo**: Abre formulario para cadastrar novo registro
- **Editar**: Selecione uma linha e clique para editar
- **Excluir**: Selecione uma linha e clique para excluir
- **Exportar Excel**: Exporta a aba atual para um novo arquivo .xlsx

### Dashboard:
- Clique em **Atualizar Dashboard** para recalcular os indicadores
- Contratos vencendo em menos de 60 dias aparecem destacados em laranja/vermelho

---

## Dicas

- Datas: formato DD/MM/AAAA
- Valores monetarios: virgula como separador decimal (ex: 150000,00)
- Sempre salve o arquivo apos cadastrar registros (Ctrl + S)
- Mantenha backups regulares do arquivo .xlsm

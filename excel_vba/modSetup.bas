Attribute VB_Name = "modSetup"
Option Explicit

'=============================================================
' SISTEMA DE MORADIAS - ITAIPU BINACIONAL
' modSetup: Cria toda a estrutura do workbook
' Execute CriarSistema() UMA VEZ em uma pasta de trabalho nova
'=============================================================

Sub CriarSistema()
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False

    ' Remove abas existentes (exceto a primeira)
    Dim ws As Worksheet
    Do While ThisWorkbook.Sheets.Count > 1
        ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count).Delete
    Loop
    ThisWorkbook.Sheets(1).Name = "TEMP_DELETE"

    ' Cria as abas na ordem correta
    CriarAbaDashboard
    CriarAbaImoveis
    CriarAbaContratos
    CriarAbaLeiloes
    CriarAbaLotes
    CriarAbaOfertas
    CriarAbaConfig

    ' Remove aba temporaria
    ThisWorkbook.Sheets("TEMP_DELETE").Delete

    ' Vai para o Dashboard
    ThisWorkbook.Sheets("Dashboard").Activate

    Application.ScreenUpdating = True
    Application.DisplayAlerts = True

    MsgBox "Sistema de Moradias criado com sucesso!" & vbNewLine & _
           "Salve o arquivo como .xlsm (Pasta Habilitada para Macros).", _
           vbInformation, "Concluido"
End Sub

Sub CriarAbaDashboard()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets.Add(Before:=ThisWorkbook.Sheets(1))
    ws.Name = "Dashboard"
    ws.Range("A1:J1").Merge
    ws.Range("A1").Value = "SISTEMA DE GERENCIAMENTO DE MORADIAS - ITAIPU BINACIONAL"
    ws.Range("A1").Font.Bold = True
    ws.Range("A1").Font.Size = 14
    ws.Range("A1").Font.Color = RGB(255, 255, 255)
    ws.Range("A1").HorizontalAlignment = xlCenter
    ws.Range("A1:J1").Interior.Color = RGB(21, 101, 192)
    ws.Rows(1).RowHeight = 35
    ws.Range("A2:J2").Merge
    ws.Range("A2").Value = "Setor de Moradias - SGII.AD"
    ws.Range("A2").Font.Italic = True
    ws.Range("A2").Font.Size = 10
    ws.Range("A2").HorizontalAlignment = xlCenter
    ws.Range("A2:J2").Interior.Color = RGB(66, 165, 245)
    ws.Range("A2").Font.Color = RGB(255, 255, 255)
    ws.Range("A4").Value = "RESUMO GERAL"
    ws.Range("A4").Font.Bold = True
    ws.Range("A4").Font.Size = 11
    CriarCardKPI ws, "B6", "Total de Imoveis", "=COUNTA(Imoveis!A:A)-1", RGB(21, 101, 192)
    CriarCardKPI ws, "D6", "Contratos Ativos", "=COUNTIF(Contratos!F:F,""Ativo"")", RGB(46, 125, 50)
    CriarCardKPI ws, "F6", "Leiloes Realizados", "=COUNTIF(Leiloes!D:D,""Realizado"")", RGB(230, 81, 0)
    CriarCardKPI ws, "H6", "Ofertas em Analise", "=COUNTIF(Ofertas!H:H,""Em Analise"")", RGB(106, 27, 154)
    ws.Range("A11").Value = "ALERTAS - CONTRATOS VENCENDO EM 60 DIAS"
    ws.Range("A11").Font.Bold = True
    ws.Range("A11:J11").Interior.Color = RGB(255, 152, 0)
    ws.Range("A11").Font.Color = RGB(255, 255, 255)
    Dim alertHeaders As Variant
    alertHeaders = Array("Num. Contrato", "Imovel", "Responsavel", "Vencimento", "Dias Restantes", "Modalidade")
    Dim i As Integer
    For i = 0 To 5
        ws.Range("A12").Offset(0, i).Value = alertHeaders(i)
        ws.Range("A12").Offset(0, i).Font.Bold = True
        ws.Range("A12").Offset(0, i).Interior.Color = RGB(245, 245, 245)
    Next i
    Dim btn As Object
    Set btn = ws.Buttons.Add(ws.Range("I4").Left, ws.Range("I4").Top, 100, 25)
    btn.Caption = "Atualizar Dashboard"
    btn.OnAction = "modDashboard.AtualizarDashboard"
    ws.Columns("A:J").AutoFit
    ws.Range("A:A").ColumnWidth = 2
End Sub

Sub CriarCardKPI(ws As Worksheet, celula As String, titulo As String, formula As String, cor As Long)
    Dim rng As Range
    Set rng = ws.Range(celula)
    rng.Value = titulo
    rng.Font.Bold = True
    rng.Font.Size = 9
    rng.Font.Color = RGB(255, 255, 255)
    rng.Interior.Color = cor
    rng.HorizontalAlignment = xlCenter
    rng.RowHeight = 20
    rng.Offset(1, 0).Formula = formula
    rng.Offset(1, 0).Font.Bold = True
    rng.Offset(1, 0).Font.Size = 20
    rng.Offset(1, 0).Font.Color = cor
    rng.Offset(1, 0).HorizontalAlignment = xlCenter
    rng.Offset(1, 0).RowHeight = 35
    Dim area As Range
    Set area = ws.Range(celula & ":" & rng.Offset(1, 0).Address)
    area.BorderAround xlContinuous, xlMedium, , cor
End Sub

Sub CriarAbaImoveis()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = "Imoveis"
    Dim headers As Variant
    headers = Array("Codigo", "Entidade", "Quadra", "Lote", "Endereco", "Numero", _
                    "Tipo", "Area m2", "Construcao m2", "Matricula", "Local/Area", _
                    "Morador", "Num. Contrato", "Tipo Contrato", "Vigencia", _
                    "Sit. Contrato", "Taxa Ocup.", "Preco Minimo", "Preco +25%", _
                    "Status", "Observacoes")
    FormatarCabecalho ws, headers, RGB(21, 101, 192)
    Dim larguras As Variant
    larguras = Array(10, 10, 8, 8, 30, 8, 12, 10, 12, 12, 15, 25, 15, 15, 12, 15, 12, 14, 14, 12, 30)
    Dim i As Integer
    For i = 0 To UBound(larguras)
        ws.Columns(i + 1).ColumnWidth = larguras(i)
    Next i
    AdicionarBotoesAba ws, "modImoveis"
End Sub

Sub CriarAbaContratos()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = "Contratos"
    Dim headers As Variant
    headers = Array("Num. Contrato", "Cod. Imovel", "Entidade", "Modalidade", "Tipo Uso", _
                    "Status", "Assinatura", "Vigencia", "Prorrogavel Ate", "CPF/CNPJ", _
                    "Responsavel", "End. Correspondencia", "Telefone", "Email", "Observacoes")
    FormatarCabecalho ws, headers, RGB(46, 125, 50)
    ws.Columns("A:O").AutoFit
    ws.Columns("A").ColumnWidth = 18
    ws.Columns("K").ColumnWidth = 25
    ws.Columns("L").ColumnWidth = 35
    ws.Columns("O").ColumnWidth = 30
    AdicionarBotoesAba ws, "modContratos"
End Sub

Sub CriarAbaLeiloes()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = "Leiloes"
    Dim headers As Variant
    headers = Array("Numero ALN", "Descricao", "Data Edital", "Status", "Qtd Imoveis", "Observacoes")
    FormatarCabecalho ws, headers, RGB(230, 81, 0)
    ws.Columns("A").ColumnWidth = 14
    ws.Columns("B").ColumnWidth = 35
    ws.Columns("C").ColumnWidth = 14
    ws.Columns("D").ColumnWidth = 14
    ws.Columns("E").ColumnWidth = 12
    ws.Columns("F").ColumnWidth = 40
    AdicionarBotoesAba ws, "modLeiloes"
End Sub

Sub CriarAbaLotes()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = "Lotes_Leilao"
    Dim headers As Variant
    headers = Array("ALN", "Lote Leilao", "Quadra", "Lote Imovel", "Matricula", "Endereco", _
                    "Arrematante", "CPF/CNPJ", "Valor Minimo", "Valor Arrematado", "Agio %", _
                    "Garantia 5%", "Valor Pago 5%", "Valor Complementar", "Modo Pagamento", _
                    "Telefone", "Email", "Status", "Observacoes")
    FormatarCabecalho ws, headers, RGB(230, 81, 0)
    ws.Columns("A:S").AutoFit
    ws.Columns("F").ColumnWidth = 30
    ws.Columns("G").ColumnWidth = 25
    ws.Columns("S").ColumnWidth = 30
End Sub

Sub CriarAbaOfertas()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = "Ofertas"
    Dim headers As Variant
    headers = Array("Cod. Imovel", "Num. Contrato", "Proponente", "CPF/CNPJ", _
                    "Telefone", "Email", "Data Oferta", "Status", _
                    "Valor Oferta", "Valor Avaliacao", "Composicao Credito", "Forma Pagamento", _
                    "Prazo Analise", "Prazo Documentos", "Prazo Pagamento", _
                    "Doc: Formulario", "Doc: RG/CPF", "Doc: Comprov. Res.", "Doc: Certidoes", _
                    "Doc: CadUnico", "Doc: Planta", "Observacoes")
    FormatarCabecalho ws, headers, RGB(106, 27, 154)
    ws.Columns("A:V").AutoFit
    ws.Columns("C").ColumnWidth = 25
    ws.Columns("V").ColumnWidth = 35
    AdicionarBotoesAba ws, "modOfertas"
End Sub

Sub CriarAbaConfig()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = "Config"
    ws.Visible = xlSheetVeryHidden
    ws.Range("A1").Value = "STATUS_IMOVEL"
    Dim statusImovel As Variant
    statusImovel = Array("Ocupado - Cessao Onerosa", "Ocupado - Comodato", "Disponivel", _
                         "Em Licitacao", "Reservado", "Manutencao", "Irregular")
    Dim i As Integer
    For i = 0 To UBound(statusImovel)
        ws.Range("A" & (i + 2)).Value = statusImovel(i)
    Next i
    ws.Range("C1").Value = "STATUS_CONTRATO"
    Dim statusContrato As Variant
    statusContrato = Array("Ativo", "Vencido", "Rescindido", "Em Renovacao", "Suspenso")
    For i = 0 To UBound(statusContrato)
        ws.Range("C" & (i + 2)).Value = statusContrato(i)
    Next i
    ws.Range("E1").Value = "MODALIDADE"
    Dim modalidades As Variant
    modalidades = Array("Cessao Onerosa", "Comodato", "Permuta", "Doacao")
    For i = 0 To UBound(modalidades)
        ws.Range("E" & (i + 2)).Value = modalidades(i)
    Next i
    ws.Range("G1").Value = "STATUS_LEILAO"
    Dim statusLeilao As Variant
    statusLeilao = Array("Planejado", "Em Andamento", "Realizado", "Cancelado", "Suspenso")
    For i = 0 To UBound(statusLeilao)
        ws.Range("G" & (i + 2)).Value = statusLeilao(i)
    Next i
    ws.Range("I1").Value = "STATUS_OFERTA"
    Dim statusOferta As Variant
    statusOferta = Array("Em Analise", "Aprovada", "Reprovada", "Cancelada", "Aguardando Docs", "Concluida")
    For i = 0 To UBound(statusOferta)
        ws.Range("I" & (i + 2)).Value = statusOferta(i)
    Next i
End Sub

Sub FormatarCabecalho(ws As Worksheet, headers As Variant, cor As Long)
    Dim i As Integer
    For i = 0 To UBound(headers)
        ws.Cells(1, i + 1).Value = headers(i)
        ws.Cells(1, i + 1).Font.Bold = True
        ws.Cells(1, i + 1).Font.Color = RGB(255, 255, 255)
        ws.Cells(1, i + 1).Interior.Color = cor
        ws.Cells(1, i + 1).HorizontalAlignment = xlCenter
        ws.Cells(1, i + 1).VerticalAlignment = xlCenter
    Next i
    ws.Rows(1).RowHeight = 25
    ws.Rows(1).Font.Size = 10
    ws.Activate
    ws.Range("A2").Select
    ActiveWindow.FreezePanes = True
End Sub

Sub AdicionarBotoesAba(ws As Worksheet, modulo As String)
    ws.Rows(1).Insert
    ws.Rows(1).RowHeight = 30
    Dim btnNovo As Object
    Set btnNovo = ws.Buttons.Add(5, 3, 80, 22)
    btnNovo.Caption = "+ Novo"
    btnNovo.OnAction = modulo & ".NovoRegistro"
    Dim btnEditar As Object
    Set btnEditar = ws.Buttons.Add(95, 3, 80, 22)
    btnEditar.Caption = "Editar"
    btnEditar.OnAction = modulo & ".EditarRegistro"
    Dim btnExcluir As Object
    Set btnExcluir = ws.Buttons.Add(185, 3, 80, 22)
    btnExcluir.Caption = "Excluir"
    btnExcluir.OnAction = modulo & ".ExcluirRegistro"
    Dim btnExportar As Object
    Set btnExportar = ws.Buttons.Add(275, 3, 100, 22)
    btnExportar.Caption = "Exportar Excel"
    btnExportar.OnAction = modulo & ".ExportarExcel"
End Sub

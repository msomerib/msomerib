Attribute VB_Name = "modImoveis"
Option Explicit

Const ABA_IMOVEIS = "Imoveis"
Const LINHA_DADOS = 3
Const COL_CODIGO = 1
Const COL_ENTIDADE = 2
Const COL_QUADRA = 3
Const COL_LOTE = 4
Const COL_ENDERECO = 5
Const COL_NUMERO = 6
Const COL_TIPO = 7
Const COL_AREA = 8
Const COL_CONSTR = 9
Const COL_MATRICULA = 10
Const COL_LOCAL = 11
Const COL_MORADOR = 12
Const COL_CONTRATO = 13
Const COL_TIPO_CONTR = 14
Const COL_VIGENCIA = 15
Const COL_SIT_CONTR = 16
Const COL_TAXA = 17
Const COL_PRECO_MIN = 18
Const COL_PRECO_25 = 19
Const COL_STATUS = 20
Const COL_OBS = 21

Sub NovoRegistro()
    frmImovel.Tag = "NOVO"
    frmImovel.LimparCampos
    frmImovel.Show
End Sub

Sub EditarRegistro()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets(ABA_IMOVEIS)
    Dim linha As Long
    linha = ObterLinhaSelecionada(ws)
    If linha = 0 Then MsgBox "Selecione um imovel para editar.", vbExclamation: Exit Sub
    frmImovel.Tag = "EDITAR:" & linha
    frmImovel.CarregarDados linha
    frmImovel.Show
End Sub

Sub ExcluirRegistro()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets(ABA_IMOVEIS)
    Dim linha As Long
    linha = ObterLinhaSelecionada(ws)
    If linha = 0 Then MsgBox "Selecione um imovel para excluir.", vbExclamation: Exit Sub
    Dim codigo As String
    codigo = ws.Cells(linha, COL_CODIGO).Value
    If MsgBox("Confirma exclusao do imovel " & codigo & "?", vbYesNo + vbQuestion) = vbYes Then
        ws.Rows(linha).Delete
        MsgBox "Imovel excluido.", vbInformation
    End If
End Sub

Sub ExportarExcel()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets(ABA_IMOVEIS)
    Dim caminho As String
    caminho = Application.GetSaveAsFilename("Imoveis_" & Format(Now, "YYYYMMDD"), "Excel (*.xlsx), *.xlsx")
    If caminho = "False" Then Exit Sub
    Dim wbNovo As Workbook
    Set wbNovo = Workbooks.Add
    ws.UsedRange.Copy wbNovo.Sheets(1).Range("A1")
    wbNovo.SaveAs caminho, xlOpenXMLWorkbook
    wbNovo.Close
    MsgBox "Exportado com sucesso!", vbInformation
End Sub

Function ObterLinhaSelecionada(ws As Worksheet) As Long
    Dim cel As Range
    Set cel = Selection
    If cel Is Nothing Then ObterLinhaSelecionada = 0: Exit Function
    If cel.Worksheet.Name <> ws.Name Then ObterLinhaSelecionada = 0: Exit Function
    If cel.Row <= 2 Then ObterLinhaSelecionada = 0: Exit Function
    ObterLinhaSelecionada = cel.Row
End Function

Function ProximaLinhaVazia(ws As Worksheet) As Long
    Dim ultima As Long
    ultima = ws.Cells(ws.Rows.Count, COL_CODIGO).End(xlUp).Row
    If ultima < LINHA_DADOS - 1 Then ProximaLinhaVazia = LINHA_DADOS Else ProximaLinhaVazia = ultima + 1
End Function

Function CodigoExiste(codigo As String) As Boolean
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets(ABA_IMOVEIS)
    Dim cel As Range
    Set cel = ws.Columns(COL_CODIGO).Find(codigo, LookIn:=xlValues, LookAt:=xlWhole)
    CodigoExiste = Not cel Is Nothing
End Function

Sub SalvarImovel(linha As Long, isNovo As Boolean, _
    codigo As String, entidade As String, quadra As String, lote As String, _
    endereco As String, numero As String, tipo As String, _
    area As String, constr As String, matricula As String, _
    local_area As String, morador As String, num_contrato As String, _
    tipo_contrato As String, vigencia As String, sit_contrato As String, _
    taxa As String, preco_min As String, preco_25 As String, _
    status As String, obs As String)

    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets(ABA_IMOVEIS)
    If isNovo Then
        If CodigoExiste(codigo) Then MsgBox "Codigo " & codigo & " ja existe!", vbExclamation: Exit Sub
        linha = ProximaLinhaVazia(ws)
    End If
    ws.Cells(linha, COL_CODIGO).Value = codigo
    ws.Cells(linha, COL_ENTIDADE).Value = entidade
    ws.Cells(linha, COL_QUADRA).Value = quadra
    ws.Cells(linha, COL_LOTE).Value = lote
    ws.Cells(linha, COL_ENDERECO).Value = endereco
    ws.Cells(linha, COL_NUMERO).Value = numero
    ws.Cells(linha, COL_TIPO).Value = tipo
    ws.Cells(linha, COL_AREA).Value = CDblSafe(area)
    ws.Cells(linha, COL_CONSTR).Value = CDblSafe(constr)
    ws.Cells(linha, COL_MATRICULA).Value = matricula
    ws.Cells(linha, COL_LOCAL).Value = local_area
    ws.Cells(linha, COL_MORADOR).Value = morador
    ws.Cells(linha, COL_CONTRATO).Value = num_contrato
    ws.Cells(linha, COL_TIPO_CONTR).Value = tipo_contrato
    ws.Cells(linha, COL_VIGENCIA).Value = CDateSafe(vigencia)
    ws.Cells(linha, COL_SIT_CONTR).Value = sit_contrato
    ws.Cells(linha, COL_TAXA).Value = CDblSafe(taxa)
    ws.Cells(linha, COL_PRECO_MIN).Value = CDblSafe(preco_min)
    ws.Cells(linha, COL_PRECO_25).Value = CDblSafe(preco_25)
    ws.Cells(linha, COL_STATUS).Value = status
    ws.Cells(linha, COL_OBS).Value = obs
    ws.Cells(linha, COL_TAXA).NumberFormat = "R$ #,##0.00"
    ws.Cells(linha, COL_PRECO_MIN).NumberFormat = "R$ #,##0.00"
    ws.Cells(linha, COL_PRECO_25).NumberFormat = "R$ #,##0.00"
    ws.Cells(linha, COL_VIGENCIA).NumberFormat = "DD/MM/YYYY"
    AplicarCorStatus ws.Rows(linha), status
End Sub

Sub AplicarCorStatus(rng As Range, status As String)
    Select Case status
        Case "Ocupado - Cessao Onerosa": rng.Interior.Color = RGB(227, 242, 253)
        Case "Ocupado - Comodato": rng.Interior.Color = RGB(232, 245, 233)
        Case "Disponivel": rng.Interior.Color = RGB(255, 255, 255)
        Case "Em Licitacao": rng.Interior.Color = RGB(255, 243, 224)
        Case "Irregular": rng.Interior.Color = RGB(255, 235, 238)
        Case Else: rng.Interior.Color = RGB(245, 245, 245)
    End Select
End Sub

Function CDblSafe(valor As String) As Double
    On Error Resume Next
    CDblSafe = CDbl(Replace(Replace(valor, "R$", ""), ".", ""))
    If Err.Number <> 0 Then CDblSafe = 0
    On Error GoTo 0
End Function

Function CDateSafe(valor As String) As Variant
    On Error Resume Next
    If Len(Trim(valor)) = 0 Then CDateSafe = "": Exit Function
    CDateSafe = CDate(valor)
    If Err.Number <> 0 Then CDateSafe = ""
    On Error GoTo 0
End Function

Attribute VB_Name = "modLeiloes"
Option Explicit

Sub NovoRegistro()
    frmLeilao.Tag = "NOVO"
    frmLeilao.LimparCampos
    frmLeilao.Show
End Sub

Sub EditarRegistro()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Leiloes")
    Dim linha As Long
    linha = modImoveis.ObterLinhaSelecionada(ws)
    If linha = 0 Then MsgBox "Selecione um leilao para editar.", vbExclamation: Exit Sub
    frmLeilao.Tag = "EDITAR:" & linha
    frmLeilao.CarregarDados linha
    frmLeilao.Show
End Sub

Sub ExcluirRegistro()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Leiloes")
    Dim linha As Long
    linha = modImoveis.ObterLinhaSelecionada(ws)
    If linha = 0 Then MsgBox "Selecione um leilao para excluir.", vbExclamation: Exit Sub
    If MsgBox("Confirma exclusao?", vbYesNo + vbQuestion) = vbYes Then ws.Rows(linha).Delete
End Sub

Sub ExportarExcel()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Leiloes")
    Dim caminho As String
    caminho = Application.GetSaveAsFilename("Leiloes_" & Format(Now, "YYYYMMDD"), "Excel (*.xlsx), *.xlsx")
    If caminho = "False" Then Exit Sub
    Dim wbNovo As Workbook
    Set wbNovo = Workbooks.Add
    ws.UsedRange.Copy wbNovo.Sheets(1).Range("A1")
    wbNovo.SaveAs caminho, xlOpenXMLWorkbook
    wbNovo.Close
    MsgBox "Exportado!", vbInformation
End Sub

Sub SalvarLeilao(linha As Long, isNovo As Boolean, _
    numero As String, descricao As String, data_edital As String, _
    status As String, qtd As String, obs As String)

    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Leiloes")
    If isNovo Then
        linha = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
        If linha < 3 Then linha = 3
    End If
    ws.Cells(linha, 1).Value = numero
    ws.Cells(linha, 2).Value = descricao
    ws.Cells(linha, 3).Value = modImoveis.CDateSafe(data_edital)
    ws.Cells(linha, 4).Value = status
    ws.Cells(linha, 5).Value = modImoveis.CDblSafe(qtd)
    ws.Cells(linha, 6).Value = obs
    ws.Cells(linha, 3).NumberFormat = "DD/MM/YYYY"
End Sub

Sub NovoLote()
    frmLote.Tag = "NOVO"
    frmLote.LimparCampos
    frmLote.Show
End Sub

Sub SalvarLote(linha As Long, isNovo As Boolean, _
    aln As String, lote_leilao As String, quadra As String, lote_imovel As String, _
    matricula As String, endereco As String, arrematante As String, _
    cpf_cnpj As String, valor_min As String, valor_arr As String, _
    modo_pgto As String, telefone As String, email As String, _
    status As String, obs As String)

    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Lotes_Leilao")
    If isNovo Then
        linha = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
        If linha < 3 Then linha = 3
    End If
    Dim vMin As Double: vMin = modImoveis.CDblSafe(valor_min)
    Dim vArr As Double: vArr = modImoveis.CDblSafe(valor_arr)
    Dim agio As Double
    If vMin > 0 Then agio = ((vArr - vMin) / vMin) * 100
    ws.Cells(linha, 1).Value = aln
    ws.Cells(linha, 2).Value = lote_leilao
    ws.Cells(linha, 3).Value = quadra
    ws.Cells(linha, 4).Value = lote_imovel
    ws.Cells(linha, 5).Value = matricula
    ws.Cells(linha, 6).Value = endereco
    ws.Cells(linha, 7).Value = arrematante
    ws.Cells(linha, 8).Value = cpf_cnpj
    ws.Cells(linha, 9).Value = vMin
    ws.Cells(linha, 10).Value = vArr
    ws.Cells(linha, 11).Value = agio
    ws.Cells(linha, 12).Value = vArr * 0.05
    ws.Cells(linha, 15).Value = modo_pgto
    ws.Cells(linha, 16).Value = telefone
    ws.Cells(linha, 17).Value = email
    ws.Cells(linha, 18).Value = status
    ws.Cells(linha, 19).Value = obs
    ws.Cells(linha, 9).NumberFormat = "R$ #,##0.00"
    ws.Cells(linha, 10).NumberFormat = "R$ #,##0.00"
    ws.Cells(linha, 11).NumberFormat = "0.00%"
    ws.Cells(linha, 12).NumberFormat = "R$ #,##0.00"
End Sub

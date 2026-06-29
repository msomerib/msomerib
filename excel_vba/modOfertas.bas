Attribute VB_Name = "modOfertas"
Option Explicit

Sub NovoRegistro()
    frmOferta.Tag = "NOVO"
    frmOferta.LimparCampos
    frmOferta.Show
End Sub

Sub EditarRegistro()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Ofertas")
    Dim linha As Long
    linha = modImoveis.ObterLinhaSelecionada(ws)
    If linha = 0 Then MsgBox "Selecione uma oferta para editar.", vbExclamation: Exit Sub
    frmOferta.Tag = "EDITAR:" & linha
    frmOferta.CarregarDados linha
    frmOferta.Show
End Sub

Sub ExcluirRegistro()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Ofertas")
    Dim linha As Long
    linha = modImoveis.ObterLinhaSelecionada(ws)
    If linha = 0 Then MsgBox "Selecione uma oferta para excluir.", vbExclamation: Exit Sub
    If MsgBox("Confirma exclusao?", vbYesNo + vbQuestion) = vbYes Then ws.Rows(linha).Delete
End Sub

Sub ExportarExcel()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Ofertas")
    Dim caminho As String
    caminho = Application.GetSaveAsFilename("Ofertas_" & Format(Now, "YYYYMMDD"), "Excel (*.xlsx), *.xlsx")
    If caminho = "False" Then Exit Sub
    Dim wbNovo As Workbook
    Set wbNovo = Workbooks.Add
    ws.UsedRange.Copy wbNovo.Sheets(1).Range("A1")
    wbNovo.SaveAs caminho, xlOpenXMLWorkbook
    wbNovo.Close
    MsgBox "Exportado!", vbInformation
End Sub

Sub SalvarOferta(linha As Long, isNovo As Boolean, _
    cod_imovel As String, num_contrato As String, proponente As String, _
    cpf_cnpj As String, telefone As String, email As String, _
    data_oferta As String, status As String, _
    valor_oferta As String, valor_aval As String, _
    composicao As String, forma_pgto As String, _
    prazo_analise As String, prazo_docs As String, prazo_pgto As String, _
    doc_form As Boolean, doc_rg As Boolean, doc_res As Boolean, _
    doc_cert As Boolean, doc_cad As Boolean, doc_planta As Boolean, _
    obs As String)

    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Ofertas")
    If isNovo Then
        linha = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
        If linha < 3 Then linha = 3
    End If
    ws.Cells(linha, 1).Value = cod_imovel
    ws.Cells(linha, 2).Value = num_contrato
    ws.Cells(linha, 3).Value = proponente
    ws.Cells(linha, 4).Value = cpf_cnpj
    ws.Cells(linha, 5).Value = telefone
    ws.Cells(linha, 6).Value = email
    ws.Cells(linha, 7).Value = modImoveis.CDateSafe(data_oferta)
    ws.Cells(linha, 8).Value = status
    ws.Cells(linha, 9).Value = modImoveis.CDblSafe(valor_oferta)
    ws.Cells(linha, 10).Value = modImoveis.CDblSafe(valor_aval)
    ws.Cells(linha, 11).Value = composicao
    ws.Cells(linha, 12).Value = forma_pgto
    ws.Cells(linha, 13).Value = modImoveis.CDateSafe(prazo_analise)
    ws.Cells(linha, 14).Value = modImoveis.CDateSafe(prazo_docs)
    ws.Cells(linha, 15).Value = modImoveis.CDateSafe(prazo_pgto)
    ws.Cells(linha, 16).Value = IIf(doc_form, "Sim", "Nao")
    ws.Cells(linha, 17).Value = IIf(doc_rg, "Sim", "Nao")
    ws.Cells(linha, 18).Value = IIf(doc_res, "Sim", "Nao")
    ws.Cells(linha, 19).Value = IIf(doc_cert, "Sim", "Nao")
    ws.Cells(linha, 20).Value = IIf(doc_cad, "Sim", "Nao")
    ws.Cells(linha, 21).Value = IIf(doc_planta, "Sim", "Nao")
    ws.Cells(linha, 22).Value = obs
    ws.Cells(linha, 7).NumberFormat = "DD/MM/YYYY"
    ws.Cells(linha, 9).NumberFormat = "R$ #,##0.00"
    ws.Cells(linha, 10).NumberFormat = "R$ #,##0.00"
    ws.Cells(linha, 13).NumberFormat = "DD/MM/YYYY"
    ws.Cells(linha, 14).NumberFormat = "DD/MM/YYYY"
    ws.Cells(linha, 15).NumberFormat = "DD/MM/YYYY"
    Select Case status
        Case "Em Analise": ws.Rows(linha).Interior.Color = RGB(255, 243, 224)
        Case "Aprovada": ws.Rows(linha).Interior.Color = RGB(232, 245, 233)
        Case "Reprovada": ws.Rows(linha).Interior.Color = RGB(255, 235, 238)
        Case "Concluida": ws.Rows(linha).Interior.Color = RGB(227, 242, 253)
        Case Else: ws.Rows(linha).Interior.Color = RGB(255, 255, 255)
    End Select
End Sub

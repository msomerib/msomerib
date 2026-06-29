Attribute VB_Name = "modContratos"
Option Explicit

Const ABA_CONTRATOS = "Contratos"

Sub NovoRegistro()
    frmContrato.Tag = "NOVO"
    frmContrato.LimparCampos
    frmContrato.Show
End Sub

Sub EditarRegistro()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets(ABA_CONTRATOS)
    Dim linha As Long
    linha = modImoveis.ObterLinhaSelecionada(ws)
    If linha = 0 Then MsgBox "Selecione um contrato para editar.", vbExclamation: Exit Sub
    frmContrato.Tag = "EDITAR:" & linha
    frmContrato.CarregarDados linha
    frmContrato.Show
End Sub

Sub ExcluirRegistro()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets(ABA_CONTRATOS)
    Dim linha As Long
    linha = modImoveis.ObterLinhaSelecionada(ws)
    If linha = 0 Then MsgBox "Selecione um contrato para excluir.", vbExclamation: Exit Sub
    Dim num As String
    num = ws.Cells(linha, 1).Value
    If MsgBox("Confirma exclusao do contrato " & num & "?", vbYesNo + vbQuestion) = vbYes Then ws.Rows(linha).Delete
End Sub

Sub ExportarExcel()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets(ABA_CONTRATOS)
    Dim caminho As String
    caminho = Application.GetSaveAsFilename("Contratos_" & Format(Now, "YYYYMMDD"), "Excel (*.xlsx), *.xlsx")
    If caminho = "False" Then Exit Sub
    Dim wbNovo As Workbook
    Set wbNovo = Workbooks.Add
    ws.UsedRange.Copy wbNovo.Sheets(1).Range("A1")
    wbNovo.SaveAs caminho, xlOpenXMLWorkbook
    wbNovo.Close
    MsgBox "Exportado!", vbInformation
End Sub

Sub SalvarContrato(linha As Long, isNovo As Boolean, _
    num_contrato As String, cod_imovel As String, entidade As String, _
    modalidade As String, tipo_uso As String, status As String, _
    assinatura As String, vigencia As String, prorrogavel As String, _
    cpf_cnpj As String, responsavel As String, end_corr As String, _
    telefone As String, email As String, obs As String)

    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets(ABA_CONTRATOS)
    If isNovo Then
        linha = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
        If linha < 3 Then linha = 3
    End If
    ws.Cells(linha, 1).Value = num_contrato
    ws.Cells(linha, 2).Value = cod_imovel
    ws.Cells(linha, 3).Value = entidade
    ws.Cells(linha, 4).Value = modalidade
    ws.Cells(linha, 5).Value = tipo_uso
    ws.Cells(linha, 6).Value = status
    ws.Cells(linha, 7).Value = modImoveis.CDateSafe(assinatura)
    ws.Cells(linha, 8).Value = modImoveis.CDateSafe(vigencia)
    ws.Cells(linha, 9).Value = modImoveis.CDateSafe(prorrogavel)
    ws.Cells(linha, 10).Value = cpf_cnpj
    ws.Cells(linha, 11).Value = responsavel
    ws.Cells(linha, 12).Value = end_corr
    ws.Cells(linha, 13).Value = telefone
    ws.Cells(linha, 14).Value = email
    ws.Cells(linha, 15).Value = obs
    ws.Cells(linha, 7).NumberFormat = "DD/MM/YYYY"
    ws.Cells(linha, 8).NumberFormat = "DD/MM/YYYY"
    ws.Cells(linha, 9).NumberFormat = "DD/MM/YYYY"
    Dim dtVenc As Date
    On Error Resume Next
    dtVenc = CDate(ws.Cells(linha, 8).Value)
    On Error GoTo 0
    If dtVenc <> 0 Then
        Dim diasRestantes As Long
        diasRestantes = DateDiff("d", Date, dtVenc)
        If diasRestantes < 0 Then
            ws.Rows(linha).Interior.Color = RGB(255, 205, 210)
        ElseIf diasRestantes <= 60 Then
            ws.Rows(linha).Interior.Color = RGB(255, 243, 224)
        Else
            ws.Rows(linha).Interior.Color = RGB(255, 255, 255)
        End If
    End If
End Sub

Sub VerificarVencimentos()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets(ABA_CONTRATOS)
    Dim ultima As Long
    ultima = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    Dim msg As String
    msg = "CONTRATOS VENCENDO NOS PROXIMOS 60 DIAS:" & vbNewLine & vbNewLine
    Dim i As Long
    For i = 3 To ultima
        Dim dtVenc As Date
        On Error Resume Next
        dtVenc = CDate(ws.Cells(i, 8).Value)
        On Error GoTo 0
        If dtVenc <> 0 Then
            Dim dias As Long
            dias = DateDiff("d", Date, dtVenc)
            If dias >= 0 And dias <= 60 Then
                msg = msg & ws.Cells(i, 1).Value & " - " & ws.Cells(i, 11).Value & " - vence em " & dias & " dias" & vbNewLine
            End If
        End If
    Next i
    MsgBox msg, vbInformation, "Alertas de Vencimento"
End Sub

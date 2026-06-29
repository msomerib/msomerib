Attribute VB_Name = "modDashboard"
Option Explicit

Sub AtualizarDashboard()
    Dim wsDash As Worksheet
    Set wsDash = ThisWorkbook.Sheets("Dashboard")
    wsDash.Range("A13:J100").ClearContents
    wsDash.Range("A13:J100").Interior.ColorIndex = xlNone
    Dim wsContr As Worksheet
    Set wsContr = ThisWorkbook.Sheets("Contratos")
    Dim ultima As Long
    ultima = wsContr.Cells(wsContr.Rows.Count, 1).End(xlUp).Row
    Dim linhaAlerta As Long
    linhaAlerta = 13
    Dim i As Long
    For i = 3 To ultima
        Dim dtVenc As Date
        On Error Resume Next
        dtVenc = CDate(wsContr.Cells(i, 8).Value)
        On Error GoTo 0
        If dtVenc <> 0 Then
            Dim dias As Long
            dias = DateDiff("d", Date, dtVenc)
            If dias >= 0 And dias <= 60 Then
                wsDash.Cells(linhaAlerta, 1).Value = wsContr.Cells(i, 1).Value
                wsDash.Cells(linhaAlerta, 2).Value = wsContr.Cells(i, 2).Value
                wsDash.Cells(linhaAlerta, 3).Value = wsContr.Cells(i, 11).Value
                wsDash.Cells(linhaAlerta, 4).Value = wsContr.Cells(i, 8).Value
                wsDash.Cells(linhaAlerta, 4).NumberFormat = "DD/MM/YYYY"
                wsDash.Cells(linhaAlerta, 5).Value = dias
                wsDash.Cells(linhaAlerta, 6).Value = wsContr.Cells(i, 4).Value
                If dias <= 30 Then
                    wsDash.Range(wsDash.Cells(linhaAlerta, 1), wsDash.Cells(linhaAlerta, 6)).Interior.Color = RGB(255, 205, 210)
                Else
                    wsDash.Range(wsDash.Cells(linhaAlerta, 1), wsDash.Cells(linhaAlerta, 6)).Interior.Color = RGB(255, 243, 224)
                End If
                linhaAlerta = linhaAlerta + 1
            End If
        End If
    Next i
    If linhaAlerta = 13 Then
        wsDash.Cells(13, 1).Value = "(Nenhum contrato vencendo nos proximos 60 dias)"
        wsDash.Cells(13, 1).Font.Italic = True
    End If
    wsDash.Range("I2").Value = "Atualizado: " & Format(Now, "DD/MM/YYYY HH:MM")
    wsDash.Range("I2").Font.Italic = True
    wsDash.Range("I2").Font.Size = 9
    MsgBox "Dashboard atualizado!", vbInformation
End Sub

Sub GerarRelatorioGeral()
    Dim msg As String
    msg = "=== RELATORIO GERAL DO SISTEMA ===" & vbNewLine & vbNewLine
    Dim wsIm As Worksheet: Set wsIm = ThisWorkbook.Sheets("Imoveis")
    Dim totIm As Long: totIm = wsIm.Cells(wsIm.Rows.Count, 1).End(xlUp).Row - 2
    If totIm < 0 Then totIm = 0
    msg = msg & "IMOVEIS: " & totIm & " cadastrados" & vbNewLine
    Dim wsContr As Worksheet: Set wsContr = ThisWorkbook.Sheets("Contratos")
    Dim totContr As Long: totContr = wsContr.Cells(wsContr.Rows.Count, 1).End(xlUp).Row - 2
    If totContr < 0 Then totContr = 0
    msg = msg & "CONTRATOS: " & totContr & " cadastrados" & vbNewLine
    Dim wsLeil As Worksheet: Set wsLeil = ThisWorkbook.Sheets("Leiloes")
    Dim totLeil As Long: totLeil = wsLeil.Cells(wsLeil.Rows.Count, 1).End(xlUp).Row - 2
    If totLeil < 0 Then totLeil = 0
    msg = msg & "LEILOES: " & totLeil & " cadastrados" & vbNewLine
    Dim wsOf As Worksheet: Set wsOf = ThisWorkbook.Sheets("Ofertas")
    Dim totOf As Long: totOf = wsOf.Cells(wsOf.Rows.Count, 1).End(xlUp).Row - 2
    If totOf < 0 Then totOf = 0
    msg = msg & "OFERTAS: " & totOf & " cadastradas" & vbNewLine
    msg = msg & vbNewLine & "Gerado em: " & Format(Now, "DD/MM/YYYY HH:MM")
    MsgBox msg, vbInformation, "Relatorio Geral"
End Sub

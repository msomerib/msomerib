(function () {
  "use strict";

  var STORAGE_KEY = "monitor-arts-data-v1";
  var WARNING_DAYS = 10;

  var state = {
    arts: [],
    search: "",
    statusFilter: "todos",
    sortKey: "fim",
    sortDir: "asc",
  };

  // ---------- persistence ----------

  function loadArts() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("Falha ao ler dados salvos, usando dados iniciais.", e);
      }
    }
    return (window.SEED_ARTS || []).slice();
  }

  function saveArts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.arts));
  }

  // ---------- date / status helpers ----------

  function todayISO() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseISODate(iso) {
    if (!iso) return null;
    var parts = iso.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function daysUntil(iso) {
    var target = parseISODate(iso);
    if (!target) return null;
    var today = todayISO();
    var msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((target - today) / msPerDay);
  }

  function computeStatus(art) {
    var d = daysUntil(art.fim);
    if (d === null) return "valido";
    if (d < 0) return "vencido";
    if (d <= WARNING_DAYS) return "vence-em-breve";
    return "valido";
  }

  var STATUS_LABEL = {
    valido: "Válida",
    "vence-em-breve": "Vence em breve",
    vencido: "Vencida",
  };

  function formatDateBR(iso) {
    var d = parseISODate(iso);
    if (!d) return "—";
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    return dd + "/" + mm + "/" + d.getFullYear();
  }

  function formatCurrency(v) {
    if (v === null || v === undefined || v === "") return "—";
    return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- rendering ----------

  function getFilteredSortedArts() {
    var term = state.search.trim().toLowerCase();
    var list = state.arts.filter(function (art) {
      var status = computeStatus(art);
      if (state.statusFilter !== "todos" && status !== state.statusFilter) return false;
      if (!term) return true;
      var haystack = [art.art, art.nome, art.cnpj, art.endereco, art.bairroCidadeCep]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(term) !== -1;
    });

    var key = state.sortKey;
    var dir = state.sortDir === "asc" ? 1 : -1;
    list.sort(function (a, b) {
      var va = a[key];
      var vb = b[key];
      if (key === "valor") {
        va = Number(va) || 0;
        vb = Number(vb) || 0;
      } else {
        va = (va || "").toString().toLowerCase();
        vb = (vb || "").toString().toLowerCase();
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return list;
  }

  function renderStats() {
    var total = state.arts.length;
    var ok = 0, soon = 0, expired = 0;
    state.arts.forEach(function (art) {
      var s = computeStatus(art);
      if (s === "valido") ok++;
      else if (s === "vence-em-breve") soon++;
      else expired++;
    });
    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-ok").textContent = ok;
    document.getElementById("stat-soon").textContent = soon;
    document.getElementById("stat-expired").textContent = expired;
  }

  function renderAlertBanner() {
    var banner = document.getElementById("alert-banner");
    var text = document.getElementById("alert-text");
    var expiredList = [];
    var soonList = [];
    state.arts.forEach(function (art) {
      var s = computeStatus(art);
      if (s === "vencido") expiredList.push(art);
      else if (s === "vence-em-breve") soonList.push(art);
    });

    if (expiredList.length === 0 && soonList.length === 0) {
      banner.hidden = true;
      return;
    }

    banner.hidden = false;
    banner.classList.toggle("critical", expiredList.length > 0);

    var parts = [];
    if (expiredList.length > 0) {
      parts.push(expiredList.length + " ART" + (expiredList.length > 1 ? "s" : "") + " já vencida" + (expiredList.length > 1 ? "s" : ""));
    }
    if (soonList.length > 0) {
      parts.push(soonList.length + " ART" + (soonList.length > 1 ? "s" : "") + " vencendo em até " + WARNING_DAYS + " dias");
    }
    text.textContent = parts.join(" e ") + ". Verifique a lista abaixo para renovar.";
  }

  function renderTable() {
    var tbody = document.getElementById("arts-tbody");
    var emptyState = document.getElementById("empty-state");
    var list = getFilteredSortedArts();

    tbody.innerHTML = "";

    if (list.length === 0) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    list.forEach(function (art) {
      var status = computeStatus(art);
      var tr = document.createElement("tr");
      tr.className = status === "vencido" ? "row-vencido" : (status === "vence-em-breve" ? "row-vence-em-breve" : "");

      var d = daysUntil(art.fim);
      var dueNote = "";
      if (d !== null) {
        if (d < 0) dueNote = " (há " + Math.abs(d) + " dias)";
        else if (d <= WARNING_DAYS) dueNote = " (em " + d + " dias)";
      }

      tr.innerHTML =
        "<td>" + escapeHtml(art.art) + "</td>" +
        "<td>" + escapeHtml(art.nome) + "</td>" +
        "<td>" + escapeHtml(art.cnpj) + "</td>" +
        "<td>" + escapeHtml(art.endereco) + (art.bairroCidadeCep ? "<br><span style='color:var(--muted)'>" + escapeHtml(art.bairroCidadeCep) + "</span>" : "") + "</td>" +
        "<td>" + formatDateBR(art.inicio) + "</td>" +
        "<td>" + formatDateBR(art.fim) + dueNote + "</td>" +
        "<td>" + formatCurrency(art.valor) + "</td>" +
        "<td><span class='status-pill status-" + status + "'>" + STATUS_LABEL[status] + "</span></td>" +
        "<td class='no-print'><div class='row-actions'>" +
        "<button class='icon-btn' data-action='renew' data-id='" + art.id + "'>Renovar</button>" +
        "<button class='icon-btn' data-action='edit' data-id='" + art.id + "'>Editar</button>" +
        "<button class='icon-btn danger' data-action='delete' data-id='" + art.id + "'>Excluir</button>" +
        "</div></td>";
      tbody.appendChild(tr);
    });
  }

  function renderAll() {
    renderStats();
    renderAlertBanner();
    renderTable();
  }

  // ---------- CRUD ----------

  function genId() {
    return "art-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function openModal(art) {
    document.getElementById("modal-title").textContent = art ? "Editar ART" : "Nova ART";
    document.getElementById("f-id").value = art ? art.id : "";
    document.getElementById("f-art").value = art ? art.art || "" : "";
    document.getElementById("f-pagamento").value = art ? art.pagamento || "PAGA" : "PAGA";
    document.getElementById("f-nome").value = art ? art.nome || "" : "";
    document.getElementById("f-endereco").value = art ? art.endereco || "" : "";
    document.getElementById("f-bairro").value = art ? art.bairroCidadeCep || "" : "";
    document.getElementById("f-cnpj").value = art ? art.cnpj || "" : "";
    document.getElementById("f-valor").value = art ? art.valor || "" : "";
    document.getElementById("f-inicio").value = art ? art.inicio || "" : "";
    document.getElementById("f-fim").value = art ? art.fim || "" : "";
    document.getElementById("f-carga").value = art ? art.cargaBtu || "" : "";
    document.getElementById("modal-backdrop").hidden = false;
  }

  function closeModal() {
    document.getElementById("modal-backdrop").hidden = true;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    var id = document.getElementById("f-id").value;
    var record = {
      id: id || genId(),
      art: document.getElementById("f-art").value.trim(),
      pagamento: document.getElementById("f-pagamento").value,
      nome: document.getElementById("f-nome").value.trim(),
      endereco: document.getElementById("f-endereco").value.trim(),
      bairroCidadeCep: document.getElementById("f-bairro").value.trim(),
      cnpj: document.getElementById("f-cnpj").value.trim(),
      valor: parseFloat(document.getElementById("f-valor").value) || 0,
      inicio: document.getElementById("f-inicio").value,
      fim: document.getElementById("f-fim").value,
      cargaBtu: parseFloat(document.getElementById("f-carga").value) || null,
      statusOriginal: null,
    };

    if (id) {
      var idx = state.arts.findIndex(function (a) { return a.id === id; });
      if (idx !== -1) state.arts[idx] = record;
    } else {
      state.arts.push(record);
    }
    saveArts();
    closeModal();
    renderAll();
  }

  function deleteArt(id) {
    var art = state.arts.find(function (a) { return a.id === id; });
    if (!art) return;
    if (!confirm("Excluir a ART " + art.art + " (" + art.nome + ")?")) return;
    state.arts = state.arts.filter(function (a) { return a.id !== id; });
    saveArts();
    renderAll();
  }

  function renewArt(id) {
    var art = state.arts.find(function (a) { return a.id === id; });
    if (!art) return;
    var currentEnd = parseISODate(art.fim) || todayISO();
    var newStart = new Date(currentEnd);
    var newEnd = new Date(currentEnd);
    newEnd.setFullYear(newEnd.getFullYear() + 1);

    var toISO = function (d) {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    };

    art.inicio = toISO(newStart);
    art.fim = toISO(newEnd);
    saveArts();
    renderAll();
  }

  // ---------- import / export ----------

  function excelSerialToISO(serial) {
    // Excel date serial (1900 date system) -> ISO date string
    var utcDays = Math.floor(serial - 25569);
    var utcValue = utcDays * 86400;
    var d = new Date(utcValue * 1000);
    return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
  }

  function normalizeDateValue(v) {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "number") return excelSerialToISO(v);
    if (v instanceof Date) {
      return v.getFullYear() + "-" + String(v.getMonth() + 1).padStart(2, "0") + "-" + String(v.getDate()).padStart(2, "0");
    }
    var s = String(v).trim();
    var brMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (brMatch) {
      return brMatch[3] + "-" + brMatch[2].padStart(2, "0") + "-" + brMatch[1].padStart(2, "0");
    }
    var isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return isoMatch[0].slice(0, 10);
    return "";
  }

  function pickField(row, candidates) {
    for (var i = 0; i < candidates.length; i++) {
      var key = Object.keys(row).find(function (k) {
        return k.toString().trim().toLowerCase() === candidates[i];
      });
      if (key !== undefined && row[key] !== undefined && row[key] !== "") return row[key];
    }
    return "";
  }

  function importFile(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: "array", cellDates: false });
        var sheetName = workbook.SheetNames[0];
        var sheet = workbook.Sheets[sheetName];
        var rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        var imported = [];
        rows.forEach(function (row) {
          var artNum = pickField(row, ["art"]);
          var nome = pickField(row, ["nome"]);
          if (!artNum && !nome) return;

          imported.push({
            id: genId(),
            art: String(pickField(row, ["art"])).replace(/\s+/g, ""),
            pagamento: pickField(row, ["pag.", "pag", "pagamento"]) || "PAGA",
            nome: pickField(row, ["nome"]),
            endereco: pickField(row, ["ru / nº", "ru/nº", "endereço", "endereco"]),
            bairroCidadeCep: pickField(row, ["bairro/cidade/cep", "bairro"]),
            cnpj: pickField(row, ["cnpj"]),
            valor: parseFloat(pickField(row, ["valor"])) || 0,
            inicio: normalizeDateValue(pickField(row, ["início", "inicio"])),
            fim: normalizeDateValue(pickField(row, ["fim"])),
            cargaBtu: parseFloat(pickField(row, ["carga \nbtu", "carga btu", "carga"])) || null,
            statusOriginal: pickField(row, ["status"]) || null,
          });
        });

        if (imported.length === 0) {
          alert("Nenhuma linha reconhecível foi encontrada nesse arquivo. Confira se as colunas ART e NOME estão presentes.");
          return;
        }

        var mode = confirm(
          imported.length + " ART(s) encontradas no arquivo.\n\nClique OK para ADICIONAR à lista atual,\nou Cancelar para SUBSTITUIR toda a lista atual por essas."
        );
        if (mode) {
          state.arts = state.arts.concat(imported);
        } else {
          state.arts = imported;
        }
        saveArts();
        renderAll();
        alert("Importação concluída: " + imported.length + " ART(s).");
      } catch (err) {
        console.error(err);
        alert("Não foi possível ler o arquivo. Verifique se é um .xlsx, .xls ou .csv válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function exportXlsx() {
    var list = getFilteredSortedArts();
    var rows = list.map(function (art) {
      return {
        "ART": art.art,
        "Pagamento": art.pagamento,
        "Nome": art.nome,
        "Endereço": art.endereco,
        "Bairro/Cidade/CEP": art.bairroCidadeCep,
        "CNPJ": art.cnpj,
        "Valor": art.valor,
        "Início": formatDateBR(art.inicio),
        "Fim (vencimento)": formatDateBR(art.fim),
        "Carga BTU": art.cargaBtu,
        "Status": STATUS_LABEL[computeStatus(art)],
      };
    });
    var ws = XLSX.utils.json_to_sheet(rows);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ARTs");
    var today = new Date();
    var fname = "relatorio-arts-" + today.toISOString().slice(0, 10) + ".xlsx";
    XLSX.writeFile(wb, fname);
  }

  function printReport() {
    document.getElementById("report-date").textContent = new Date().toLocaleString("pt-BR");
    window.print();
  }

  // ---------- events ----------

  function attachEvents() {
    document.getElementById("btn-new").addEventListener("click", function () {
      openModal(null);
    });

    document.getElementById("btn-cancel").addEventListener("click", closeModal);

    document.getElementById("modal-backdrop").addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });

    document.getElementById("art-form").addEventListener("submit", handleFormSubmit);

    document.getElementById("search").addEventListener("input", function (e) {
      state.search = e.target.value;
      renderTable();
    });

    document.getElementById("filter-status").addEventListener("change", function (e) {
      state.statusFilter = e.target.value;
      renderTable();
    });

    document.getElementById("arts-tbody").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-action]");
      if (!btn) return;
      var id = btn.getAttribute("data-id");
      var action = btn.getAttribute("data-action");
      if (action === "edit") {
        var art = state.arts.find(function (a) { return a.id === id; });
        openModal(art);
      } else if (action === "delete") {
        deleteArt(id);
      } else if (action === "renew") {
        if (confirm("Renovar esta ART por mais 1 ano a partir do vencimento atual?")) {
          renewArt(id);
        }
      }
    });

    document.querySelectorAll("thead th[data-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var key = th.getAttribute("data-sort");
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = "asc";
        }
        renderTable();
      });
    });

    document.getElementById("btn-import").addEventListener("click", function () {
      document.getElementById("file-import").click();
    });
    document.getElementById("file-import").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (file) importFile(file);
      e.target.value = "";
    });

    document.getElementById("btn-export-xlsx").addEventListener("click", exportXlsx);
    document.getElementById("btn-print").addEventListener("click", printReport);

    document.getElementById("alert-dismiss").addEventListener("click", function () {
      document.getElementById("alert-banner").hidden = true;
    });
  }

  // ---------- init ----------

  function init() {
    state.arts = loadArts();
    attachEvents();
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

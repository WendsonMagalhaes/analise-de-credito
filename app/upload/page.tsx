"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

type ResultadoArquivo =
  | { tipo: "aberto" | "pago"; inseridos: number; duplicados: number }
  | { tipo: "limite"; atualizados: number };

type Resultado = Record<string, ResultadoArquivo>;

const TIPO_LABEL: Record<string, string> = {
  aberto: "títulos em aberto",
  pago: "títulos pagos",
  limite: "limite de crédito",
};

export default function UploadPage() {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [segundos, setSegundos] = useState(0);

  // cronômetro só enquanto envia: com arquivo grande o servidor leva alguns
  // segundos e a tela parada dava a impressão de que tinha travado
  useEffect(() => {
    if (!enviando) {
      setSegundos(0);
      return;
    }
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [enviando]);

  async function enviar() {
    if (arquivos.length === 0) return;
    setEnviando(true);
    setErro(null);
    setResultado(null);

    const form = new FormData();
    arquivos.forEach((f) => form.append("files", f));

    try {
      const res = await fetch(`${API_URL}/api/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      setResultado(await res.json());
    } catch (e: any) {
      setErro(e.message || "Falha ao enviar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Atualizar relatórios"
        subtitle="Suba os relatórios exportados do ERP para manter o histórico de crédito em dia."
      />

      <p className="text-sm text-muted mb-2">
        Todo dia, exporte do ERP o relatório de <strong className="text-ink">títulos em aberto</strong> e o de{" "}
        <strong className="text-ink">títulos pagos</strong> (Contas a Receber) e solte os dois arquivos aqui. O
        sistema identifica sozinho qual é qual e ignora linhas que já foram importadas antes —
        pode subir o mesmo arquivo mais de uma vez sem medo de duplicar.
      </p>
      <p className="text-sm text-muted mb-8">
        Opcionalmente, solte junto o relatório de <strong className="text-ink">limite de crédito atual</strong> dos
        clientes (pode ser o .xls do ERP ou uma planilha .xlsx/.csv à parte, com colunas de
        cliente e limite) — o sistema também reconhece esse sozinho, e passa a mostrar quanto
        cada cliente ainda tem livre dentro do limite já cadastrado.
      </p>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          setArquivos(Array.from(e.dataTransfer.files || []));
        }}
        className={`block border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all bg-panel shadow-soft ${
          arrastando ? "border-frost bg-frost/5 scale-[1.01]" : "border-line hover:border-frost/50"
        }`}
      >
        <input
          type="file"
          multiple
          accept=".xls,.xlsx,.html,.csv"
          className="hidden"
          onChange={(e) => setArquivos(Array.from(e.target.files || []))}
        />
        <div className="w-14 h-14 rounded-2xl bg-frost/10 text-frost flex items-center justify-center mx-auto mb-4">
          <UploadCloud size={24} strokeWidth={1.8} />
        </div>
        {arquivos.length === 0 ? (
          <>
            <p className="text-sm font-medium text-ink mb-1">
              Clique para escolher ou arraste os arquivos aqui
            </p>
            <p className="text-xs text-muted">.xls, .xlsx, .html ou .csv exportados do ERP</p>
          </>
        ) : (
          <ul className="text-sm text-ink space-y-1.5 text-left max-w-sm mx-auto">
            {arquivos.map((f) => (
              <li key={f.name} className="flex items-center gap-2">
                <FileSpreadsheet size={15} className="text-frost shrink-0" />
                <span className="truncate">{f.name}</span>
              </li>
            ))}
          </ul>
        )}
      </label>

      <button
        onClick={enviar}
        disabled={arquivos.length === 0 || enviando}
        className="mt-4 flex items-center gap-2 bg-frost text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft hover:bg-frostdark hover:shadow-glow active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {enviando ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Processando…
          </>
        ) : (
          <>
            <UploadCloud size={15} /> Importar para o histórico
          </>
        )}
      </button>

      {enviando && (
        <div role="status" className="mt-6 border border-line rounded-2xl bg-panel p-5 shadow-soft">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="flex items-center gap-2 text-ink font-medium">
              <Loader2 size={15} className="animate-spin text-frost" />
              {segundos < 3 ? "Enviando arquivos…" : "Processando no servidor…"}
            </span>
            <span className="text-xs text-muted tabular">{segundos}s</span>
          </div>
          <div className="h-1.5 rounded-full bg-panel2 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-frost animate-pulse" />
          </div>
          <p className="text-xs text-muted mt-3">
            Lendo os relatórios, gravando no histórico e recalculando a carteira. Não feche esta página.
          </p>
        </div>
      )}

      {erro && (
        <div className="mt-6 flex items-start gap-2 border border-vermelho/30 bg-vermelhobg text-vermelho rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {resultado && (
        <div className="mt-6 border border-line rounded-2xl bg-panel p-5 shadow-soft">
          <p className="flex items-center gap-2 text-sm font-medium text-ink mb-3">
            <CheckCircle2 size={16} className="text-verde" /> Importação concluída
          </p>
          <ul className="text-sm space-y-2">
            {Object.entries(resultado).map(([arquivo, r]) => (
              <li key={arquivo} className="flex justify-between text-muted">
                <span>
                  {arquivo} <span className="text-xs">({TIPO_LABEL[r.tipo] || r.tipo})</span>
                </span>
                <span className="tabular text-ink">
                  {r.tipo === "limite"
                    ? `${r.atualizados} clientes atualizados`
                    : `${r.inseridos} novos · ${r.duplicados} já existiam`}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 mt-4 text-sm text-frost font-medium hover:text-frostdark"
          >
            Ver carteira atualizada <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

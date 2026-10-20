import { useState, useEffect, useRef } from 'react';
import { Key, X, Eye, EyeOff, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ApiKeyModal({ open, onClose, onSaved }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setApiKey('');
      setResult(null);
      setShowKey(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setResult({ ok: false, message: 'Digite uma chave antes de salvar.' });
      return;
    }
    setSaving(true);
    setResult(null);
    try {
      await api.sync.configure(trimmed);
      setResult({ ok: true, message: 'Chave salva! Clique em Sincronizar para carregar os dados.' });
      onSaved();
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Erro ao salvar a chave.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        data-wb-label="Modal de API Key"
        className="relative w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Key className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">Configurar API-Football</h2>
            <p className="text-xs text-muted-foreground">Insira sua chave para carregar dados reais da Premier League</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">
              Chave da API <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setResult(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                placeholder="Cole sua chave aqui…"
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Feedback */}
          {result && (
            <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs ${
              result.ok
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
            }`}>
              {result.ok
                ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                : <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
              <span>{result.message}</span>
            </div>
          )}

          {/* Info box */}
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground">Como obter sua chave:</p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>Crie uma conta gratuita em <a href="https://www.api-football.com" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-primary/80">api-football.com <ExternalLink className="h-2.5 w-2.5" /></a></li>
              <li>Acesse o painel e copie sua <strong className="text-foreground">API Key</strong></li>
              <li>Cole a chave acima e clique em <strong className="text-foreground">Salvar</strong></li>
            </ol>
            <p className="text-amber-600 dark:text-amber-400 mt-1">⚠ Plano gratuito: 100 requisições/dia</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !apiKey.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Salvando…
              </>
            ) : (
              <>
                <Key className="h-3.5 w-3.5" />
                Salvar chave
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

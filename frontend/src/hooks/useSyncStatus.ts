import { useState, useEffect, useCallback, useRef } from 'react';
import { api, SyncStatusResponse } from '@/lib/api';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatusResponse | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.sync.status();
      setStatus(data);
      return data;
    } catch {
      // Backend not ready yet – ignore silently
      return null;
    }
  }, []);

  // Start polling while syncing
  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      const data = await fetchStatus();
      if (data && data.status !== 'syncing') {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        setSyncing(false);
      }
    }, 2000);
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchStatus]);

  const triggerSync = useCallback(async () => {
    setError(null);
    setSyncing(true);
    try {
      await api.sync.trigger();
      startPolling();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao iniciar sincronização';
      setError(msg);
      setSyncing(false);
    }
  }, [startPolling]);

  const isBusy = syncing || status?.status === 'syncing';

  return { status, isBusy, error, triggerSync, refetch: fetchStatus };
}

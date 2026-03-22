import func2url from '../../backend/func2url.json';

const URLS = func2url as Record<string, string>;

async function request<T>(fn: string, path: string, options?: RequestInit): Promise<T> {
  const base = URLS[fn];
  const url = `${base}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as T;
}

// ---- PCs ----
export const apiGetPCs = () => request<PCRow[]>('pcs', '/');
export const apiAddPC = (data: { name: string; zone: string; cpu?: string; gpu?: string; ram?: string }) =>
  request<{ id: number; name: string; agent_token: string }>('pcs', '/', { method: 'POST', body: JSON.stringify(data) });
export const apiDeletePC = (id: number) => request<{ ok: boolean }>('pcs', `/${id}`, { method: 'DELETE' });
export const apiSendCommand = (pcId: number, command: string, params?: Record<string, unknown>) =>
  request<{ ok: boolean; command_id: number }>('pcs', `/${pcId}/command`, {
    method: 'POST',
    body: JSON.stringify({ command, params: params || {} }),
  });

// ---- Sessions ----
export const apiGetSessions = (status?: string) =>
  request<SessionRow[]>('sessions', status ? `/?status=${status}` : '/');
export const apiStartSession = (data: { pc_id: number; client_id?: number; tariff_id?: number; game?: string }) =>
  request<{ id: number; started_at: string }>('sessions', '/', { method: 'POST', body: JSON.stringify(data) });
export const apiEndSession = (id: number) =>
  request<{ ok: boolean; cost: number; duration: number }>('sessions', `/${id}/end`, { method: 'POST' });

// ---- Clients ----
export const apiGetClients = () => request<ClientRow[]>('clients', '/');
export const apiAddClient = (data: { name: string; phone?: string; balance?: number }) =>
  request<ClientRow>('clients', '/', { method: 'POST', body: JSON.stringify(data) });
export const apiDeposit = (id: number, amount: number) =>
  request<{ ok: boolean; balance: number }>('clients', `/${id}/deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
export const apiDeleteClient = (id: number) => request<{ ok: boolean }>('clients', `/${id}`, { method: 'DELETE' });

// ---- Tariffs ----
export const apiGetTariffs = () => request<TariffRow[]>('tariffs', '/');
export const apiCreateTariff = (data: Partial<TariffRow>) =>
  request<TariffRow>('tariffs', '/', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateTariff = (id: number, data: Partial<TariffRow>) =>
  request<TariffRow>('tariffs', `/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const apiDeleteTariff = (id: number) => request<{ ok: boolean }>('tariffs', `/${id}`, { method: 'DELETE' });

// ---- Finance ----
export const apiGetFinanceStats = () =>
  request<{ stats: FinanceStats; week: WeekDay[] }>('finance', '/');
export const apiGetTransactions = () =>
  request<TransactionRow[]>('finance', '/transactions');

// ---- Types ----
export interface PCRow {
  id: number;
  name: string;
  zone: string;
  ip?: string;
  specs_cpu?: string;
  specs_gpu?: string;
  specs_ram?: string;
  status: 'active' | 'idle' | 'offline' | 'maintenance';
  last_seen?: string;
  session_id?: number;
  started_at?: string;
  game?: string;
  client_name?: string;
  price_per_hour?: number;
  mac_address?: string;
}

export interface SessionRow {
  id: number;
  pc_id: number;
  pc_name: string;
  zone: string;
  client_id?: number;
  client_name?: string;
  tariff_name?: string;
  price_per_hour?: number;
  game?: string;
  status: 'active' | 'completed';
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  duration_calc?: number;
  cost: number;
}

export interface ClientRow {
  id: number;
  name: string;
  phone?: string;
  balance: number;
  visits: number;
  total_spent: number;
  status: string;
  last_visit?: string;
  created_at?: string;
}

export interface TariffRow {
  id: number;
  name: string;
  zone: string;
  price_per_hour: number;
  min_time: number;
  color: string;
  popular: boolean;
  active: boolean;
}

export interface FinanceStats {
  total_deposits: number;
  total_sessions: number;
  total_refunds: number;
  session_count: number;
}

export interface WeekDay {
  day: string;
  income: number;
  sessions: number;
}

export interface TransactionRow {
  id: number;
  client_id?: number;
  client_name?: string;
  amount: number;
  type: 'deposit' | 'session' | 'refund';
  description?: string;
  created_at: string;
}

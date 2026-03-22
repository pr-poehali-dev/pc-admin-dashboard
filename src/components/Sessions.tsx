import { useEffect, useState, useCallback } from 'react';
import { apiGetSessions, apiGetPCs, apiGetClients, apiGetTariffs, apiStartSession, apiEndSession, SessionRow, PCRow, ClientRow, TariffRow } from '@/api/client';
import Icon from '@/components/ui/icon';

function StartSessionModal({ onClose, onStarted }: { onClose: () => void; onStarted: () => void }) {
  const [pcs, setPCs] = useState<PCRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [tariffs, setTariffs] = useState<TariffRow[]>([]);
  const [form, setForm] = useState({ pc_id: 0, client_id: 0, tariff_id: 0, game: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([apiGetPCs(), apiGetClients(), apiGetTariffs()]).then(([p, c, t]) => {
      setPCs(p.filter(pc => pc.status === 'idle'));
      setClients(c);
      setTariffs(t);
    });
  }, []);

  const submit = async () => {
    if (!form.pc_id) return;
    setLoading(true);
    try {
      await apiStartSession({
        pc_id: form.pc_id,
        client_id: form.client_id || undefined,
        tariff_id: form.tariff_id || undefined,
        game: form.game,
      });
      onStarted();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-2 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white/90">Новая сессия</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <Icon name="X" size={16} className="text-white/50" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 block mb-1">ПК (свободные)</label>
            <select className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none"
              value={form.pc_id} onChange={e => setForm(p => ({ ...p, pc_id: +e.target.value }))}>
              <option value={0}>Выберите ПК</option>
              {pcs.map(pc => <option key={pc.id} value={pc.id}>{pc.name} ({pc.zone})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1">Клиент (необязательно)</label>
            <select className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none"
              value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: +e.target.value }))}>
              <option value={0}>Гость</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.balance} ₽)</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1">Тариф</label>
            <select className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none"
              value={form.tariff_id} onChange={e => setForm(p => ({ ...p, tariff_id: +e.target.value }))}>
              <option value={0}>Без тарифа</option>
              {tariffs.map(t => <option key={t.id} value={t.id}>{t.name} — {t.price_per_hour} ₽/час</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1">Игра</label>
            <input className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-neon-cyan/30"
              placeholder="CS2, Dota 2..." value={form.game} onChange={e => setForm(p => ({ ...p, game: e.target.value }))} />
          </div>
          <button
            className="w-full py-2.5 bg-neon-green/15 hover:bg-neon-green/25 text-neon-green border border-neon-green/30 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            onClick={submit} disabled={loading || !form.pc_id}>
            {loading ? 'Запускаю...' : 'Запустить сессию'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sessions() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [notification, setNotification] = useState<string | null>(null);
  const [showStart, setShowStart] = useState(false);

  const showNotif = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const loadSessions = useCallback(async () => {
    try {
      const data = await apiGetSessions();
      setSessions(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadSessions();
    const t = setInterval(loadSessions, 10000);
    return () => clearInterval(t);
  }, [loadSessions]);

  const endSession = async (id: number) => {
    try {
      const res = await apiEndSession(id);
      showNotif(`Сессия завершена. Стоимость: ${res.cost} ₽`);
      loadSessions();
    } catch (e) { console.error(e); }
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const historySessions = sessions.filter(s => s.status === 'completed');
  const displayed = tab === 'active' ? activeSessions : historySessions;

  const totalRevenue = sessions.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.cost, 0);
  const activeRevenue = activeSessions.reduce((sum, s) => sum + s.cost, 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-surface-3 border border-neon-cyan/30 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-neon-green" />{notification}
        </div>
      )}
      {showStart && <StartSessionModal onClose={() => setShowStart(false)} onStarted={() => { showNotif('Сессия запущена'); loadSessions(); }} />}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Активных сессий', value: activeSessions.length, color: '#22c55e', icon: 'Play' },
          { label: 'Доход активных', value: `${activeRevenue} ₽`, color: '#00ffff', icon: 'Zap' },
          { label: 'Завершено сегодня', value: `${totalRevenue.toLocaleString()} ₽`, color: '#a855f7', icon: 'BarChart3' },
        ].map((card, i) => (
          <div key={i} className="bg-surface-2 border border-white/5 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top right, ${card.color}, transparent 60%)` }} />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${card.color}15`, border: `1px solid ${card.color}25` }}>
                <Icon name={card.icon} size={16} style={{ color: card.color }} />
              </div>
              <div>
                <div className="font-mono font-bold text-xl" style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs text-white/40">{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex bg-surface-2 border border-white/5 rounded-xl p-1 gap-1">
          {[{ id: 'active', label: 'Активные', count: activeSessions.length }, { id: 'history', label: 'История', count: historySessions.length }].map(t => (
            <button key={t.id}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30' : 'text-white/40 hover:text-white/60'}`}
              onClick={() => setTab(t.id as 'active' | 'history')}>
              {t.label} <span className="font-mono text-xs opacity-60 ml-1">{t.count}</span>
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20 hover:border-neon-cyan/40 rounded-xl text-sm font-medium transition-all"
          onClick={() => setShowStart(true)}>
          <Icon name="Plus" size={15} />Новая сессия
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-surface-2 border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['ПК', 'Клиент', 'Игра', 'Начало', 'Длительность', 'Сумма', 'Действия'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-white/20 text-sm">Нет сессий</td></tr>
              ) : displayed.map((session: SessionRow) => {
                const durationMins = Math.round(session.duration_calc || session.duration_minutes || 0);
                return (
                  <tr key={session.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                          <span className="font-mono text-neon-cyan text-xs font-bold">{session.pc_id.toString().padStart(2, '0')}</span>
                        </div>
                        <span className="font-mono text-sm text-white/70">{session.pc_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm text-white/80">{session.client_name || 'Гость'}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-white/60">{session.game || '—'}</span></td>
                    <td className="px-4 py-3"><span className="font-mono text-sm text-white/50">{new Date(session.started_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</span></td>
                    <td className="px-4 py-3"><span className="font-mono text-sm text-neon-green">{Math.floor(durationMins / 60)}ч {durationMins % 60}м</span></td>
                    <td className="px-4 py-3"><span className="font-mono text-sm font-bold text-white/90">{session.cost} ₽</span></td>
                    <td className="px-4 py-3">
                      {session.status === 'active' ? (
                        <button
                          className="px-2.5 py-1 rounded-lg text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                          onClick={() => endSession(session.id)}>
                          Завершить
                        </button>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-lg bg-white/5 text-white/30">Завершена</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

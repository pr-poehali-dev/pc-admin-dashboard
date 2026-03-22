import { useEffect, useState, useCallback } from 'react';
import { apiGetClients, apiAddClient, apiDeposit, apiDeleteClient, ClientRow } from '@/api/client';
import Icon from '@/components/ui/icon';

export default function Clients() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [depositModal, setDepositModal] = useState<ClientRow | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', balance: '' });

  const showNotif = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const loadClients = useCallback(async () => {
    try {
      const data = await apiGetClients();
      setClients(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  const addClient = async () => {
    if (!form.name) return;
    try {
      await apiAddClient({ name: form.name, phone: form.phone, balance: +form.balance || 0 });
      showNotif(`Клиент ${form.name} добавлен`);
      setShowAdd(false);
      setForm({ name: '', phone: '', balance: '' });
      loadClients();
    } catch (e) { console.error(e); }
  };

  const doDeposit = async () => {
    if (!depositModal || !depositAmount) return;
    try {
      const res = await apiDeposit(depositModal.id, +depositAmount);
      showNotif(`Пополнено на ${depositAmount} ₽. Новый баланс: ${res.balance} ₽`);
      setDepositModal(null);
      setDepositAmount('');
      loadClients();
    } catch (e) { console.error(e); }
  };

  const deleteClient = async (c: ClientRow) => {
    if (!confirm(`Удалить клиента ${c.name}?`)) return;
    try {
      await apiDeleteClient(c.id);
      showNotif(`${c.name} удалён`);
      loadClients();
    } catch (e) { console.error(e); }
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-surface-3 border border-neon-cyan/30 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-neon-green" />{notification}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-2 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white/90">Новый клиент</h2>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Icon name="X" size={16} className="text-white/50" />
              </button>
            </div>
            <div className="space-y-3">
              {[{ key: 'name', label: 'Имя', placeholder: 'Артём Иванов' }, { key: 'phone', label: 'Телефон', placeholder: '+7 916 123-45-67' }, { key: 'balance', label: 'Начальный баланс (₽)', placeholder: '500' }].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-white/40 block mb-1">{f.label}</label>
                  <input className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-neon-cyan/30"
                    placeholder={f.placeholder} value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <button className="w-full py-2.5 bg-neon-cyan/15 hover:bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/30 rounded-xl text-sm font-medium transition-all mt-2"
                onClick={addClient} disabled={!form.name}>
                Добавить клиента
              </button>
            </div>
          </div>
        </div>
      )}

      {depositModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-2 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white/90">Пополнение баланса</h2>
              <button onClick={() => setDepositModal(null)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Icon name="X" size={16} className="text-white/50" />
              </button>
            </div>
            <p className="text-sm text-white/60 mb-1">Клиент: <span className="text-white/90 font-medium">{depositModal.name}</span></p>
            <p className="text-sm text-white/60 mb-4">Текущий баланс: <span className="font-mono text-neon-green">{depositModal.balance} ₽</span></p>
            <div className="mb-3">
              <label className="text-xs text-white/40 block mb-1">Сумма (₽)</label>
              <input className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-neon-green/30 font-mono"
                type="number" placeholder="500" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              {[100, 200, 500, 1000].map(v => (
                <button key={v} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg text-sm transition-all"
                  onClick={() => setDepositAmount(v.toString())}>+{v} ₽</button>
              ))}
            </div>
            <button className="w-full py-2.5 bg-neon-green/15 hover:bg-neon-green/25 text-neon-green border border-neon-green/30 rounded-xl text-sm font-medium transition-all"
              onClick={doDeposit} disabled={!depositAmount}>
              Пополнить
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Всего клиентов', value: clients.length, color: '#00ffff', icon: 'Users' },
          { label: 'Онлайн сейчас', value: clients.filter(c => c.status === 'active').length, color: '#22c55e', icon: 'UserCheck' },
          { label: 'Нулевой баланс', value: clients.filter(c => c.balance <= 0).length, color: '#ef4444', icon: 'AlertTriangle' },
          { label: 'Сумма балансов', value: `${clients.reduce((s, c) => s + c.balance, 0).toLocaleString()} ₽`, color: '#a855f7', icon: 'Wallet' },
        ].map((s, i) => (
          <div key={i} className="bg-surface-2 border border-white/5 rounded-xl p-4 relative overflow-hidden card-hover">
            <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top right, ${s.color}, transparent 60%)` }} />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                <Icon name={s.icon} size={16} style={{ color: s.color }} />
              </div>
              <div>
                <div className="font-mono font-bold text-2xl" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Поиск по имени или телефону..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-2 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-neon-cyan/30 transition-colors" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20 rounded-xl text-sm font-medium transition-all"
          onClick={() => setShowAdd(true)}>
          <Icon name="UserPlus" size={15} />Добавить
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
                {['Клиент', 'Телефон', 'Баланс', 'Визитов', 'Потрачено', 'Статус', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-white/20 text-sm">
                  {clients.length === 0 ? 'Нет клиентов. Нажмите "Добавить".' : 'Не найдено'}
                </td></tr>
              ) : filtered.map((client) => (
                <tr key={client.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-white/70">{client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                      </div>
                      <span className="text-sm font-medium text-white/80">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="font-mono text-sm text-white/50">{client.phone || '—'}</span></td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-sm font-bold ${client.balance <= 0 ? 'text-neon-red' : client.balance < 100 ? 'text-neon-orange' : 'text-neon-green'}`}>
                      {client.balance} ₽
                    </span>
                  </td>
                  <td className="px-4 py-3"><span className="font-mono text-sm text-white/60">{client.visits}</span></td>
                  <td className="px-4 py-3"><span className="font-mono text-sm text-white/60">{client.total_spent.toLocaleString()} ₽</span></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${client.status === 'active' ? 'bg-neon-green/15 text-neon-green' : 'bg-white/5 text-white/30'}`}>
                      {client.status === 'active' ? 'Онлайн' : 'Не активен'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/20 flex items-center justify-center transition-all"
                        onClick={() => setDepositModal(client)} title="Пополнить">
                        <Icon name="Plus" size={12} className="text-neon-green" />
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-all"
                        onClick={() => deleteClient(client)} title="Удалить">
                        <Icon name="Trash2" size={12} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { apiGetPCs, apiSendCommand, apiAddPC, PCRow } from '@/api/client';
import Icon from '@/components/ui/icon';

type PCStatus = 'active' | 'idle' | 'offline' | 'maintenance';

const statusConfig: Record<PCStatus, { label: string; color: string }> = {
  active: { label: 'Активен', color: '#22c55e' },
  idle: { label: 'Свободен', color: '#00ffff' },
  offline: { label: 'Выключен', color: '#6b7280' },
  maintenance: { label: 'Обслуживание', color: '#f97316' },
};

const zoneColor: Record<string, string> = { VIP: '#a855f7', Стандарт: '#00ffff', Турнирная: '#f97316' };

function PCCard({ pc, onAction }: { pc: PCRow; onAction: (pc: PCRow, action: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const cfg = statusConfig[pc.status] || statusConfig.offline;

  return (
    <div className="relative bg-surface-2 rounded-xl border border-white/5 hover:border-white/15 transition-all duration-200 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`, opacity: pc.status === 'active' ? 1 : 0.3 }} />
      {pc.status === 'active' && <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${cfg.color}, transparent 60%)` }} />}

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-sm">{pc.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ color: zoneColor[pc.zone] || '#fff', background: `${zoneColor[pc.zone] || '#fff'}15`, border: `1px solid ${zoneColor[pc.zone] || '#fff'}25` }}>
                {pc.zone}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color, boxShadow: pc.status === 'active' ? `0 0 6px ${cfg.color}` : 'none' }} />
              <span className="text-xs" style={{ color: cfg.color }}>{cfg.label}</span>
            </div>
          </div>
          <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            onClick={() => setShowMenu(!showMenu)}>
            <Icon name="MoreVertical" size={14} className="text-white/40" />
          </button>
        </div>

        {pc.status === 'active' && pc.client_name && (
          <div className="mb-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="User" size={12} className="text-neon-cyan" />
              <span className="text-sm text-white/80">{pc.client_name}</span>
            </div>
            {pc.game && <div className="text-xs text-white/40 flex items-center gap-1"><Icon name="Gamepad2" size={10} className="text-white/30" />{pc.game}</div>}
          </div>
        )}

        {(pc.specs_gpu || pc.specs_cpu) && (
          <div className="space-y-1 mb-3">
            {pc.specs_gpu && <div className="flex justify-between text-xs"><span className="text-white/30">GPU</span><span className="font-mono text-white/50">{pc.specs_gpu}</span></div>}
            {pc.specs_cpu && <div className="flex justify-between text-xs"><span className="text-white/30">CPU</span><span className="font-mono text-white/50">{pc.specs_cpu}</span></div>}
          </div>
        )}

        {pc.last_seen && (
          <div className="text-xs text-white/20 mb-3 font-mono">
            {new Date(pc.last_seen).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}

        <div className="flex gap-2">
          {pc.status === 'active' && (
            <>
              <button className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                onClick={() => onAction(pc, 'lock')}>Блокировать</button>
              <button className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 transition-all"
                onClick={() => onAction(pc, 'screenshot')}>Скриншот</button>
            </>
          )}
          {pc.status === 'idle' && (
            <button className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20 transition-all"
              onClick={() => onAction(pc, 'unlock')}>Разблокировать</button>
          )}
          {pc.status === 'offline' && (
            <button className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/30 border border-white/10 cursor-not-allowed" disabled>
              Агент оффлайн
            </button>
          )}
          {pc.status === 'maintenance' && (
            <button className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-neon-orange/10 hover:bg-neon-orange/20 text-neon-orange border border-neon-orange/20 transition-all"
              onClick={() => onAction(pc, 'unlock')}>Вернуть в работу</button>
          )}
        </div>
      </div>

      {showMenu && (
        <div className="absolute top-10 right-2 z-20 bg-surface-3 border border-white/10 rounded-lg shadow-xl py-1 min-w-[170px]">
          {[
            { label: 'Скриншот', icon: 'Camera', action: 'screenshot' },
            { label: 'Перезагрузить', icon: 'RefreshCw', action: 'reboot' },
            { label: 'Выключить', icon: 'PowerOff', action: 'shutdown' },
            { label: 'Заблокировать', icon: 'Lock', action: 'lock' },
            { label: 'Разблокировать', icon: 'Unlock', action: 'unlock' },
            { label: 'Обслуживание', icon: 'Wrench', action: 'maintenance' },
            { label: 'Сообщение', icon: 'MessageSquare', action: 'message' },
          ].map(item => (
            <button key={item.action}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => { onAction(pc, item.action); setShowMenu(false); }}>
              <Icon name={item.icon} size={13} />{item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddPCModal({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({ name: '', zone: 'Стандарт', cpu: '', gpu: '', ram: '' });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  const submit = async () => {
    if (!form.name) return;
    setLoading(true);
    try {
      const res = await apiAddPC(form);
      setToken(res.agent_token);
      onAdd();
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
          <h2 className="text-lg font-bold text-white/90">Добавить ПК</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <Icon name="X" size={16} className="text-white/50" />
          </button>
        </div>

        {token ? (
          <div className="space-y-4">
            <div className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-xl">
              <p className="text-neon-green font-medium mb-2">ПК добавлен!</p>
              <p className="text-sm text-white/60 mb-3">Токен агента (вставьте в nexus_agent.py):</p>
              <div className="bg-surface-1 border border-white/10 rounded-lg p-3 font-mono text-xs text-neon-cyan break-all select-all">{token}</div>
            </div>
            <div className="text-sm text-white/50 space-y-1 bg-surface-3 rounded-xl p-3">
              <p className="text-white/70 font-medium mb-2">Инструкция установки агента:</p>
              <p>1. Скачайте файл агента (кнопка ниже)</p>
              <p>2. На ПК: <code className="text-neon-cyan">pip install requests pillow pywin32</code></p>
              <p>3. Вставьте токен в файл агента</p>
              <p>4. Запустите: <code className="text-neon-cyan">python nexus_agent.py</code></p>
            </div>
            <a href="/agent/nexus_agent.py" download className="block w-full py-2.5 text-center bg-neon-cyan/15 hover:bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/30 rounded-xl text-sm font-medium transition-all">
              Скачать агент (nexus_agent.py)
            </a>
            <button onClick={onClose} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-xl text-sm">Готово</button>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { key: 'name', label: 'Название', placeholder: 'PC-01' },
              { key: 'cpu', label: 'Процессор', placeholder: 'Intel Core i7-13700K' },
              { key: 'gpu', label: 'Видеокарта', placeholder: 'RTX 4070' },
              { key: 'ram', label: 'Оперативная память', placeholder: '16GB' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-white/40 block mb-1">{f.label}</label>
                <input
                  className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-neon-cyan/30 transition-colors"
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-white/40 block mb-1">Зона</label>
              <select className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none"
                value={form.zone} onChange={e => setForm(prev => ({ ...prev, zone: e.target.value }))}>
                {['Стандарт', 'VIP', 'Турнирная'].map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <button
              className="w-full py-2.5 bg-neon-cyan/15 hover:bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/30 rounded-xl text-sm font-medium transition-all mt-2 disabled:opacity-50"
              onClick={submit} disabled={loading || !form.name}>
              {loading ? 'Создаю...' : 'Добавить и получить токен'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PCGrid() {
  const [pcs, setPCs] = useState<PCRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PCStatus | 'all'>('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [notification, setNotification] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const showNotif = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3500); };

  const loadPCs = useCallback(async () => {
    try {
      const data = await apiGetPCs();
      setPCs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPCs();
    const interval = setInterval(loadPCs, 15000);
    return () => clearInterval(interval);
  }, [loadPCs]);

  const handleAction = async (pc: PCRow, action: string) => {
    const labels: Record<string, string> = {
      lock: 'Команда "Блокировать" отправлена',
      unlock: 'Команда "Разблокировать" отправлена',
      shutdown: 'Команда "Выключить" отправлена',
      reboot: 'Команда "Перезагрузить" отправлена',
      screenshot: 'Скриншот запрошен',
      maintenance: 'Команда "Обслуживание" отправлена',
      message: 'Сообщение отправлено',
    };
    try {
      const params = action === 'message' ? { text: 'Сообщение от администратора', title: 'NEXUS CLUB' } : {};
      await apiSendCommand(pc.id, action, params);
      showNotif(`${pc.name}: ${labels[action] || action}`);
    } catch (e) {
      showNotif(`Ошибка: ${pc.name} недоступен`);
    }
  };

  const filtered = pcs.filter(pc =>
    (filter === 'all' || pc.status === filter) &&
    (zoneFilter === 'all' || pc.zone === zoneFilter)
  );

  const statusFilters = [
    { value: 'all' as const, label: 'Все', count: pcs.length },
    { value: 'active' as const, label: 'Активные', count: pcs.filter(p => p.status === 'active').length },
    { value: 'idle' as const, label: 'Свободные', count: pcs.filter(p => p.status === 'idle').length },
    { value: 'offline' as const, label: 'Оффлайн', count: pcs.filter(p => p.status === 'offline').length },
    { value: 'maintenance' as const, label: 'Обслуживание', count: pcs.filter(p => p.status === 'maintenance').length },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-surface-3 border border-neon-cyan/30 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-neon-green" />{notification}
        </div>
      )}

      {showAdd && <AddPCModal onClose={() => setShowAdd(false)} onAdd={() => { loadPCs(); }} />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-surface-2 border border-white/5 rounded-xl p-1 gap-1">
          {statusFilters.map(f => (
            <button key={f.value}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.value ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30' : 'text-white/40 hover:text-white/60'}`}
              onClick={() => setFilter(f.value)}>
              {f.label}<span className="ml-1.5 font-mono opacity-60">{f.count}</span>
            </button>
          ))}
        </div>
        <div className="flex bg-surface-2 border border-white/5 rounded-xl p-1 gap-1">
          {(['all', 'Стандарт', 'VIP', 'Турнирная']).map(z => (
            <button key={z}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${zoneFilter === z ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/30' : 'text-white/40 hover:text-white/60'}`}
              onClick={() => setZoneFilter(z)}>
              {z === 'all' ? 'Все зоны' : z}
            </button>
          ))}
        </div>
        <button
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20 rounded-xl text-sm font-medium transition-all"
          onClick={() => setShowAdd(true)}>
          <Icon name="Plus" size={15} />Добавить ПК
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Icon name="Monitor" size={40} className="mx-auto mb-3 opacity-20" />
          <p>{pcs.length === 0 ? 'Нет ПК. Нажмите "Добавить ПК" чтобы начать.' : 'Нет ПК по выбранным фильтрам'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(pc => <PCCard key={pc.id} pc={pc} onAction={handleAction} />)}
        </div>
      )}
    </div>
  );
}
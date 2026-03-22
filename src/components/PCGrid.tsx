import { useState } from 'react';
import { pcs, PC, PCStatus, PCZone } from '@/data/mockData';
import Icon from '@/components/ui/icon';

const statusConfig: Record<PCStatus, { label: string; color: string; bg: string; border: string }> = {
  active: { label: 'Активен', color: '#22c55e', bg: '#22c55e15', border: '#22c55e30' },
  idle: { label: 'Свободен', color: '#00ffff', bg: '#00ffff10', border: '#00ffff25' },
  offline: { label: 'Выключен', color: '#6b7280', bg: '#6b728015', border: '#6b728030' },
  maintenance: { label: 'Обслуживание', color: '#f97316', bg: '#f9731615', border: '#f9731630' },
};

const zoneColor: Record<PCZone, string> = {
  'VIP': '#a855f7',
  'Стандарт': '#00ffff',
  'Турнирная': '#f97316',
};

interface PCCardProps {
  pc: PC;
  onAction: (pc: PC, action: string) => void;
  selected: boolean;
  onSelect: (id: number) => void;
}

function PCCard({ pc, onAction, selected, onSelect }: PCCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const cfg = statusConfig[pc.status];

  return (
    <div
      className={`relative bg-surface-2 rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer group
        ${selected ? 'border-neon-cyan/60 shadow-[0_0_20px_rgba(0,255,255,0.15)]' : 'border-white/5 hover:border-white/15'}`}
      onClick={() => onSelect(pc.id)}
    >
      {/* Status glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`, opacity: pc.status === 'active' ? 1 : 0.4 }}
      />

      {pc.status === 'active' && (
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${cfg.color}, transparent 60%)` }}
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-sm">{pc.name}</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium"
                style={{ color: zoneColor[pc.zone], background: `${zoneColor[pc.zone]}15`, border: `1px solid ${zoneColor[pc.zone]}25` }}
              >
                {pc.zone}
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 mt-1"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: cfg.color, boxShadow: pc.status === 'active' ? `0 0 6px ${cfg.color}` : 'none' }}
              />
              <span className="text-xs" style={{ color: cfg.color }}>{cfg.label}</span>
            </div>
          </div>
          <button
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors relative z-10"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          >
            <Icon name="MoreVertical" size={14} className="text-white/40" />
          </button>
        </div>

        {/* User info */}
        {pc.status === 'active' && pc.user && (
          <div className="mb-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                <Icon name="User" size={10} className="text-neon-cyan" />
              </div>
              <span className="text-sm text-white/80 font-medium">{pc.user}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 flex items-center gap-1">
                <Icon name="Gamepad2" size={10} className="text-white/30" />
                {pc.game}
              </span>
              <span className="font-mono text-xs text-neon-green">
                {Math.floor((pc.sessionDuration || 0) / 60)}ч {(pc.sessionDuration || 0) % 60}м
              </span>
            </div>
          </div>
        )}

        {/* Specs */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/30">GPU</span>
            <span className="font-mono text-white/50 text-right">{pc.specs.gpu}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/30">CPU</span>
            <span className="font-mono text-white/50">{pc.specs.cpu}</span>
          </div>
        </div>

        {/* Balance */}
        {pc.balance !== undefined && pc.status === 'active' && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-white/30">Баланс</span>
            <span className={`font-mono text-xs font-bold ${pc.balance < 100 ? 'text-neon-red' : 'text-neon-green'}`}>
              {pc.balance} ₽
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          {pc.status === 'active' && (
            <>
              <button
                className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all"
                onClick={(e) => { e.stopPropagation(); onAction(pc, 'end'); }}
              >
                Завершить
              </button>
              <button
                className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 transition-all"
                onClick={(e) => { e.stopPropagation(); onAction(pc, 'extend'); }}
              >
                +1ч
              </button>
            </>
          )}
          {pc.status === 'idle' && (
            <button
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20 hover:border-neon-cyan/40 transition-all"
              onClick={(e) => { e.stopPropagation(); onAction(pc, 'start'); }}
            >
              Запустить сессию
            </button>
          )}
          {pc.status === 'offline' && (
            <button
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 transition-all"
              onClick={(e) => { e.stopPropagation(); onAction(pc, 'power'); }}
            >
              Включить
            </button>
          )}
          {pc.status === 'maintenance' && (
            <button
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-neon-orange/10 hover:bg-neon-orange/20 text-neon-orange border border-neon-orange/20 hover:border-neon-orange/40 transition-all"
              onClick={(e) => { e.stopPropagation(); onAction(pc, 'fix'); }}
            >
              Завершить обслуж.
            </button>
          )}
        </div>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div
          className="absolute top-10 right-2 z-20 bg-surface-3 border border-white/10 rounded-lg shadow-xl py-1 min-w-[160px]"
          onClick={e => e.stopPropagation()}
        >
          {[
            { label: 'Подробности', icon: 'Info', action: 'details' },
            { label: 'Перезагрузить', icon: 'RefreshCw', action: 'reboot' },
            { label: 'Заблокировать', icon: 'Lock', action: 'lock' },
            { label: 'Скриншот', icon: 'Camera', action: 'screenshot' },
            { label: 'Тех. обслуживание', icon: 'Wrench', action: 'maintenance' },
          ].map(item => (
            <button
              key={item.action}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => { onAction(pc, item.action); setShowMenu(false); }}
            >
              <Icon name={item.icon} size={13} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PCGrid() {
  const [selectedPCs, setSelectedPCs] = useState<number[]>([]);
  const [filter, setFilter] = useState<PCStatus | 'all'>('all');
  const [zoneFilter, setZoneFilter] = useState<PCZone | 'all'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = (pc: PC, action: string) => {
    const actions: Record<string, string> = {
      end: `Сессия на ${pc.name} завершена`,
      extend: `Сессия на ${pc.name} продлена на 1 час`,
      start: `Сессия на ${pc.name} запущена`,
      power: `${pc.name} включается...`,
      fix: `${pc.name} переведён в рабочий режим`,
      reboot: `${pc.name} перезагружается...`,
      lock: `${pc.name} заблокирован`,
      screenshot: `Скриншот ${pc.name} сохранён`,
      maintenance: `${pc.name} отправлен на обслуживание`,
    };
    showNotif(actions[action] || `Действие: ${action} на ${pc.name}`);
  };

  const toggleSelect = (id: number) => {
    setSelectedPCs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = pcs.filter(pc =>
    (filter === 'all' || pc.status === filter) &&
    (zoneFilter === 'all' || pc.zone === zoneFilter)
  );

  const statusFilters: { value: PCStatus | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'Все', count: pcs.length },
    { value: 'active', label: 'Активные', count: pcs.filter(p => p.status === 'active').length },
    { value: 'idle', label: 'Свободные', count: pcs.filter(p => p.status === 'idle').length },
    { value: 'offline', label: 'Выключены', count: pcs.filter(p => p.status === 'offline').length },
    { value: 'maintenance', label: 'Обслуживание', count: pcs.filter(p => p.status === 'maintenance').length },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-surface-3 border border-neon-cyan/30 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-neon-green" />
          {notification}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-surface-2 border border-white/5 rounded-xl p-1 gap-1">
          {statusFilters.map(f => (
            <button
              key={f.value}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.value
                  ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span className="ml-1.5 font-mono opacity-60">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="flex bg-surface-2 border border-white/5 rounded-xl p-1 gap-1">
          {(['all', 'Стандарт', 'VIP', 'Турнирная'] as const).map(z => (
            <button
              key={z}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                zoneFilter === z
                  ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
              onClick={() => setZoneFilter(z)}
            >
              {z === 'all' ? 'Все зоны' : z}
            </button>
          ))}
        </div>

        {selectedPCs.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-white/40">Выбрано: {selectedPCs.length}</span>
            <button className="px-3 py-1.5 rounded-lg text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
              onClick={() => showNotif(`Выключено ${selectedPCs.length} ПК`)}>
              Выключить все
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 transition-all"
              onClick={() => setSelectedPCs([])}>
              Сбросить
            </button>
          </div>
        )}
      </div>

      {/* PC Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map(pc => (
          <PCCard
            key={pc.id}
            pc={pc}
            onAction={handleAction}
            selected={selectedPCs.includes(pc.id)}
            onSelect={toggleSelect}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <Icon name="Monitor" size={40} className="mx-auto mb-3 opacity-20" />
          <p>Нет ПК по выбранным фильтрам</p>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { sessions, Session } from '@/data/mockData';
import Icon from '@/components/ui/icon';

export default function Sessions() {
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const historySessions = sessions.filter(s => s.status === 'completed');
  const displayed = tab === 'active' ? activeSessions : historySessions;

  const totalRevenue = sessions.reduce((sum, s) => sum + s.cost, 0);
  const activeRevenue = activeSessions.reduce((sum, s) => sum + s.cost, 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-surface-3 border border-neon-cyan/30 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-neon-green" />
          {notification}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Активных сессий', value: activeSessions.length, color: '#22c55e', icon: 'Play' },
          { label: 'Доход активных', value: `${activeRevenue} ₽`, color: '#00ffff', icon: 'Zap' },
          { label: 'Всего за день', value: `${totalRevenue} ₽`, color: '#a855f7', icon: 'BarChart3' },
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

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex bg-surface-2 border border-white/5 rounded-xl p-1 gap-1">
          {[
            { id: 'active', label: 'Активные', count: activeSessions.length },
            { id: 'history', label: 'История', count: historySessions.length },
          ].map(t => (
            <button
              key={t.id}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
              onClick={() => setTab(t.id as 'active' | 'history')}
            >
              {t.label} <span className="font-mono text-xs opacity-60 ml-1">{t.count}</span>
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20 hover:border-neon-cyan/40 rounded-xl text-sm font-medium transition-all"
          onClick={() => showNotif('Форма новой сессии откроется здесь')}
        >
          <Icon name="Plus" size={15} />
          Новая сессия
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-2 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['ПК', 'Пользователь', 'Игра', 'Начало', 'Длительность', 'Сумма', 'Действия'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((session: Session, i) => (
              <tr
                key={session.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                      <span className="font-mono text-neon-cyan text-xs font-bold">{session.pcId.toString().padStart(2, '0')}</span>
                    </div>
                    <span className="font-mono text-sm text-white/70">{session.pcName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Icon name="User" size={11} className="text-white/40" />
                    </div>
                    <span className="text-sm text-white/80">{session.user}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white/60">{session.game}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-white/50">{session.start}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-neon-green">
                    {Math.floor(session.duration / 60)}ч {session.duration % 60}м
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-bold text-white/90">{session.cost} ₽</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {session.status === 'active' ? (
                      <>
                        <button
                          className="px-2.5 py-1 rounded-lg text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                          onClick={() => showNotif(`Сессия ${session.pcName} завершена`)}
                        >
                          Завершить
                        </button>
                        <button
                          className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 transition-all"
                          onClick={() => showNotif(`Сессия ${session.pcName} продлена`)}
                        >
                          Продлить
                        </button>
                      </>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-lg bg-white/5 text-white/30">Завершена</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

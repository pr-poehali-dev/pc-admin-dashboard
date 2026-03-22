import { pcs, sessions, transactions } from '@/data/mockData';
import Icon from '@/components/ui/icon';

const stats = [
  {
    label: 'ПК онлайн',
    value: pcs.filter(p => p.status === 'active').length,
    total: pcs.length,
    color: '#00ffff',
    icon: 'Monitor',
    glow: 'glow-cyan',
  },
  {
    label: 'Активных сессий',
    value: sessions.filter(s => s.status === 'active').length,
    color: '#22c55e',
    icon: 'Play',
    glow: 'glow-green',
  },
  {
    label: 'Доход сегодня',
    value: '8 420 ₽',
    color: '#a855f7',
    icon: 'TrendingUp',
    glow: 'glow-purple',
  },
  {
    label: 'На обслуживании',
    value: pcs.filter(p => p.status === 'maintenance').length,
    color: '#f97316',
    icon: 'Wrench',
    glow: 'glow-orange',
  },
];

const topGames = [
  { game: 'CS2', count: 3, color: '#f97316' },
  { game: 'Cyberpunk 2077', count: 1, color: '#a855f7' },
  { game: 'Dota 2', count: 1, color: '#22c55e' },
  { game: 'Valorant', count: 1, color: '#ef4444' },
  { game: 'GTA V', count: 1, color: '#00ffff' },
];

export default function Dashboard() {
  const activePCs = pcs.filter(p => p.status === 'active');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="relative bg-surface-2 border border-white/5 rounded-xl p-5 card-hover overflow-hidden"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className="absolute inset-0 opacity-5 rounded-xl"
              style={{ background: `radial-gradient(circle at top right, ${stat.color}, transparent 70%)` }}
            />
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}
              >
                <Icon name={stat.icon} size={18} style={{ color: stat.color }} />
              </div>
              {stat.total && (
                <span className="font-mono text-xs text-white/30">/{stat.total}</span>
              )}
            </div>
            <div className="font-mono text-3xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-sm text-white/50 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Sessions */}
        <div className="lg:col-span-2 bg-surface-2 border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              Активные сессии
            </h3>
            <span className="font-mono text-xs text-white/30">
              {new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="space-y-2">
            {sessions.filter(s => s.status === 'active').map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-surface-3/50 rounded-lg border border-white/5 hover:border-neon-cyan/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                    <span className="font-mono text-neon-cyan text-xs font-bold">{session.pcId.toString().padStart(2, '0')}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/90">{session.user}</div>
                    <div className="text-xs text-white/40">{session.game}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-neon-green">{Math.floor(session.duration / 60)}ч {session.duration % 60}м</div>
                  <div className="font-mono text-xs text-white/40">{session.cost} ₽</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Games */}
        <div className="bg-surface-2 border border-white/5 rounded-xl p-5">
          <h3 className="font-semibold text-white/80 mb-4 flex items-center gap-2">
            <Icon name="Gamepad2" size={16} className="text-neon-purple" />
            Топ игры
          </h3>
          <div className="space-y-3">
            {topGames.map((g, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">{g.game}</span>
                  <span className="font-mono text-white/40">{g.count}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(g.count / 3) * 100}%`, background: g.color, boxShadow: `0 0 8px ${g.color}60` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recent transactions */}
          <h3 className="font-semibold text-white/80 mt-6 mb-3 flex items-center gap-2">
            <Icon name="ArrowLeftRight" size={16} className="text-neon-cyan" />
            Транзакции
          </h3>
          <div className="space-y-2">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${tx.type === 'deposit' ? 'bg-neon-green' : tx.type === 'refund' ? 'bg-neon-orange' : 'bg-neon-red'}`} />
                  <span className="text-xs text-white/60 truncate max-w-[100px]">{tx.user}</span>
                </div>
                <span className={`font-mono text-xs font-medium ${tx.amount > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} ₽
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Overview */}
      <div className="grid grid-cols-3 gap-4">
        {(['Стандарт', 'VIP', 'Турнирная'] as const).map((zone) => {
          const zonePCs = pcs.filter(p => p.zone === zone);
          const active = zonePCs.filter(p => p.status === 'active').length;
          const color = zone === 'VIP' ? '#a855f7' : zone === 'Турнирная' ? '#f97316' : '#00ffff';
          return (
            <div key={zone} className="bg-surface-2 border border-white/5 rounded-xl p-4 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white/70">{zone}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
                  {active}/{zonePCs.length}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {zonePCs.map(pc => (
                  <div
                    key={pc.id}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      background: pc.status === 'active' ? color : pc.status === 'idle' ? '#374151' : pc.status === 'maintenance' ? '#f97316' : '#1f2937',
                      boxShadow: pc.status === 'active' ? `0 0 6px ${color}80` : 'none',
                    }}
                    title={`${pc.name}: ${pc.status}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
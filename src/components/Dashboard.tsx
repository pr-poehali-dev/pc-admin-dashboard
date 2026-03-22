import { useEffect, useState } from 'react';
import { apiGetPCs, apiGetSessions, apiGetFinanceStats, PCRow, SessionRow, FinanceStats } from '@/api/client';
import Icon from '@/components/ui/icon';

export default function Dashboard() {
  const [pcs, setPCs] = useState<PCRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [finance, setFinance] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s, f] = await Promise.all([apiGetPCs(), apiGetSessions(), apiGetFinanceStats()]);
        setPCs(p);
        setSessions(s);
        setFinance(f.stats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const activePCs = pcs.filter(p => p.status === 'active').length;
  const activeSessions = sessions.filter(s => s.status === 'active');

  const stats = [
    { label: 'ПК онлайн', value: activePCs, total: pcs.length, color: '#00ffff', icon: 'Monitor' },
    { label: 'Активных сессий', value: activeSessions.length, color: '#22c55e', icon: 'Play' },
    { label: 'Доход сегодня', value: finance ? `${finance.total_sessions.toLocaleString()} ₽` : '—', color: '#a855f7', icon: 'TrendingUp' },
    { label: 'На обслуживании', value: pcs.filter(p => p.status === 'maintenance').length, color: '#f97316', icon: 'Wrench' },
  ];

  const zones = ['Стандарт', 'VIP', 'Турнирная'] as const;
  const zoneColors: Record<string, string> = { VIP: '#a855f7', Турнирная: '#f97316', Стандарт: '#00ffff' };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
        <span className="text-white/30 text-sm">Загрузка данных...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="relative bg-surface-2 border border-white/5 rounded-xl p-5 card-hover overflow-hidden">
            <div className="absolute inset-0 opacity-5 rounded-xl" style={{ background: `radial-gradient(circle at top right, ${stat.color}, transparent 70%)` }} />
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}>
                <Icon name={stat.icon} size={18} style={{ color: stat.color }} />
              </div>
              {stat.total !== undefined && <span className="font-mono text-xs text-white/30">/{stat.total}</span>}
            </div>
            <div className="font-mono text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
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
            <span className="font-mono text-xs text-white/30">{new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {activeSessions.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm">Нет активных сессий</div>
          ) : (
            <div className="space-y-2">
              {activeSessions.map((session) => {
                const durationMins = Math.round(session.duration_calc || 0);
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-surface-3/50 rounded-lg border border-white/5 hover:border-neon-cyan/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                        <span className="font-mono text-neon-cyan text-xs font-bold">{session.pc_id.toString().padStart(2, '0')}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white/90">{session.client_name || 'Гость'}</div>
                        <div className="text-xs text-white/40">{session.game || session.pc_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-neon-green">{Math.floor(durationMins / 60)}ч {durationMins % 60}м</div>
                      <div className="font-mono text-xs text-white/40">{session.cost} ₽</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Zone overview */}
        <div className="bg-surface-2 border border-white/5 rounded-xl p-5">
          <h3 className="font-semibold text-white/80 mb-4 flex items-center gap-2">
            <Icon name="Map" size={16} className="text-neon-purple" />
            Зоны
          </h3>
          <div className="space-y-4">
            {zones.map(zone => {
              const zonePCs = pcs.filter(p => p.zone === zone);
              const active = zonePCs.filter(p => p.status === 'active').length;
              const color = zoneColors[zone];
              return (
                <div key={zone} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">{zone}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
                      {active}/{zonePCs.length}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {zonePCs.map(pc => (
                      <div key={pc.id} className="w-4 h-4 rounded" title={`${pc.name}: ${pc.status}`}
                        style={{
                          background: pc.status === 'active' ? color : pc.status === 'idle' ? '#374151' : pc.status === 'maintenance' ? '#f97316' : '#1f2937',
                          boxShadow: pc.status === 'active' ? `0 0 6px ${color}80` : 'none',
                        }}
                      />
                    ))}
                    {zonePCs.length === 0 && <span className="text-xs text-white/20">Нет ПК</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Finance summary */}
          {finance && (
            <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
              <h3 className="font-semibold text-white/80 mb-3 flex items-center gap-2">
                <Icon name="BarChart3" size={16} className="text-neon-cyan" />
                Сегодня
              </h3>
              {[
                { label: 'Доход', value: `${finance.total_sessions.toLocaleString()} ₽`, color: '#22c55e' },
                { label: 'Пополнений', value: `${finance.total_deposits.toLocaleString()} ₽`, color: '#00ffff' },
                { label: 'Сессий', value: finance.session_count.toString(), color: '#a855f7' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-white/40">{item.label}</span>
                  <span className="font-mono text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

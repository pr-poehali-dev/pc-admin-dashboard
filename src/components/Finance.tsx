import { useEffect, useState, useCallback } from 'react';
import { apiGetFinanceStats, apiGetTransactions, FinanceStats, WeekDay, TransactionRow } from '@/api/client';
import Icon from '@/components/ui/icon';

const typeConfig = {
  deposit: { label: 'Пополнение', color: '#22c55e', icon: 'ArrowDownLeft' },
  session: { label: 'Сессия', color: '#ef4444', icon: 'ArrowUpRight' },
  refund: { label: 'Возврат', color: '#f97316', icon: 'RotateCcw' },
};

export default function Finance() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [f, t] = await Promise.all([apiGetFinanceStats(), apiGetTransactions()]);
      setStats(f.stats);
      setWeek(f.week);
      setTransactions(t);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, [load]);

  const maxIncome = Math.max(...week.map(d => d.income), 1);
  const dayNames: Record<string, string> = { '0': 'Вс', '1': 'Пн', '2': 'Вт', '3': 'Ср', '4': 'Чт', '5': 'Пт', '6': 'Сб' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Доход сегодня', value: `${(stats?.total_sessions || 0).toLocaleString()} ₽`, color: '#22c55e', icon: 'TrendingUp', sub: `${stats?.session_count || 0} сессий` },
          { label: 'Пополнений', value: `${(stats?.total_deposits || 0).toLocaleString()} ₽`, color: '#00ffff', icon: 'Wallet', sub: 'Сегодня' },
          { label: 'Возвраты', value: `${(stats?.total_refunds || 0).toLocaleString()} ₽`, color: '#f97316', icon: 'RotateCcw', sub: 'Сегодня' },
          { label: 'Средний чек', value: stats?.session_count ? `${Math.round(stats.total_sessions / stats.session_count).toLocaleString()} ₽` : '—', color: '#a855f7', icon: 'Receipt', sub: 'за сессию' },
        ].map((card, i) => (
          <div key={i} className="bg-surface-2 border border-white/5 rounded-xl p-4 relative overflow-hidden card-hover">
            <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top right, ${card.color}, transparent 60%)` }} />
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${card.color}15`, border: `1px solid ${card.color}25` }}>
              <Icon name={card.icon} size={16} style={{ color: card.color }} />
            </div>
            <div className="font-mono font-bold text-2xl" style={{ color: card.color }}>{card.value}</div>
            <div className="text-xs text-white/40 mt-0.5">{card.label}</div>
            <div className="text-xs text-white/25 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Chart */}
        <div className="col-span-3 bg-surface-2 border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white/80">Доход за 7 дней</h3>
            <span className="font-mono text-xs text-white/30">₽</span>
          </div>
          {week.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-white/20 text-sm">Нет данных за эту неделю</div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-40">
              {week.map((d, i) => {
                const height = (d.income / maxIncome) * 100;
                const dayNum = new Date(d.day).getDay().toString();
                const isToday = d.day === new Date().toISOString().split('T')[0];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="font-mono text-xs text-white/30">{d.income > 0 ? `${(d.income / 1000).toFixed(1)}к` : ''}</span>
                    <div className="w-full relative" style={{ height: '100px' }}>
                      <div className="absolute bottom-0 w-full rounded-t-md transition-all duration-500"
                        style={{
                          height: `${Math.max(height, 2)}%`,
                          background: isToday ? 'linear-gradient(to top, #00ffff, #00ffff80)' : 'linear-gradient(to top, #1f2937, #374151)',
                          boxShadow: isToday ? '0 0 12px rgba(0,255,255,0.3)' : 'none',
                        }} />
                    </div>
                    <span className={`text-xs font-medium ${isToday ? 'text-neon-cyan' : 'text-white/30'}`}>{dayNames[dayNum] || d.day.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="col-span-2 bg-surface-2 border border-white/5 rounded-xl p-5">
          <h3 className="font-semibold text-white/80 mb-4">Транзакции</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm">Нет транзакций</div>
          ) : (
            <div className="space-y-2 overflow-auto max-h-64">
              {transactions.map(tx => {
                const cfg = typeConfig[tx.type] || typeConfig.session;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}>
                        <Icon name={cfg.icon} size={13} style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white/70">{tx.client_name || 'Гость'}</div>
                        <div className="text-xs text-white/30">{new Date(tx.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    <span className={`font-mono text-sm font-bold ${tx.amount > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} ₽
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

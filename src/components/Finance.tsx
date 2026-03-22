import { useState } from 'react';
import { transactions } from '@/data/mockData';
import Icon from '@/components/ui/icon';

const typeConfig = {
  deposit: { label: 'Пополнение', color: '#22c55e', icon: 'ArrowDownLeft' },
  session: { label: 'Сессия', color: '#ef4444', icon: 'ArrowUpRight' },
  refund: { label: 'Возврат', color: '#f97316', icon: 'RotateCcw' },
};

const weekData = [
  { day: 'Пн', income: 4200, sessions: 12 },
  { day: 'Вт', income: 5800, sessions: 16 },
  { day: 'Ср', income: 3900, sessions: 11 },
  { day: 'Чт', income: 7200, sessions: 20 },
  { day: 'Пт', income: 9100, sessions: 26 },
  { day: 'Сб', income: 12400, sessions: 34 },
  { day: 'Вс', income: 8420, sessions: 24 },
];

const maxIncome = Math.max(...weekData.map(d => d.income));

export default function Finance() {
  const [notification, setNotification] = useState<string | null>(null);
  const showNotif = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalSessions = Math.abs(transactions.filter(t => t.type === 'session').reduce((s, t) => s + t.amount, 0));
  const totalRefunds = transactions.filter(t => t.type === 'refund').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-surface-3 border border-neon-cyan/30 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-neon-green" />
          {notification}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Доход сегодня', value: `${totalSessions.toLocaleString()} ₽`, color: '#22c55e', icon: 'TrendingUp', sub: '+18% к вчера' },
          { label: 'Пополнений', value: `${totalDeposits.toLocaleString()} ₽`, color: '#00ffff', icon: 'Wallet', sub: `${transactions.filter(t => t.type === 'deposit').length} операций` },
          { label: 'Возвраты', value: `${totalRefunds.toLocaleString()} ₽`, color: '#f97316', icon: 'RotateCcw', sub: `${transactions.filter(t => t.type === 'refund').length} возврата` },
          { label: 'Средний чек', value: `${Math.round(totalSessions / 7).toLocaleString()} ₽`, color: '#a855f7', icon: 'Receipt', sub: 'за сессию' },
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

      {/* Chart + Transactions */}
      <div className="grid grid-cols-5 gap-4">
        {/* Bar Chart */}
        <div className="col-span-3 bg-surface-2 border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white/80">Доход за неделю</h3>
            <span className="font-mono text-xs text-white/30">₽</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {weekData.map((d, i) => {
              const height = (d.income / maxIncome) * 100;
              const isToday = i === 6;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="font-mono text-xs text-white/30">{(d.income / 1000).toFixed(1)}к</span>
                  <div className="w-full relative group" style={{ height: '100px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-md transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        background: isToday
                          ? 'linear-gradient(to top, #00ffff, #00ffff80)'
                          : 'linear-gradient(to top, #1f2937, #374151)',
                        boxShadow: isToday ? '0 0 12px rgba(0,255,255,0.3)' : 'none',
                      }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isToday ? 'text-neon-cyan' : 'text-white/30'}`}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions */}
        <div className="col-span-2 bg-surface-2 border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white/80">Транзакции</h3>
            <button
              className="text-xs text-neon-cyan hover:underline"
              onClick={() => showNotif('Экспорт отчёта сформирован')}
            >
              Экспорт
            </button>
          </div>
          <div className="space-y-2">
            {transactions.map(tx => {
              const cfg = typeConfig[tx.type];
              return (
                <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}>
                      <Icon name={cfg.icon} size={13} style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white/70">{tx.user}</div>
                      <div className="text-xs text-white/30">{tx.time}</div>
                    </div>
                  </div>
                  <span className={`font-mono text-sm font-bold ${tx.amount > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} ₽
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

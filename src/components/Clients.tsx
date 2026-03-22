import { useState } from 'react';
import Icon from '@/components/ui/icon';

const clients = [
  { id: 1, name: 'Артём Котов', phone: '+7 916 123-45-67', balance: 430, visits: 24, totalSpent: 8640, lastVisit: 'Сегодня', status: 'active', favorite: 'CS2' },
  { id: 2, name: 'Максим Петров', phone: '+7 926 234-56-78', balance: 870, visits: 41, totalSpent: 14760, lastVisit: 'Сегодня', status: 'active', favorite: 'Cyberpunk 2077' },
  { id: 3, name: 'Денис Романов', phone: '+7 903 345-67-89', balance: 220, visits: 15, totalSpent: 5400, lastVisit: 'Сегодня', status: 'active', favorite: 'Dota 2' },
  { id: 4, name: 'Иван Смирнов', phone: '+7 985 456-78-90', balance: 150, visits: 8, totalSpent: 2880, lastVisit: 'Вчера', status: 'idle', favorite: 'Valorant' },
  { id: 5, name: 'Влад Морозов', phone: '+7 977 567-89-01', balance: 1200, visits: 67, totalSpent: 24120, lastVisit: 'Сегодня', status: 'vip', favorite: 'CS2' },
  { id: 6, name: 'Никита Волков', phone: '+7 915 678-90-12', balance: 0, visits: 5, totalSpent: 1800, lastVisit: '3 дня назад', status: 'idle', favorite: 'Fortnite' },
  { id: 7, name: 'Рома Гусев', phone: '+7 999 789-01-23', balance: 320, visits: 19, totalSpent: 6840, lastVisit: 'Вчера', status: 'idle', favorite: 'Apex Legends' },
  { id: 8, name: 'Саша Лебедев', phone: '+7 925 890-12-34', balance: 90, visits: 3, totalSpent: 1080, lastVisit: 'Сегодня', status: 'new', favorite: 'League of Legends' },
];

const statusConfig = {
  active: { label: 'Онлайн', color: '#22c55e' },
  idle: { label: 'Не активен', color: '#6b7280' },
  vip: { label: 'VIP', color: '#a855f7' },
  new: { label: 'Новый', color: '#00ffff' },
};

export default function Clients() {
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const showNotif = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-surface-3 border border-neon-cyan/30 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-neon-green" />
          {notification}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Всего клиентов', value: clients.length, color: '#00ffff', icon: 'Users' },
          { label: 'VIP клиентов', value: clients.filter(c => c.status === 'vip').length, color: '#a855f7', icon: 'Crown' },
          { label: 'Онлайн сейчас', value: clients.filter(c => c.status === 'active').length, color: '#22c55e', icon: 'UserCheck' },
          { label: 'Новых сегодня', value: clients.filter(c => c.status === 'new').length, color: '#f97316', icon: 'UserPlus' },
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

      {/* Search + Actions */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Поиск по имени или телефону..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-2 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-neon-cyan/30 transition-colors"
          />
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20 hover:border-neon-cyan/40 rounded-xl text-sm font-medium transition-all"
          onClick={() => showNotif('Форма добавления клиента откроется здесь')}
        >
          <Icon name="UserPlus" size={15} />
          Добавить
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-2 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Клиент', 'Телефон', 'Баланс', 'Визитов', 'Потрачено', 'Был', 'Статус', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, i) => {
              const cfg = statusConfig[client.status as keyof typeof statusConfig];
              return (
                <tr key={client.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors" style={{ animationDelay: `${i * 40}ms` }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-white/70">{client.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <span className="text-sm font-medium text-white/80">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-white/50">{client.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-sm font-bold ${client.balance === 0 ? 'text-neon-red' : client.balance < 100 ? 'text-neon-orange' : 'text-neon-green'}`}>
                      {client.balance} ₽
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-white/60">{client.visits}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-white/60">{client.totalSpent.toLocaleString()} ₽</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white/40">{client.lastVisit}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="w-7 h-7 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/20 flex items-center justify-center transition-all"
                        onClick={() => showNotif(`Пополнение баланса ${client.name}`)}
                        title="Пополнить"
                      >
                        <Icon name="Plus" size={12} className="text-neon-green" />
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                        onClick={() => showNotif(`Профиль ${client.name}`)}
                        title="Профиль"
                      >
                        <Icon name="Eye" size={12} className="text-white/40" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

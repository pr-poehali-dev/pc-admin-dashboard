import { useState } from 'react';
import { tariffs, Tariff, PCZone } from '@/data/mockData';
import Icon from '@/components/ui/icon';

export default function Tariffs() {
  const [notification, setNotification] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const showNotif = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const zones: PCZone[] = ['Стандарт', 'VIP', 'Турнирная'];

  return (
    <div className="space-y-4 animate-fade-in">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-surface-3 border border-neon-cyan/30 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-neon-green" />
          {notification}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/90">Тарифы</h2>
          <p className="text-sm text-white/40">Управление ценами и условиями</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20 hover:border-neon-cyan/40 rounded-xl text-sm font-medium transition-all"
          onClick={() => showNotif('Форма создания тарифа откроется здесь')}
        >
          <Icon name="Plus" size={15} />
          Новый тариф
        </button>
      </div>

      {zones.map(zone => {
        const zoneTariffs = tariffs.filter(t => t.zone === zone);
        return (
          <div key={zone} className="space-y-2">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider px-1">Зона {zone}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {zoneTariffs.map((tariff: Tariff) => (
                <div
                  key={tariff.id}
                  className={`relative bg-surface-2 border rounded-xl p-5 card-hover overflow-hidden ${
                    tariff.popular ? 'border-neon-purple/30' : 'border-white/5'
                  }`}
                >
                  {tariff.popular && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30 font-medium">
                        Популярный
                      </span>
                    </div>
                  )}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: `linear-gradient(90deg, transparent, ${tariff.color}, transparent)` }}
                  />

                  <div className="mb-4">
                    <div className="font-bold text-white/90 text-lg">{tariff.name}</div>
                    <div className="text-xs text-white/40 mt-0.5">Мин. время: {tariff.minTime} ч</div>
                  </div>

                  <div className="flex items-end gap-1 mb-4">
                    <span className="font-mono font-black text-4xl" style={{ color: tariff.color }}>
                      {tariff.pricePerHour}
                    </span>
                    <span className="text-white/40 text-sm mb-1">₽/час</span>
                  </div>

                  {editingId === tariff.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-surface-3 border border-white/10 rounded-lg px-3 py-2">
                        <span className="text-xs text-white/30">₽/час</span>
                        <input
                          type="number"
                          defaultValue={tariff.pricePerHour}
                          className="bg-transparent font-mono text-sm text-white flex-1 outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 py-1.5 rounded-lg text-xs bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/25 transition-all"
                          onClick={() => { setEditingId(null); showNotif(`Тариф "${tariff.name}" обновлён`); }}
                        >
                          Сохранить
                        </button>
                        <button
                          className="flex-1 py-1.5 rounded-lg text-xs bg-white/5 text-white/40 border border-white/10 transition-all"
                          onClick={() => setEditingId(null)}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 transition-all flex items-center justify-center gap-1.5"
                        onClick={() => setEditingId(tariff.id)}
                      >
                        <Icon name="Pencil" size={12} />
                        Изменить
                      </button>
                      <button
                        className="w-8 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-all"
                        onClick={() => showNotif(`Тариф "${tariff.name}" удалён`)}
                      >
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

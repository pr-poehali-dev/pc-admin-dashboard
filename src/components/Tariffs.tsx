import { useEffect, useState, useCallback } from 'react';
import { apiGetTariffs, apiUpdateTariff, apiDeleteTariff, apiCreateTariff, TariffRow } from '@/api/client';
import Icon from '@/components/ui/icon';

export default function Tariffs() {
  const [tariffs, setTariffs] = useState<TariffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price_per_hour: 0, min_time: 1, popular: false });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', zone: 'Стандарт', price_per_hour: 120, min_time: 1, color: '#22c55e', popular: false });

  const showNotif = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const loadTariffs = useCallback(async () => {
    try { setTariffs(await apiGetTariffs()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTariffs(); }, [loadTariffs]);

  const startEdit = (t: TariffRow) => {
    setEditingId(t.id);
    setEditForm({ name: t.name, price_per_hour: t.price_per_hour, min_time: t.min_time, popular: t.popular });
  };

  const saveEdit = async (id: number) => {
    try {
      await apiUpdateTariff(id, editForm);
      showNotif('Тариф обновлён');
      setEditingId(null);
      loadTariffs();
    } catch (e) { console.error(e); }
  };

  const deleteTariff = async (t: TariffRow) => {
    if (!confirm(`Удалить тариф "${t.name}"?`)) return;
    try {
      await apiDeleteTariff(t.id);
      showNotif(`Тариф "${t.name}" удалён`);
      loadTariffs();
    } catch (e) { console.error(e); }
  };

  const createTariff = async () => {
    try {
      await apiCreateTariff(addForm);
      showNotif('Тариф создан');
      setShowAdd(false);
      loadTariffs();
    } catch (e) { console.error(e); }
  };

  const zones = ['Стандарт', 'VIP', 'Турнирная'];

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
              <h2 className="text-lg font-bold text-white/90">Новый тариф</h2>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Icon name="X" size={16} className="text-white/50" />
              </button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs text-white/40 block mb-1">Название</label>
                <input className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none" value={addForm.name}
                  onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="text-xs text-white/40 block mb-1">Зона</label>
                <select className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none" value={addForm.zone}
                  onChange={e => setAddForm(p => ({ ...p, zone: e.target.value }))}>
                  {zones.map(z => <option key={z} value={z}>{z}</option>)}
                </select></div>
              <div><label className="text-xs text-white/40 block mb-1">Цена ₽/час</label>
                <input type="number" className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none font-mono" value={addForm.price_per_hour}
                  onChange={e => setAddForm(p => ({ ...p, price_per_hour: +e.target.value }))} /></div>
              <div><label className="text-xs text-white/40 block mb-1">Мин. время (часов)</label>
                <input type="number" className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none font-mono" value={addForm.min_time}
                  onChange={e => setAddForm(p => ({ ...p, min_time: +e.target.value }))} /></div>
              <button className="w-full py-2.5 bg-neon-cyan/15 hover:bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/30 rounded-xl text-sm font-medium transition-all"
                onClick={createTariff} disabled={!addForm.name}>
                Создать тариф
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/90">Тарифы</h2>
          <p className="text-sm text-white/40">Управление ценами и условиями</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20 rounded-xl text-sm font-medium transition-all"
          onClick={() => setShowAdd(true)}>
          <Icon name="Plus" size={15} />Новый тариф
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
        </div>
      ) : zones.map(zone => {
        const zoneTariffs = tariffs.filter(t => t.zone === zone);
        if (zoneTariffs.length === 0) return null;
        return (
          <div key={zone} className="space-y-2">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider px-1">Зона {zone}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {zoneTariffs.map((tariff: TariffRow) => (
                <div key={tariff.id} className={`relative bg-surface-2 border rounded-xl p-5 card-hover overflow-hidden ${tariff.popular ? 'border-neon-purple/30' : 'border-white/5'}`}>
                  {tariff.popular && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30 font-medium">Популярный</span>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${tariff.color}, transparent)` }} />

                  <div className="mb-4">
                    <div className="font-bold text-white/90 text-lg">{tariff.name}</div>
                    <div className="text-xs text-white/40 mt-0.5">Мин. время: {tariff.min_time} ч</div>
                  </div>

                  <div className="flex items-end gap-1 mb-4">
                    <span className="font-mono font-black text-4xl" style={{ color: tariff.color }}>{tariff.price_per_hour}</span>
                    <span className="text-white/40 text-sm mb-1">₽/час</span>
                  </div>

                  {editingId === tariff.id ? (
                    <div className="space-y-2">
                      <input type="number" value={editForm.price_per_hour}
                        onChange={e => setEditForm(p => ({ ...p, price_per_hour: +e.target.value }))}
                        className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white/80 outline-none focus:border-neon-cyan/30" placeholder="Цена ₽/час" />
                      <div className="flex gap-2">
                        <button className="flex-1 py-1.5 rounded-lg text-xs bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/25 transition-all"
                          onClick={() => saveEdit(tariff.id)}>Сохранить</button>
                        <button className="flex-1 py-1.5 rounded-lg text-xs bg-white/5 text-white/40 border border-white/10 transition-all"
                          onClick={() => setEditingId(null)}>Отмена</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button className="flex-1 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 transition-all flex items-center justify-center gap-1.5"
                        onClick={() => startEdit(tariff)}>
                        <Icon name="Pencil" size={12} />Изменить
                      </button>
                      <button className="w-8 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-all"
                        onClick={() => deleteTariff(tariff)}>
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

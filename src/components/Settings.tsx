import { useState } from 'react';
import Icon from '@/components/ui/icon';

export default function Settings() {
  const [notification, setNotification] = useState<string | null>(null);
  const showNotif = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const [settings, setSettings] = useState({
    clubName: 'NEXUS CLUB',
    address: 'ул. Игровая, 42',
    openTime: '10:00',
    closeTime: '02:00',
    lowBalanceAlert: 50,
    autoLogout: 30,
    sessionWarning: 10,
    soundAlerts: true,
    autoShutdown: true,
    screenshotEnabled: false,
    maintenance: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-surface-3 border border-neon-cyan/30 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-neon-green" />
          {notification}
        </div>
      )}

      {[
        {
          title: 'Информация о клубе',
          icon: 'Building2',
          color: '#00ffff',
          fields: [
            { label: 'Название клуба', key: 'clubName', type: 'text' },
            { label: 'Адрес', key: 'address', type: 'text' },
            { label: 'Время открытия', key: 'openTime', type: 'time' },
            { label: 'Время закрытия', key: 'closeTime', type: 'time' },
          ]
        },
        {
          title: 'Сессии и баланс',
          icon: 'Timer',
          color: '#22c55e',
          fields: [
            { label: 'Минимальный баланс (₽)', key: 'lowBalanceAlert', type: 'number' },
            { label: 'Авто-выход (мин)', key: 'autoLogout', type: 'number' },
            { label: 'Предупреждение до конца (мин)', key: 'sessionWarning', type: 'number' },
          ]
        },
      ].map(section => (
        <div key={section.title} className="bg-surface-2 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${section.color}15`, border: `1px solid ${section.color}25` }}>
              <Icon name={section.icon} size={15} style={{ color: section.color }} />
            </div>
            <h3 className="font-semibold text-white/80">{section.title}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {section.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs text-white/40 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={settings[field.key as keyof typeof settings] as string | number}
                  onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-neon-cyan/30 font-mono transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Toggles */}
      <div className="bg-surface-2 border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-neon-purple/15 border border-neon-purple/25">
            <Icon name="Sliders" size={15} className="text-neon-purple" />
          </div>
          <h3 className="font-semibold text-white/80">Автоматизация</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'soundAlerts', label: 'Звуковые уведомления', desc: 'Сигнал при окончании баланса или сессии', icon: 'Bell' },
            { key: 'autoShutdown', label: 'Автовыключение', desc: 'Выключать ПК после завершения сессии', icon: 'PowerOff' },
            { key: 'screenshotEnabled', label: 'Скриншоты экрана', desc: 'Периодически снимать скриншоты (каждые 15 мин)', icon: 'Camera' },
            { key: 'maintenance', label: 'Режим обслуживания', desc: 'Закрыть клуб на техническое обслуживание', icon: 'Wrench' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <Icon name={item.icon} size={16} className="text-white/30" />
                <div>
                  <div className="text-sm font-medium text-white/70">{item.label}</div>
                  <div className="text-xs text-white/30">{item.desc}</div>
                </div>
              </div>
              <button
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                  settings[item.key as keyof typeof settings]
                    ? 'bg-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.4)]'
                    : 'bg-white/10'
                }`}
                onClick={() => toggle(item.key as keyof typeof settings)}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                    settings[item.key as keyof typeof settings] ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        className="w-full py-3 bg-neon-cyan/15 hover:bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/30 hover:border-neon-cyan/50 rounded-xl font-medium transition-all"
        onClick={() => showNotif('Настройки сохранены')}
      >
        Сохранить настройки
      </button>
    </div>
  );
}

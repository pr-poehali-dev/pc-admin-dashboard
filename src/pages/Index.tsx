import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import Dashboard from '@/components/Dashboard';
import PCGrid from '@/components/PCGrid';
import Sessions from '@/components/Sessions';
import Finance from '@/components/Finance';
import Tariffs from '@/components/Tariffs';
import Clients from '@/components/Clients';
import Settings from '@/components/Settings';
import { apiGetPCs, PCRow } from '@/api/client';

type Section = 'dashboard' | 'pcs' | 'sessions' | 'finance' | 'tariffs' | 'clients' | 'settings';

const nav: { id: Section; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
  { id: 'pcs', label: 'ПК', icon: 'Monitor' },
  { id: 'sessions', label: 'Сессии', icon: 'Play' },
  { id: 'clients', label: 'Клиенты', icon: 'Users' },
  { id: 'finance', label: 'Финансы', icon: 'BarChart3' },
  { id: 'tariffs', label: 'Тарифы', icon: 'Tag' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
];

const sectionTitles: Record<Section, string> = {
  dashboard: 'Дашборд',
  pcs: 'Управление ПК',
  sessions: 'Сессии',
  finance: 'Финансы',
  tariffs: 'Тарифы',
  clients: 'Клиенты',
  settings: 'Настройки',
};

export default function Index() {
  const [section, setSection] = useState<Section>('dashboard');
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pcs, setPCs] = useState<PCRow[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadPCs = useCallback(async () => {
    try { setPCs(await apiGetPCs()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    loadPCs();
    const t = setInterval(loadPCs, 8000);
    return () => clearInterval(t);
  }, [loadPCs]);

  const activePCs = pcs.filter(p => p.status === 'active').length;
  const totalPCs = pcs.length;

  return (
    <div className="min-h-screen bg-surface-1 grid-bg flex font-sans">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-white/5 transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
        style={{ background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center flex-shrink-0 glow-cyan">
            <Icon name="Cpu" size={16} className="text-neon-cyan" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-black text-white text-sm tracking-widest">NEXUS</div>
              <div className="font-mono text-neon-cyan text-xs tracking-wider">CLUB</div>
            </div>
          )}
          <button
            className="ml-auto w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Icon name={sidebarOpen ? 'ChevronLeft' : 'ChevronRight'} size={12} className="text-white/30" />
          </button>
        </div>

        {/* Status Bar */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-b border-white/5">
            <div className="bg-surface-3/50 rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">ПК онлайн</span>
                <span className="font-mono text-xs text-neon-green font-bold">{activePCs}/{totalPCs}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(activePCs / totalPCs) * 100}%`,
                    background: 'linear-gradient(90deg, #22c55e, #00ffff)',
                    boxShadow: '0 0 8px rgba(34,197,94,0.5)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {nav.map(item => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                  active
                    ? 'bg-neon-cyan/12 text-neon-cyan border border-neon-cyan/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
                }`}
                onClick={() => setSection(item.id)}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4/5 bg-neon-cyan rounded-full" />
                )}
                <Icon name={item.icon} size={16} className="flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                )}
                {sidebarOpen && item.id === 'pcs' && activePCs > 0 && (
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                    style={{ background: active ? 'rgba(0,255,255,0.2)' : 'rgba(255,255,255,0.08)', color: active ? '#00ffff' : 'rgba(255,255,255,0.4)' }}>
                    {activePCs}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Clock */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-t border-white/5">
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-white/80 text-glow-cyan">
                {time.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs text-white/30 mt-0.5">
                {time.toLocaleDateString('ru', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0" style={{ background: '#0d111780' }}>
          <div>
            <h1 className="text-lg font-bold text-white/90">{sectionTitles[section]}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-white/30 font-mono">Система активна</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4 mr-2">
              {[
                { label: 'Активных', value: activePCs, color: '#22c55e' },
                { label: 'Свободных', value: pcs.filter(p => p.status === 'idle').length, color: '#00ffff' },
                { label: 'Оффлайн', value: pcs.filter(p => p.status === 'offline').length, color: '#6b7280' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-mono font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-white/25">{s.label}</div>
                </div>
              ))}
            </div>

            <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors relative">
              <Icon name="Bell" size={16} className="text-white/50" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-orange rounded-full" />
            </button>

            <div className="flex items-center gap-2.5 bg-surface-2 border border-white/5 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 border border-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white/80">А</span>
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-medium text-white/80">Администратор</div>
                <div className="text-xs text-white/30">admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {section === 'dashboard' && <Dashboard />}
          {section === 'pcs' && <PCGrid />}
          {section === 'sessions' && <Sessions />}
          {section === 'finance' && <Finance />}
          {section === 'tariffs' && <Tariffs />}
          {section === 'clients' && <Clients />}
          {section === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}
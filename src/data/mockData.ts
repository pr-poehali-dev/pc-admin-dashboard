export type PCStatus = 'active' | 'idle' | 'offline' | 'maintenance';
export type PCZone = 'VIP' | 'Стандарт' | 'Турнирная';

export interface PC {
  id: number;
  name: string;
  zone: PCZone;
  status: PCStatus;
  user?: string;
  game?: string;
  sessionStart?: string;
  sessionDuration?: number;
  balance?: number;
  specs: { cpu: string; gpu: string; ram: string; };
  ip: string;
}

export interface Session {
  id: string;
  pcId: number;
  pcName: string;
  user: string;
  game: string;
  start: string;
  duration: number;
  cost: number;
  status: 'active' | 'completed';
}

export interface Transaction {
  id: string;
  user: string;
  amount: number;
  type: 'deposit' | 'session' | 'refund';
  time: string;
  description: string;
}

export interface Tariff {
  id: string;
  name: string;
  zone: PCZone;
  pricePerHour: number;
  minTime: number;
  color: string;
  popular?: boolean;
}

export const pcs: PC[] = [
  { id: 1, name: 'PC-01', zone: 'VIP', status: 'active', user: 'Артём К.', game: 'CS2', sessionStart: '18:30', sessionDuration: 95, balance: 430, specs: { cpu: 'i9-13900K', gpu: 'RTX 4090', ram: '32GB' }, ip: '192.168.1.1' },
  { id: 2, name: 'PC-02', zone: 'VIP', status: 'active', user: 'Макс П.', game: 'Cyberpunk 2077', sessionStart: '17:15', sessionDuration: 130, balance: 870, specs: { cpu: 'i9-13900K', gpu: 'RTX 4090', ram: '32GB' }, ip: '192.168.1.2' },
  { id: 3, name: 'PC-03', zone: 'VIP', status: 'idle', specs: { cpu: 'i9-13900K', gpu: 'RTX 4090', ram: '32GB' }, ip: '192.168.1.3' },
  { id: 4, name: 'PC-04', zone: 'VIP', status: 'maintenance', specs: { cpu: 'i9-13900K', gpu: 'RTX 4090', ram: '32GB' }, ip: '192.168.1.4' },
  { id: 5, name: 'PC-05', zone: 'Стандарт', status: 'active', user: 'Денис Р.', game: 'Dota 2', sessionStart: '19:00', sessionDuration: 60, balance: 220, specs: { cpu: 'i7-13700K', gpu: 'RTX 4070', ram: '16GB' }, ip: '192.168.1.5' },
  { id: 6, name: 'PC-06', zone: 'Стандарт', status: 'active', user: 'Иван С.', game: 'Valorant', sessionStart: '18:45', sessionDuration: 75, balance: 150, specs: { cpu: 'i7-13700K', gpu: 'RTX 4070', ram: '16GB' }, ip: '192.168.1.6' },
  { id: 7, name: 'PC-07', zone: 'Стандарт', status: 'active', user: 'Олег Т.', game: 'GTA V', sessionStart: '20:00', sessionDuration: 35, balance: 680, specs: { cpu: 'i7-13700K', gpu: 'RTX 4070', ram: '16GB' }, ip: '192.168.1.7' },
  { id: 8, name: 'PC-08', zone: 'Стандарт', status: 'idle', specs: { cpu: 'i7-13700K', gpu: 'RTX 4070', ram: '16GB' }, ip: '192.168.1.8' },
  { id: 9, name: 'PC-09', zone: 'Стандарт', status: 'idle', specs: { cpu: 'i7-13700K', gpu: 'RTX 4070', ram: '16GB' }, ip: '192.168.1.9' },
  { id: 10, name: 'PC-10', zone: 'Стандарт', status: 'offline', specs: { cpu: 'i7-13700K', gpu: 'RTX 4070', ram: '16GB' }, ip: '192.168.1.10' },
  { id: 11, name: 'PC-11', zone: 'Турнирная', status: 'active', user: 'Влад М.', game: 'CS2', sessionStart: '18:00', sessionDuration: 120, balance: 1200, specs: { cpu: 'i9-14900K', gpu: 'RTX 4090 Ti', ram: '64GB' }, ip: '192.168.1.11' },
  { id: 12, name: 'PC-12', zone: 'Турнирная', status: 'active', user: 'Кирилл Н.', game: 'CS2', sessionStart: '18:00', sessionDuration: 120, balance: 1200, specs: { cpu: 'i9-14900K', gpu: 'RTX 4090 Ti', ram: '64GB' }, ip: '192.168.1.12' },
  { id: 13, name: 'PC-13', zone: 'Турнирная', status: 'idle', specs: { cpu: 'i9-14900K', gpu: 'RTX 4090 Ti', ram: '64GB' }, ip: '192.168.1.13' },
  { id: 14, name: 'PC-14', zone: 'Турнирная', status: 'idle', specs: { cpu: 'i9-14900K', gpu: 'RTX 4090 Ti', ram: '64GB' }, ip: '192.168.1.14' },
  { id: 15, name: 'PC-15', zone: 'Стандарт', status: 'active', user: 'Саша Л.', game: 'League of Legends', sessionStart: '19:30', sessionDuration: 50, balance: 90, specs: { cpu: 'i7-13700K', gpu: 'RTX 4070', ram: '16GB' }, ip: '192.168.1.15' },
  { id: 16, name: 'PC-16', zone: 'Стандарт', status: 'idle', specs: { cpu: 'i7-13700K', gpu: 'RTX 4070', ram: '16GB' }, ip: '192.168.1.16' },
];

export const sessions: Session[] = [
  { id: 'S001', pcId: 1, pcName: 'PC-01', user: 'Артём К.', game: 'CS2', start: '18:30', duration: 95, cost: 285, status: 'active' },
  { id: 'S002', pcId: 2, pcName: 'PC-02', user: 'Макс П.', game: 'Cyberpunk 2077', start: '17:15', duration: 130, cost: 390, status: 'active' },
  { id: 'S003', pcId: 5, pcName: 'PC-05', user: 'Денис Р.', game: 'Dota 2', start: '19:00', duration: 60, cost: 120, status: 'active' },
  { id: 'S004', pcId: 6, pcName: 'PC-06', user: 'Иван С.', game: 'Valorant', start: '18:45', duration: 75, cost: 150, status: 'active' },
  { id: 'S005', pcId: 11, pcName: 'PC-11', user: 'Влад М.', game: 'CS2', start: '18:00', duration: 120, cost: 480, status: 'active' },
  { id: 'S006', pcId: 3, pcName: 'PC-03', user: 'Никита В.', game: 'Fortnite', start: '16:00', duration: 180, cost: 540, status: 'completed' },
  { id: 'S007', pcId: 8, pcName: 'PC-08', user: 'Рома Г.', game: 'Apex Legends', start: '15:30', duration: 120, cost: 240, status: 'completed' },
];

export const transactions: Transaction[] = [
  { id: 'T001', user: 'Артём К.', amount: 500, type: 'deposit', time: '18:25', description: 'Пополнение счёта' },
  { id: 'T002', user: 'Макс П.', amount: -390, type: 'session', time: '18:00', description: 'Оплата сессии PC-02' },
  { id: 'T003', user: 'Денис Р.', amount: 300, type: 'deposit', time: '18:55', description: 'Пополнение счёта' },
  { id: 'T004', user: 'Никита В.', amount: 50, type: 'refund', time: '19:10', description: 'Возврат остатка' },
  { id: 'T005', user: 'Иван С.', amount: -150, type: 'session', time: '18:45', description: 'Оплата сессии PC-06' },
  { id: 'T006', user: 'Влад М.', amount: 1500, type: 'deposit', time: '17:55', description: 'Пополнение счёта' },
  { id: 'T007', user: 'Рома Г.', amount: -240, type: 'session', time: '17:30', description: 'Оплата сессии PC-08' },
];

export const tariffs: Tariff[] = [
  { id: 'T1', name: 'Стандарт Day', zone: 'Стандарт', pricePerHour: 120, minTime: 1, color: '#22c55e' },
  { id: 'T2', name: 'Стандарт Night', zone: 'Стандарт', pricePerHour: 80, minTime: 2, color: '#22c55e' },
  { id: 'T3', name: 'VIP Day', zone: 'VIP', pricePerHour: 200, minTime: 1, color: '#a855f7', popular: true },
  { id: 'T4', name: 'VIP Night', zone: 'VIP', pricePerHour: 150, minTime: 2, color: '#a855f7' },
  { id: 'T5', name: 'Турнирная', zone: 'Турнирная', pricePerHour: 300, minTime: 1, color: '#f97316' },
  { id: 'T6', name: 'Ночной пакет', zone: 'Стандарт', pricePerHour: 60, minTime: 8, color: '#00ffff' },
];

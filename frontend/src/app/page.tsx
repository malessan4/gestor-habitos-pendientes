"use client";
import { useEffect, useState } from 'react';
import api from '@/api/axios';
import {
  Flame,
  Plus,
  LayoutDashboard,
  Clock,
  PieChart as PieIcon,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Circle,
  Calendar as CalIcon,
  LogOut,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const router = useRouter();

  const fetchHabits = async () => {
    try {
      const res = await api.get('/habits');
      setHabits(res.data);
    } catch (err) {
      console.error("Error fetching habits:", err);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/auth');
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    try {
      await api.post('/habits', { title: newHabitTitle });
      setNewHabitTitle("");
      setIsModalOpen(false);
      fetchHabits();
    } catch (err) {
      alert("Error al crear la unidad");
    }
  };

  const calculateFlexibleStreak = (completions: any[], frequency: number[]) => {
    if (!completions || completions.length === 0 || !frequency) return 0;
    const activityDates = new Set(completions.map(c => new Date(c.date).toISOString().split('T')[0]));
    let streak = 0;
    let checkDate = new Date();
    const todayStr = checkDate.toISOString().split('T')[0];
    if (frequency.includes(checkDate.getDay()) && !activityDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (frequency.includes(checkDate.getDay())) {
        if (activityDates.has(dateStr)) streak++;
        else if (dateStr !== todayStr) break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  const todayIndex = new Date().getDay();
  const todayHabits = habits.filter((h: any) => h.frequency?.includes(todayIndex));

  const isDoneToday = (completions: any[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return completions.some(c => new Date(c.date).toISOString().split('T')[0] === todayStr);
  };

  const totalMinutes = habits.reduce((acc, h: any) =>
    acc + h.completions.reduce((sum: number, c: any) => sum + (c.minutes || 0), 0), 0
  );

  // Lógica para encontrar el hábito con más horas
  const topHabit = habits.length > 0
    ? [...habits].sort((a: any, b: any) => {
      const sumA = a.completions.reduce((s: number, c: any) => s + (c.minutes || 0), 0);
      const sumB = b.completions.reduce((s: number, c: any) => s + (c.minutes || 0), 0);
      return sumB - sumA;
    })[0]
    : null;

  const topHabitTime = topHabit
    ? topHabit.completions.reduce((s: number, c: any) => s + (c.minutes || 0), 0)
    : 0;

  const chartData = habits.map((h: any) => ({
    name: h.title,
    minutos: h.completions.reduce((sum: number, c: any) => sum + (c.minutes || 0), 0)
  })).filter(d => d.minutos > 0);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto bg-black text-white font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-indigo-500" size={32} />
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">
            Habitus <span className="text-indigo-500">Stamina</span>
          </h1>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/agenda" className="flex-1 md:flex-none bg-zinc-900/50 text-indigo-500 px-6 py-3 rounded-2xl font-black uppercase italic tracking-widest border border-indigo-500/20 flex items-center justify-center gap-2 transition-all hover:bg-indigo-500/10 text-[10px]">
            <CalIcon size={16} /> Agenda
          </Link>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none bg-white text-black px-6 py-3 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-105 text-[10px]">
            <Plus size={16} strokeWidth={3} /> Nueva Unidad
          </button>
          <button onClick={handleLogout} className="p-3 bg-zinc-900 text-zinc-500 rounded-2xl hover:text-red-500 border border-zinc-800 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Misiones de hoy */}
      <div className="mb-12">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div> Misiones de hoy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {todayHabits.map((habit: any) => {
            const done = isDoneToday(habit.completions);
            return (
              <Link href={`/habit/${habit.id}`} key={habit.id}>
                <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${done ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'}`}>
                  <span className={`font-bold text-sm truncate pr-2 ${done ? 'text-indigo-400 line-through opacity-70' : 'text-zinc-200'}`}>{habit.title}</span>
                  {done ? <CheckCircle2 size={18} className="text-indigo-500 shrink-0" /> : <Circle size={18} className="text-zinc-700 shrink-0" />}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800">
          <Clock className="text-indigo-400 mb-4" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Producción Total</p>
          <h3 className="text-3xl font-black">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</h3>
        </div>

        <div className="bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800">
          <TrendingUp className="text-orange-500 mb-4" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Unidades Activas</p>
          <h3 className="text-3xl font-black">{habits.length}</h3>
        </div>

        <div className="bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800 border-l-indigo-500/50">
          <Trophy className="text-indigo-500 mb-4" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Máxima Stamina</p>
          {topHabit ? (
            <>
              <h3 className="text-2xl font-black truncate text-white italic uppercase tracking-tighter">
                {topHabit.title}
              </h3>
              <p className="text-indigo-500 font-bold text-xs mt-1">
                {Math.floor(topHabitTime / 60)}h {topHabitTime % 60}m dedicados
              </p>
            </>
          ) : (
            <h3 className="text-2xl font-black text-zinc-700 italic">Sin Datos</h3>
          )}
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-zinc-900/30 p-8 rounded-[40px] border border-zinc-800 mb-12">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-8 flex items-center gap-2"><PieIcon size={14} /> Rendimiento (Minutos)</h3>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#18181b' }} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
              <Bar dataKey="minutos" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid de Unidades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit: any) => {
          const streak = calculateFlexibleStreak(habit.completions, habit.frequency);
          return (
            <Link href={`/habit/${habit.id}`} key={habit.id}>
              <div className="group bg-zinc-900/40 p-8 rounded-[40px] border border-zinc-800 hover:border-indigo-500 transition-all h-64 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-indigo-500/10 group-hover:text-indigo-500/20"><Flame size={120} fill="currentColor" /></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold group-hover:text-indigo-400 uppercase italic transition-colors tracking-tighter">{habit.title}</h2>
                  <div className="flex items-center gap-2 text-orange-500 text-sm font-black mt-3 bg-orange-500/5 w-fit px-3 py-1 rounded-full border border-orange-500/10">
                    <Flame size={14} fill={streak > 0 ? "currentColor" : "none"} /> {streak} Racha
                  </div>
                </div>
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white transition-colors">Abrir Unidad</span>
                  <ArrowRight size={20} className="text-zinc-600 group-hover:translate-x-2 transition-transform group-hover:text-indigo-500" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Modal Nueva Unidad */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[40px] w-full max-w-md relative overflow-hidden shadow-2xl">
            <h2 className="text-2xl font-black mb-6 uppercase italic">Nueva Unidad</h2>
            <form onSubmit={handleCreateHabit}>
              <input autoFocus className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 mb-6 text-white font-bold outline-none focus:border-indigo-500" value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} placeholder="Ej: Composición" />
              <button type="submit" className="w-full bg-indigo-600 p-4 rounded-2xl font-black uppercase italic hover:bg-indigo-700 transition active:scale-95">Crear</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full mt-4 text-zinc-500 font-black uppercase text-[10px] hover:text-white transition">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
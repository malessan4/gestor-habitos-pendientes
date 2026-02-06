"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Flame, Plus, LayoutDashboard, Clock, PieChart as PieIcon, ArrowRight, TrendingUp, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const fetchHabits = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3000/habits');
      setHabits(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchHabits(); }, []);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    try {
      await axios.post('http://127.0.0.1:3000/habits', { title: newHabitTitle });
      setNewHabitTitle("");
      setIsModalOpen(false);
      fetchHabit(); // Error de tipeo corregido aquí
      fetchHabits();
    } catch (err) { alert("Error al crear"); }
  };

  // --- LÓGICA DE MISIONES DIARIAS ---
  const todayIndex = new Date().getDay(); // 0: Dom, 1: Lun...
  const todayHabits = habits.filter((h: any) => h.frequency?.includes(todayIndex));

  const isDoneToday = (completions: any[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return completions.some(c => new Date(c.date).toISOString().split('T')[0] === todayStr);
  };

  // Estadísticas globales
  const totalMinutes = habits.reduce((acc, h: any) =>
    acc + h.completions.reduce((sum: number, c: any) => sum + (c.minutes || 0), 0), 0
  );

  const topHabit = habits.length > 0
    ? [...habits].sort((a: any, b: any) => {
      const sumA = a.completions.reduce((s: number, c: any) => s + (c.minutes || 0), 0);
      const sumB = b.completions.reduce((s: number, c: any) => s + (c.minutes || 0), 0);
      return sumB - sumA;
    })[0] : null;

  const chartData = habits.map((h: any) => ({
    name: h.title,
    minutos: h.completions.reduce((sum: number, c: any) => sum + (c.minutes || 0), 0)
  })).filter(d => d.minutos > 0);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto bg-black text-white font-sans">
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-indigo-500" size={32} />
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Habitus <span className="text-indigo-500">Stamina</span></h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer"
        >
          <Plus size={20} /> Nueva Unidad
        </button>
      </header>

      {/* SECCIÓN DE MISIONES DE HOY */}
      <div className="mb-12">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          Misiones de hoy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {todayHabits.length > 0 ? todayHabits.map((habit: any) => {
            const done = isDoneToday(habit.completions);
            return (
              <Link href={`/habit/${habit.id}`} key={habit.id}>
                <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${done ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                  }`}>
                  <span className={`font-bold text-sm ${done ? 'text-indigo-400 line-through opacity-70' : 'text-zinc-200'}`}>
                    {habit.title}
                  </span>
                  {done ? (
                    <CheckCircle2 size={18} className="text-indigo-500" />
                  ) : (
                    <Circle size={18} className="text-zinc-700 group-hover:text-zinc-500" />
                  )}
                </div>
              </Link>
            );
          }) : (
            <p className="text-zinc-600 text-sm italic">Hoy es día de descanso según tu configuración.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800">
          <Clock className="text-indigo-400 mb-4" />
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Producción Total</p>
          <h3 className="text-3xl font-black">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</h3>
        </div>
        <div className="bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800">
          <TrendingUp className="text-orange-500 mb-4" />
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Max Stamina</p>
          <h3 className="text-2xl font-black truncate">{topHabit ? topHabit.title : "N/A"}</h3>
        </div>
        <div className="bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800">
          <Flame className="text-indigo-500 mb-4" />
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Unidades Activas</p>
          <h3 className="text-3xl font-black">{habits.length}</h3>
        </div>
      </div>

      <div className="bg-zinc-900/30 p-8 rounded-[40px] border border-zinc-800 mb-12 h-80">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">Rendimiento (Minutos)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ backgroundColor: '#09090b', border: 'none', borderRadius: '12px' }} />
            <Bar dataKey="minutos" fill="#6366f1" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit: any) => (
          <Link href={`/habit/${habit.id}`} key={habit.id}>
            <div className="group bg-zinc-900/40 p-8 rounded-[40px] border border-zinc-800 hover:border-indigo-500 transition-all cursor-pointer h-64 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold group-hover:text-indigo-400 uppercase italic tracking-tighter">{habit.title}</h2>
                <div className="flex items-center gap-2 text-orange-500 text-sm font-bold mt-2">
                  <Flame size={14} fill="currentColor" /> Racha Configurada
                </div>
              </div>
              <ArrowRight size={24} className="text-zinc-600 group-hover:translate-x-2 transition-transform self-end" />
            </div>
          </Link>
        ))}
      </div>

      {/* MODAL NUEVA UNIDAD (IGUAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[40px] w-full max-w-md">
            <h2 className="text-2xl font-black mb-6 uppercase italic">Nueva Unidad</h2>
            <form onSubmit={handleCreateHabit}>
              <input
                autoFocus className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-6 outline-none focus:border-indigo-500"
                value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} placeholder="Ej: Programación"
              />
              <button type="submit" className="w-full bg-indigo-600 p-4 rounded-2xl font-bold hover:bg-indigo-700 transition">Crear Unidad</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full mt-4 text-zinc-500 text-sm font-black uppercase tracking-widest">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
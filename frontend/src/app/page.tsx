"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Flame, Plus, LayoutDashboard, Clock, PieChart as PieIcon, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const fetchHabits = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3000/habits');
      setHabits(res.data);
    } catch (err) {
      console.error("Error al obtener hábitos:", err);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    try {
      await axios.post('http://127.0.0.1:3000/habits', { title: newHabitTitle });
      setNewHabitTitle("");
      setIsModalOpen(false);
      fetchHabits();
    } catch (err) {
      alert("Error al crear el hábito");
    }
  };

  // Lógica Dinámica
  const totalMinutes = habits.reduce((acc, h: any) =>
    acc + h.completions.reduce((sum: number, c: any) => sum + (c.minutes || 0), 0), 0
  );

  const topHabit = habits.length > 0
    ? [...habits].sort((a: any, b: any) => {
      const sumA = a.completions.reduce((s: number, c: any) => s + (c.minutes || 0), 0);
      const sumB = b.completions.reduce((s: number, c: any) => s + (c.minutes || 0), 0);
      return sumB - sumA;
    })[0]
    : null;

  const chartData = habits.map((h: any) => ({
    name: h.title,
    minutos: h.completions.reduce((sum: number, c: any) => sum + (c.minutes || 0), 0)
  })).filter(d => d.minutos > 0);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto bg-black text-white font-sans">
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-indigo-500" size={32} />
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">
            Habit <span className="text-indigo-500">Production</span>
          </h1>
        </div>

        {/* BOTÓN + NUEVO CON HOVER MEJORADO */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2 
                     transition-all duration-300 hover:scale-105 hover:bg-zinc-200 
                     hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer"
        >
          <Plus size={20} strokeWidth={3} /> Nueva Unidad
        </button>
      </header>

      {/* MÉTRICAS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800">
          <Clock className="text-indigo-400 mb-4" />
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Producción Total</p>
          <h3 className="text-3xl font-black">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</h3>
        </div>

        <div className="bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800">
          <TrendingUp className="text-green-500 mb-4" />
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Top Producción</p>
          <h3 className="text-2xl font-black truncate">{topHabit ? topHabit.title : "Sin datos"}</h3>
        </div>

        <div className="bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800">
          <Flame className="text-orange-500 mb-4" />
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Unidades</p>
          <h3 className="text-3xl font-black">{habits.length}</h3>
        </div>
      </div>

      {/* GRÁFICO DE PROGRESO */}
      <div className="bg-zinc-900/30 p-8 rounded-[40px] border border-zinc-800 mb-12">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-8 flex items-center gap-2">
          <PieIcon size={16} /> Rendimiento Comparativo (minutos)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: '#27272a', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '15px' }}
              />
              <Bar dataKey="minutos" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRID DE UNIDADES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit: any) => (
          <Link href={`/habit/${habit.id}`} key={habit.id}>
            <div className="group bg-zinc-900/40 p-8 rounded-[40px] border border-zinc-800 hover:border-indigo-500 transition-all cursor-pointer h-64 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold group-hover:text-indigo-400 transition-colors">{habit.title}</h2>
                <div className="flex items-center gap-2 text-orange-500 text-sm font-bold mt-2">
                  <Flame size={14} fill="currentColor" /> {habit.completions.length} Días activos
                </div>
              </div>
              <div className="flex justify-between items-center text-zinc-500 group-hover:text-white transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest">Analizar Producción</span>
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* MODAL DE NUEVA UNIDAD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[40px] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-6 uppercase italic">Nueva Unidad de <span className="text-indigo-500">Producción</span></h2>
            <form onSubmit={handleCreateHabit}>
              <input
                autoFocus
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-6 outline-none focus:border-indigo-500 text-white"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                placeholder="Ej: Programación, Gym, Lectura..."
              />
              <div className="flex flex-col gap-3">
                <button type="submit" className="w-full bg-indigo-600 p-4 rounded-2xl font-bold hover:bg-indigo-700 transition active:scale-95">
                  Crear Unidad
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full p-4 text-zinc-500 text-sm font-bold hover:text-white transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
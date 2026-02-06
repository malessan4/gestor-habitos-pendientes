"use client";
import 'react-calendar-heatmap/dist/styles.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Flame, CheckCircle, Plus, LayoutDashboard, X, Trash2, Undo2, Clock } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';

export default function Home() {
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const fetchHabits = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3000/habits');
      setHabits(res.data);
    } catch (err) { console.error("Error al cargar hábitos", err); }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    try {
      await axios.post('http://127.0.0.1:3000/habits', { title: newHabitTitle });
      setNewHabitTitle("");
      setIsModalOpen(false);
      fetchHabits();
    } catch (err) { alert("Error al crear hábito"); }
  };

  const handleComplete = async (habitId: number) => {
    const mins = prompt("¿Cuántos minutos le dedicaste hoy?");
    if (mins === null) return;

    try {
      await axios.post(`http://127.0.0.1:3000/habits/${habitId}/complete`, {
        minutes: Number(mins) || 0
      });
      fetchHabits();
    } catch (err) { console.error("Error al completar", err); }
  };

  const handleDeleteHabit = async (habitId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este hábito y todo su progreso?")) return;
    try {
      await axios.delete(`http://127.0.0.1:3000/habits/${habitId}`);
      fetchHabits();
    } catch (err) { console.error("Error al eliminar", err); }
  };

  const handleUndoLast = async (habitId: number) => {
    try {
      await axios.delete(`http://127.0.0.1:3000/habits/${habitId}/undo`);
      fetchHabits();
    } catch (err) { console.error("Error al deshacer", err); }
  };

  const getTotalTime = (completions: any[]) => {
    const totalMins = completions.reduce((acc, curr) => acc + (curr.minutes || 0), 0);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins}m`;
  };

  useEffect(() => { fetchHabits(); }, []);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto bg-black text-white">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-16 border-b border-zinc-800 pb-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl">
            <LayoutDashboard className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">
            Habit <span className="text-indigo-500">Production</span>
          </h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-zinc-200 transition font-bold cursor-pointer shadow-lg shadow-white/5"
        >
          <Plus size={20} /> Nuevo Hábito
        </button>
      </header>

      {/* MODAL PARA NUEVO HÁBITO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[40px] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Nuevo reto</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition">
                <X size={28} />
              </button>
            </div>
            <form onSubmit={handleCreateHabit}>
              <input
                autoFocus
                type="text"
                placeholder="¿Qué vamos a producir hoy?"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 mb-8 text-white text-lg outline-none focus:border-indigo-500 transition"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
              />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl text-lg transition shadow-xl shadow-indigo-900/20">
                Empezar producción
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LISTA DE HÁBITOS - DISEÑO XL */}
      <div className="grid gap-10">
        {habits.map((habit: any) => (
          <div key={habit.id} className="bg-zinc-900/30 p-10 rounded-[48px] border border-zinc-800 flex flex-col gap-10 hover:bg-zinc-900/50 transition-all duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight">{habit.title}</h2>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest border border-orange-500/20">
                    <Flame size={18} fill="currentColor" /> {habit.completions?.length || 0} Días logrados
                  </div>
                  <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest border border-indigo-500/20">
                    <Clock size={18} /> {getTotalTime(habit.completions)} Producidos
                  </div>
                </div>
              </div>

              {/* Acciones de gestión */}
              <div className="flex gap-3 bg-black/20 p-2 rounded-3xl border border-zinc-800">
                <button
                  onClick={() => handleUndoLast(habit.id)}
                  className="p-4 text-zinc-500 hover:text-yellow-500 hover:bg-yellow-500/5 rounded-2xl transition cursor-pointer"
                  title="Deshacer último registro"
                >
                  <Undo2 size={24} />
                </button>
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="p-4 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition cursor-pointer"
                  title="Eliminar hábito"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>

            {/* HEATMAP XL */}
            <div className="w-full bg-black/40 p-8 rounded-[32px] border border-zinc-800/50 shadow-inner">
              <CalendarHeatmap
                startDate={new Date('2026-01-01')}
                endDate={new Date('2026-12-31')}
                values={habit.completions.map((c: any) => ({
                  date: new Date(c.date).toISOString().split('T')[0],
                  count: 1
                }))}
                classForValue={(value: any) => value ? 'color-scale-4' : 'color-empty'}
              />
            </div>

            <button
              onClick={() => handleComplete(habit.id)}
              className="w-full bg-indigo-600/10 hover:bg-green-500 group border border-indigo-500/20 hover:border-green-400 py-8 rounded-[32px] transition-all duration-300 flex items-center justify-center gap-6 cursor-pointer"
            >
              <CheckCircle size={32} className="text-indigo-500 group-hover:text-white transition-colors" />
              <span className="text-2xl font-bold text-indigo-200 group-hover:text-white transition-colors tracking-tight">Registrar Producción Diaria</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
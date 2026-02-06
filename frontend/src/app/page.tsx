"use client";
import 'react-calendar-heatmap/dist/styles.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Flame, CheckCircle, Plus, LayoutDashboard, X } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';

export default function Home() {
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const fetchHabits = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3000/habits');
      setHabits(res.data);
    } catch (err) { console.error(err); }
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
    try {
      await axios.post(`http://127.0.0.1:3000/habits/${habitId}/complete`);
      fetchHabits();
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchHabits(); }, []);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto bg-black text-white">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-indigo-500" size={28} />
          <h1 className="text-2xl font-bold tracking-tight">FocusHabit</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition font-bold text-sm cursor-pointer"
        >
          <Plus size={18} /> Nuevo Hábito
        </button>
      </header>

      {/* MODAL PARA NUEVO HÁBITO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Crear nuevo hábito</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateHabit}>
              <input
                autoFocus
                type="text"
                placeholder="Ej: Meditar 10 min"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 mb-6 text-white outline-none focus:border-indigo-500 transition"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
              />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition">
                Comenzar Hábito
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LISTA DE HÁBITOS */}
      <div className="grid gap-6">
        {habits.map((habit: any) => (
          <div key={habit.id} className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 w-full">
              <h2 className="text-xl font-bold mb-2">{habit.title}</h2>
              <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Flame size={14} fill="currentColor" />
                {habit.completions?.length || 0} Días
              </div>
            </div>

            <div className="w-full max-w-[450px]">
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

            <button onClick={() => handleComplete(habit.id)} className="bg-zinc-800 text-zinc-500 hover:text-green-500 hover:bg-green-500/10 p-4 rounded-2xl transition-all cursor-pointer">
              <CheckCircle size={32} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
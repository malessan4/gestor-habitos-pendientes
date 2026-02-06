"use client";
import 'react-calendar-heatmap/dist/styles.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Flame, CheckCircle, Plus, LayoutDashboard } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';

export default function Home() {
  const [habits, setHabits] = useState([]);

  // 1. Función para cargar datos
  const fetchHabits = async () => {
    try {
      const res = await axios.get('http://localhost:3000/habits');
      setHabits(res.data);
    } catch (err) {
      console.error("Error al cargar hábitos", err);
    }
  };

  // 2. Función para marcar como completado
  const handleComplete = async (habitId: number) => {
    try {
      // Llamamos al backend para registrar la actividad de hoy
      await axios.post(`http://localhost:3000/habits/${habitId}/complete`);
      // Refrescamos la lista para ver el cuadrito verde nuevo
      fetchHabits();
    } catch (err) {
      alert("Error al guardar el progreso");
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      {/* ... (Header igual que antes) ... */}

      <div className="max-w-4xl mx-auto grid gap-6">
        {habits.map((habit: any) => (
          <div key={habit.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 mb-1">{habit.title}</h2>
              <div className="flex items-center gap-2 text-orange-500 font-medium">
                <Flame size={18} fill="currentColor" />
                <span>{habit.completions?.length || 0} días</span>
              </div>
            </div>

            <div className="w-48 h-20">
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

            {/* BOTÓN ACTUALIZADO */}
            <button
              onClick={() => handleComplete(habit.id)}
              className="bg-slate-100 text-slate-400 hover:text-green-600 hover:bg-green-50 p-3 rounded-full transition cursor-pointer"
            >
              <CheckCircle size={36} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from 'react';
import api from '@/api/axios';
import { LayoutDashboard, Calendar as CalIcon, Clock, GripVertical, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AgendaPage() {
    const [habits, setHabits] = useState([]);
    const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);
    const [sourceDay, setSourceDay] = useState<number | null>(null);
    const router = useRouter();

    const days = [
        { n: 'Dom', i: 0 }, { n: 'Lun', i: 1 }, { n: 'Mar', i: 2 },
        { n: 'Mié', i: 3 }, { n: 'Jue', i: 4 }, { n: 'Vie', i: 5 }, { n: 'Sáb', i: 6 }
    ];

    const fetchHabits = async () => {
        try {
            const res = await api.get('/habits');
            setHabits(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchHabits(); }, []);

    // Identificamos el día de hoy (0-6)
    const todayIndex = new Date().getDay();

    // --- LÓGICA DE ARRASTRE ---
    const handleDragStart = (habitId: string, dayIndex: number) => {
        setDraggedHabitId(habitId);
        setSourceDay(dayIndex);
    };

    const handleDrop = async (toDay: number) => {
        if (draggedHabitId === null || sourceDay === null || sourceDay === toDay) return;

        const habit: any = habits.find((h: any) => h.id === draggedHabitId);
        if (!habit) return;

        setDraggedHabitId(null);
        setSourceDay(null);

        const newFreq = [...habit.frequency.filter((d: number) => d !== sourceDay), toDay];

        try {
            await api.patch(`/habits/${draggedHabitId}`, { frequency: newFreq });
            await fetchHabits();
        } catch (err) {
            alert("Error al mover la unidad");
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-black text-white font-sans">
            <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-8">
                <div className="flex items-center gap-3">
                    <CalIcon className="text-indigo-500" size={32} />
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter">Cronograma <span className="text-indigo-500">Semanal</span></h1>
                </div>
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition text-[10px] font-black uppercase bg-zinc-900/50 px-6 py-3 rounded-2xl border border-zinc-800">
                    <LayoutDashboard size={16} /> Dashboard
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map((day) => {
                    const habitsForDay = habits.filter((h: any) => h.frequency?.includes(day.i));
                    const isToday = day.i === todayIndex;

                    return (
                        <div
                            key={day.i}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(day.i)}
                            className={`flex flex-col gap-4 min-h-[500px] p-2 rounded-3xl border-2 transition-all duration-300 ${
                                isToday 
                                    ? 'bg-indigo-500/5 border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
                                    : draggedHabitId 
                                        ? 'border-indigo-500/10 bg-indigo-500/5' 
                                        : 'border-transparent bg-zinc-900/10'
                            }`}
                        >
                            {/* Cabecera del día con color condicional */}
                            <div className={`p-4 rounded-2xl text-center border font-black uppercase text-[10px] tracking-widest transition-colors ${
                                isToday 
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                            }`}>
                                {day.n}
                                {isToday && <span className="block text-[7px] mt-1 opacity-80">Actual</span>}
                            </div>

                            <div className="flex flex-col gap-2">
                                {habitsForDay.map((habit: any) => (
                                    <div
                                        key={habit.id}
                                        draggable
                                        onDragStart={() => handleDragStart(habit.id, day.i)}
                                        className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:border-indigo-500 transition-all group"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[11px] font-bold uppercase truncate group-hover:text-indigo-400">
                                                {habit.title}
                                            </span>
                                            <GripVertical size={14} className="text-zinc-800" />
                                        </div>
                                        <div
                                            onClick={() => router.push(`/habit/${habit.id}`)}
                                            className="text-[8px] font-black text-zinc-600 hover:text-indigo-500 cursor-pointer uppercase flex items-center gap-1"
                                        >
                                            <Clock size={10} /> {habit.completions.length} Sesiones • Ver
                                        </div>
                                    </div>
                                ))}
                                {habitsForDay.length === 0 && (
                                    <div className="flex-1 flex items-center justify-center opacity-20 italic text-[9px] uppercase font-bold mt-4">
                                        Libre
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-center">
                <p className="flex items-center gap-2 text-zinc-600 text-[9px] font-black uppercase italic tracking-widest">
                    <Info size={12} /> Arrastra una unidad para reprogramar tu semana
                </p>
            </div>
        </div>
    );
}
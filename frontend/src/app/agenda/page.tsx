"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Calendar as CalIcon, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AgendaPage() {
    const [habits, setHabits] = useState([]);
    const days = [
        { n: 'Domingo', i: 0 },
        { n: 'Lunes', i: 1 },
        { n: 'Martes', i: 2 },
        { n: 'Miércoles', i: 3 },
        { n: 'Jueves', i: 4 },
        { n: 'Viernes', i: 5 },
        { n: 'Sábado', i: 6 }
    ];

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:3000/habits');
                setHabits(res.data);
            } catch (err) { console.error(err); }
        };
        fetchHabits();
    }, []);

    const todayIndex = new Date().getDay();

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-black text-white font-sans">
            <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-8">
                <div className="flex items-center gap-3">
                    <CalIcon className="text-indigo-500" size={32} />
                    <div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Cronograma <span className="text-indigo-500">Semanal</span></h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Planificación de Stamina</p>
                    </div>
                </div>
                <Link href="/" className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition border border-zinc-800">
                    <ArrowLeft size={18} /> Volver al Dashboard
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map((day) => {
                    const habitsForDay = habits.filter((h: any) => h.frequency?.includes(day.i));
                    const isToday = day.i === todayIndex;

                    return (
                        <div key={day.i} className={`flex flex-col gap-4 ${isToday ? 'opacity-100' : 'opacity-60 hover:opacity-100 transition-opacity'}`}>
                            <div className={`p-4 rounded-2xl text-center border ${isToday ? 'bg-indigo-600 border-indigo-400' : 'bg-zinc-900 border-zinc-800'}`}>
                                <span className="text-xs font-black uppercase tracking-widest">{day.n}</span>
                                {isToday && <p className="text-[8px] font-black uppercase mt-1 text-indigo-200">Hoy</p>}
                            </div>

                            <div className="flex flex-col gap-3">
                                {habitsForDay.length > 0 ? habitsForDay.map((habit: any) => (
                                    <Link href={`/habit/${habit.id}`} key={habit.id}>
                                        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl hover:border-indigo-500 transition-all group">
                                            <p className="text-xs font-bold group-hover:text-indigo-400 truncate">{habit.title}</p>
                                            <div className="flex items-center gap-1 mt-2 text-[8px] text-zinc-500 font-black uppercase">
                                                <Clock size={10} /> {habit.completions.length} SESIONES
                                            </div>
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="border border-dashed border-zinc-800 p-4 rounded-2xl text-center">
                                        <span className="text-[10px] text-zinc-700 font-bold uppercase italic">Descanso</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
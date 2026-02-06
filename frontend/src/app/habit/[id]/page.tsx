"use client";
import 'react-calendar-heatmap/dist/styles.css';
import { useEffect, useState, use } from 'react';
import axios from 'axios';
import { Flame, CheckCircle, ArrowLeft, Undo2, Clock, Calendar as CalIcon, Edit3, Save, Trash2, X, Award, Medal, Trophy, Settings2 } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function HabitDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [habit, setHabit] = useState<any>(null);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [desc, setDesc] = useState("");
    const [title, setTitle] = useState("");
    const [sessionMins, setSessionMins] = useState("");

    const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

    const fetchHabit = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:3000/habits/${id}`);
            setHabit(res.data);
            setDesc(res.data.description || "");
            setTitle(res.data.title || "");
        } catch (err) { console.error(err); }
    };

    // --- ALGORITMO DE RACHA FLEXIBLE ---
    const calculateFlexibleStreak = (completions: any[], frequency: number[]) => {
        if (!completions || completions.length === 0 || !frequency) return 0;

        const activityDates = new Set(completions.map(c =>
            new Date(c.date).toISOString().split('T')[0]
        ));

        let streak = 0;
        let checkDate = new Date();
        const todayStr = checkDate.toISOString().split('T')[0];

        // Si hoy es día de racha y no hay actividad, probamos desde ayer
        if (frequency.includes(checkDate.getDay()) && !activityDates.has(todayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // Buscamos hacia atrás
        for (let i = 0; i < 365; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const dayOfWeek = checkDate.getDay();

            if (frequency.includes(dayOfWeek)) {
                if (activityDates.has(dateStr)) {
                    streak++;
                } else {
                    // Si era un día obligatorio y no hay actividad, se rompió
                    if (dateStr !== todayStr) break;
                }
            }
            // Si no está en frequency, simplemente saltamos al día anterior sin romper
            checkDate.setDate(checkDate.getDate() - 1);
        }
        return streak;
    };

    const toggleDay = async (dayIndex: number) => {
        let newFreq = [...(habit.frequency || [])];
        if (newFreq.includes(dayIndex)) {
            newFreq = newFreq.filter(d => d !== dayIndex);
        } else {
            newFreq.push(dayIndex);
        }
        try {
            await axios.patch(`http://127.0.0.1:3000/habits/${id}`, { frequency: newFreq });
            fetchHabit();
        } catch (err) { alert("Error al guardar frecuencia"); }
    };

    const handleUpdate = async (fields: { title?: string; description?: string }) => {
        try {
            await axios.patch(`http://127.0.0.1:3000/habits/${id}`, fields);
            setIsEditingDesc(false);
            setIsEditingTitle(false);
            fetchHabit();
        } catch (err) { alert("Error al actualizar"); }
    };

    const handleDelete = async () => {
        if (!confirm("¿ESTÁS SEGURO? Se perderá toda la Stamina.")) return;
        try {
            await axios.delete(`http://127.0.0.1:3000/habits/${id}`);
            router.push('/');
        } catch (err) { alert("Error al eliminar"); }
    };

    const handleRegisterSession = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const mins = Number(sessionMins);
        if (!mins || mins <= 0) return;
        try {
            await axios.post(`http://127.0.0.1:3000/habits/${id}/complete`, { minutes: mins });
            setSessionMins("");
            setIsModalOpen(false);
            fetchHabit();
        } catch (err) { console.error(err); }
    };

    const handleUndo = async () => {
        if (!confirm("¿Deshacer último?")) return;
        try {
            await axios.delete(`http://127.0.0.1:3000/habits/${id}/undo`);
            fetchHabit();
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchHabit(); }, [id]);

    if (!habit) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-bold uppercase tracking-widest text-sm italic">Sincronizando Stamina...</div>;

    const totalMins = habit.completions.reduce((acc: number, curr: any) => acc + (curr.minutes || 0), 0);
    const currentStreak = calculateFlexibleStreak(habit.completions, habit.frequency);

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto bg-black text-white font-sans">
            <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition mb-8 group w-fit text-[10px] font-black uppercase tracking-[0.2em]">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Dashboard
            </Link>

            <div className="bg-zinc-900/40 p-8 rounded-[32px] border border-zinc-800 shadow-xl relative">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        {isEditingTitle ? (
                            <div className="flex gap-2 items-center mb-2">
                                <input
                                    className="bg-zinc-800 border border-indigo-500 rounded-xl px-4 py-2 text-2xl font-black italic uppercase outline-none w-full max-w-md"
                                    value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
                                />
                                <button onClick={() => handleUpdate({ title })} className="text-green-500 p-2"><Save size={24} /></button>
                                <button onClick={() => setIsEditingTitle(false)} className="text-zinc-500 p-2"><X size={24} /></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 group cursor-pointer w-fit" onClick={() => setIsEditingTitle(true)}>
                                <h1 className="text-3xl font-black tracking-tighter italic uppercase underline decoration-indigo-500/50 decoration-2 underline-offset-4">{habit.title}</h1>
                                <Edit3 size={16} className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}

                        <div className="group relative mt-4 max-w-xl">
                            {isEditingDesc ? (
                                <div className="flex gap-2 items-start">
                                    <textarea
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-300 outline-none h-24 focus:border-indigo-500"
                                        value={desc} onChange={(e) => setDesc(e.target.value)}
                                    />
                                    <button onClick={() => handleUpdate({ description: desc })} className="bg-indigo-600 p-2 rounded-lg"><Save size={18} /></button>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 cursor-pointer w-fit" onClick={() => setIsEditingDesc(true)}>
                                    <p className="text-zinc-400 text-sm italic leading-relaxed">{habit.description || "Sin descripción. Agregá detalles aquí..."}</p>
                                    <Edit3 size={14} className="text-zinc-700 opacity-0 group-hover:opacity-100 mt-1" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleUndo} className="p-3 bg-zinc-800 text-zinc-400 hover:text-yellow-500 rounded-xl border border-zinc-700 transition"><Undo2 size={20} /></button>
                        <button onClick={handleDelete} className="p-3 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-xl border border-zinc-700 transition"><Trash2 size={20} /></button>
                    </div>
                </div>

                {/* CONFIGURACIÓN DE FRECUENCIA */}
                <div className="mb-8 p-4 bg-black/20 rounded-2xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                        <Settings2 size={12} /> Días de Entrenamiento (Configura tu Racha)
                    </div>
                    <div className="flex gap-2">
                        {dayNames.map((name, index) => (
                            <button
                                key={index}
                                onClick={() => toggleDay(index)}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${habit.frequency?.includes(index)
                                        ? 'bg-indigo-600 border-indigo-400 text-white'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-600'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 mb-8 border-t border-zinc-800 pt-6">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-orange-500 bg-orange-500/5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase border border-orange-500/10">
                            <Flame size={14} fill={currentStreak > 0 ? "currentColor" : "none"} /> {currentStreak} Días de racha
                        </div>
                        <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase border border-indigo-500/10">
                            <Clock size={14} /> {Math.floor(totalMins / 60)}h {totalMins % 60}m totales
                        </div>
                    </div>
                </div>

                {/* HEATMAP */}
                <div className="bg-black/40 p-8 rounded-[24px] border border-zinc-800/50 mb-8 overflow-hidden">
                    <div className="flex gap-6 mb-4">
                        <div className="flex flex-col justify-between text-[10px] text-zinc-600 font-black uppercase py-2 h-[100px]">
                            <span>Lun</span><span>Mie</span><span>Vie</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <CalendarHeatmap
                                startDate={new Date('2026-01-01')}
                                endDate={new Date('2026-12-31')}
                                values={habit.completions.map((c: any) => ({
                                    date: new Date(c.date).toISOString().split('T')[0],
                                    count: c.minutes
                                }))}
                                classForValue={(value: any) => {
                                    if (!value || value.count === 0) return 'color-empty';
                                    if (value.count <= 30) return 'color-scale-1';
                                    if (value.count <= 60) return 'color-scale-2';
                                    if (value.count <= 120) return 'color-scale-3';
                                    return 'color-scale-4';
                                }}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-tighter text-xl flex items-center justify-center gap-3 transition-all hover:bg-green-500 active:scale-95 cursor-pointer shadow-xl shadow-indigo-500/10"
                >
                    <CheckCircle size={24} /> Registrar Sesión
                </button>
            </div>

            {/* MODAL (Igual al anterior, solo agregamos el cierre al pulsar Enter) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[40px] w-full max-w-sm shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black italic uppercase">Cargar <span className="text-indigo-500">Sesión</span></h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-red-500 transition"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleRegisterSession}>
                                <input
                                    autoFocus type="number" placeholder="Minutos"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 mb-6 outline-none focus:border-indigo-500 text-3xl font-black text-center text-white"
                                    value={sessionMins} onChange={(e) => setSessionMins(e.target.value)}
                                />
                                <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic hover:bg-indigo-500 hover:text-white transition-all">Guardar Entrenamiento</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full mt-4 text-red-500/60 text-[10px] font-black uppercase tracking-widest">Cancelar</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .react-calendar-heatmap .color-empty { fill: #18181b; }
                .react-calendar-heatmap .color-scale-1 { fill: #312e81; }
                .react-calendar-heatmap .color-scale-2 { fill: #4338ca; }
                .react-calendar-heatmap .color-scale-3 { fill: #6366f1; }
                .react-calendar-heatmap .color-scale-4 { fill: #818cf8; }
                .react-calendar-heatmap rect { rx: 2px; }
            `}</style>
        </div>
    );
}
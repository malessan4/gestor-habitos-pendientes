"use client";
import 'react-calendar-heatmap/dist/styles.css';
import { useEffect, useState, use, useRef } from 'react';
import api from '@/api/axios';
import {
    Flame, CheckCircle, Undo2, Clock, Calendar as CalIcon,
    Edit3, Save, Trash2, X, Award, Medal, Trophy,
    Settings2, LayoutDashboard, Play, Pause, Square
} from 'lucide-react';
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

    // --- ESTADOS DEL CRONÓMETRO BLINDADO ---
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [seconds, setSeconds] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

    const fetchHabit = async () => {
        try {
            const res = await api.get(`/habits/${id}`);
            setHabit(res.data);
            setDesc(res.data.description || "");
            setTitle(res.data.title || "");
        } catch (err) {
            console.error(err);
        }
    };

    // --- LÓGICA DEL CRONÓMETRO (SINCRONIZADA CON RELOJ DEL SISTEMA) ---
    useEffect(() => {
        if (isActive && !isPaused) {
            // Guardamos el momento de inicio real compensando lo ya transcurrido
            startTimeRef.current = Date.now() - (seconds * 1000);
            timerRef.current = setInterval(() => {
                if (startTimeRef.current) {
                    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                    setSeconds(elapsed);
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isActive, isPaused]);

    const handlePlayPause = () => {
        setIsActive(true);
        setIsPaused(!isPaused);
    };

    const handleStop = async () => {
        const minsToRegister = Math.max(1, Math.round(seconds / 60));
        if (seconds < 10) return alert("Tiempo insuficiente para generar Stamina.");

        if (confirm(`¿Finalizar sesión y registrar ${minsToRegister} minutos de Stamina?`)) {
            try {
                await api.post(`/habits/${id}/complete`, { minutes: minsToRegister });
                setIsActive(false);
                setIsPaused(true);
                setSeconds(0);
                await fetchHabit();
            } catch (err) {
                alert("Error al registrar sesión automática");
            }
        }
    };

    const formatTimer = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- LÓGICA DE AGRUPACIÓN PARA HEATMAP (RESUELVE TU INCONSISTENCIA) ---
    const getHeatmapData = () => {
        if (!habit || !habit.completions) return [];
        const groups: { [key: string]: number } = {};

        habit.completions.forEach((c: any) => {
            const dateObj = new Date(c.date);
            // Ajustamos el offset para que la fecha coincida con Argentina
            const offset = dateObj.getTimezoneOffset() * 60000;
            const localDate = new Date(dateObj.getTime() - offset).toISOString().split('T')[0];

            groups[localDate] = (groups[localDate] || 0) + (c.minutes || 0);
        });

        return Object.keys(groups).map(date => ({
            date,
            count: groups[date]
        }));
    };

    // --- CÁLCULO DE RACHA FLEXIBLE CORREGIDO ---
    const calculateFlexibleStreak = (completions: any[], frequency: number[]) => {
        if (!completions || completions.length === 0 || !frequency) return 0;

        const activityDates = new Set(completions.map(c => {
            const d = new Date(c.date);
            const offset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - offset).toISOString().split('T')[0];
        }));

        let streak = 0;
        let checkDate = new Date();
        const offsetToday = checkDate.getTimezoneOffset() * 60000;
        const todayStr = new Date(checkDate.getTime() - offsetToday).toISOString().split('T')[0];

        if (frequency.includes(checkDate.getDay()) && !activityDates.has(todayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }
        for (let i = 0; i < 365; i++) {
            const currentOffset = checkDate.getTimezoneOffset() * 60000;
            const dateStr = new Date(checkDate.getTime() - currentOffset).toISOString().split('T')[0];
            const dayOfWeek = checkDate.getDay();

            if (frequency.includes(dayOfWeek)) {
                if (activityDates.has(dateStr)) { streak++; }
                else if (dateStr !== todayStr) break;
            }
            checkDate.setDate(checkDate.getDate() - 1);
        }
        return streak;
    };

    const toggleDay = async (dayIndex: number) => {
        let newFreq = [...(habit.frequency || [])];
        newFreq = newFreq.includes(dayIndex) ? newFreq.filter(d => d !== dayIndex) : [...newFreq, dayIndex];
        try {
            await api.patch(`/habits/${id}`, { frequency: newFreq });
            fetchHabit();
        } catch (err) { alert("Error al guardar frecuencia"); }
    };

    const handleUpdate = async (fields: { title?: string; description?: string }) => {
        try {
            await api.patch(`/habits/${id}`, fields);
            setIsEditingDesc(false);
            setIsEditingTitle(false);
            fetchHabit();
        } catch (err) { alert("Error al actualizar"); }
    };

    const handleDelete = async () => {
        if (!confirm("¿ESTÁS SEGURO? Se perderá toda la Stamina.")) return;
        try {
            await api.delete(`/habits/${id}`);
            router.push('/');
        } catch (err) { alert("Error al eliminar"); }
    };

    const handleRegisterSession = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const mins = Number(sessionMins);
        if (!mins || mins <= 0) return;
        try {
            await api.post(`/habits/${id}/complete`, { minutes: mins });
            setSessionMins("");
            setIsModalOpen(false);
            await fetchHabit();
        } catch (err) { console.error(err); }
    };

    const handleUndo = async () => {
        if (!confirm("¿Deshacer último?")) return;
        try {
            await api.delete(`/habits/${id}/undo`);
            fetchHabit();
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchHabit(); }, [id]);

    if (!habit) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-bold uppercase tracking-widest text-sm italic animate-pulse">Sincronizando Stamina...</div>;

    const totalMins = habit.completions.reduce((acc: number, curr: any) => acc + (curr.minutes || 0), 0);
    const totalHours = totalMins / 60;
    const currentStreak = calculateFlexibleStreak(habit.completions, habit.frequency);
    const heatmapValues = getHeatmapData();

    const achievements = [
        { name: "Iniciador", icon: <Award size={24} />, req: 10, current: totalHours, color: "text-amber-600" },
        { name: "Constancia", icon: <Medal size={24} />, req: 50, current: totalHours, color: "text-zinc-400" },
        { name: "Maestría", icon: <Trophy size={24} />, req: 100, current: totalHours, color: "text-yellow-400" },
    ];

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto bg-black text-white font-sans">
            <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-8">
                <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition group text-[10px] font-black uppercase tracking-[0.2em] bg-zinc-900/50 px-6 py-3 rounded-2xl border border-zinc-800">
                    <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link href="/agenda" className="flex items-center gap-2 text-indigo-500 hover:text-indigo-400 transition group text-[10px] font-black uppercase bg-indigo-500/5 px-6 py-3 rounded-2xl border border-indigo-500/20">
                    <CalIcon size={16} /> Agenda Semanal
                </Link>
            </header>

            <div className="bg-zinc-900/40 p-8 rounded-[32px] border border-zinc-800 shadow-xl relative">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        {isEditingTitle ? (
                            <div className="flex gap-2 items-center mb-2">
                                <input className="bg-zinc-800 border border-indigo-500 rounded-xl px-4 py-2 text-2xl font-black italic uppercase outline-none w-full max-w-md text-white" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                                <button onClick={() => handleUpdate({ title })} className="text-green-500 p-2 hover:bg-green-500/10 rounded-lg transition"><Save size={24} /></button>
                                <button onClick={() => setIsEditingTitle(false)} className="text-zinc-500 p-2 hover:bg-white/5 rounded-lg transition"><X size={24} /></button>
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
                                    <textarea className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-300 outline-none h-24 focus:border-indigo-500" value={desc} onChange={(e) => setDesc(e.target.value)} />
                                    <button onClick={() => handleUpdate({ description: desc })} className="bg-indigo-600 p-2 rounded-lg hover:bg-indigo-500 transition"><Save size={18} /></button>
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
                        <button onClick={handleUndo} title="Deshacer sesión" className="p-3 bg-zinc-800 text-zinc-400 hover:text-yellow-500 rounded-xl border border-zinc-700 transition"><Undo2 size={20} /></button>
                        <button onClick={handleDelete} title="Borrar Hábito" className="p-3 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-xl border border-zinc-700 transition"><Trash2 size={20} /></button>
                    </div>
                </div>

                <div className="mb-8 p-4 bg-black/20 rounded-2xl border border-zinc-800/50 mt-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3"><Settings2 size={12} /> Días de Entrenamiento</div>
                    <div className="flex gap-2">
                        {dayNames.map((name, index) => (
                            <button key={index} onClick={() => toggleDay(index)} className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${habit.frequency?.includes(index) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-600'}`}>{name}</button>
                        ))}
                    </div>
                </div>

                {/* --- SECCIÓN CRONÓMETRO --- */}
                <div className="mb-8 p-8 bg-black/40 rounded-[24px] border border-zinc-800/50 flex flex-col items-center">
                    <div className={`text-6xl font-mono font-black mb-8 tracking-tighter transition-colors ${!isPaused ? 'text-indigo-500 animate-pulse' : 'text-zinc-600'}`}>
                        {formatTimer(seconds)}
                    </div>
                    <div className="flex gap-4 w-full max-w-sm">
                        <button onClick={handlePlayPause} className={`flex-1 py-5 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 transition-all ${isPaused ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-800 text-indigo-400 border border-indigo-500/30 hover:bg-zinc-700 hover:text-indigo-300'}`}>
                            {isPaused ? <><Play size={24} fill="currentColor" /> Iniciar</> : <><Pause size={24} fill="currentColor" /> Pausa</>}
                        </button>
                        <button onClick={handleStop} disabled={!isActive} className={`flex-1 py-5 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 transition-all ${isActive ? 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white shadow-lg shadow-red-500/10' : 'bg-zinc-900 text-zinc-800 border border-zinc-800 cursor-not-allowed opacity-50'}`}>
                            <Square size={20} fill="currentColor" /> Detener
                        </button>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 mt-6 italic text-center">Capture Automated Stamina Production</p>
                </div>

                <button onClick={() => setIsModalOpen(true)} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-tighter text-xl flex items-center justify-center gap-3 transition-all hover:bg-green-500 active:scale-95 cursor-pointer shadow-xl shadow-indigo-500/10 mb-8">
                    <CheckCircle size={24} /> Registrar Sesión Manual
                </button>

                <div className="flex flex-wrap items-center justify-between gap-6 mb-8 border-t border-zinc-800 pt-6">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-orange-500 bg-orange-500/5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase border border-orange-500/10"><Flame size={14} fill={currentStreak > 0 ? "currentColor" : "none"} /> {currentStreak} Días de racha</div>
                        <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase border border-indigo-500/10"><Clock size={14} /> {Math.floor(totalMins / 60)}h {totalMins % 60}m totales</div>
                    </div>
                    <div className="flex gap-3">
                        {achievements.map((ach) => (
                            <div key={ach.name} className={`p-2 rounded-xl border ${ach.current >= ach.req ? `${ach.color} border-current bg-white/5` : 'text-zinc-800 border-zinc-800 bg-transparent'} transition-all`} title={ach.current >= ach.req ? `¡Logro alcanzado: ${ach.name}!` : `Faltan ${(ach.req - ach.current).toFixed(1)}h para esta medalla`}>{ach.icon}</div>
                        ))}
                    </div>
                </div>

                <div className="bg-black/40 p-8 rounded-[24px] border border-zinc-800/50 mb-8 overflow-hidden">
                    <div className="flex gap-6 mb-6">
                        <div className="flex flex-col justify-between text-[10px] text-zinc-600 font-black uppercase py-2 h-[100px]"><span>Lun</span><span>Mie</span><span>Vie</span></div>
                        <div className="flex-1 min-w-0">
                            <CalendarHeatmap
                                startDate={new Date('2026-01-01')}
                                endDate={new Date('2026-12-31')}
                                values={heatmapValues}
                                classForValue={(value: any) => {
                                    if (!value || value.count === 0) return 'color-empty';
                                    if (value.count <= 30) return 'color-scale-1';
                                    if (value.count <= 60) return 'color-scale-2';
                                    if (value.count <= 120) return 'color-scale-3';
                                    return 'color-scale-4';
                                }}
                                tooltipDataAttrs={(value: any) => {
                                    if (!value || !value.date) return { 'data-tooltip-content': 'Sin actividad' };
                                    return { 'data-tooltip-content': `${value.date}: ${value.count} min totales` };
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-10 rounded-[40px] w-full max-w-sm shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-[80px]"></div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-black italic uppercase mb-6">Cargar <span className="text-indigo-500">Sesión</span></h2>
                            <form onSubmit={handleRegisterSession}>
                                <input autoFocus type="number" placeholder="00" className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 mb-6 outline-none focus:border-indigo-500 text-3xl font-black text-center text-white" value={sessionMins} onChange={(e) => setSessionMins(e.target.value)} />
                                <div className="flex flex-col gap-3">
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase italic hover:bg-green-500 transition-all active:scale-95">Guardar</button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <ReactTooltip anchorSelect=".react-calendar-heatmap rect, .group [title]" noArrow style={{ backgroundColor: "#6366f1", color: "#fff", borderRadius: "8px", fontWeight: "bold", fontSize: "11px" }} />
            <style jsx global>{`
                .react-calendar-heatmap .color-empty { fill: #18181b; }
                .react-calendar-heatmap .color-scale-1 { fill: #312e81; }
                .react-calendar-heatmap .color-scale-2 { fill: #4338ca; }
                .react-calendar-heatmap .color-scale-3 { fill: #6366f1; }
                .react-calendar-heatmap .color-scale-4 { fill: #818cf8; }
                .react-calendar-heatmap rect { rx: 2px; cursor: pointer; transition: all 0.2s; }
                .react-calendar-heatmap rect:hover { filter: brightness(1.3); stroke: #fff; stroke-width: 1px; }
            `}</style>
        </div>
    );
}
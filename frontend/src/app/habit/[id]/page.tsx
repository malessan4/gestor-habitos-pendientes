"use client";
import 'react-calendar-heatmap/dist/styles.css';
import { useEffect, useState, use } from 'react';
import axios from 'axios';
import { Flame, CheckCircle, ArrowLeft, Undo2, Clock, Calendar as CalIcon, Edit3, Save, Trash2, X } from 'lucide-react';
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

    const [desc, setDesc] = useState("");
    const [title, setTitle] = useState("");

    const fetchHabit = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:3000/habits/${id}`);
            setHabit(res.data);
            setDesc(res.data.description || "");
            setTitle(res.data.title || "");
        } catch (err) { console.error(err); }
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
        if (!confirm("¿ESTÁS SEGURO? Esta acción destruirá toda la Stamina acumulada.")) return;
        try {
            await axios.delete(`http://127.0.0.1:3000/habits/${id}`);
            router.push('/');
        } catch (err) { alert("Error al eliminar"); }
    };

    const handleComplete = async () => {
        const mins = prompt("¿Cuántos minutos duró esta sesión?");
        if (!mins) return;
        try {
            await axios.post(`http://127.0.0.1:3000/habits/${id}/complete`, { minutes: Number(mins) });
            fetchHabit();
        } catch (err) { alert("Error al registrar"); }
    };

    const handleUndo = async () => {
        if (!confirm("¿Deshacer último registro?")) return;
        try {
            await axios.delete(`http://127.0.0.1:3000/habits/${id}/undo`);
            fetchHabit();
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchHabit(); }, [id]);

    if (!habit) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-bold uppercase tracking-widest">Cargando Unidad...</div>;

    const totalMins = habit.completions.reduce((acc: number, curr: any) => acc + (curr.minutes || 0), 0);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto bg-black text-white font-sans">
            <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition mb-8 group w-fit text-[10px] font-black uppercase tracking-[0.2em]">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Dashboard
            </Link>

            <div className="bg-zinc-900/40 p-8 rounded-[32px] border border-zinc-800 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        {isEditingTitle ? (
                            <div className="flex gap-2 items-center mb-2">
                                <input
                                    className="bg-zinc-800 border border-indigo-500 rounded-xl px-4 py-2 text-2xl font-black italic uppercase outline-none w-full max-w-md"
                                    value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
                                />
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
                                    <textarea
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-300 outline-none h-24 focus:border-indigo-500"
                                        value={desc} onChange={(e) => setDesc(e.target.value)}
                                    />
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
                        <button onClick={handleUndo} title="Deshacer sesión" className="p-3 bg-zinc-800 text-zinc-400 hover:text-yellow-500 rounded-xl border border-zinc-700 transition">
                            <Undo2 size={20} />
                        </button>
                        <button onClick={handleDelete} title="Borrar Hábito" className="p-3 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-xl border border-zinc-700 transition">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mb-8 border-t border-zinc-800 pt-6">
                    <div className="flex items-center gap-2 text-orange-500 bg-orange-500/5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase border border-orange-500/10">
                        <Flame size={14} fill="currentColor" /> {habit.completions.length} Días
                    </div>
                    <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase border border-indigo-500/10">
                        <Clock size={14} /> {Math.floor(totalMins / 60)}h {totalMins % 60}m
                    </div>
                </div>

                <div className="bg-black/40 p-8 rounded-[24px] border border-zinc-800/50 flex gap-6 mb-8 overflow-hidden">
                    <div className="flex flex-col justify-between text-[10px] text-zinc-600 font-black uppercase py-2 h-[110px]">
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
                            tooltipDataAttrs={(value: any) => {
                                if (!value || !value.date) return { 'data-tooltip-content': 'Sin actividad' };
                                return {
                                    'data-tooltip-content': `${formatDate(value.date)}: ${value.count} min registrados`,
                                };
                            }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleComplete}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter text-xl flex items-center justify-center gap-3 transition-all hover:bg-green-500 hover:text-white active:scale-95 cursor-pointer shadow-xl shadow-white/5"
                >
                    <CheckCircle size={24} />
                    Registrar Sesión
                </button>
            </div>

            <ReactTooltip
                anchorSelect=".react-calendar-heatmap rect"
                noArrow
                style={{ backgroundColor: "#6366f1", color: "#fff", borderRadius: "12px", fontWeight: "900", fontSize: "12px", padding: "8px 12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            />

            <style jsx global>{`
                .react-calendar-heatmap .color-empty { fill: #18181b; }
                .react-calendar-heatmap .color-scale-1 { fill: #312e81; }
                .react-calendar-heatmap .color-scale-2 { fill: #4338ca; }
                .react-calendar-heatmap .color-scale-3 { fill: #6366f1; }
                .react-calendar-heatmap .color-scale-4 { fill: #818cf8; }
                .react-calendar-heatmap rect { rx: 3px; cursor: pointer; transition: all 0.2s; }
                .react-calendar-heatmap rect:hover { filter: brightness(1.3); stroke: #fff; stroke-width: 1px; }
            `}</style>
        </div>
    );
}
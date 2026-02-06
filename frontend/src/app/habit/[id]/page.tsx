"use client";
import { useEffect, useState, use } from 'react';
import axios from 'axios';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { ArrowLeft, Clock, Flame, Calendar as CalIcon, Plus } from 'lucide-react';
import Link from 'next/link';

export default function HabitDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [habit, setHabit] = useState<any>(null);
    const [minutes, setMinutes] = useState("");

    const fetchHabit = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:3000/habits/${id}`);
            setHabit(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchHabit(); }, [id]);

    const handleAddCompletion = async () => {
        if (!minutes) return;
        try {
            await axios.post(`http://127.0.0.1:3000/habits/${id}/completion`, {
                minutes: parseInt(minutes),
                date: new Date().toISOString()
            });
            setMinutes("");
            fetchHabit();
        } catch (err) { alert("Error al registrar"); }
    };

    if (!habit) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>;

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto bg-black text-white">
            <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition mb-12">
                <ArrowLeft size={20} /> Volver al Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                <div>
                    <p className="text-indigo-500 font-black uppercase tracking-widest text-xs mb-2">Unidad de Producción</p>
                    <h1 className="text-6xl font-black">{habit.title}</h1>
                </div>

                <div className="flex gap-4">
                    <input
                        type="number" placeholder="Minutos"
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 w-32 outline-none focus:border-indigo-500"
                        value={minutes} onChange={(e) => setMinutes(e.target.value)}
                    />
                    <button onClick={handleAddCompletion} className="bg-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition flex items-center gap-2">
                        <Plus size={20} /> Registrar
                    </button>
                </div>
            </div>

            {/* HEATMAP CON DÍAS A LA IZQUIERDA */}
            <div className="bg-zinc-900/30 p-10 rounded-[40px] border border-zinc-800 mb-12">
                <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                    <CalIcon size={14} /> Mapa de Producción Anual
                </h3>

                <div className="flex gap-6">
                    {/* Etiquetas de días manuales para estilo perfecto */}
                    <div className="flex flex-col justify-between text-[10px] text-zinc-600 font-black uppercase py-2">
                        <span>Lun</span>
                        <span>Mie</span>
                        <span>Vie</span>
                    </div>

                    <div className="flex-1">
                        <CalendarHeatmap
                            startDate={new Date('2026-01-01')}
                            endDate={new Date('2026-12-31')}
                            values={habit.completions.map((c: any) => ({
                                date: new Date(c.date).toISOString().split('T')[0],
                                count: 1
                            }))}
                            classForValue={(value) => {
                                if (!value) return 'color-empty';
                                return `color-scale-4`;
                            }}
                        />
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .react-calendar-heatmap .color-empty { fill: #18181b; }
        .react-calendar-heatmap .color-scale-4 { fill: #6366f1; }
        .react-calendar-heatmap rect { rx: 2px; }
      `}</style>
        </div>
    );
}
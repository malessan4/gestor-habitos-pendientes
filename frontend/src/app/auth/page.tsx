"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Apuntamos al puerto 3000 que es donde corre tu NestJS
        const baseURL = 'http://127.0.0.1:3000';
        const endpoint = isLogin ? '/auth/login' : '/auth/register';

        try {
            const res = await axios.post(`${baseURL}${endpoint}`, { email, password });

            // Guardamos el Token y el ID del usuario
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userId', res.data.userId);

            // ¡Al Dashboard!
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || "Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-zinc-900/40 p-10 rounded-[40px] border border-zinc-800 shadow-2xl relative overflow-hidden">
                {/* Efecto de luz de fondo */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px]"></div>

                <div className="text-center mb-10 relative z-10">
                    <div className="flex justify-center gap-2 mb-4 text-indigo-500">
                        <LayoutDashboard size={40} />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        Habitus <span className="text-indigo-500">Stamina</span>
                    </h1>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
                        {isLogin ? 'Control de Acceso' : 'Registro de Unidad'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl mb-6 text-center font-bold uppercase tracking-tight">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 text-zinc-600" size={18} />
                        <input
                            type="email" placeholder="EMAIL" required
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 pl-12 outline-none focus:border-indigo-500 text-white transition-all placeholder:text-zinc-600 font-bold text-sm"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-zinc-600" size={18} />
                        <input
                            type="password" placeholder="PASSWORD" required
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 pl-12 outline-none focus:border-indigo-500 text-white transition-all placeholder:text-zinc-600 font-bold text-sm"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-2 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 mt-6 shadow-xl disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Entrar' : 'Registrar')}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <button
                    onClick={() => { setIsLogin(!isLogin); setError(""); }}
                    className="w-full mt-6 text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:text-zinc-400 transition relative z-10"
                >
                    {isLogin ? '¿No tienes cuenta? Crea una' : '¿Ya tienes cuenta? Ingresa'}
                </button>

                <div className="mt-8 flex justify-center opacity-20">
                    <ShieldCheck size={20} className="text-zinc-500" />
                </div>
            </div>
        </div>
    );
}
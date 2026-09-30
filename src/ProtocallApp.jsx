import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewStatus } from './types';
import { InterviewSetup } from './InterviewSetup';
import { InterviewSession } from './InterviewSession';
import { AnalysisReport } from './AnalysisReport';
import { generateEvaluation } from './analysisService';
import { startCheckout } from './billingService';
import { Icons } from './constants';
import { supabase } from './supabaseClient';

const INITIAL_STATS = {
    totalSessions: 0,
    currentStreak: 0,
    lastSessionDate: null,
    scoreHistory: [],
    averageScore: 0
};

const FairHiringInterview = ({ user, onExit }) => {
    const navigate = useNavigate();
    const [state, setState] = useState({
        status: InterviewStatus.IDLE,
        config: null,
        analysis: null,
        currentHistory: [],
        pastInterviews: [],
        stats: INITIAL_STATS
    });

    const [loading, setLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(null);
    const [hasKey, setHasKey] = useState(true);

    // Load interviews and compute stats on mount
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                const { data: interviews, error } = await supabase
                    .from('interviews')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Compute stats from interviews
                const totalSessions = interviews.length;
                const scoreHistory = interviews
                    .filter(i => i.analysis?.overallScore)
                    .map(i => i.analysis.overallScore);
                const averageScore = scoreHistory.length > 0
                    ? Math.round(scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length)
                    : 0;

                // Compute streak (simplified - last 7 days)
                const now = new Date();
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const recentInterviews = interviews.filter(i =>
                    new Date(i.created_at) >= sevenDaysAgo
                );
                const currentStreak = recentInterviews.length;

                const lastSessionDate = interviews.length > 0
                    ? new Date(interviews[0].created_at).toISOString().split('T')[0]
                    : null;

                const stats = {
                    totalSessions,
                    currentStreak,
                    lastSessionDate,
                    scoreHistory,
                    averageScore
                };

                setState(prev => ({ ...prev, stats, pastInterviews: interviews }));
            } catch (error) {
                console.error('Failed to load interviews:', error);
            }
        };

        loadData();

        // Live Audio session needs the key client-side; analysis goes through the proxy
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
        const hasProxy = !!import.meta.env.VITE_API_URL;
        setHasKey(!!apiKey || hasProxy);
    }, [user]);

    const handleStartInterview = (config) => {
        setState(prev => ({ ...prev, config, status: InterviewStatus.INTERVIEWING }));
    };

    const handleInterviewComplete = async (history, duration) => {
        if (!state.config || !user) return;

        setLoading(true);
        try {
            const evaluation = await generateEvaluation(state.config, history);
            evaluation.duration = duration;

            // Insert into database
            const { error } = await supabase
                .from('interviews')
                .insert({
                    user_id: user.id,
                    config: state.config,
                    history,
                    analysis: evaluation,
                    duration
                });

            if (error) throw error;

            // Reload data
            const { data: interviews, error: fetchError } = await supabase
                .from('interviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Recompute stats
            const totalSessions = interviews.length;
            const scoreHistory = interviews
                .filter(i => i.analysis?.overallScore)
                .map(i => i.analysis.overallScore);
            const averageScore = scoreHistory.length > 0
                ? Math.round(scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length)
                : 0;

            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const recentInterviews = interviews.filter(i =>
                new Date(i.created_at) >= sevenDaysAgo
            );
            const currentStreak = recentInterviews.length;

            const lastSessionDate = interviews.length > 0
                ? new Date(interviews[0].created_at).toISOString().split('T')[0]
                : null;

            const stats = {
                totalSessions,
                currentStreak,
                lastSessionDate,
                scoreHistory,
                averageScore
            };

            setState(prev => ({
                ...prev,
                currentHistory: history,
                analysis: evaluation,
                pastInterviews: interviews,
                stats,
                status: InterviewStatus.COMPLETED
            }));
        } catch (err) {
            console.error('Evaluation failed:', err);
            alert(`API Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const isStandalone = import.meta.env.VITE_STANDALONE_PROTOCOL === 'true';

    const handleExit = () => {
        if (onExit && !isStandalone) {
            onExit();
        } else if (!isStandalone) {
            navigate('/candidate');
        } else {
            // In standalone, just return to IDLE
            setState(prev => ({ ...prev, status: InterviewStatus.IDLE, analysis: null, config: null }));
        }
    };

    const handleBack = () => {
        if (state.status === InterviewStatus.SETUP) {
            setState(prev => ({ ...prev, status: InterviewStatus.IDLE }));
        } else if (state.status === InterviewStatus.INTERVIEWING) {
            if (confirm("Are you sure you want to leave the interview? Progress will be lost.")) {
                setState(prev => ({ ...prev, status: InterviewStatus.SETUP }));
            }
        } else if (state.status === InterviewStatus.COMPLETED) {
            setState(prev => ({ ...prev, status: InterviewStatus.IDLE, analysis: null, config: null }));
        } else {
            handleExit();
        }
    };

    const handleCheckout = async (plan) => {
        setCheckoutLoading(plan);
        try {
            await startCheckout(plan);
        } catch (err) {
            console.error('Checkout failed:', err);
            alert(err.message);
            setCheckoutLoading(null);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12">
                    <div className="relative">
                        <div className="w-40 h-40 border-[3px] border-[#1c1c1c]/10 border-t-[#1c1c1c] rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icons.Sparkles className="w-12 h-12 text-[#1c1c1c] animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-5xl font-black text-[#1c1c1c] tracking-tighter uppercase font-montreal">Analyzing Performance</h2>
                        <p className="text-sm font-black tracking-widest uppercase opacity-50 font-grotesk">Synthesizing behavioral intelligence feed...</p>
                    </div>
                </div>
            );
        }

        switch (state.status) {
            case InterviewStatus.IDLE:
                const improvement = state.stats.scoreHistory.length > 1
                    ? state.stats.scoreHistory[state.stats.scoreHistory.length - 1] - state.stats.scoreHistory[0]
                    : 0;

                return (
                    <div className="flex flex-col max-w-[1440px] mx-auto py-4 min-h-[70vh] justify-start text-center">
                        <div className="space-y-8">
                            {/* Badges */}
                            <div className="flex justify-center gap-4">
                                <div className="inline-flex items-center gap-4 px-4 py-1.5 border-[2px] border-[#1c1c1c] text-[#1c1c1c] text-[9px] font-black tracking-[0.3em] uppercase">
                                    <Icons.Sparkles className="w-3.5 h-3.5" />
                                    AI_INTELLIGENCE_CORE
                                </div>
                                {state.stats.totalSessions > 0 && (
                                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#1c1c1c] text-white text-[9px] font-black tracking-[0.3em] uppercase">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        {state.stats.currentStreak}D CONSISTENCY
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex justify-center">
                                <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium">{user?.email}</span>
                                    <button
                                        onClick={async () => {
                                            await supabase.auth.signOut();
                                            onExit && onExit();
                                        }}
                                        className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>

                            {/* Main Title */}
                            <div className="space-y-0">
                                <h1 className="text-[10vw] md:text-[14vw] xl:text-[14vw] font-black tracking-tighter text-[#1c1c1c] leading-[0.75] font-montreal uppercase block w-full">
                                    FAIR HIRING
                                </h1>
                                <h1 className="text-[7vw] md:text-[11vw] xl:text-[11vw] font-black tracking-tighter text-[#1c1c1c] leading-[0.75] font-montreal uppercase block w-full opacity-80">
                                    INTERVIEW
                                </h1>
                            </div>

                            {/* Description & Action */}
                            <div className="max-w-3xl mx-auto space-y-8">
                                <p className="text-sm md:text-base text-[#1c1c1c]/60 font-black font-grotesk leading-tight uppercase tracking-widest">
                                    Multimodal interview simulation. Master your delivery through real-time expression analysis and adaptive agent inquiry.
                                </p>

                                <div className="pt-2">
                                    {!hasKey && (
                                        <div className="px-6 py-3 border-[2px] border-red-500 text-red-500 font-black text-[10px] tracking-widest uppercase mb-6 inline-block">
                                            CONFIG_ERROR: MISSING_API_KEY
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setState(prev => ({ ...prev, status: InterviewStatus.SETUP }))}
                                        className="px-16 py-6 bg-black text-white border-[3px] border-black font-grotesk font-black text-lg tracking-[0.3em] uppercase transition-all shadow-[6px_6px_0px_#ccc] hover:bg-white hover:text-black hover:-translate-y-1 hover:shadow-[10px_10px_0px_#bbb] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                                    >
                                        {state.stats.totalSessions > 0 ? 'RESUME_TRAINING' : 'START_SIMULATION'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Features Minimal Horizontal Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-t-[3px] border-[#1c1c1c]/10 mt-12">
                            {[
                                { label: 'BEHAVIORAL SYNC', icon: <Icons.Sparkles className="w-8 h-8" />, text: 'Visual and auditory performance analysis.' },
                                { label: 'ADAPTIVE AGENT', icon: <Icons.Microphone className="w-8 h-8" />, text: 'Dynamic context-aware questioning.' },
                                { label: 'SKILL MAPPING', icon: <Icons.ChartBar className="w-8 h-8" />, text: 'Detailed intelligence breakdown.' },
                            ].map((f, i) => (
                                <div key={i} className="flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 border-[3px] border-[#1c1c1c] flex items-center justify-center text-[#1c1c1c] shrink-0 shadow-[6px_6px_0px_#ccc]">
                                        {f.icon}
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-montreal font-black text-xs md:text-sm uppercase tracking-[0.4em] leading-none text-[#1c1c1c]">{f.label}</h3>
                                        <p className="text-[#1c1c1c]/70 text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] font-grotesk max-w-[200px] mx-auto leading-relaxed">{f.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t-[3px] border-[#1c1c1c]/10 pt-10 text-left">
                            {[
                                {
                                    id: 'plus',
                                    name: 'Plus',
                                    price: '$14.99 / month',
                                    description: 'For candidates who want structured weekly practice before applications.'
                                },
                                {
                                    id: 'pro',
                                    name: 'Pro',
                                    price: '$9.99 / month',
                                    description: 'For active job seekers preparing intensely across roles and rounds.'
                                }
                            ].map((plan) => (
                                <div key={plan.id} className="border-[3px] border-[#1c1c1c] bg-white/40 p-6 shadow-[8px_8px_0px_#ccc]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-black tracking-[0.35em] uppercase opacity-50 font-grotesk">Beta plan</p>
                                            <h3 className="text-4xl font-black tracking-tighter uppercase font-montreal mt-2">{plan.name}</h3>
                                        </div>
                                        <span className="text-[10px] font-black tracking-[0.2em] uppercase border-[2px] border-[#1c1c1c] px-3 py-1">
                                            Stripe
                                        </span>
                                    </div>
                                    <p className="text-lg font-black uppercase tracking-tight mt-6">{plan.price}</p>
                                    <p className="text-xs font-black uppercase tracking-[0.12em] leading-relaxed opacity-60 mt-3">{plan.description}</p>
                                    <button
                                        onClick={() => handleCheckout(plan.id)}
                                        disabled={checkoutLoading !== null}
                                        className="w-full mt-8 px-6 py-4 bg-[#1c1c1c] text-white border-[3px] border-[#1c1c1c] font-black text-xs tracking-[0.25em] uppercase transition-all hover:bg-white hover:text-[#1c1c1c] disabled:opacity-50"
                                    >
                                        {checkoutLoading === plan.id ? 'Opening checkout...' : `Choose ${plan.name}`}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case InterviewStatus.SETUP:
                return <InterviewSetup onStart={handleStartInterview} />;
            case InterviewStatus.INTERVIEWING:
                return state.config ? (
                    <InterviewSession config={state.config} onComplete={handleInterviewComplete} />
                ) : null;
            case InterviewStatus.COMPLETED:
                return state.analysis ? (
                    <AnalysisReport
                        analysis={state.analysis}
                        config={state.config}
                        onReset={() => setState(prev => ({ ...prev, status: InterviewStatus.IDLE, analysis: null, config: null }))}
                    />
                ) : null;
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[150] bg-[#E6E6E3] text-[#1c1c1c] overflow-y-auto selection:bg-black selection:text-white"
            style={{ willChange: 'transform' }}
            data-lenis-prevent
        >
            {/* STICKY HEADER */}
            <header className="sticky top-0 left-0 w-full bg-[#E6E6E3] border-b-[3px] border-[#1c1c1c] z-50 px-6 md:px-12 py-6 flex justify-between items-center bg-opacity-95 backdrop-blur-sm">
                <div className="flex items-center gap-6">
                    {state.status !== InterviewStatus.COMPLETED && (
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 border-[2px] border-[#1c1c1c] font-grotesk text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#1c1c1c] hover:text-[#E6E6E3] transition-all flex items-center gap-2 group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> BACK
                        </button>
                    )}
                    {state.status !== InterviewStatus.COMPLETED && <div className="h-10 w-[2px] bg-[#1c1c1c]/10 hidden md:block"></div>}
                    <span
                        className="font-montreal font-black text-sm md:text-base tracking-[0.2em] uppercase text-[#1c1c1c] cursor-pointer"
                        onClick={() => setState(prev => ({ ...prev, status: InterviewStatus.IDLE, analysis: null, config: null }))}
                    >
                        FAIR HIRING INTERVIEW
                    </span>
                </div>
                <div className="font-grotesk text-[11px] font-black tracking-[0.1em] uppercase opacity-100 text-[#1c1c1c]">
                    SESSION_V1
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-6 md:px-12 py-12 min-h-[90vh]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state.status + (loading ? '_loading' : '')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="max-w-[1280px] mx-auto px-6 md:px-12 py-12 border-t border-[#1c1c1c]/10 text-center">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="font-grotesk text-[10px] font-black tracking-[0.3em] uppercase opacity-50">
                        © 2026 FAIR HIRING NETWORK
                    </p>
                    <div className="flex items-center gap-8 font-grotesk text-[10px] font-black tracking-[0.3em] uppercase">
                        <div className="flex items-center gap-2">
                            <span className="opacity-40">CURRENT CONSISTENCY</span>
                            <span className="text-[#1c1c1c]">{state.stats.currentStreak} DAYS</span>
                        </div>
                        <div className="h-4 w-[2px] bg-[#1c1c1c]/10" />
                        <div className="flex items-center gap-2">
                            <span className="opacity-40">SYSTEM STATUS</span>
                            <span className="text-green-600">ACTIVE</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </motion.div>
    );
};

export default FairHiringInterview;

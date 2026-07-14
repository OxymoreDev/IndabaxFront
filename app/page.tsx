"use client";
import { useEffect, useState, useCallback } from "react";
import { MatchResult, EvaluationMetrics } from "../src/types/matching";
import {
  CheckCircle,
  Briefcase,
  BarChart3,
  Users,
  Target,
  Search,
  Award,
  Building2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

// --- INTERFACES ---
interface DashboardStats {
  totalCandidates: number;
  totalOffers: number;
  sectorDistribution: { name: string; value: number }[];
  jobDistribution: { name: string; value: number }[];
  cityDistribution: { name: string; value: number }[];
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
  sub: string;
}

export default function Home() {
  // Données
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Recherche & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // --- CHARGEMENT INITIAL (Mémorisé avec useCallback) ---
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [resM, resS, resE] = await Promise.all([
        fetch("https://localhost:7182/api/Matching/results?k=10"),
        fetch("https://localhost:7182/api/Matching/stats"),
        fetch("https://localhost:7182/api/Matching/evaluate"),
      ]);

      const mData = await resM.json();
      const sData = await resS.json();
      const eData = await resE.json();

      setMatches(mData);
      setStats(sData);
      setMetrics(eData);
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  }, []); // Le tableau vide [] signifie que la fonction est créée une seule fois

  useEffect(() => {
    (async () => {
      await loadAllData();
    })();
  }, [loadAllData]); // Ajoute loadAllData ici au lieu de []

  // --- LOGIQUE DE RECHERCHE ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://localhost:7182/api/Matching/search?query=${encodeURIComponent(searchQuery)}&k=10`,
      );
      const data = await res.json();
      setMatches(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Erreur recherche:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // --- PAGINATION ---
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentMatches = matches.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(matches.length / resultsPerPage);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-blue-900 font-black uppercase tracking-widest text-xs">
            Calcul du moteur sémantique...
          </p>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
               Match <span className="text-blue-600">Engine</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Intelligence Artificielle & NLP - Prototype Officiel ACPE Congo
            </p>
          </div>
          <button
            onClick={loadAllData}
            className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={18} className="text-slate-400" />
          </button>
        </header>

        {/* --- BANDEAU SCIENTIFIQUE (Point H & NDCG) --- */}
        {metrics && metrics.status === "Success" && (
          <div className="mb-10 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-blue-500/20">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              <div className="flex items-center gap-4 col-span-1">
                <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-400/30 text-blue-400 shadow-inner">
                  <Award size={35} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight uppercase">
                    Validation <span className="text-blue-400">IndabaX</span>
                  </h2>
                  <p className="text-blue-200/50 text-[10px] font-bold tracking-[0.3em]">
                    ML.NET PERFORMANCE
                  </p>
                </div>
              </div>

              <div className="lg:col-span-3 flex flex-wrap justify-around gap-6">
                <MetricDisplay
                  label="Precision @5"
                  value={metrics.precisionAt5}
                />
                <MetricDisplay label="Recall @5" value={metrics.recallAt5} />
                <MetricDisplay
                  label="NDCG @5 (Ranking)"
                  value={metrics.ndcgAt5}
                  color="text-purple-400"
                />
                <MetricDisplay
                  label="NDCG @10"
                  value={metrics.ndcgAt10}
                  color="text-indigo-400"
                />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-5 rotate-12">
              <Target size={250} />
            </div>
          </div>
        )}

        {/* --- KPI STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon={<Users size={20} />}
            label="Candidats"
            value={stats?.totalCandidates}
            sub="Profils en base de données"
          />
          <StatCard
            icon={<Briefcase size={20} />}
            label="Offres d'emploi"
            value={stats?.totalOffers}
            sub="Catalogue ACPE actualisé"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Top Secteur"
            value={stats?.sectorDistribution[0]?.name.split(" ")[0]}
            sub="Volume d'offres dominant"
          />
        </div>

        {/* --- CORE SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* COLONNE GAUCHE : RECHERCHE & MATCHING */}
          <div className="lg:col-span-7 space-y-6">
            {/* BARRE DE RECHERCHE (Bonus 1) */}
            <form
              onSubmit={handleSearch}
              className="bg-white p-2 rounded-[2rem] shadow-xl border border-slate-200 flex items-center gap-2 mb-10 focus-within:border-blue-500 transition-all"
            >
              <div className="pl-5 text-slate-400">
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Recherche intelligente : 'Chauffeur à Pointe-Noire'..."
                className="flex-1 bg-transparent py-4 text-sm font-semibold focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {isSearching ? "Analyse..." : "Analyser"}
              </button>
            </form>

            <div className="flex justify-between items-end mb-4 px-2">
              <h2 className="text-2xl font-black tracking-tight">
                <h2 className="text-2xl font-black tracking-tight">
                  {searchQuery
                    ? `Talents correspondant à "${searchQuery}"`
                    : "Recommandations IA (Candidats vs Offres)"}
                </h2>
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Page {currentPage} / {totalPages}
              </span>
            </div>

            <div className="grid gap-6">
              {currentMatches.map((match, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h3 className="font-black text-2xl text-slate-800 group-hover:text-blue-600 transition-colors">
                        {match.candidateId === "SEARCH"
                          ? "Profil Idéal Détecté"
                          : match.candidate_name}
                      </h3>
                      <div className="flex flex-col gap-1">
                        <div className="text-blue-600 font-bold text-xs flex items-center gap-2 uppercase tracking-wider">
                          <Award size={14} /> {match.job_title}
                        </div>
                        <div className="text-slate-400 font-bold text-[10px] flex items-center gap-2 uppercase tracking-[0.15em]">
                          <Building2 size={12} /> {match.company_name}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-[2rem] text-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                      <div className="text-3xl font-black italic">
                        {(match.score * 100).toFixed(0)}%
                      </div>
                      <div className="text-[9px] font-black opacity-50 uppercase tracking-tighter">
                        Indice pertinence
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest">
                        Points de correspondance (XAI)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {match.common_skills
                          .filter((s) => s.length > 2)
                          .map((s) => (
                            <span
                              key={s}
                              className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 uppercase"
                            >
                              <CheckCircle
                                size={12}
                                className="text-emerald-500"
                              />{" "}
                              {s}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50">
                      <div className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                        <Target size={14} className="text-rose-500" /> Analyse
                        des écarts (Skill Gap)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {match.missing_skills.length > 0 ? (
                          match.missing_skills.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100 italic"
                            >
                              + {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold italic bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                            ✓ Profil 100% aligné avec cette offre
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 disabled:opacity-10 transition-all uppercase tracking-widest"
              >
                <ChevronLeft size={18} /> Précédent
              </button>
              <div className="flex gap-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 disabled:opacity-10 transition-all uppercase tracking-widest"
              >
                Suivant <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* COLONNE DROITE : ANALYTIQUE */}
          <div className="lg:col-span-5 space-y-10">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <BarChart3 className="text-blue-600" /> Pilotage Strategique
            </h2>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase mb-8 tracking-[0.2em] text-center italic">
                Offres par secteur
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.sectorDistribution}
                      innerRadius={75}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {stats?.sectorDistribution.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {stats?.sectorDistribution.slice(0, 4).map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: COLORS[i] }}
                      ></div>{" "}
                      {s.name}
                    </div>
                    <span>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase mb-8 tracking-[0.2em] text-center italic">
                Top 5 Métiers Demandés
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={stats?.jobDistribution}
                    margin={{ left: 0, right: 30 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={110}
                      tick={{
                        fontSize: 9,
                        fontWeight: "bold",
                        fill: "#94a3b8",
                      }}
                    />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Bar
                      dataKey="value"
                      fill="#2563eb"
                      radius={[0, 10, 10, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// --- SOUS-COMPOSANTS ---

function MetricDisplay({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-blue-300 text-[9px] font-black uppercase mb-1 tracking-widest">
        {label}
      </p>
      <div className={`text-4xl font-black ${color}`}>
        {(value * 100).toFixed(1)}
        <span className="text-xs opacity-50 ml-0.5">%</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner">
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div>
        <div className="text-4xl font-black text-slate-900 tracking-tighter">
          {value ?? "..."}
        </div>
        <p className="text-[10px] text-slate-400 font-bold mt-1">{sub}</p>
      </div>
    </div>
  );
}

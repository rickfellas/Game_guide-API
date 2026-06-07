import { useEffect, useState } from "react";

interface Game {
  id: string;
  title: string;
  franchise: string;
  releaseYear: number;
  isCompleted: boolean;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface Guide {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  rating: number;
  createdAt: string;
  gameId: string;
  game?: Game;
}

// Nova view "landing" adicionada
type ViewState = "landing" | "home" | "catalog" | "createGame" | "createGuide" | "details" | "gameGuides";

export default function App() {
  // A tela inicial agora é a Landing Page
  const [view, setView] = useState<ViewState>("landing");
  const [loading, setLoading] = useState(false);

  // Estados de Dados
  const [games, setGames] = useState<Game[]>([]);
  const [recentGuides, setRecentGuides] = useState<Guide[]>([]);
  const [gameGuides, setGameGuides] = useState<Guide[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  // Estado do Guia Aberto
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [guideDetails, setGuideDetails] = useState<{ guide: Guide; comments: Comment[] } | null>(null);

  // Estados da Home
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Formulários
  const [newGame, setNewGame] = useState({ title: "", franchise: "", releaseYear: 2026, isCompleted: false });
  const [newGuide, setNewGuide] = useState({ title: "", content: "", category: "Walkthrough", tags: "" });
  const [newComment, setNewComment] = useState("");

  // Efeitos de Carregamento
  useEffect(() => {
    if (view === "home") {
      setLoading(true);
      fetch("/api/guides")
        .then(res => res.json())
        .then(data => { 
          setRecentGuides(data.guides || []); 
          setLoading(false); 
        })
        .catch(err => { console.error(err); setLoading(false); });
    }
  }, [view]);

  useEffect(() => {
    if (view === "catalog" || view === "createGuide") {
      fetch("/api/games").then(res => res.json()).then(data => setGames(Array.isArray(data) ? data : []));
    }
  }, [view]);

  useEffect(() => {
    if (view === "details" && selectedGuideId) {
      setLoading(true);
      fetch(`/api/guides/${selectedGuideId}`).then(res => res.json()).then(data => { setGuideDetails(data); setLoading(false); });
    }
  }, [view, selectedGuideId]);

  // --- FUNÇÕES DE EXCLUSÃO ---
  const handleDeleteGame = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir este jogo e TODOS os seus guias?")) return;
    try {
      const res = await fetch(`/api/games/${id}`, { method: "DELETE" });
      if (res.ok) setGames(prev => prev.filter(g => g.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleDeleteGuide = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir este guia?")) return;
    try {
      const res = await fetch(`/api/guides/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecentGuides(prev => prev.filter(g => g.id !== id));
        setGameGuides(prev => prev.filter(g => g.id !== id));
        if (view === "details") setView("home");
      }
    } catch (err) { console.error(err); }
  };

  // --- FUNÇÕES DE AÇÃO ---
  const handleViewGameGuides = async (game: Game) => {
    setSelectedGame(game);
    setLoading(true);
    setView("gameGuides");
    try {
      const res = await fetch(`/api/games/${game.id}/guides`);
      const data = await res.json();
      setGameGuides(data.guides || []);
    } catch (err) { console.error(err); } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newGame) });
      if (res.ok) { setView("catalog"); setNewGame({ title: "", franchise: "", releaseYear: 2026, isCompleted: false }); }
    } catch (err) { console.error(err); }
  };

  const handleCreateGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;
    try {
      const res = await fetch("/api/guides", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gameId: selectedGame.id, title: newGuide.title, content: newGuide.content, category: newGuide.category, tags: newGuide.tags.split(",").map(t => t.trim()).filter(Boolean) }) });
      if (res.ok) { setView("gameGuides"); handleViewGameGuides(selectedGame); setNewGuide({ title: "", content: "", category: "Walkthrough", tags: "" }); }
    } catch (err) { console.error(err); }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuideId || !newComment.trim()) return;
    try {
      const res = await fetch(`/api/guides/${selectedGuideId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: "Visitante", content: newComment }) });
      if (res.ok) {
        const data = await res.json();
        setGuideDetails(prev => prev ? { ...prev, comments: [...prev.comments, data.comment] } : null);
        setNewComment("");
      }
    } catch (err) { console.error(err); }
  };

  const handleVote = async (guideId: string, voteType: "upvote" | "downvote", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/guides/${guideId}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voteType }) });
      if (res.ok) {
        const data = await res.json();
        setRecentGuides(prev => prev.map(g => g.id === guideId ? { ...g, rating: data.rating } : g));
        setGameGuides(prev => prev.map(g => g.id === guideId ? { ...g, rating: data.rating } : g));
        if (guideDetails && guideDetails.guide.id === guideId) setGuideDetails({ ...guideDetails, guide: { ...guideDetails.guide, rating: data.rating } });
      }
    } catch (err) { console.error(err); }
  };

  const filteredGuides = recentGuides.filter(guide => {
    const termo = searchTerm.toLowerCase();
    const matchBusca = guide.title.toLowerCase().includes(termo) || 
                       (guide.game?.title || "").toLowerCase().includes(termo);
    const matchCat = filterCategory ? guide.category === filterCategory : true;
    const matchYear = filterYear ? guide.game?.releaseYear.toString() === filterYear : true;
    return matchBusca && matchCat && matchYear;
  });

  // --- RENDERIZAÇÃO DA LANDING PAGE (TELA DE ENTRADA) ---
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Efeito de brilho no fundo do card */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none"></div>
          
          <span className="text-6xl mb-6 block">🎮</span>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Hub de Guias</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Seu painel central para gerenciar estratégias, documentar loot e criar walkthroughs.
          </p>

          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 mb-8 text-left">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <span>🔒</span> Acesso Administrativo
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Você está prestes a entrar na sua área de autor. Neste painel, você tem permissões totais para <strong>cadastrar jogos</strong> e <strong>editar ou excluir seus guias</strong>.
            </p>
          </div>

          <button
            onClick={() => setView("home")}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-3"
          >
            <span>Entrar no Painel (Usuário01)</span>
            <span>➡️</span>
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DO APLICATIVO PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* HEADER GLOBAL ATUALIZADO */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setView("home")}>
          <span className="text-2xl">🎮</span>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white hidden sm:block">Hub de Guias</h1>
        </div>
        <div className="flex gap-4 items-center">
          {/* Perfil do Usuário Simulado */}
          <div className="hidden md:flex items-center gap-2 mr-2 bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-700/50">
            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">R</div>
            <span className="text-sm font-medium text-slate-300">Usuário01</span>
          </div>
          
          <button onClick={() => setView("catalog")} className="text-sm font-medium text-slate-300 hover:text-white transition-colors bg-slate-800 px-4 py-2 rounded-lg">
            📚 Catálogo
          </button>
          
          {/* Botão de Sair (Logout) */}
          <button 
            onClick={() => setView("landing")} 
            className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Sair do Painel"
          >
            🚪
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        
        {/* --- TELA 1: HOME (FEED) --- */}
        {view === "home" && (
          <>
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Seus Guias Recentes</h2>
              <p className="text-slate-400">Gerencie seu conteúdo e acompanhe o engajamento.</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Pesquisar guias ou jogos..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-4 pr-10 py-2 outline-none focus:border-indigo-500" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 select-none cursor-text">🔍</span>
              </div>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:border-indigo-500">
                <option value="">Todas as Categorias</option>
                <option value="Walkthrough">📖 Walkthrough</option>
                <option value="Conquistas">🏆 Conquistas</option>
                <option value="Modding">🔧 Modding</option>
                <option value="Loot">📦 Loot & Itens</option>
              </select>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:border-indigo-500">
                <option value="">Qualquer Ano</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400">Carregando feed...</div>
            ) : filteredGuides.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-xl border border-slate-800">
                <span className="text-4xl mb-4 block">📭</span>
                <p className="text-slate-400">Nenhum guia encontrado com esses filtros.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredGuides.map(guide => (
                  <div key={guide.id} onClick={() => { setSelectedGuideId(guide.id); setView("details"); }} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer flex flex-col relative group">
                    <button onClick={(e) => handleDeleteGuide(guide.id, e)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir Guia">🗑️</button>
                    
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded ring-1 ring-indigo-500/20">{guide.category}</span>
                    </div>
                    
                    <div className="text-sm font-medium text-slate-400 mb-1">{guide.game?.title || "Jogo Desconhecido"}</div>
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{guide.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-grow">{guide.content}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                      <div className="flex items-center gap-4">
                        <button onClick={(e) => handleVote(guide.id, "upvote", e)} className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">👍 <span className="font-bold">{guide.rating}</span></button>
                        <span className="flex items-center gap-1.5 text-slate-500 text-sm">👁️ {guide.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* --- RESTANTE DO CÓDIGO PERMANECE IGUAL (CATÁLOGO, CRIAR, DETALHES) --- */}
        {/* TELA 2: CATÁLOGO DE JOGOS */}
        {view === "catalog" && (
          <>
            <button onClick={() => setView("home")} className="text-slate-400 hover:text-white mb-6 block">⬅️ Voltar para a Home</button>
            <div className="mb-10 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">Catálogo de Jogos</h2>
                <p className="text-slate-400">Selecione um jogo para ver ou criar guias.</p>
              </div>
              <button onClick={() => setView("createGame")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium">+ Novo Jogo</button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {games.map(game => (
                <div key={game.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 flex flex-col relative group">
                  <button onClick={(e) => handleDeleteGame(game.id, e)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir Jogo">🗑️</button>
                  <div className="text-xs text-indigo-400 mb-2">{game.franchise} • {game.releaseYear}</div>
                  <h3 className="text-lg font-bold text-white mb-4 flex-grow">{game.title}</h3>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => handleViewGameGuides(game)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm transition-colors">Ver Guias</button>
                    <button onClick={() => { setSelectedGame(game); setView("createGuide"); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm transition-colors">+ Guia</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TELA 3: GUIAS DO JOGO ESPECÍFICO */}
        {view === "gameGuides" && selectedGame && (
          <div>
             <button onClick={() => setView("catalog")} className="text-slate-400 hover:text-white mb-6 block">⬅️ Voltar ao Catálogo</button>
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Guias: {selectedGame.title}</h2>
                <button onClick={() => setView("createGuide")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium">+ Criar Guia</button>
             </div>

             {loading ? (
                <div className="text-center py-20 text-slate-400">Carregando...</div>
             ) : gameGuides.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 rounded-xl border border-slate-800">
                  <span className="text-4xl mb-4 block">👻</span>
                  <p className="text-slate-300 text-lg">Este jogo ainda não possui nenhum guia.</p>
                  <p className="text-slate-500 mt-2">Crie o primeiro guia para este jogo agora mesmo!</p>
                </div>
             ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {gameGuides.map(guide => (
                    <div key={guide.id} onClick={() => { setSelectedGuideId(guide.id); setView("details"); }} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer relative group">
                      <button onClick={(e) => handleDeleteGuide(guide.id, e)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded ring-1 ring-indigo-500/20">{guide.category}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{guide.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-grow">{guide.content}</p>
                      <div className="flex items-center gap-4 pt-4 border-t border-slate-800/80">
                        <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">👍 {guide.rating}</span>
                        <span className="flex items-center gap-1.5 text-slate-500 text-sm">👁️ {guide.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        )}

        {/* TELA 4: CRIAR JOGO */}
        {view === "createGame" && (
          <div className="max-w-xl mx-auto bg-slate-900/60 p-8 rounded-xl border border-slate-800">
            <button onClick={() => setView("catalog")} className="text-slate-400 hover:text-white mb-6 block">⬅️ Cancelar</button>
            <h2 className="text-2xl font-bold text-white mb-6">Cadastrar Jogo</h2>
            <form onSubmit={handleCreateGame} className="space-y-4">
              <input required placeholder="Título do Jogo" value={newGame.title} onChange={e => setNewGame({...newGame, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3" />
              <input required placeholder="Franquia" value={newGame.franchise} onChange={e => setNewGame({...newGame, franchise: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3" />
              <input required type="number" placeholder="Ano" value={newGame.releaseYear} onChange={e => setNewGame({...newGame, releaseYear: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3" />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold mt-4">Salvar Jogo</button>
            </form>
          </div>
        )}

        {/* TELA 5: CRIAR GUIA */}
        {view === "createGuide" && selectedGame && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 p-8 rounded-xl border border-slate-800">
            <button onClick={() => setView("catalog")} className="text-slate-400 hover:text-white mb-6 block">⬅️ Cancelar</button>
            <h2 className="text-2xl font-bold text-white mb-6">Novo Guia: {selectedGame.title}</h2>
            <form onSubmit={handleCreateGuide} className="space-y-4">
              <input required placeholder="Título do Guia" value={newGuide.title} onChange={e => setNewGuide({...newGuide, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3" />
              <select value={newGuide.category} onChange={e => setNewGuide({...newGuide, category: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3">
                <option value="Walkthrough">Walkthrough</option>
                <option value="Conquistas">Conquistas</option>
                <option value="Modding">Modding</option>
                <option value="Loot">Loot & Itens</option>
              </select>
              <input placeholder="Tags (separadas por vírgula)" value={newGuide.tags} onChange={e => setNewGuide({...newGuide, tags: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3" />
              <textarea required rows={8} placeholder="Escreva seu guia..." value={newGuide.content} onChange={e => setNewGuide({...newGuide, content: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3" />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold mt-4">Publicar Guia</button>
            </form>
          </div>
        )}

        {/* TELA 6: DETALHES DO GUIA ABERTO */}
        {view === "details" && guideDetails && (
          <div className="max-w-3xl mx-auto relative">
            <button onClick={() => setView("home")} className="text-slate-400 hover:text-white mb-6 block">⬅️ Voltar</button>
            <button onClick={(e) => handleDeleteGuide(guideDetails.guide.id, e)} className="absolute top-0 right-0 text-slate-500 hover:text-red-500 transition-colors p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg">🗑️ Excluir Guia</button>
            
            <div className="mb-8 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded font-bold text-sm">{guideDetails.guide.category}</span>
                <span className="text-slate-400 font-medium">{guideDetails.guide.game?.title}</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">{guideDetails.guide.title}</h1>
              <div className="flex gap-4 text-slate-400 text-sm">
                <span>👁️ {guideDetails.guide.views} views</span>
                <span>👍 {guideDetails.guide.rating} avaliações</span>
              </div>
            </div>

            <div className="bg-slate-900/40 p-8 rounded-xl border border-slate-800 mb-8 text-slate-300 whitespace-pre-wrap leading-relaxed">
              {guideDetails.guide.content}
            </div>

            <div className="flex items-center gap-4 bg-slate-900/60 p-6 rounded-xl border border-slate-800 mb-10">
              <span className="text-white font-medium">Avalie este guia:</span>
              <button onClick={() => handleVote(guideDetails.guide.id, "upvote")} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex gap-2">
                👍 <span className="font-bold text-emerald-400">{guideDetails.guide.rating}</span>
              </button>
              <button onClick={() => handleVote(guideDetails.guide.id, "downvote")} className="bg-slate-800 hover:bg-red-900/30 text-slate-400 px-4 py-2 rounded-lg">👎</button>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">💬 Comentários ({guideDetails.comments.length})</h3>
              <form onSubmit={handleCreateComment} className="flex gap-2 mb-8">
                <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Deixe um comentário..." className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-3 outline-none" />
                <button type="submit" disabled={!newComment.trim()} className="bg-indigo-600 px-6 font-bold rounded-lg text-white disabled:opacity-50">Enviar</button>
              </form>
              <div className="space-y-4">
                {guideDetails.comments.map(c => (
                  <div key={c.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500 mb-2">{c.userId} • {new Date(c.createdAt).toLocaleDateString()}</div>
                    <p className="text-slate-300">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
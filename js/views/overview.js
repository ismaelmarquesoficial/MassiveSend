Views.overview = function(data = [], completedCount = 0) {
    const totalContacts = data.length;
    const totalSuccess = data.filter(c => (c.Status_Envio || "").toLowerCase().includes('concluido')).length;
    const campaignsCount = new Set(data.map(c => c.Nome_Campanha || c["nome da campanha"]).filter(Boolean)).size;

    return `
        <div class="space-y-8 animate-in fade-in duration-500">
            <h3 class="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total</p>
                    <p class="text-2xl font-black text-slate-800">${totalContacts}</p>
                </div>
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Sucesso</p>
                    <p class="text-2xl font-black text-emerald-600">${totalSuccess}</p>
                </div>
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Campanhas</p>
                    <p class="text-2xl font-black text-indigo-600">${campaignsCount}</p>
                </div>
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">Concluídas</p>
                    <p class="text-2xl font-black text-slate-800">${completedCount}</p>
                </div>
            </div>

            <!-- CONTAINER ONDE O MONITOR VAI TRABALHAR -->
            <div id="active-monitor-container" class="space-y-4"></div>

            <div id="overview-empty-state" class="p-12 text-center glass-card rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <p class="text-xs text-slate-400 italic">Nenhum envio ativo detetado no momento.</p>
            </div>
        </div>
    `;
};
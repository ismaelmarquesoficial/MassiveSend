/**
 * js/views/overview.js
 * Dashboard estático com contadores globais.
 */
Views.overview = function(data = [], completedCount = 0) {
    const totalContacts = data.length;
    const totalSuccess = data.filter(c => {
        const s = (c.Status_Envio || c.status || "").toLowerCase();
        return s.includes('concluido') || s.includes('sucesso');
    }).length;
    
    const campaignsActive = new Set(data.map(c => c.Nome_Campanha || c["nome da campanha"]).filter(Boolean)).size;

    return `
        <div class="space-y-8 animate-in fade-in duration-500">
            <div class="flex justify-between items-end">
                <div>
                    <h3 class="text-2xl font-black text-slate-800 tracking-tight">Painel de Controlo</h3>
                    <p class="text-xs text-slate-400">Visão consolidada da operação</p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Contatos Totais</p>
                    <p class="text-2xl font-black text-slate-800">${totalContacts}</p>
                </div>
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Envios Sucesso</p>
                    <p class="text-2xl font-black text-emerald-600">${totalSuccess}</p>
                </div>
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Campanhas Ativas</p>
                    <p class="text-2xl font-black text-indigo-600">${campaignsActive}</p>
                </div>
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">Campanhas Concluídas</p>
                    <p class="text-2xl font-black text-slate-800">${completedCount}</p>
                </div>
            </div>

            <div class="p-12 text-center glass-card rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="check-circle" class="w-8 h-8"></i>
                </div>
                <h4 class="font-bold text-slate-800 text-sm italic">Sistema em espera</h4>
                <p class="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">Para acompanhar o progresso de um disparo específico, consulte a aba de Status.</p>
            </div>
        </div>
    `;
};
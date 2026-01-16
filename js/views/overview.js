/**
 * js/views/overview.js
 * Componente autônomo que gerencia o Dashboard, Histórico e Monitoramento Ativo.
 * Otimizado para a fonte Inter com pesos e rastreamento de caracteres específicos.
 */
Views.overview = function(data = [], completedCount = 0) {
    // Iniciadores automáticos ao carregar a View
    setTimeout(() => {
        Views.initCompletedData(); // Histórico (Uma vez)
        Views.startActivePolling(); // Monitoramento (Loop)
    }, 200);

    const totalContacts = data.length;
    const totalSuccess = data.filter(c => {
        const s = (c.Status_Envio || c.status || "").toLowerCase();
        return s.includes('concluido') || s.includes('sucesso');
    }).length;
    const activeCampaignsCount = new Set(data.map(c => (c.Nome_Campanha || "").trim()).filter(Boolean)).size;

    return `
        <div class="space-y-8 animate-in fade-in duration-500">
            <!-- Cards de Resumo -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total na Base</p>
                    <p class="text-2xl font-black text-slate-800 tracking-tight leading-none">${totalContacts}</p>
                </div>
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Sucessos</p>
                    <p class="text-2xl font-black text-emerald-600 tracking-tight leading-none">${totalSuccess}</p>
                </div>
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Campanhas</p>
                    <p class="text-2xl font-black text-indigo-600 tracking-tight leading-none">${activeCampaignsCount}</p>
                </div>
                <div class="glass-card p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                    <p class="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Concluídas</p>
                    <p class="text-2xl font-black text-slate-800 tracking-tight leading-none">${completedCount}</p>
                </div>
            </div>

            <!-- Monitoramento Ativo (Auto-gerenciado) -->
            <section>
                <div class="flex items-center gap-2 mb-4 ml-1">
                    <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
                    <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Disparos em Tempo Real</h4>
                </div>
                <div id="active-monitor-container" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                <div id="overview-empty-state" class="hidden p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl text-[11px] text-slate-300 uppercase font-black italic tracking-tight">Nenhum envio ativo detectado</div>
            </section>

            <!-- Histórico de Campanhas (Accordion) -->
            <section>
                <div class="flex items-center gap-2 mb-4 ml-1">
                    <div class="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Histórico de Campanhas</h4>
                </div>
                <div id="completed-monitor-container" class="space-y-3">
                    <div class="p-12 text-center text-slate-300 text-[11px] font-black uppercase italic font-mono tracking-widest animate-pulse">Sincronizando Banco de Dados...</div>
                </div>
            </section>
        </div>
    `;
};

/**
 * Lógica do Monitoramento Ativo (Polling Sequencial)
 */
Views.activePollingTimeout = null;

Views.startActivePolling = async function() {
    const container = document.getElementById('active-monitor-container');
    const emptyState = document.getElementById('overview-empty-state');

    if (!container) {
        if (Views.activePollingTimeout) clearTimeout(Views.activePollingTimeout);
        return;
    }

    if (document.hidden) {
        Views.activePollingTimeout = setTimeout(() => Views.startActivePolling(), 10000);
        return;
    }

    try {
        const rawData = await API.listActiveCampaigns();
        const activeData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);

        if (activeData.length === 0) {
            container.innerHTML = "";
            emptyState?.classList.remove('hidden');
        } else {
            emptyState?.classList.add('hidden');
            const campaigns = {};
            activeData.forEach(item => {
                const name = (item.Nome_Campanha || item["nome da campanha"] || "Ativa").toString().trim();
                if (!campaigns[name]) campaigns[name] = [];
                campaigns[name].push(item);
            });

            container.innerHTML = Object.keys(campaigns).map(name => {
                const list = campaigns[name];
                const total = list.length;
                const completed = list.filter(i => {
                    const s = (i["Status Envio"] || i.status || "").toString().toLowerCase();
                    return s.includes("concluido") || s.includes("sucesso") || s.includes("concluído");
                }).length;
                const percent = Math.round((completed / total) * 100) || 0;

                return `
                    <div class="glass-card p-5 rounded-3xl bg-white border border-slate-100 shadow-sm animate-in fade-in">
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex items-center gap-2">
                                <span class="flex h-2 w-2 relative">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                <h4 class="text-xs font-black text-slate-700 uppercase tracking-tight">${name}</h4>
                            </div>
                            <span class="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">${percent}%</span>
                        </div>
                        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-indigo-600 transition-all duration-1000" style="width: ${percent}%"></div>
                        </div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-3 tracking-tighter">Processados: ${completed}/${total}</p>
                    </div>`;
            }).join('');
            if (window.lucide) lucide.createIcons();
        }
    } catch (e) { console.warn("Erro no polling ativo:", e); }

    Views.activePollingTimeout = setTimeout(() => Views.startActivePolling(), 10000);
};

/**
 * Busca e renderiza os dados concluídos com Accordion
 */
Views.initCompletedData = async function() {
    const container = document.getElementById('completed-monitor-container');
    if (!container) return;

    try {
        const rawData = await API.listCompletedCampaigns();
        const completedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
        
        if (completedData.length === 0) {
            container.innerHTML = `<div class="p-12 text-center text-slate-300 text-[11px] font-black uppercase italic border border-dashed border-slate-100 rounded-3xl tracking-tight">Sem histórico de envios</div>`;
            return;
        }

        const campaigns = {};
        completedData.forEach(item => {
            const name = (item.Nome_Campanha || item["nome da campanha"] || "Indefinida").toString().trim();
            if (!campaigns[name]) campaigns[name] = { template: item.Nome_template || "N/A", contacts: [] };
            campaigns[name].contacts.push(item);
        });

        container.innerHTML = Object.keys(campaigns).map((name, index) => {
            const camp = campaigns[name];
            const sectionId = `camp-detail-${index}`;
            return `
                <div class="glass-card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2">
                    <button onclick="Views.toggleCampaignDetail('${sectionId}')" class="w-full bg-white hover:bg-slate-50/50 px-6 py-5 flex justify-between items-center transition-all group border-none outline-none">
                        <div class="flex items-center gap-4 text-left">
                            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <i data-lucide="check-check" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h4 class="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight">${name}</h4>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic">Template: ${camp.template}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0">${camp.contacts.length} Envios</span>
                            <i data-lucide="chevron-down" id="icon-${sectionId}" class="w-5 h-5 text-slate-300 transition-transform duration-300"></i>
                        </div>
                    </button>
                    <div id="${sectionId}" class="overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/30 border-t border-slate-50" style="max-height: 0px">
                        <div class="p-4">
                            <div class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <table class="w-full text-left text-[11px]">
                                    <thead class="text-[9px] font-black text-slate-300 uppercase tracking-widest sticky top-0 bg-white/80 backdrop-blur-sm">
                                        <tr><th class="px-4 py-3">Destinatário</th><th class="px-4 py-3 text-right">Status</th></tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        ${camp.contacts.map(c => `
                                            <tr class="text-slate-600">
                                                <td class="px-4 py-3">
                                                    <p class="font-black text-slate-700 tracking-tight">${c.Nome || 'N/A'}</p>
                                                    <p class="text-[9px] font-mono font-medium text-slate-400">${c.Telefone || 'N/A'}</p>
                                                </td>
                                                <td class="px-4 py-3 text-right text-emerald-500 font-black italic uppercase text-[10px] tracking-tighter">Sucesso</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>`;
        }).join('');
        if (window.lucide) lucide.createIcons();
    } catch (err) { container.innerHTML = `<div class="p-12 text-center text-rose-400 text-xs font-black uppercase tracking-widest">Erro ao conectar com a base de dados.</div>`; }
};

Views.toggleCampaignDetail = function(id) {
    const element = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (element.style.maxHeight && element.style.maxHeight !== '0px') {
        element.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
    } else {
        element.style.maxHeight = element.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
    }
};
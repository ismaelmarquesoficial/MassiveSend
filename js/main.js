/**
 * js/main.js
 * Orquestrador principal da aplicação.
 * Gerencia a navegação entre views e as ações de formulário de forma simplificada.
 */

const Router = {
    async navigate(viewName) {
        // Desliga o monitor ao sair de qualquer página
        if (window.ActiveMonitor) ActiveMonitor.stop();

        const container = document.getElementById('content-container');
        const title = document.getElementById('view-title');
        const subtitle = document.getElementById('view-subtitle');
        
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('sidebar-item-active'));
        const activeNav = document.getElementById(`nav-${viewName}`);
        if(activeNav) activeNav.classList.add('sidebar-item-active');

        switch(viewName) {
            case 'overview':
                title.innerText = "Dashboard"; 
                subtitle.innerText = "Monitorização em Tempo Real";
                container.innerHTML = `<div class="flex flex-col items-center p-12 text-slate-400"><span class="loader mb-4"></span>Sincronizando estatísticas...</div>`;
                
                try {
                    // Busca inicial de dados estáticos para os cards superiores
                    const [allData, completedData] = await Promise.all([
                        API.listCampaigns(),
                        API.listCompletedCampaigns()
                    ]);
                    
                    const completedCount = new Set(completedData.map(c => c.Nome_Campanha || c["nome da campanha"]).filter(Boolean)).size;
                    
                    // Renderiza o esqueleto da página Overview
                    container.innerHTML = Views.overview(allData, completedCount);
                    
                    // 2. LIGA O MOTOR DE MONITORIZAÇÃO (Agora que o container existe no DOM)
                    this.startActiveMonitor();

                } catch (e) {
                    console.error("Erro ao carregar Dashboard:", e);
                    container.innerHTML = Views.overview([], 0);
                }
                break;

            case 'create':
                title.innerText = "Campanha"; subtitle.innerText = "Configurar Envio";
                const templates = await API.fetchApprovedTemplates();
                container.innerHTML = Views.create(templates);
                this.handleInputSwitch('csv');
                break;
                
            case 'status':
                title.innerText = "Histórico"; subtitle.innerText = "Relatórios";
                const dataStatus = await API.listCampaigns();
                container.innerHTML = Views.status(dataStatus);
                break;
                
            case 'dispatch':
                title.innerText = "Execução"; subtitle.innerText = "Disparo";
                const dataDisp = await API.listCampaigns();
                container.innerHTML = Views.dispatch(dataDisp);
                break;
                
            case 'templates':
                title.innerText = "Gestão"; subtitle.innerText = "Biblioteca";
                const temps = await API.fetchAllTemplates();
                container.innerHTML = Views.templates(temps);
                break;
        }
        lucide.createIcons();
    },


    /**
     * MOTOR DE MONITORIZAÇÃO (Lógica integrada)
     */
    startActiveMonitor() {
        console.log("🚀 [Main] Iniciando motor de monitorização ativo...");
        
        // Executa o primeiro refresh imediatamente
        this.refreshActiveData();
        
        // Agenda a execução a cada 4 segundos
        this.activeMonitorInterval = setInterval(() => {
            this.refreshActiveData();
        }, 4000);
    },

    stopActiveMonitor() {
        if (this.activeMonitorInterval) {
            console.log("🛑 [Main] Parando monitorização ativa...");
            clearInterval(this.activeMonitorInterval);
            this.activeMonitorInterval = null;
        }
    },

    /**
     * Lógica de Atualização Visual do Progresso
     */
    
    /**
     * MOTOR DE MONITORIZAÇÃO INTELIGENTE (RECURSIVO)
     * Garante que o intervalo de 10s seja respeitado APÓS a resposta da API.
     */
    startActiveMonitor() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        console.log("🚀 [Main] Motor de monitorização iniciado.");
        this.refreshActiveLoop();
    },

    stopActiveMonitor() {
        this.isMonitoring = false;
        if (this.activeMonitorTimeout) {
            clearTimeout(this.activeMonitorTimeout);
            this.activeMonitorTimeout = null;
            console.log("🛑 [Main] Motor de monitorização parado.");
        }
    },

    /**
     * Ciclo de atualização sequencial
     */
    async refreshActiveLoop() {
        // Se a monitorização foi desligada ou o container saiu da tela, interrompe o loop
        const container = document.getElementById('active-monitor-container');
        if (!this.isMonitoring || !container) {
            this.stopActiveMonitor();
            return;
        }

        // Se a aba estiver escondida, não faz o fetch para economizar quota
        if (document.hidden) {
            this.activeMonitorTimeout = setTimeout(() => this.refreshActiveLoop(), 10000);
            return;
        }

        // Executa a requisição
        await this.updateMonitorUI();

        // AGENDA A PRÓXIMA CHAMADA: 
        // Aqui está o segredo. Só agendamos os 10 segundos DEPOIS que a requisição acima terminou.
        this.activeMonitorTimeout = setTimeout(() => {
            this.refreshActiveLoop();
        }, 10000); // 10 Segundos de intervalo real
    },

    /**
     * Atualiza a Interface com os dados ativos
     */
    async updateMonitorUI() {
        try {
            const activeData = await API.listActiveCampaigns();
            const monitorContainer = document.getElementById('active-monitor-container');
            const emptyState = document.getElementById('overview-empty-state');

            if (!monitorContainer) return;

            if (!activeData || activeData.length === 0) {
                monitorContainer.innerHTML = "";
                if (emptyState) emptyState.classList.remove('hidden');
                return;
            }

            if (emptyState) emptyState.classList.add('hidden');

            // Agrupamento por campanha
            const campaigns = {};
            activeData.forEach(item => {
                const name = item.Nome_Campanha || "Campanha Ativa";
                if (!campaigns[name]) campaigns[name] = [];
                campaigns[name].push(item);
            });

            // Renderização do design compacto e claro solicitado
            monitorContainer.innerHTML = Object.keys(campaigns).map(name => {
                const list = campaigns[name];
                const total = list.length;
                const completed = list.filter(i => {
                    const s = (i["Status Envio"] || i.status || "").toLowerCase();
                    return s.includes("concluido") || s.includes("sucesso") || s.includes("concluído");
                }).length;
                const percent = Math.round((completed / total) * 100) || 0;

                return `
                        <div class="glass-card p-6 rounded-3xl bg-white border border-slate-100 shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500 mb-6">
                            <div class="absolute -top-20 -right-20 w-48 h-48 bg-indigo-50 blur-[60px] rounded-full"></div>
                            <div class="relative z-10 space-y-5">
                                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="flex h-1.5 w-1.5">
                                                <span class="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                            </span>
                                            <p class="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">Execução em Tempo Real</p>
                                        </div>
                                        <h4 class="text-xl font-black text-slate-800 uppercase tracking-tight">${name}</h4>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div class="bg-slate-50 px-4 py-1.5 rounded-xl text-center border border-slate-100">
                                            <p class="text-[7px] font-bold text-slate-400 uppercase">Restam</p>
                                            <p class="text-sm font-black text-slate-700">${remaining}</p>
                                        </div>
                                        <div class="bg-indigo-600 px-4 py-1.5 rounded-xl text-center shadow-lg shadow-indigo-100">
                                            <p class="text-[7px] font-bold text-indigo-100 uppercase">Total</p>
                                            <p class="text-sm font-black text-white">${total}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-end px-1">
                                        <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Progresso</p>
                                        <p class="text-2xl font-black text-slate-800 tracking-tighter">${percent}%</p>
                                    </div>
                                    <div class="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                                        <div class="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-emerald-400 rounded-full transition-all duration-1000 ease-out" style="width: ${percent}%"></div>
                                    </div>
                                    <div class="grid grid-cols-3 gap-3 pt-2">
                                        <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center transition-all hover:bg-slate-100/50">
                                            <p class="text-[7px] font-bold text-slate-400 uppercase mb-0.5">Pendente</p>
                                            <p class="text-sm font-black text-slate-600">${pending}</p>
                                        </div>
                                        <div class="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center transition-all hover:bg-amber-100/50">
                                            <p class="text-[7px] font-bold text-amber-500 uppercase mb-0.5">Enviando</p>
                                            <p class="text-sm font-black text-amber-600">${sending}</p>
                                        </div>
                                        <div class="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center transition-all hover:bg-emerald-100/50">
                                            <p class="text-[7px] font-bold text-emerald-500 uppercase mb-0.5">Sucesso</p>
                                            <p class="text-sm font-black text-emerald-600">${completed}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
            }).join('');
            
            lucide.createIcons();
        } catch (err) {
            console.warn("⚠️ Falha na atualização visual do monitor.");
        }
    },



    /**
     * LÓGICA DE DISPARO
     */
    async handleDispatch(campaignName) {
        if (!confirm(`Deseja iniciar o disparo imediato para a campanha: ${campaignName}?`)) return;

        UI.showToast(`Iniciando disparo: ${campaignName}...`, 'success');
        
        try {
            console.log(`📤 Enviando comando de disparo para: ${campaignName}`);
            await API.triggerDispatch(campaignName);
            
            UI.showToast("Comando de disparo enviado com sucesso!", "success");
            
            // Redireciona para o histórico de forma estática
            setTimeout(() => this.navigate('status'), 1500);
        } catch (e) {
            console.error("🚨 Falha crítica no disparo:", e);
            UI.showToast("Falha ao comunicar disparo. Verifique se o Webhook no n8n está ativo.", "error");
        }
    },

    /**
     * LÓGICA DE CRIAÇÃO (Alternar métodos de entrada)
     */
    handleInputSwitch(method) {
        AppState.currentInputMethod = method;
        const container = document.getElementById('input-method-container');
        const tCSV = document.getElementById('tab-csv');
        const tManual = document.getElementById('tab-manual');
        
        if (method === 'csv') {
            if(tCSV) tCSV.className = 'text-[10px] font-bold pb-1 tab-active transition-all';
            if(tManual) tManual.className = 'text-[10px] font-bold pb-1 text-slate-400 transition-all';
            container.innerHTML = `
                <div onclick="document.getElementById('csv-file').click()" class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 hover:border-indigo-400 cursor-pointer transition-all">
                    <input type="file" id="csv-file" class="hidden" accept=".csv" onchange="Router.processCSV(event)">
                    <i data-lucide="upload" class="w-8 h-8 mx-auto text-slate-300 mb-2"></i>
                    <p class="text-xs text-slate-500 font-medium tracking-tight uppercase tracking-widest">Carregar arquivo <span class="text-indigo-600 font-bold">.CSV</span></p>
                </div>`;
        } else {
            if(tManual) tManual.className = 'text-[10px] font-bold pb-1 tab-active transition-all';
            if(tCSV) tCSV.className = 'text-[10px] font-bold pb-1 text-slate-400 transition-all';
            container.innerHTML = `
                <div class="space-y-3 animate-in fade-in duration-300">
                    <div class="grid grid-cols-2 gap-3">
                        <input type="text" id="m-name" placeholder="Nome" class="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-semibold">
                        <input type="text" id="m-phone" placeholder="Telefone" class="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-semibold">
                    </div>
                    <button onclick="Router.addManualContact()" class="w-full py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-lg text-[10px] font-black uppercase transition-all tracking-widest">Adicionar à Lista</button>
                </div>`;
        }
        lucide.createIcons();
    },

    addManualContact() {
        const n = document.getElementById('m-name'), p = document.getElementById('m-phone');
        if (n.value && p.value) {
            AppState.contactsQueue.push({ Nome: n.value, Telefone: p.value });
            n.value = ""; p.value = "";
            this.updateQueueUI();
        } else {
            UI.showToast("Preencha Nome e Telefone.", "error");
        }
    },

    processCSV(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const lines = ev.target.result.split('\n');
            lines.forEach((line, idx) => {
                const parts = line.split(',');
                if (parts.length >= 2 && idx > 0) {
                    const nome = parts[0].trim(), tel = parts[1].trim();
                    if (nome && tel) AppState.contactsQueue.push({ Nome: nome, Telefone: tel });
                }
            });
            UI.showToast("CSV importado com sucesso!");
            this.updateQueueUI();
        };
        reader.readAsText(file);
    },

    updateQueueUI() {
        const prev = document.getElementById('contacts-preview');
        const badge = document.getElementById('contact-count-badge');
        if (badge) badge.innerText = AppState.contactsQueue.length;
        if (!prev) return;
        
        if (AppState.contactsQueue.length === 0) {
            prev.innerHTML = `<p class="text-[10px] text-slate-400 text-center italic">Nenhum contato na fila.</p>`;
        } else {
            prev.innerHTML = AppState.contactsQueue.slice(-5).map(c => `
                <div class="flex justify-between items-center bg-white p-2 rounded border border-slate-100 mb-1">
                    <span class="text-[10px] font-bold text-slate-700">${c.Nome}</span>
                    <span class="text-[9px] text-slate-400 font-mono">${c.Telefone}</span>
                </div>`).join('') + (AppState.contactsQueue.length > 5 ? `<p class="text-[8px] text-indigo-500 text-center font-bold mt-1">+ ${AppState.contactsQueue.length - 5} contatos ocultos</p>` : '');
        }
    },

    /**
     * Submissão da Campanha (Cadastro de Contatos)
     */
    async handleSubmission() {
        const campName = document.getElementById('input-campanha').value;
        const templateValue = document.getElementById('select-template').value;
        const btn = document.getElementById('btn-submit');

        if (!campName || !templateValue || AppState.contactsQueue.length === 0) {
            return UI.showToast("Preencha todos os campos corretamente.", "error");
        }

        btn.disabled = true;
        btn.innerHTML = `<span class="loader mr-2"></span> Enviando...`;

        const payload = AppState.contactsQueue.map(c => ({
            "nome": c.Nome,
            "contato": c.Telefone,
            "nome da campanha": campName,
            "nome do template": templateValue 
        }));

        try {
            await API.createCampaign(payload);
            UI.showToast("Campanha enviada com sucesso!");
            AppState.contactsQueue = []; // Limpa fila após envio
            setTimeout(() => this.navigate('status'), 1000);
        } catch (e) {
            UI.showToast("Erro ao conectar com n8n.", "error");
            btn.disabled = false;
            btn.innerText = "Criar Campanha";
        }
    }
};

// Inicialização da aplicação
window.onload = () => Router.navigate('overview');



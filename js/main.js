/**
 * js/main.js
 * Orquestrador principal da aplicação.
 * Gerencia a navegação entre views e as ações de formulário de forma simplificada.
 */

const Router = {
    activeCampaign: null,

    /**
     * Gerencia a troca de páginas (Views)
     */
    async navigate(viewName) {
        const container = document.getElementById('content-container');
        const title = document.getElementById('view-title');
        const subtitle = document.getElementById('view-subtitle');
        
        // Atualiza a classe ativa nos botões do menu lateral
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('sidebar-item-active'));
        const activeNav = document.getElementById(`nav-${viewName}`);
        if(activeNav) activeNav.classList.add('sidebar-item-active');

        // Renderização baseada na rota selecionada
        switch(viewName) {
            case 'overview':
                title.innerText = "Dashboard"; 
                subtitle.innerText = "Resumo Geral";
                container.innerHTML = `<div class="flex flex-col items-center p-12 text-slate-400"><span class="loader mb-4"></span>Carregando estatísticas...</div>`;
                try {
                    // Busca dados para o Dashboard (Lista Geral e Concluídas)
                    const [allData, completedData] = await Promise.all([
                        API.listCampaigns(),
                        API.listCompletedCampaigns()
                    ]);
                    
                    // Conta nomes de campanhas únicos concluídos
                    const completedCount = new Set(completedData.map(c => c.Nome_Campanha || c["nome da campanha"]).filter(Boolean)).size;
                    
                    // Renderiza a view overview passando os dados e o contador
                    container.innerHTML = Views.overview(allData, completedCount);
                } catch (e) {
                    console.error("Erro no Dashboard:", e);
                    // Fallback se a API falhar
                    container.innerHTML = Views.overview([], 0);
                }
                break;
                
            case 'create':
                title.innerText = "Campanha"; 
                subtitle.innerText = "Configurar Novo Envio";
                container.innerHTML = `<div class="flex flex-col items-center p-12 text-slate-400"><span class="loader mb-4"></span>Buscando templates...</div>`;
                try {
                    const templates = await API.fetchApprovedTemplates();
                    container.innerHTML = Views.create(templates);
                    this.handleInputSwitch('csv');
                } catch (e) {
                    console.error("Erro ao carregar templates:", e);
                    UI.showToast("Erro ao carregar templates", "error");
                    container.innerHTML = Views.create([]);
                }
                break;
                
            case 'status':
                title.innerText = "Histórico"; 
                subtitle.innerText = "Dados Agrupados por Campanha";
                container.innerHTML = `<div class="flex flex-col items-center p-12 text-slate-400"><span class="loader mb-4"></span>Buscando registros no n8n...</div>`;
                try {
                    const data = await API.listCampaigns();
                    container.innerHTML = Views.status(data);
                } catch (e) {
                    console.error("Erro ao listar campanhas:", e);
                    container.innerHTML = `<div class="p-8 text-center text-rose-500 font-bold bg-white rounded-2xl border border-rose-100 shadow-sm">Erro ao conectar com o banco de dados.</div>`;
                }
                break;
            
            case 'templates':
                title.innerText = "Gestão"; 
                subtitle.innerText = "Biblioteca de Templates";
                container.innerHTML = `<div class="flex flex-col items-center p-12 text-slate-400"><span class="loader mb-4"></span>Consultando Meta API...</div>`;
                try {
                    const templates = await API.fetchAllTemplates();
                    container.innerHTML = Views.templates(templates);
                } catch (e) {
                    console.error("Erro ao carregar templates:", e);
                    container.innerHTML = `<div class="p-8 text-center text-rose-500 font-bold bg-white rounded-2xl border border-rose-100">Erro ao carregar biblioteca.</div>`;
                }
                break;
                
            case 'dispatch':
                title.innerText = "Execução"; 
                subtitle.innerText = "Disparo de Mensagens";
                container.innerHTML = `<div class="flex flex-col items-center p-12 text-slate-400"><span class="loader mb-4"></span>Carregando filas de envio...</div>`;
                try {
                    const data = await API.listCampaigns();
                    container.innerHTML = Views.dispatch(data);
                } catch (e) {
                    console.error("Erro na view de disparo:", e);
                    container.innerHTML = `<div class="p-8 text-center text-rose-500 font-bold bg-white rounded-2xl border border-rose-100">Erro ao carregar campanhas prontas.</div>`;
                }
                break;
        }
        lucide.createIcons();
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
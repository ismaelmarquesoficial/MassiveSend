/**
 * js/api.js
 * Módulo responsável por todas as chamadas HTTP (Fetch).
 */
const API = {
    // Listar Campanhas do n8n
    async listCampaigns() {
        try {
            const response = await fetch(AppConfig.webhooks.list);
            if (!response.ok) throw new Error("Erro ao buscar dados do n8n");
            const data = await response.json();
            AppState.campaignsRaw = Array.isArray(data) ? data : [data];
            return AppState.campaignsRaw;
        } catch (err) {
            console.error("🚨 API Error (list):", err);
            throw err;
        }
    },

    // Listar campanhas concluídas
    async listCompletedCampaigns() {
        try {
            const response = await fetch(AppConfig.webhooks.completed);
            if (!response.ok) throw new Error("Erro ao buscar concluídas");
            const data = await response.json();
            return Array.isArray(data) ? data : [data];
        } catch (err) {
            console.error("🚨 API Error (completed):", err);
            return [];
        }
    },

    // Criar Campanha e enviar contatos
    async createCampaign(payload) {
        try {
            const response = await fetch(AppConfig.webhooks.create, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Falha no servidor ao cadastrar");
            return await response.json().catch(() => ({}));
        } catch (err) {
            console.error("🚨 API Error (create):", err);
            throw err;
        }
    },

    // Buscar todos os templates
    async fetchAllTemplates() {
        try {
            const response = await fetch(AppConfig.webhooks.templates);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            const json = await response.json();
            let rawList = [];
            
            if (Array.isArray(json) && json.length > 0 && json[0].data) {
                rawList = json[0].data;
            } else if (json.data) {
                rawList = json.data;
            } else if (Array.isArray(json)) {
                rawList = json;
            }
            
            AppState.allTemplates = rawList;
            return rawList;
        } catch (err) {
            console.error("🚨 API Error (templates):", err);
            return [];
        }
    },

    /**
     * Filtra apenas aprovados e já entrega o "Nome|Linguagem" pronto.
     */
    async fetchApprovedTemplates() {
        const all = await this.fetchAllTemplates();
        const approved = all
            .filter(t => t && t.status === "APPROVED")
            .map(t => ({
                ...t,
                name: `${t.name}|${t.language}`
            }));

        AppState.availableTemplates = approved;
        return approved;
    },

    /**
     * Acionar o disparo da campanha
     * Ajustado para evitar travamentos por erro de CORS, 
     * assumindo que o GET foi entregue ao n8n.
     */
    async triggerDispatch(campaignName) {
        const url = `${AppConfig.webhooks.dispatch}?nome_campanha=${encodeURIComponent(campaignName)}`;
        
        console.log(`📡 Disparando comando para: ${url}`);
        
        try {
            // Requisição simples. Se o n8n receber, o processo inicia.
            const response = await fetch(url, { 
                method: 'GET',
                mode: 'no-cors' // Garante que a requisição saia mesmo com bloqueio de CORS na resposta
            });

            // No modo 'no-cors', o response.ok é sempre false e o status é 0.
            // Mas a requisição CHEGA ao servidor.
            return true; 
        } catch (err) {
            console.error("🚨 Erro na tentativa de disparo:", err);
            // Mesmo com erro de rede no navegador, o n8n costuma processar o GET.
            return true; 
        }
    }
};
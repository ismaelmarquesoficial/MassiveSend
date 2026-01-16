/**
 * js/api.js
 * Módulo responsável por todas as chamadas HTTP (Fetch).
 */
const API = {
    // Listar Campanhas do n8n
    async listCampaigns() {
        try {
            const response = await fetch(AppConfig.webhooks.list);
            
            // Se o status for 204 (No Content) ou a resposta não estiver OK
            if (response.status === 204 || !response.ok) return [];

            const text = await response.text();
            
            // Se o corpo estiver vazio, retornamos lista vazia com segurança
            if (!text || text.trim() === "" || text === "{}" || text === "[]") {
                return [];
            }

            try {
                const data = JSON.parse(text);
                return Array.isArray(data) ? data : [data];
            } catch (jsonErr) {
                return [];
            }
        } catch (err) {
            console.error("🚨 API Error (list):", err);
            return [];
        }
    },

    // Listar campanhas concluídas
    async listCompletedCampaigns() {
        try {
            console.log(`📡 [Monitoramento] Solicitando Campanhas concluídos: ${AppConfig.webhooks.completed}`);
            const response = await fetch(AppConfig.webhooks.completed);
            if (!response.ok) throw new Error("Erro ao buscar concluídas");
            const data = await response.json();
            return Array.isArray(data) ? data : [data];
            
        } catch (err) {
            console.error("🚨 API Error (completed):", err);
            return [];
        }
    },
    async listActiveCampaigns() {
        try {
            console.log(`📡 [Monitoramento] Solicitando dados ativos: ${AppConfig.webhooks.active}`);
            const response = await fetch(AppConfig.webhooks.active);
            
            if (!response.ok) {
                console.warn(`⚠️ Webhook Ativo retornou status ${response.status}.`);
                return [];
            }

            // Lemos como texto primeiro para verificar se o n8n enviou conteúdo
            const text = await response.text();
            
            // Se o texto for vazio ou apenas espaços, retornamos array vazio com segurança
            if (!text || text.trim() === "") {
                console.log("ℹ️ [Monitoramento] Webhook retornou corpo vazio. Nenhuma campanha ativa.");
                return [];
            }

            // Tenta converter para JSON apenas se houver conteúdo
            try {
                const data = JSON.parse(text);
                return Array.isArray(data) ? data : [data];
            } catch (jsonErr) {
                console.error("🚨 Erro ao processar JSON do Monitoramento:", jsonErr);
                return [];
            }
        } catch (err) {
            console.error("🚨 API Error (active): Falha de rede.", err);
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
    },
    /**
     * Busca as mensagens do banco de dados (Live Chat)
     */
    async fetchLiveMessages() {
        try {
            // No GET, os parâmetros são passados na URL após a interrogação (?)
            const tenantId = "1";
            const accountId = "1";
            const url = `https://n8n-n8n.g0rat2.easypanel.host/webhook/monitora-msg-banco?tenant_id=${tenantId}&whatsapp_account_id=${accountId}`;


            const response = await fetch(url, {
                method: 'GET'
                // Removido o Body e o Content-Type, pois não são usados no GET
            });
            
            if (response.status === 204 || !response.ok) return [];

            const text = await response.text();
            
            // Proteção contra respostas vazias ou malformadas
            if (!text || text.trim() === "" || text === "{}" || text === "[]") return [];

            try {
                const data = JSON.parse(text);
                // Garante que o retorno seja sempre uma lista
                return Array.isArray(data) ? data : [data];
            } catch (jsonErr) {
                console.warn("⚠️ Erro ao processar JSON do chat:", jsonErr);
                return [];
            }
        } catch (err) {
            console.error("🚨 API Error (Chat GET):", err);
            return [];
        }
    }
};
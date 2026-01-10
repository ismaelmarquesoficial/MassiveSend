/**
 * js/config.js
 */
const AppConfig = {
    webhooks: {
        create: "https://n8n-n8n.g0rat2.easypanel.host/webhook/cadastrar-contato",
        list: "https://n8n-n8n.g0rat2.easypanel.host/webhook/listar-campanhas",
        templates: "https://n8n-n8n.g0rat2.easypanel.host/webhook/consultar-template",
        dispatch: "https://n8n-n8n.g0rat2.easypanel.host/webhook/disparar_camapanha",
        active: "https://n8n-n8n.g0rat2.easypanel.host/webhook/listar-campanhas-ativa",
        completed: "https://n8n-n8n.g0rat2.easypanel.host/webhook/listar-campanhas-concluida"
    }
};

const AppState = {
    isSidebarCollapsed: false,
    campaignsRaw: [],
    contactsQueue: [],
    currentInputMethod: 'csv',
    availableTemplates: [],
    allTemplates: []
};
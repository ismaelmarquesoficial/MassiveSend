/**
 * js/views/create.js
 * Como a API já envia o nome formatado, o código aqui fica limpo.
 */
Views.create = function(templates = []) {
    AppState.contactsQueue = [];
    
    // O t.name já é "Nome - Idioma" vindo da API.fetchApprovedTemplates()
    const templateOptions = templates.length > 0 
        ? templates.map(t => `<option value="${t.name}">${t.name}</option>`).join('')
        : `<option value="">Nenhum template aprovado</option>`;

    return `
        <div class="max-w-3xl mx-auto">
            <div class="glass-card rounded-2xl overflow-hidden shadow-xl border-none">
                <div class="bg-indigo-600 px-6 py-5 text-white flex justify-between items-center">
                    <div>
                        <h3 class="text-base font-bold">Nova Campanha</h3>
                        <p class="text-[10px] opacity-80 uppercase mt-1">Configuração de Envio</p>
                    </div>
                    <div class="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">
                        Contatos: <span id="contact-count-badge">0</span>
                    </div>
                </div>
                
                <div class="p-6 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome da Campanha</label>
                            <input type="text" id="input-campanha" placeholder="Ex: Janeiro" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none text-xs font-semibold focus:border-indigo-500">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Template (Nome - Idioma)</label>
                            <select id="select-template" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none text-xs font-semibold cursor-pointer">
                                <option value="">Selecione um template...</option>
                                ${templateOptions}
                            </select>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <label class="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Base de Dados</label>
                            <div class="flex gap-4">
                                <button onclick="Router.handleInputSwitch('csv')" id="tab-csv" class="text-[10px] font-bold pb-1 transition-all tab-active">CSV</button>
                                <button onclick="Router.handleInputSwitch('manual')" id="tab-manual" class="text-[10px] font-bold pb-1 text-slate-400 transition-all">MANUAL</button>
                            </div>
                        </div>
                        <div id="input-method-container"></div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fila de Disparo (Prévia)</label>
                        <div id="contacts-preview" class="p-3 bg-slate-50/50 rounded-xl min-h-[60px] max-h-40 overflow-y-auto">
                            <p class="text-[10px] text-slate-400 text-center italic">Nenhum contato na lista.</p>
                        </div>
                    </div>

                    <div class="flex justify-end pt-6 border-t border-slate-100">
                        <button onclick="Router.handleSubmission()" id="btn-submit" class="bg-indigo-600 hover:bg-indigo-700 px-10 py-3 rounded-xl text-white font-bold text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-95">
                            Criar Campanha
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};
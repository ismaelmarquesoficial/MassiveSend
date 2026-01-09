/**
 * Views: Contém as funções que geram o HTML dinâmico para o container central.
 */
const Views = {
    overview() {
        return `
            <div class="p-10 glass-card rounded-3xl text-center">
                <h3 class="text-xl font-black text-slate-800 mb-2 tracking-tight">Painel MassiveSend Pro</h3>
                <p class="text-slate-500 max-w-sm mx-auto leading-relaxed">Bem-vindo. Selecione uma opção no menu lateral para gerenciar os disparos.</p>
            </div>
        `;
    },

    create() {
        return `
            <div class="max-w-3xl mx-auto">
                <div class="glass-card rounded-2xl overflow-hidden shadow-xl border-none">
                    <div class="bg-indigo-600 px-6 py-5 text-white flex justify-between items-center">
                        <div><h3 class="text-base font-bold">Nova Campanha</h3><p class="text-[10px] opacity-80 uppercase mt-1">Configuração de Envio</p></div>
                        <div class="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">Contatos: <span id="contact-count-badge">0</span></div>
                    </div>
                    <div class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome da Campanha</label>
                                <input type="text" id="input-campanha" placeholder="Ex: Janeiro" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none text-xs font-semibold focus:border-indigo-500 transition-all">
                            </div>
                            <div class="space-y-1">
                                <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Template</label>
                                <select id="select-template" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none text-xs font-semibold cursor-pointer">
                                    <option value="">Selecione...</option>
                                    <option value="janeiro">janeiro</option>
                                    <option value="promo_v1">promo_v1</option>
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
                                <p class="text-[10px] text-slate-400 text-center italic">Nenhum contato na fila.</p>
                            </div>
                        </div>
                        <div class="flex justify-end pt-6 border-t border-slate-100">
                            <button onclick="Router.handleSubmission()" id="btn-submit" class="btn-primary px-10 py-3 rounded-xl text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95">Criar Campanha</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    status(data) {
        // Agrupamento lógico por Nome da Campanha
        const grouped = data.reduce((acc, curr) => {
            const name = curr.Nome_Campanha || curr["nome da campanha"] || 'Campanha Indefinida';
            if (!acc[name]) {
                acc[name] = { 
                    template: curr.Nome_template || curr["nome do template"] || 'N/A', 
                    contacts: [] 
                };
            }
            acc[name].contacts.push(curr);
            return acc;
        }, {});

        if (Object.keys(grouped).length === 0) {
            return `<div class="p-12 text-center text-slate-400 italic">Sem registros no n8n.</div>`;
        }

        return Object.entries(grouped).map(([campName, camp]) => `
            <div class="glass-card rounded-2xl overflow-hidden mb-6 border border-slate-200/60">
                <div class="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><i data-lucide="folder" class="w-4 h-4"></i></div>
                        <div><h4 class="font-extrabold text-slate-800 text-sm uppercase tracking-tight">${campName}</h4><p class="text-[10px] text-slate-400">Template: <span class="font-mono text-indigo-500">${camp.template}</span></p></div>
                    </div>
                    <span class="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500">${camp.contacts.length} Contatos</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50/40 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <tr><th class="px-6 py-2">Nome</th><th class="px-6 py-2">Telefone</th><th class="px-6 py-2 text-center">Status</th></tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${camp.contacts.map(c => `
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-3 font-semibold text-slate-600 text-xs">${c.Nome || 'N/A'}</td>
                                    <td class="px-6 py-3 text-xs font-mono text-slate-400">${c.Telefone || 'N/A'}</td>
                                    <td class="px-6 py-3 text-center"><span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${UI.getStatusColorClass(c.Status_Envio || c.status)}">${c.Status_Envio || c.status || 'Pendente'}</span></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('');
    }
};
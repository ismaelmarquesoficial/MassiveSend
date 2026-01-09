/**
 * js/views/status.js
 */
Views.status = function(data) {
    // Agrupamento Dinâmico por Nome da Campanha
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
        return `<div class="p-12 text-center text-slate-400 italic text-xs">Sem registros pendentes retornados do n8n.</div>`;
    }

    return Object.entries(grouped).map(([campName, camp]) => `
        <div class="glass-card rounded-2xl overflow-hidden mb-6 border border-slate-200/60 shadow-sm">
            <!-- Cabeçalho do Grupo -->
            <div class="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <i data-lucide="folder" class="w-4 h-4"></i>
                    </div>
                    <div>
                        <h4 class="font-extrabold text-slate-800 text-sm uppercase tracking-tight">${campName}</h4>
                        <p class="text-[10px] text-slate-400">Template: <span class="font-mono text-indigo-500">${camp.template}</span></p>
                    </div>
                </div>
                <span class="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                    ${camp.contacts.length} Contatos
                </span>
            </div>

            <!-- Tabela de Contatos do Grupo -->
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-slate-50/40 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th class="px-6 py-2">Nome</th>
                            <th class="px-6 py-2">Telefone</th>
                            <th class="px-6 py-2 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        ${camp.contacts.map(c => `
                            <tr class="hover:bg-slate-50/50 transition-colors">
                                <td class="px-6 py-3 font-semibold text-slate-600 text-xs">${c.Nome || 'N/A'}</td>
                                <td class="px-6 py-3 text-xs font-mono text-slate-400">${c.Telefone || 'N/A'}</td>
                                <td class="px-6 py-3 text-center">
                                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${UI.getStatusColorClass(c.Status_Envio || c.status)}">
                                        ${c.Status_Envio || c.status || 'Pendente'}
                                    </span>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `).join('');
};
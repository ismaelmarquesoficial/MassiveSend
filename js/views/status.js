/**
 * js/views/status.js
 * Renderiza a lista de campanhas agrupadas com funcionalidade de expandir/recolher.
 */
Views.status = function(data = []) {
    // 1. Agrupamento Dinâmico e Robusto (Lida com espaços e formatos variados)
    const grouped = data.reduce((acc, curr) => {
        const rawName = curr.Nome_Campanha || curr["nome da campanha"] || 'Campanha Indefinida';
        const name = rawName.toString().trim(); // Limpa espaços extras
        
        if (!acc[name]) {
            acc[name] = { 
                template: curr.Nome_template || curr["nome do template"] || 'N/A', 
                contacts: [] 
            };
        }
        acc[name].contacts.push(curr);
        return acc;
    }, {});

    const groups = Object.entries(grouped);

    if (groups.length === 0) {
        return `
            <div class="p-16 text-center animate-in fade-in duration-500">
                <div class="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="inbox" class="w-8 h-8"></i>
                </div>
                <h4 class="font-bold text-slate-400 text-xs uppercase tracking-widest">Nenhum registro encontrado</h4>
                <p class="text-[10px] text-slate-300 mt-1">As campanhas aparecerão aqui assim que forem cadastradas.</p>
            </div>
        `;
    }

    // 2. Renderiza os cartões com Accordion
    return groups.map(([campName, camp], index) => {
        const sectionId = `status-detail-${index}`;
        const total = camp.contacts.length;
        
        return `
            <div class="glass-card rounded-2xl overflow-hidden mb-4 border border-slate-200/60 shadow-sm bg-white animate-in slide-in-from-bottom-2">
                <!-- Cabeçalho Clicável (Minimizado por padrão) -->
                <button onclick="Views.toggleStatusDetail('${sectionId}')" class="w-full bg-white hover:bg-slate-50/50 px-6 py-4 flex justify-between items-center transition-all border-none outline-none group text-left">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i data-lucide="folder" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h4 class="font-extrabold text-slate-800 text-sm uppercase tracking-tight">${campName}</h4>
                            <p class="text-[10px] text-slate-400 font-medium">Template: <span class="font-mono text-indigo-500">${camp.template}</span></p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <div class="text-right hidden sm:block">
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Contatos</p>
                            <p class="text-xs font-bold text-slate-700">${total}</p>
                        </div>
                        <div class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <i data-lucide="chevron-down" id="icon-${sectionId}" class="w-4 h-4 transition-transform duration-300"></i>
                        </div>
                    </div>
                </button>

                <!-- Área Expandível (Escondida por padrão) -->
                <div id="${sectionId}" class="overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/30 border-t border-slate-50" style="max-height: 0px">
                    <div class="p-0">
                        <div class="overflow-x-auto max-height-[400px] overflow-y-auto">
                            <table class="w-full text-left">
                                <thead class="bg-slate-100/50 text-[9px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
                                    <tr>
                                        <th class="px-6 py-3">Nome</th>
                                        <th class="px-6 py-3">Telefone</th>
                                        <th class="px-6 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${camp.contacts.map(c => `
                                        <tr class="hover:bg-white transition-colors">
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
                </div>
            </div>
        `;
    }).join('');
};

/**
 * Lógica de Expansão para a View de Status
 */
Views.toggleStatusDetail = function(id) {
    const element = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    
    // Fecha outros se necessário (opcional: remova se quiser abrir vários ao mesmo tempo)
    if (element.style.maxHeight && element.style.maxHeight !== '0px') {
        element.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
    } else {
        // Define a altura baseada no conteúdo real para animação fluida
        element.style.maxHeight = element.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
    }
};
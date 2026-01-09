/**
 * js/views/templates.js
 */
Views.templates = function(data = []) {
    // Agrupar por status
    const approved = data.filter(t => t.status === 'APPROVED');
    const pending = data.filter(t => t.status === 'PENDING' || t.status === 'IN_REVIEW');
    const rejected = data.filter(t => t.status === 'REJECTED');

    return `
        <div class="space-y-6">
            <!-- Resumo de Status -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="glass-card p-4 rounded-2xl border-l-4 border-emerald-500">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aprovados</p>
                    <p class="text-2xl font-black text-slate-800">${approved.length}</p>
                </div>
                <div class="glass-card p-4 rounded-2xl border-l-4 border-amber-500">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Em Análise</p>
                    <p class="text-2xl font-black text-slate-800">${pending.length}</p>
                </div>
                <div class="glass-card p-4 rounded-2xl border-l-4 border-rose-500">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rejeitados</p>
                    <p class="text-2xl font-black text-slate-800">${rejected.length}</p>
                </div>
            </div>

            <!-- Listagem Geral -->
            <div class="glass-card rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm">
                <div class="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h4 class="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Biblioteca de Templates</h4>
                    <button onclick="Router.navigate('templates')" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50/40 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th class="px-6 py-3">Nome do Template</th>
                                <th class="px-6 py-3">Categoria</th>
                                <th class="px-6 py-3">Idioma</th>
                                <th class="px-6 py-3 text-center">Status</th>
                                <th class="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${data.map((t, index) => `
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-4 font-bold text-slate-700 text-xs">${t.name}</td>
                                    <td class="px-6 py-4 text-[10px] text-slate-500 uppercase">${t.category || 'N/A'}</td>
                                    <td class="px-6 py-4 text-[10px] text-slate-400 font-mono">${t.language}</td>
                                    <td class="px-6 py-4 text-center">
                                        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${UI.getStatusColorClass(t.status)}">
                                            ${t.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <button onclick="Views.openTemplatePreview('${t.name}')" class="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 ml-auto">
                                            <i data-lucide="eye" class="w-3 h-3"></i> Prévia
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal de Pré-visualização -->
        <div id="modal-preview" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] hidden items-center justify-center p-4">
            <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div class="bg-indigo-600 p-4 text-white flex justify-between items-center">
                    <h5 class="font-bold text-sm">Visualização do Template</h5>
                    <button onclick="Views.closeTemplatePreview()" class="hover:bg-white/20 p-1 rounded-lg transition-all">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="p-6 bg-slate-50">
                    <div id="preview-content" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3 relative">
                        <!-- Simulação de bolha do WhatsApp -->
                        <div class="absolute -left-2 top-4 w-4 h-4 bg-white rotate-45 border-l border-b border-slate-200"></div>
                        <div id="template-body-render" class="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap"></div>
                    </div>
                    <div class="mt-6 space-y-2">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhes Técnicos</p>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-white p-2 rounded-xl border border-slate-100">
                                <p class="text-[8px] text-slate-400 uppercase font-bold">ID Meta</p>
                                <p id="preview-id" class="text-[10px] font-mono text-slate-600 truncate"></p>
                            </div>
                            <div class="bg-white p-2 rounded-xl border border-slate-100">
                                <p class="text-[8px] text-slate-400 uppercase font-bold">Formato</p>
                                <p id="preview-format" class="text-[10px] font-mono text-slate-600 uppercase"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Lógica de abertura e renderização da prévia
 */
Views.openTemplatePreview = function(templateName) {
    const template = AppState.allTemplates.find(t => t.name === templateName);
    if (!template) return;

    const modal = document.getElementById('modal-preview');
    const bodyRender = document.getElementById('template-body-render');
    const idRender = document.getElementById('preview-id');
    const formatRender = document.getElementById('preview-format');

    // Limpa e renderiza componentes
    let fullText = "";
    
    // Organiza por tipo de componente (HEADER, BODY, FOOTER)
    const header = template.components.find(c => c.type === 'HEADER');
    const body = template.components.find(c => c.type === 'BODY');
    const footer = template.components.find(c => c.type === 'FOOTER');

    if (header && header.text) fullText += `<span class="font-black text-slate-900 block mb-2">${header.text}</span>`;
    if (body && body.text) fullText += `<span>${body.text}</span>`;
    if (footer && footer.text) fullText += `<span class="text-[10px] text-slate-400 block mt-2 border-t border-slate-100 pt-1">${footer.text}</span>`;

    bodyRender.innerHTML = fullText || "Este template não possui conteúdo de texto legível.";
    idRender.innerText = template.id || 'N/A';
    formatRender.innerText = template.parameter_format || 'N/A';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
};

Views.closeTemplatePreview = function() {
    const modal = document.getElementById('modal-preview');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};
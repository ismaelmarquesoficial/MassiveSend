/**
 * js/views/dispatch.js
 */
Views.dispatch = function(data = []) {
    // Agrupa os contatos por nome de campanha para contar o total de cada uma
    const campaignCounts = data.reduce((acc, curr) => {
        const name = curr.Nome_Campanha || curr["nome da campanha"] || 'Sem Nome';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    const campaignList = Object.entries(campaignCounts);

    return `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="glass-card p-6 rounded-3xl bg-gradient-to-br from-white to-indigo-50/30 border-none shadow-sm">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <i data-lucide="rocket"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-black text-slate-800 tracking-tight uppercase">Central de Execução</h3>
                        <p class="text-xs text-slate-500">Selecione uma campanha configurada para iniciar o envio em massa.</p>
                    </div>
                </div>
            </div>

            <div class="glass-card rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm bg-white">
                <div class="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campanhas Prontas para Disparo</h4>
                </div>
                
                <div class="divide-y divide-slate-50">
                    ${campaignList.length > 0 ? campaignList.map(([name, count]) => `
                        <div class="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-all group">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                    <i data-lucide="send" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <p class="font-bold text-slate-700 text-sm">${name}</p>
                                    <p class="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                        <span class="text-indigo-600 font-black">${count}</span> Contatos na fila
                                    </p>
                                </div>
                            </div>
                            
                            <button onclick="Router.handleDispatch('${name}')" 
                                class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-100">
                                <i data-lucide="zap" class="w-3.5 h-3.5 fill-current"></i>
                                Iniciar Disparo
                            </button>
                        </div>
                    `).join('') : `
                        <div class="p-12 text-center text-slate-400">
                            <p class="text-xs italic">Nenhuma campanha encontrada para disparar.</p>
                            <button onclick="Router.navigate('create')" class="mt-4 text-indigo-600 font-bold text-[10px] uppercase underline">Criar minha primeira campanha</button>
                        </div>
                    `}
                </div>
            </div>

            <!-- Card de Dica -->
            <div class="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start">
                <i data-lucide="alert-circle" class="w-5 h-5 text-amber-500 shrink-0"></i>
                <p class="text-[11px] text-amber-700 leading-relaxed">
                    <strong>Importante:</strong> Ao clicar em "Iniciar Disparo", as mensagens serão enviadas imediatamente seguindo as regras de delay configuradas no seu fluxo n8n. Certifique-se de que o template está correto.
                </p>
            </div>
        </div>
    `;
};
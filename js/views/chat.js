/**
 * js/views/chat.js
 * Interface de Chat ao Vivo Omnichannel - Versão Enterprise Completa.
 * Suporta: Mobile, Emojis, Pesquisa, Metadados e Painel de Informações.
 */
Views.chat = function() {
    if (Views.chatState.pollingInterval) clearTimeout(Views.chatState.pollingInterval);
    setTimeout(() => Views.startChatPolling(), 200);

    return `
        <div id="chat-wrapper" class="flex h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] gap-0 md:gap-4 animate-in duration-500 relative overflow-hidden">
            
            <!-- SIDEBAR: LISTA DE CONVERSAS -->
            <aside id="chat-sidebar" class="w-full md:w-80 bg-white rounded-none md:rounded-[2rem] border-r md:border border-slate-100 shadow-sm flex flex-col overflow-hidden shrink-0 transition-all duration-300 z-20">
                <div class="p-6 border-b border-slate-50 bg-white space-y-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-base font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Conversas
                        </h3>
                        <span id="chat-count-badge" class="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">0</span>
                    </div>
                    <!-- Barra de Pesquisa -->
                    <div class="relative group">
                        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                        <input type="text" id="contact-search" placeholder="Buscar nome ou número..." 
                            oninput="Views.handleContactSearch(this.value)"
                            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-indigo-200 focus:bg-white transition-all shadow-inner">
                    </div>
                </div>
                <div id="chat-list-container" class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-slate-50/30">
                    <div class="p-12 text-center text-slate-400 font-bold uppercase italic text-xs">Sincronizando mensagens...</div>
                </div>
            </aside>

            <!-- MAIN: JANELA DE CHAT -->
            <main id="chat-main" class="absolute inset-0 translate-x-full md:relative md:inset-auto md:translate-x-0 flex-1 bg-white rounded-none md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden transition-all duration-300 z-30 min-w-0">
                
                <!-- HEADER DO CHAT -->
                <div id="chat-window-header" class="p-5 border-b border-slate-50 bg-white flex items-center justify-between z-10 shadow-sm">
                    <div class="flex items-center gap-4 min-w-0">
                        <button onclick="Views.backToList()" class="md:hidden p-2.5 -ml-2 text-slate-400 hover:text-indigo-600 transition-colors shrink-0">
                            <i data-lucide="arrow-left" class="w-7 h-7"></i>
                        </button>
                        
                        <div id="active-chat-avatar" class="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-lg shadow-indigo-100 shrink-0 uppercase">?</div>
                        
                        <div class="min-w-0">
                            <h4 id="active-chat-name" class="text-base md:text-lg font-black text-slate-800 tracking-tight truncate leading-tight">Selecione um cliente</h4>
                            <p id="active-chat-status" class="text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-widest italic truncate mt-0.5">Offline</p>
                        </div>
                    </div>
                    
                    <div class="flex gap-2 shrink-0">
                        <button onclick="Views.toggleContactInfo()" class="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-slate-100">
                            <i data-lucide="info" class="w-6 h-6"></i>
                        </button>
                        <button class="p-3 text-slate-300 hover:text-indigo-600 transition-all hidden md:block"><i data-lucide="more-vertical" class="w-6 h-6"></i></button>
                    </div>
                </div>

                <!-- CONTAINER DE MENSAGENS -->
                <div id="chat-messages-container" class="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 bg-slate-50/20 custom-scrollbar flex flex-col">
                    <div class="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-40 uppercase font-black text-xs tracking-[0.3em] text-center px-8">
                        <i data-lucide="messages-square" class="w-16 h-16"></i>
                        <p>Inicie uma conversa para visualizar o histórico de mensagens do banco</p>
                    </div>
                </div>

                <!-- BARRA DE INPUT E EMOJIS -->
                <div class="p-5 border-t border-slate-50 bg-white relative">
                    <!-- Picker de Emojis -->
                    <div id="emoji-picker" class="absolute bottom-[90%] left-4 right-4 md:right-auto md:w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 hidden animate-in slide-in-from-bottom-4 z-[100] flex flex-col overflow-hidden max-h-[350px]">
                        <div class="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Emojis</p>
                            <button onclick="Views.closeEmojiPicker()" class="text-slate-300 hover:text-rose-500"><i data-lucide="x" class="w-4 h-4"></i></button>
                        </div>
                        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            ${Views.renderEmojiGroups()}
                        </div>
                    </div>

                    <div class="flex gap-3 items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100 focus-within:border-indigo-200 focus-within:bg-white transition-all shadow-sm">
                        <button id="emoji-toggle-btn" onclick="Views.toggleEmojiPicker()" disabled class="p-3 text-slate-400 hover:text-indigo-600 transition-colors opacity-50 shrink-0">
                            <i data-lucide="smile" class="w-7 h-7"></i>
                        </button>

                        <input type="text" id="chat-input-field" placeholder="Digite sua mensagem..." disabled 
                            onkeyup="if(event.key === 'Enter') Views.sendMessage()"
                            onfocus="Views.closeEmojiPicker()"
                            class="flex-1 bg-transparent border-none px-1 py-3 text-base font-medium focus:ring-0 outline-none opacity-50 placeholder:text-slate-300">
                        
                        <button id="chat-send-btn" onclick="Views.sendMessage()" disabled 
                            class="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 opacity-50 active:scale-95 transition-all shrink-0">
                            <i data-lucide="send" class="w-6 h-6"></i>
                        </button>
                    </div>
                </div>
            </main>

            <!-- PANEL: DETALHES TÉCNICOS (INFO PANEL) -->
            <aside id="contact-info-panel" class="fixed md:relative inset-y-0 right-0 w-0 opacity-0 bg-white rounded-none md:rounded-[2rem] border-l md:border border-slate-100 shadow-2xl md:shadow-sm flex flex-col overflow-hidden transition-all duration-300 ease-in-out shrink-0 z-[100]">
                <div class="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div class="flex items-center gap-3">
                        <i data-lucide="database" class="w-6 h-6 text-indigo-600"></i>
                        <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest">Metadados</h3>
                    </div>
                    <button onclick="Views.toggleContactInfo()" class="text-slate-400 hover:text-rose-500 transition-colors p-2 -mr-2"><i data-lucide="x" class="w-7 h-7 md:w-6 md:h-6"></i></button>
                </div>
                <div id="contact-info-content" class="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/10">
                    <!-- Injetado dinamicamente -->
                </div>
            </aside>
        </div>
    `;
};

// --- ESTADO GLOBAL DO CHAT ---
Views.chatState = {
    messages: [],
    selectedContact: null,
    pollingInterval: null,
    isInfoOpen: false,
    isEmojiPickerOpen: false,
    searchTerm: ""
};

// --- NAVEGAÇÃO E BUSCA ---
Views.backToList = function() {
    document.getElementById('chat-main').classList.add('translate-x-full');
    Views.chatState.selectedContact = null;
    Views.renderChatList();
};

Views.openChatOnMobile = function() {
    document.getElementById('chat-main').classList.remove('translate-x-full');
};

Views.handleContactSearch = function(val) {
    Views.chatState.searchTerm = val.toLowerCase().trim();
    Views.renderChatList();
};

// --- ENGINE DE MENSAGENS (POLLING) ---
Views.startChatPolling = async function() {
    if (!document.getElementById('chat-list-container')) return;
    try {
        const data = await API.fetchLiveMessages();
        Views.chatState.messages = Array.isArray(data) ? data : (data ? [data] : []);
        
        const badge = document.getElementById('chat-count-badge');
        if (badge) badge.innerText = Views.chatState.messages.length;

        Views.renderChatList();
        if (Views.chatState.selectedContact) {
            Views.renderChatMessages(Views.chatState.selectedContact);
        }
    } catch (e) { console.error("🚨 Erro de Polling:", e); }
    Views.chatState.pollingInterval = setTimeout(() => Views.startChatPolling(), 500);
};

// --- RENDERIZAÇÃO DE LISTA ---
Views.renderChatList = function() {
    const container = document.getElementById('chat-list-container');
    if (!container) return;

    if (Views.chatState.messages.length === 0) {
        container.innerHTML = `<div class="p-12 text-center text-sm text-slate-300 font-bold uppercase italic">Vazio</div>`;
        return;
    }

    const contacts = {};
    Views.chatState.messages.forEach(msg => {
        const phone = msg.cliente_fone;
        if (!phone) return;
        const msgDate = new Date(msg.data_mensagem || 0);
        if (!contacts[phone] || msgDate > new Date(contacts[phone].data_mensagem)) {
            contacts[phone] = { ...msg };
        } else if (!contacts[phone].nome_contato && msg.nome_contato) {
            contacts[phone].nome_contato = msg.nome_contato;
        }
    });

    let sortedPhones = Object.keys(contacts).sort((a, b) => new Date(contacts[b].data_mensagem) - new Date(contacts[a].data_mensagem));

    if (Views.chatState.searchTerm) {
        sortedPhones = sortedPhones.filter(p => p.includes(Views.chatState.searchTerm) || (contacts[p].nome_contato || "").toLowerCase().includes(Views.chatState.searchTerm));
    }

    container.innerHTML = sortedPhones.map(phone => {
        const c = contacts[phone];
        const isActive = Views.chatState.selectedContact === phone;
        const time = c.data_mensagem ? new Date(c.data_mensagem).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';
        const displayName = (c.nome_contato && c.nome_contato !== "null") ? c.nome_contato : phone;

        return `
            <button onclick="Views.selectChat('${phone}')" 
                class="w-full p-5 rounded-none md:rounded-3xl flex items-center gap-5 transition-all ${isActive ? 'bg-indigo-600 text-white shadow-xl scale-[0.98] z-10' : 'hover:bg-white text-slate-600 border-b border-slate-50 md:border-none'}">
                <div class="w-14 h-14 rounded-2xl ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'} flex items-center justify-center font-black text-base uppercase shrink-0 shadow-sm">
                    ${displayName.toString().substring(0, 2)}
                </div>
                <div class="flex-1 text-left overflow-hidden min-w-0">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-base font-black tracking-tight truncate">${displayName}</span>
                        <span class="text-[11px] ${isActive ? 'text-white/60' : 'text-slate-400'} font-bold shrink-0 ml-2">${time}</span>
                    </div>
                    <p class="text-sm ${isActive ? 'text-white/80' : 'text-slate-400'} truncate font-medium">
                        ${c.direcao === 'outbound' ? '✓ ' : ''}${c.mensagem || 'Mídia'}
                    </p>
                </div>
            </button>
        `;
    }).join('');
    if (window.lucide) lucide.createIcons();
};

// --- SELEÇÃO DE CHAT ---
Views.selectChat = function(phone) {
    Views.chatState.selectedContact = phone;
    const contact = Views.chatState.messages.find(m => m.cliente_fone === phone);
    const displayName = (contact?.nome_contato && contact?.nome_contato !== "null") ? contact.nome_contato : phone;
    
    document.getElementById('active-chat-name').innerText = displayName;
    document.getElementById('active-chat-status').innerText = displayName !== phone ? `Atendimento: ${phone}` : "Monitorando banco";
    document.getElementById('active-chat-avatar').innerText = displayName.toString().substring(0, 2).toUpperCase();
    
    Views.openChatOnMobile();

    const infoContent = document.getElementById('contact-info-content');
    if (infoContent) {
        infoContent.innerHTML = `
            <div class="space-y-4">
                <div class="flex flex-col items-center py-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm mb-2">
                    <div class="w-24 h-24 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl font-black mb-5 shadow-2xl shadow-indigo-200 uppercase">
                        ${displayName.toString().substring(0, 2)}
                    </div>
                    <h5 class="text-lg font-black text-slate-800 tracking-tight">${displayName}</h5>
                    <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mt-2">Ativo</span>
                </div>
                ${Views.renderInfoItem('hash', 'ID do Banco', contact?.id || '---')}
                ${Views.renderInfoItem('user', 'Nome Contato', contact?.nome_contato || '---')}
                ${Views.renderInfoItem('phone', 'Número WhatsApp', phone)}
                ${Views.renderInfoItem('shield', 'Tenant ID', contact?.tenant_id || 'default')}
                ${Views.renderInfoItem('box', 'WhatsApp Account', contact?.whatsapp_account_id || '---')}
            </div>
        `;
    }

    const input = document.getElementById('chat-input-field');
    const btn = document.getElementById('chat-send-btn');
    const emojiBtn = document.getElementById('emoji-toggle-btn');

    if (input) { input.disabled = false; input.classList.remove('opacity-50'); input.focus(); }
    if (btn) { btn.disabled = false; btn.classList.remove('opacity-50'); }
    if (emojiBtn) { emojiBtn.disabled = false; emojiBtn.classList.remove('opacity-50'); }

    Views.renderChatList(); 
    Views.renderChatMessages(phone);
};

Views.renderInfoItem = function(icon, label, value) {
    return `
        <div class="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <i data-lucide="${icon}" class="w-4 h-4"></i> ${label}
            </p>
            <p class="text-sm font-bold text-slate-700 break-all">${value}</p>
        </div>
    `;
};

// --- MENSAGENS E DATA ---
Views.renderChatMessages = function(phone) {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    const chatHistory = Views.chatState.messages
        .filter(m => m.cliente_fone === phone)
        .sort((a, b) => new Date(a.data_mensagem) - new Date(b.data_mensagem));

    if (chatHistory.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-sm text-slate-300 font-bold uppercase italic leading-relaxed">Nenhuma conversa registrada.</div>`;
        return;
    }

    let lastDate = null, html = "";
    chatHistory.forEach(msg => {
        const isOut = msg.direcao === 'outbound';
        const dateObj = new Date(msg.data_mensagem);
        const time = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const dateStr = dateObj.toLocaleDateString();

        if (dateStr !== lastDate) {
            html += `<div class="flex justify-center my-8">
                <span class="px-5 py-2 bg-slate-100 rounded-full text-[11px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 shadow-sm">${Views.formatDateLabel(dateObj)}</span>
            </div>`;
            lastDate = dateStr;
        }

        html += `
            <div class="flex ${isOut ? 'justify-end' : 'justify-start'} animate-in duration-300 w-full mb-4">
                <div class="max-w-[85%] md:max-w-[70%] flex flex-col ${isOut ? 'items-end' : 'items-start'} min-w-0">
                    <div class="px-6 py-4 rounded-[1.5rem] shadow-sm text-base font-medium leading-relaxed break-words overflow-hidden w-full ${
                        isOut ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }">
                        ${msg.mensagem ? msg.mensagem.replace(/\n/g, '<br>') : 'Mídia Recibida'}
                    </div>
                    <div class="flex items-center gap-2 mt-2 px-1 shrink-0">
                        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">${time}</span>
                        ${isOut ? '<i data-lucide="check-check" class="w-4 h-4 text-indigo-400"></i>' : ''}
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    if (window.lucide) lucide.createIcons();
};

Views.formatDateLabel = function(date) {
    const today = new Date().toLocaleDateString(), yesterday = new Date(Date.now() - 86400000).toLocaleDateString(), dateStr = date.toLocaleDateString();
    if (dateStr === today) return "Hoje"; if (dateStr === yesterday) return "Ontem"; return dateStr;
};

// --- EMOJIS PICKER ---
Views.renderEmojiGroups = function() {
    const groups = {
        "Populares": ['😀','😂','😍','😊','🙏','👍','🔥','✨','✅','🚀','💬','❤️'],
        "Expressões": ['😃','😄','😁','😅','🤣','😇','🙂','🙃','😉','😌','🥰','😘','😋','😛','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃'],
    };
    return Object.entries(groups).map(([name, list]) => `
        <div class="mb-6">
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">${name}</p>
            <div class="grid grid-cols-6 md:grid-cols-8 gap-2.5">
                ${list.map(e => `<button onclick="Views.addEmoji('${e}')" class="hover:bg-slate-100 p-2.5 rounded-xl text-2xl md:text-xl transition-all active:scale-90 text-center">${e}</button>`).join('')}
            </div>
        </div>
    `).join('');
};

Views.toggleEmojiPicker = function() {
    const p = document.getElementById('emoji-picker'); if (!p) return;
    Views.chatState.isEmojiPickerOpen = !Views.chatState.isEmojiPickerOpen;
    p.classList.toggle('hidden', !Views.chatState.isEmojiPickerOpen);
};

Views.closeEmojiPicker = function() {
    const p = document.getElementById('emoji-picker'); if (p) { p.classList.add('hidden'); Views.chatState.isEmojiPickerOpen = false; }
};

Views.addEmoji = function(emoji) {
    const i = document.getElementById('chat-input-field'); if (i) { i.value += emoji; i.focus(); }
};

// --- INFO PANEL ---
Views.toggleContactInfo = function() {
    const p = document.getElementById('contact-info-panel'); if (!p) return;
    Views.chatState.isInfoOpen = !Views.chatState.isInfoOpen;
    if (Views.chatState.isInfoOpen) { p.classList.remove('w-0', 'opacity-0'); p.classList.add('w-full', 'md:w-80', 'opacity-100', 'md:ml-4'); }
    else { p.classList.add('w-0', 'opacity-0'); p.classList.remove('w-full', 'md:w-80', 'opacity-100', 'md:ml-4'); }
    if (window.lucide) lucide.createIcons();
};

// --- ENVIO FINAL ---
Views.sendMessage = async function() {
    const input = document.getElementById('chat-input-field'), btn = document.getElementById('chat-send-btn');
    const msgText = input.value.trim(), phone = Views.chatState.selectedContact;
    if (!msgText || !phone) return;
    
    // Captura metadados para envio
    const contact = Views.chatState.messages.find(m => m.cliente_fone === phone);
    const tenantId = contact?.tenant_id || "1";
    const accountId = contact?.whatsapp_account_id || "1";
    const contactName = (contact?.nome_contato && contact?.nome_contato !== "null") ? contact.nome_contato : phone;

    try {
        input.disabled = true; btn.disabled = true; btn.innerHTML = `<span class="loader border-white"></span>`;
        Views.closeEmojiPicker();

        // Webhook GET com TODOS os parâmetros solicitados
        const url = `https://n8n-n8n.g0rat2.easypanel.host/webhook/envia-msg?telefone=${encodeURIComponent(phone)}&mensagem=${encodeURIComponent(msgText)}&tenant_id=${encodeURIComponent(tenantId)}&whatsapp_account_id=${encodeURIComponent(accountId)}&nome_contato=${encodeURIComponent(contactName)}`;
        
        const res = await fetch(url, { method: 'GET' });
        if (res.ok) { input.value = ""; setTimeout(() => Views.startChatPolling(), 300); }
    } catch (e) { console.error("🚨 Erro de Envio:", e); } finally {
        input.disabled = false; btn.disabled = false; btn.innerHTML = `<i data-lucide="send" class="w-6 h-6"></i>`;
        input.focus(); if (window.lucide) lucide.createIcons();
    }
};
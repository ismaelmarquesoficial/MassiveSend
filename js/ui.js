/**
 * js/ui.js
 * Utilitários de manipulação visual e feedback ao usuário.
 */
const UI = {
    // Alterna o menu lateral
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const labels = document.querySelectorAll('.nav-label');
        const logo = document.getElementById('logo-text');
        const credits = document.getElementById('credits-card');
        
        AppState.isSidebarCollapsed = !AppState.isSidebarCollapsed;
        
        if (AppState.isSidebarCollapsed) {
            sidebar.classList.replace('w-64', 'w-16');
            labels.forEach(l => l.classList.add('hidden'));
            logo.classList.add('hidden');
            credits.classList.add('hidden');
        } else {
            sidebar.classList.replace('w-16', 'w-64');
            labels.forEach(l => l.classList.remove('hidden'));
            logo.classList.remove('hidden');
            credits.classList.remove('hidden');
        }
        lucide.createIcons();
    },

    // Abre o modal de confirmação de disparo
    showConfirmDispatch(campaignName, onConfirm) {
        const modal = document.getElementById('modal-confirm-dispatch');
        const nameDisplay = document.getElementById('modal-camp-name');
        const confirmBtn = document.getElementById('btn-modal-confirm');

        // CORREÇÃO: Verifica se os elementos existem antes de tentar usar
        if (!modal || !nameDisplay || !confirmBtn) {
            console.error("Erro: Elementos do modal de confirmação não encontrados no HTML.");
            return;
        }

        nameDisplay.innerText = campaignName;
        
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.onclick = () => {
            this.closeConfirmDispatch();
            onConfirm();
        };

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        lucide.createIcons();
    },

    closeConfirmDispatch() {
        const modal = document.getElementById('modal-confirm-dispatch');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    // Exibe avisos Toast
    showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        const colorClass = type === 'success' ? 'bg-emerald-500' : 'bg-rose-500';
        
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-2xl text-white font-bold text-xs z-50 animate-in slide-in-from-right duration-300 ${colorClass}`;
        toast.innerText = msg;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    /**
     * Mapeia o status para a cor correta do badge (Corrigido para templates Meta)
     */
    getStatusColorClass(status) {
        if (!status) return 'bg-slate-100 text-slate-400 border-slate-200';
        
        const s = status.toString().toUpperCase();

        // APROVADOS (Verde)
        if (s === 'APPROVED' || s === 'CONCLUIDO' || s === 'SUCESSO') {
            return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
        }

        // PENDENTES / EM REVISÃO (Amarelo)
        if (s === 'PENDING' || s === 'IN_REVIEW' || s === 'PENDENTE' || s === 'LIMIT_REACHED') {
            return 'bg-amber-50 text-amber-600 border border-amber-200';
        }

        // PROCESSANDO / ENVIANDO (Azul)
        if (s === 'PROCESSANDO' || s === 'ENVIANDO' || s === 'DISPARANDO') {
            return 'bg-blue-50 text-blue-600 border border-blue-200';
        }

        // REJEITADOS / ERRO / PAUSADO (Vermelho/Cinza)
        if (s === 'REJECTED' || s === 'ERRO' || s === 'FALHA' || s === 'DISABLED') {
            return 'bg-rose-50 text-rose-600 border border-rose-200';
        }

        // PADRÃO (Cinza)
        return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
};
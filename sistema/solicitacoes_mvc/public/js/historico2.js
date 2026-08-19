// public/js/historico.js

const API_BASE_URL = 'http://localhost:80/solicitacoes_mvc/api';
const solicitacoesMap = {}; // Mapa para armazenar os detalhes de cada solicitação

// --- LÓGICA DA SIDEBAR ---
document.body.addEventListener('mousemove', function (e) {
    const openThreshold = 50;
    const closeThreshold = 300;
    if (e.clientX < openThreshold) expandirSidebar();
    else if (e.clientX > closeThreshold) voltarSidebar();
});

function expandirSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('w-[300px]')) return;
    sidebar.classList.remove('w-[60px]');
    sidebar.classList.add('w-[300px]');
    sidebar.querySelectorAll('.icon-only').forEach(button => {
        const spanText = button.querySelector('.sidebar-text');
        if (spanText) {
            spanText.classList.remove('hidden');
            setTimeout(() => spanText.classList.add('active-text'), 300);
        }
    });
}

function voltarSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('w-[60px]')) return;
    sidebar.classList.remove('w-[300px]');
    sidebar.classList.add('w-[60px]');
    sidebar.querySelectorAll('.icon-only').forEach(button => {
        const spanText = button.querySelector('.sidebar-text');
        if (spanText) {
            spanText.classList.remove('active-text');
            setTimeout(() => spanText.classList.add('hidden'), 300);
        }
    });
}
// --- FIM DA LÓGICA DA SIDEBAR ---

// --- FUNÇÕES DE MODAL E UTILIDADES ---
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'N/A';
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    const matchShort = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
    if (matchShort) return `(${matchShort[1]}) ${matchShort[2]}-${matchShort[3]}`;
    return cleaned;
}

function abrirCard(solicitacaoId, tipoPedido) {
    const solicitacao = solicitacoesMap[solicitacaoId + '-' + tipoPedido];
    if (!solicitacao) {
        console.error('Solicitação não encontrada no mapa:', solicitacaoId, tipoPedido);
        alert('Erro ao carregar detalhes da solicitação.');
        return;
    }

    const modalContent = document.querySelector('#cardDetalhes .modal-content');
    modalContent.innerHTML = '';

    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    let displayPrazo = 'N/A';

    if (solicitacao.tipo_pedido === 'design' && solicitacao.detalhes_solicitacao.data_entrega_arte) {
        displayPrazo = `Prazo: ${new Date(solicitacao.detalhes_solicitacao.data_entrega_arte).toLocaleDateString('pt-BR', dateOptions)}`;
    } else if (solicitacao.tipo_pedido === 'video' && solicitacao.detalhes_solicitacao.data_entrega_video) {
        displayPrazo = `Prazo: ${new Date(solicitacao.detalhes_solicitacao.data_entrega_video).toLocaleDateString('pt-BR', dateOptions)}`;
    }

    let cardViewContent = `
        <button class="modal-close-btn" onclick="fecharCard()">&times;</button>
        <div class="p-0 pb-2">
            <h2 class="text-xl font-bold mb-2 break-all-words">${solicitacao.nome}</h2>
            <div class="text-sm text-gray-700 mb-1 break-all-words">Ministério: ${solicitacao.ministerio}</div>
            <div class="text-sm text-gray-700 mb-2 break-all-words">Tipo: ${solicitacao.tipo_pedido.charAt(0).toUpperCase() + solicitacao.tipo_pedido.slice(1)}</div>
            <div class="text-sm text-gray-700 mb-2 break-all-words">${displayPrazo}</div>
            <div class="text-sm text-gray-700 mb-2 break-all-words">Status Trello: ${solicitacao.status ? solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1) : 'N/A'}</div>
            <div class="text-sm font-medium mb-1 break-all-words">Solicitante: ${solicitacao.nome}</div>
            <div class="text-sm mb-4 break-all-words">Contato: ${solicitacao.email_cliente || 'N/A'} | Tel: ${formatPhoneNumber(solicitacao.numero_cliente)}</div>
        </div>
        <div id="cardDescricaoDisplay" class="text-gray-800 text-sm border-t pt-2 mb-2 break-all-words"></div>
        <img id="cardImagemDisplay" class="mt-4 hidden max-w-full rounded-lg mb-6 shadow-md" />
        <div id="cardDetalhesEspecificosDisplay" class="text-gray-700 text-sm space-y-2"></div>
    `;
    modalContent.innerHTML = cardViewContent;

    const cardDescricaoDisplay = document.getElementById('cardDescricaoDisplay');
    const cardImagemDisplay = document.getElementById('cardImagemDisplay');
    const cardDetalhesEspecificosDisplay = document.getElementById('cardDetalhesEspecificosDisplay');

    if (solicitacao.tipo_pedido === 'design') {
        const detalhes = solicitacao.detalhes_solicitacao;
        cardDescricaoDisplay.innerText = detalhes.uso_e_objetivo_arte || 'Sem descrição de uso/objetivo';
        cardDetalhesEspecificosDisplay.innerHTML = `
            <p class="break-all-words"><strong>Texto Fundamental:</strong> ${detalhes.texto_fundamental || 'N/A'}</p>
            <p class="break-all-words"><strong>Data Evento:</strong> ${detalhes.data_evento ? new Date(detalhes.data_evento).toLocaleDateString('pt-BR', dateOptions) : 'N/A'}</p>
            <p class="break-all-words"><strong>Público:</strong> ${detalhes.publico_alcancado || 'N/A'}</p>
            <p class="break-all-words"><strong>Observações:</strong> ${detalhes.observacoes_complementares || 'N/A'}</p>
        `;
        if (detalhes.imagem_referencia) {
            cardImagemDisplay.src = detalhes.imagem_referencia;
            cardImagemDisplay.classList.remove('hidden');
        }
    } else if (solicitacao.tipo_pedido === 'video') {
        const detalhes = solicitacao.detalhes_solicitacao;
        cardDescricaoDisplay.innerText = detalhes.roteiro_video || 'Sem roteiro';
        cardDetalhesEspecificosDisplay.innerHTML = `
            <p class="break-all-words"><strong>Título do Vídeo:</strong> ${detalhes.titulo_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Duração:</strong> ${detalhes.tempo_duracao_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Onde Passará:</strong> ${detalhes.onde_passara_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Público Alvo:</strong> ${detalhes.publico_alvo_video || 'N/A'}</p>
        `;
    }

    document.getElementById('cardDetalhes').classList.remove('hidden');
    document.getElementById('cardDetalhes').classList.add('flex');
}

function fecharCard() {
    document.getElementById('cardDetalhes').classList.add('hidden');
    document.getElementById('cardDetalhes').classList.remove('flex');
}
// --- FIM DAS FUNÇÕES DE MODAL ---

/**
 * Pede confirmação e, se confirmado, apaga uma solicitação do histórico.
 * @param {number} id - O ID da solicitação.
 * @param {string} tipo_pedido - O tipo da solicitação ('design' ou 'video').
 */
async function confirmarDelete(id, tipo_pedido) {
    if (!confirm('Tem certeza que deseja apagar esta solicitação PERMANENTEMENTE? Esta ação não pode ser desfeita.')) {
        return;
    }

    // --- INÍCIO DA MODIFICAÇÃO ---

    // 1. Buscar os dados completos da solicitação no nosso mapa
    const solicitacao = solicitacoesMap[id + '-' + tipo_pedido];

    // 2. Verificar se a solicitação foi encontrada e se ela tem um ID de card do Trello
    if (solicitacao && solicitacao.trello_card_id) {
        const webhookUrl = 'https://sistema-crescer-n8n.vuvd0x.easypanel.host/webhook/deletar-card';
        const payload = {
            id_card_trello: solicitacao.trello_card_id
        };

        console.log('Encontrado Trello Card ID:', solicitacao.trello_card_id, '. Acionando webhook...');

        try {
            // 3. Chamar o webhook para deletar o card no Trello (fire-and-forget)
            // Não esperamos a resposta para continuar, mas registramos se houver erro.
            fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }).catch(error => {
                // Apenas registra o erro no console, mas não impede a exclusão local.
                console.error('Ocorreu um erro ao tentar acionar o webhook do Trello:', error);
            });

        } catch (error) {
            console.error('Erro ao preparar a chamada para o webhook:', error);
        }
    }

    // --- FIM DA MODIFICAÇÃO ---


    // 4. Continuar com a exclusão da solicitação no nosso banco de dados (lógica original)
    try {
        const response = await fetch(`${API_BASE_URL}/solicitacoes/${tipo_pedido}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert('Solicitação apagada com sucesso!');
            // Remove o card da tela
            document.getElementById(`historico-card-${id}-${tipo_pedido}`).remove();
        } else {
            alert(`Erro ao apagar a solicitação do banco de dados: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede ao tentar apagar do banco de dados:', error);
        alert('Erro de conexão. Não foi possível apagar a solicitação.');
    }
}
/**
 * Renderiza um card de solicitação na tela de histórico.
 * @param {object} solicitacao - O objeto da solicitação.
 */
function renderHistoricoCard(solicitacao) {
    solicitacoesMap[solicitacao.id + '-' + solicitacao.tipo_pedido] = solicitacao;

    const container = document.getElementById('listaHistorico');
    const div = document.createElement('div');
    div.id = `historico-card-${solicitacao.id}-${solicitacao.tipo_pedido}`;
    div.className = 'solicitacao-card';
    // O dataset.status deve corresponder exatamente ao valor que vem do banco
    div.dataset.status = solicitacao.status_interno;

    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    let displayPrazo = 'N/A';

    if (solicitacao.tipo_pedido === 'design' && solicitacao.detalhes_solicitacao.data_entrega_arte) {
        displayPrazo = `Prazo: ${new Date(solicitacao.detalhes_solicitacao.data_entrega_arte).toLocaleDateString('pt-BR', dateOptions)}`;
    } else if (solicitacao.tipo_pedido === 'video' && solicitacao.detalhes_solicitacao.data_entrega_video) {
        displayPrazo = `Prazo: ${new Date(solicitacao.detalhes_solicitacao.data_entrega_video).toLocaleDateString('pt-BR', dateOptions)}`;
    }

    let specificTitle = 'Sem Título';
    if (solicitacao.tipo_pedido === 'design' && solicitacao.detalhes_solicitacao.texto_fundamental) {
        specificTitle = solicitacao.detalhes_solicitacao.texto_fundamental;
    } else if (solicitacao.tipo_pedido === 'video' && solicitacao.detalhes_solicitacao.titulo_video) {
        specificTitle = solicitacao.detalhes_solicitacao.titulo_video;
    }

    let statusClass = '';
    let statusText = solicitacao.status_interno; // Por padrão, usa o texto do banco

    switch (solicitacao.status_interno) {
        case 'Aprovado':
            statusClass = 'status-aprovado';
            break;
        case 'Recusado':
            statusClass = 'status-recusado';
            break;
        case 'aguardando aprovação':
            statusClass = 'status-aguardando';
            // Capitaliza para melhor exibição
            statusText = 'Aguardando Aprovação';
            break;
        case 'Finalizado':
            statusClass = 'status-finalizado';
            break;
        default:
            statusClass = 'bg-gray-500'; // Um fallback visual para status não mapeados
    }
    const statusBadge = `<span class="status-badge ${statusClass}">${statusText}</span>`;

    let motivoDisplay = '';
    if (solicitacao.status_interno === 'Recusado' && solicitacao.motivo_cancelamento) {
        motivoDisplay = `<div class="text-xs text-red-600 mt-1 break-all-words">Motivo: ${solicitacao.motivo_cancelamento}</div>`;
    }

    div.innerHTML = `
        <div class="flex-grow">
            <strong>${solicitacao.nome}</strong><br>
            <span class="text-sm text-gray-600">${specificTitle}</span><br> ${displayPrazo}
            <br>
            Ministério: ${solicitacao.ministerio}
            <br>
            Tipo: ${solicitacao.tipo_pedido.charAt(0).toUpperCase() + solicitacao.tipo_pedido.slice(1)}
            <br>
            Telefone: ${formatPhoneNumber(solicitacao.numero_cliente)}
            ${motivoDisplay}
        </div>
        <div class="flex flex-col items-center justify-center gap-3">
            ${statusBadge}
            <button class="btn-link mt-2" onclick='abrirCard("${solicitacao.id}", "${solicitacao.tipo_pedido}")'>ABRIR CARD</button>
            <button class="btn-icon-danger" title="Apagar Solicitação" onclick='confirmarDelete(${solicitacao.id}, "${solicitacao.tipo_pedido}")'>EXCLUIR</button>
        </div>
    `;
    container.appendChild(div);
}

// --- LÓGICA DE FILTRO ---
function handleFilterChange(changedCheckbox) {
    const filtroTodos = document.getElementById('filtroTodos');
    const filtroAprovados = document.getElementById('filtroAprovados');
    const filtroRecusados = document.getElementById('filtroRecusados');
    const filtroAguardando = document.getElementById('filtroAguardando');
    const filtroFinalizados = document.getElementById('filtroFinalizados');

    const statusFilters = [filtroAprovados, filtroRecusados, filtroAguardando, filtroFinalizados];

    if (changedCheckbox.id === 'filtroTodos') {
        if (changedCheckbox.checked) {
            // Se "Todos" foi marcado, desmarca os outros
            statusFilters.forEach(cb => cb.checked = false);
        } else if (!statusFilters.some(cb => cb.checked)) {
            // Previne que "Todos" seja desmarcado se nenhum outro filtro estiver ativo
            filtroTodos.checked = true;
        }
    } else { // Um dos filtros de status foi alterado
        if (changedCheckbox.checked) {
            // Se um filtro de status foi marcado, desmarca "Todos"
            filtroTodos.checked = false;
        } else if (!statusFilters.some(cb => cb.checked)) {
            // Se todos os filtros de status foram desmarcados, marca "Todos"
            filtroTodos.checked = true;
        }
    }
    filtrarHistoricoPorStatus();
}

function filtrarHistoricoPorStatus() {
    const filtroTodosChecked = document.getElementById('filtroTodos').checked;
    const filtroAprovadosChecked = document.getElementById('filtroAprovados').checked;
    const filtroRecusadosChecked = document.getElementById('filtroRecusados').checked;
    const filtroAguardandoChecked = document.getElementById('filtroAguardando').checked;
    const filtroFinalizadosChecked = document.getElementById('filtroFinalizados').checked;

    const cards = document.querySelectorAll('#listaHistorico .solicitacao-card');

    cards.forEach(card => {
        const statusDoCard = card.dataset.status;

        // Condição para mostrar o card
        const deveMostrar = filtroTodosChecked ||
            (filtroAprovadosChecked && statusDoCard === 'Aprovado') ||
            (filtroRecusadosChecked && statusDoCard === 'Recusado') ||
            (filtroAguardandoChecked && statusDoCard === 'aguardando aprovação') ||
            (filtroFinalizadosChecked && statusDoCard === 'Finalizado');

        if (deveMostrar) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// --- CARREGAMENTO INICIAL DA PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/solicitacoes/historico`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            const container = document.getElementById('listaHistorico');
            container.innerHTML = '';

            if (result.data.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500">Nenhum registro no histórico ainda.</p>';
            } else {
                result.data.forEach(solicitacao => renderHistoricoCard(solicitacao));
            }
        } else {
            document.getElementById('listaHistorico').innerHTML = `<p class="text-center text-red-500">Falha ao carregar o histórico: ${result.message}</p>`;
        }
    } catch (error) {
        document.getElementById('listaHistorico').innerHTML = '<p class="text-center text-red-500">Erro de conexão. Verifique se o servidor está no ar.</p>';
    }
});
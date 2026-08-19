// public/js/main.js

// === ESTADO GLOBAL PARA PAGINAÇÃO E FILTRO ===
let currentPage = 1;
let currentFilter = 'todos'; // 'todos', 'design', 'video'
const ITEMS_PER_PAGE = 10;
// ===============================================

let cardAtual = null;
const solicitacoesMap = {};
let allClientsForSelection = [];

const API_BASE_URL = 'http://localhost:80/solicitacoes_mvc/api';
const WEBHOOK_URL = 'https://sistema-crescer-n8n.vuvd0x.easypanel.host/webhook/receber-dados';
const CANCEL_WEBHOOK_URL = 'https://sistema-crescer-n8n.vuvd0x.easypanel.host/webhook/cancelar-solicitacao';


let currentEditingSolicitacao = null;
let currentCancellingSolicitacao = null;

// ... (funções do sidebar, formatPhoneNumber, etc. - MANTENHA-AS COMO ESTÃO)
document.body.addEventListener('mousemove', function (e) {
    const openThreshold = 50;
    const closeThreshold = 300;

    if (e.clientX < openThreshold) {
        expandirSidebar();
    } else if (e.clientX > closeThreshold) {
        voltarSidebar();
    }
});

function expandirSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('w-[300px]')) return;

    sidebar.classList.remove('w-[60px]');
    sidebar.classList.add('w-[300px]');
    const botoes = sidebar.querySelectorAll('.icon-only');
    botoes.forEach(button => {
        const spanText = button.querySelector('.sidebar-text');
        if (spanText) {
            spanText.classList.remove('hidden');
            setTimeout(() => {
                spanText.classList.add('active-text');
            }, 300);
        }
    });
}

function voltarSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('w-[60px]')) return;

    sidebar.classList.remove('w-[300px]');
    sidebar.classList.add('w-[60px]');
    const botoes = sidebar.querySelectorAll('.icon-only');
    botoes.forEach(button => {
        const spanText = button.querySelector('.sidebar-text');
        if (spanText) {
            spanText.classList.remove('active-text');
            setTimeout(() => {
                spanText.classList.add('hidden');
            }, 300);
        }
    });
}

function clearValidationErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('active'));
}

async function abrirFormulario() {
    document.getElementById('formModal').classList.remove('hidden');
    document.getElementById('formModal').classList.add('flex');
    document.getElementById('solicitacaoForm').reset();
    clearValidationErrors();

    document.getElementById('detalhesDesign').classList.add('hidden');
    document.getElementById('detalhesVideo').classList.add('hidden');

    document.getElementById('tipo_pedido').value = '';

    // Limpa e habilita os campos de cliente
    document.getElementById('clienteSearch').value = '';
    document.getElementById('selectedClientId').value = '';
    document.getElementById('searchResults').innerHTML = ''; // Limpa resultados anteriores
    document.getElementById('searchResults').classList.add('hidden'); // Oculta a div de resultados

    document.getElementById('nome').value = '';
    document.getElementById('numero_cliente').value = '';
    document.getElementById('email_cliente').value = '';

    document.getElementById('nome').disabled = false;
    document.getElementById('numero_cliente').disabled = false;
    document.getElementById('email_cliente').disabled = false;

    // Carrega clientes para a pesquisa
    await fetchAllClientsForSearch();
}

function fecharFormulario() {
    document.getElementById('formModal').classList.add('hidden');
    document.getElementById('formModal').classList.remove('flex');
    document.getElementById('solicitacaoForm').reset();
    clearValidationErrors();

    document.getElementById('detalhesDesign').classList.add('hidden');
    document.getElementById('detalhesVideo').classList.add('hidden');

    // Limpa e habilita os campos de cliente ao fechar
    document.getElementById('clienteSearch').value = '';
    document.getElementById('selectedClientId').value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('searchResults').classList.add('hidden');

    document.getElementById('nome').value = '';
    document.getElementById('numero_cliente').value = '';
    document.getElementById('email_cliente').value = '';

    document.getElementById('nome').disabled = false;
    document.getElementById('numero_cliente').disabled = false;
    document.getElementById('email_cliente').disabled = false;
}

function mostrarCamposPorTipo() {
    const tipoPedido = document.getElementById('tipo_pedido').value;
    document.getElementById('detalhesDesign').classList.add('hidden');
    document.getElementById('detalhesVideo').classList.add('hidden');

    if (tipoPedido === 'design') {
        document.getElementById('detalhesDesign').classList.remove('hidden');
    } else if (tipoPedido === 'video') {
        document.getElementById('detalhesVideo').classList.remove('hidden');
    }
    clearValidationErrors();
}

function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'N/A';
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    const matchShort = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
    if (matchShort) {
        return `(${matchShort[1]}) ${matchShort[2]}-${matchShort[3]}`;
    }
    return cleaned;
}

function abrirCard(solicitacaoId, tipoPedido) {
    const solicitacao = solicitacoesMap[solicitacaoId + '-' + tipoPedido];
    if (!solicitacao) {
        console.error('Solicitação não encontrada no mapa:', solicitacaoId, tipoPedido);
        alert('Erro ao carregar detalhes da solicitação.');
        document.getElementById('cardDetalhes').classList.add('hidden');
        return;
    }

    currentEditingSolicitacao = solicitacao;

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
            <h2 class="text-xl font-bold mb-2 break-all-words" id="cardTituloDisplay">${solicitacao.nome}</h2>
            <div class="text-sm text-gray-700 mb-1 break-all-words" id="cardMinisterioDisplay">Ministério: ${solicitacao.ministerio}</div>
            <div class="text-sm text-gray-700 mb-2 break-all-words" id="cardTipoPedidoDisplay">Tipo: ${solicitacao.tipo_pedido.charAt(0).toUpperCase() + solicitacao.tipo_pedido.slice(1)}</div>
            <div class="text-sm text-gray-700 mb-2 break-all-words" id="cardPrazoDisplay">${displayPrazo}</div>
            <div class="text-sm text-gray-700 mb-2 break-all-words">Status: ${solicitacao.status ? solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1) : 'Pendente'}</div>
            <div class="text-sm font-medium mb-1 break-all-words" id="cardAutorDisplay">Solicitante: ${solicitacao.nome}</div>
            <div class="text-sm mb-4 break-all-words" id="cardContatoDisplay">Contato: ${solicitacao.email_cliente || 'N/A'} | Tel: ${formatPhoneNumber(solicitacao.numero_cliente)}</div>
        </div>

        <div id="cardDescricaoDisplay" class="text-gray-800 text-sm border-t pt-2 mb-2 break-all-words"></div>
        <img id="cardImagemDisplay" class="mt-4 hidden max-w-full rounded-lg mb-6 shadow-md" />

        <div id="cardDetalhesEspecificosDisplay" class="text-gray-700 text-sm space-y-2"></div>
        
        <div class="flex justify-end gap-3 mt-6">
            <button type="button" class="btn-primary px-4 py-2" onclick="entrarModoEdicao()">Editar</button>
        </div>
    `;
    modalContent.innerHTML = cardViewContent;

    const cardDescricaoDisplay = document.getElementById('cardDescricaoDisplay');
    const cardImagemDisplay = document.getElementById('cardImagemDisplay');
    const cardDetalhesEspecificosDisplay = document.getElementById('cardDetalhesEspecificosDisplay');

    if (solicitacao.tipo_pedido === 'design') {
        const detalhesDesign = solicitacao.detalhes_solicitacao;
        cardDescricaoDisplay.innerText = detalhesDesign.uso_e_objetivo_arte || 'Sem descrição de uso/objetivo';
        cardDetalhesEspecificosDisplay.innerHTML += `
            <p class="break-all-words"><strong>Texto Fundamental:</strong> ${detalhesDesign.texto_fundamental || 'N/A'}</p>
            <p class="break-all-words"><strong>Data Evento:</strong> ${detalhesDesign.data_evento ? new Date(detalhesDesign.data_evento).toLocaleDateString('pt-BR', dateOptions) : 'N/A'}</p>
            <p class="break-all-words"><strong>Público:</strong> ${detalhesDesign.publico_alcancado || 'N/A'}</p>
            <p class="break-all-words"><strong>E-mail Aprovação:</strong> ${detalhesDesign.email_aprovacao_orcamento || 'N/A'}</p>
            <p class="break-all-words"><strong>Link QR Code:</strong> ${detalhesDesign.link_qr_code ? `<a href="${detalhesDesign.link_qr_code}" target="_blank" class="text-blue-500 underline break-all-words">${detalhesDesign.link_qr_code}</a>` : 'N/A'}</p>
            <p class="break-all-words"><strong>Observações:</strong> ${detalhesDesign.observacoes_complementares || 'N/A'}</p>
            <p class="break-all-words"><strong>Formatos de Entrega:</strong> ${detalhesDesign.formatos_entrega && detalhesDesign.formatos_entrega.length > 0 && detalhesDesign.formatos_entrega[0] !== '' ? detalhesDesign.formatos_entrega.join(', ') : 'N/A'}</p>
            <p class="break-all-words"><strong>Arquivos Necessários:</strong> ${detalhesDesign.arquivos_necessarios && detalhesDesign.arquivos_necessarios.length > 0 && detalhesDesign.arquivos_necessarios[0] !== '' ? detalhesDesign.arquivos_necessarios.join(', ') : 'N/A'}</p>
        `;
        if (detalhesDesign.imagem_referencia) {
            cardImagemDisplay.src = detalhesDesign.imagem_referencia;
            cardImagemDisplay.classList.remove('hidden');
        }
    } else if (solicitacao.tipo_pedido === 'video') {
        const detalhesVideo = solicitacao.detalhes_solicitacao;
        cardDescricaoDisplay.innerText = detalhesVideo.roteiro_video || 'Sem roteiro';
        cardDetalhesEspecificosDisplay.innerHTML += `
            <p class="break-all-words"><strong>Título do Vídeo:</strong> ${detalhesVideo.titulo_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Duração:</strong> ${detalhesVideo.tempo_duracao_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Onde Passará:</strong> ${detalhesVideo.onde_passara_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Referência:</strong> ${detalhesVideo.referencia_video ? detalhesVideo.referencia_video : 'N/A'}</p>
            <p class="break-all-words"><strong>Público Alvo:</strong> ${detalhesVideo.publico_alvo_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Fonte Imagens:</strong> ${detalhesVideo.fonte_imagens || 'N/A'}</p>
            <p class="break-all-words"><strong>Roteiro do Vídeo:</strong> ${detalhesVideo.roteiro_video || 'N/A'}</p>
        `;
    }

    document.getElementById('cardDetalhes').classList.remove('hidden');
    document.getElementById('cardDetalhes').classList.add('flex');
}

function entrarModoEdicao() {
    const solicitacao = currentEditingSolicitacao;
    if (!solicitacao) {
        alert('Erro: Nenhuma solicitação selecionada para edição.');
        return;
    }

    const modalContent = document.querySelector('#cardDetalhes .modal-content');
    modalContent.innerHTML = '';

    const dataEntregaArte = solicitacao.tipo_pedido === 'design' && solicitacao.detalhes_solicitacao.data_entrega_arte ? new Date(solicitacao.detalhes_solicitacao.data_entrega_arte).toISOString().split('T')[0] : '';
    const dataEventoDesign = solicitacao.tipo_pedido === 'design' && solicitacao.detalhes_solicitacao.data_evento ? new Date(solicitacao.detalhes_solicitacao.data_evento).toISOString().split('T')[0] : '';
    const dataEntregaVideo = solicitacao.tipo_pedido === 'video' && solicitacao.detalhes_solicitacao.data_entrega_video ? new Date(solicitacao.detalhes_solicitacao.data_entrega_video).toISOString().split('T')[0] : '';

    let cardEditContent = `
        <button class="modal-close-btn" onclick="fecharCard()">&times;</button>
        <h2 class="text-xl font-bold mb-4">Editar Solicitação</h2>
        <form id="editSolicitacaoForm" onsubmit="event.preventDefault(); salvarAlteracoesCard();">
            <input type="hidden" id="editSolicitacaoId" value="${solicitacao.id}">
            <input type="hidden" id="editTipoPedido" value="${solicitacao.tipo_pedido}">

            <div class="mb-4">
                <label for="editNome" class="form-label">Nome do Solicitante:</label>
                <input type="text" id="editNome" name="nome" class="form-input" value="${solicitacao.nome}" required disabled />
            </div>
            <div class="mb-4">
                <label for="editNumeroCliente" class="form-label">Telefone:</label>
                <input type="text" id="editNumeroCliente" name="numero_cliente" class="form-input" value="${formatPhoneNumber(solicitacao.numero_cliente)}" required disabled />
            </div>
            <div class="mb-4">
                <label for="editEmailCliente" class="form-label">Email:</label>
                <input type="email" id="editEmailCliente" name="email_cliente" class="form-input" value="${solicitacao.email_cliente}" required disabled />
            </div>
            <div class="mb-4">
                <label for="editMinisterio" class="form-label">Ministério:</label>
                <input type="text" id="editMinisterio" name="ministerio" class="form-input" value="${solicitacao.ministerio}" required />
            </div>
            <div class="mb-4">
                <label class="form-label">Tipo de Pedido:</label>
                <input type="text" class="form-input" value="${solicitacao.tipo_pedido.charAt(0).toUpperCase() + solicitacao.tipo_pedido.slice(1)}" disabled />
            </div>
            <div class="mb-4">
                <label class="form-label">Status:</label>
                <input type="text" class="form-input" value="${solicitacao.status ? solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1) : 'Pendente'}" disabled />
            </div>
            <div id="editDetalhesEspecificos" class="details-section mt-6">
                <h3>Detalhes Específicos (${solicitacao.tipo_pedido.charAt(0).toUpperCase() + solicitacao.tipo_pedido.slice(1)})</h3>
                </div>
            
            <div class="flex justify-end gap-3 mt-6">
                <button type="button" class="bg-gray-400 text-white px-4 py-2 rounded-lg transition hover:bg-gray-500" onclick="fecharCard()">Cancelar</button>
                <button type="submit" class="btn-primary px-4 py-2">Salvar Alterações</button>
            </div>
        </form>
    `;
    modalContent.innerHTML = cardEditContent;

    const editDetalhesDiv = document.getElementById('editDetalhesEspecificos');

    if (solicitacao.tipo_pedido === 'design') {
        const detalhesDesign = solicitacao.detalhes_solicitacao;
        editDetalhesDiv.innerHTML += `
            <div class="mb-4">
                <label for="editTextoFundamental" class="form-label">Texto Fundamental:</label>
                <textarea id="editTextoFundamental" name="texto_fundamental" class="form-input">${detalhesDesign.texto_fundamental || ''}</textarea>
            </div>
            <div class="mb-4">
                <label for="editDataEventoDesign" class="form-label">Data do Evento:</label>
                <input type="date" id="editDataEventoDesign" name="data_evento" class="form-input" value="${dataEventoDesign}" />
            </div>
            <div class="mb-4">
                <label for="editDataEntregaArte" class="form-label">Data de Entrega da Arte:</label>
                <input type="date" id="editDataEntregaArte" name="data_entrega_arte" class="form-input" value="${dataEntregaArte}" required />
            </div>
            <div class="mb-4">
                <label for="editUsoObjetivoArte" class="form-label">Uso e Objetivo da Arte:</label>
                <textarea id="editUsoObjetivoArte" name="uso_e_objetivo_arte" class="form-input">${detalhesDesign.uso_e_objetivo_arte || ''}</textarea>
            </div>
            <div class="mb-4">
                <label for="editPublicoAlcancado" class="form-label">Público Alcançado:</label>
                <textarea id="editPublicoAlcancado" name="publico_alcancado" class="form-input">${detalhesDesign.publico_alcancado || ''}</textarea>
            </div>
            <div class="mb-4">
                <label for="editFormatosEntrega" class="form-label">Formatos de Entrega (separados por vírgula):</label>
                <input type="text" id="editFormatosEntrega" name="formatos_entrega" class="form-input" value="${detalhesDesign.formatos_entrega ? detalhesDesign.formatos_entrega.join(', ') : ''}" />
            </div>
            <div class="mb-4">
                <label for="editArquivosNecessarios" class="form-label">Arquivos Necessários (separados por vírgula):</label>
                <input type="text" id="editArquivosNecessarios" name="arquivos_necessarios" class="form-input" value="${detalhesDesign.arquivos_necessarios ? detalhesDesign.arquivos_necessarios.join(', ') : ''}" />
            </div>
            <div class="mb-4">
                <label for="editEmailAprovacaoOrcamento" class="form-label">Email Aprovação Orçamento:</label>
                <input type="email" id="editEmailAprovacaoOrcamento" name="email_aprovacao_orcamento" class="form-input" value="${detalhesDesign.email_aprovacao_orcamento || ''}" />
            </div>
            <div class="mb-4">
                <label for="editLinkQrCode" class="form-label">Link QR Code:</label>
                <input type="text" id="editLinkQrCode" name="link_qr_code" class="form-input" value="${detalhesDesign.link_qr_code || ''}" />
            </div>
            <div class="mb-4">
                <label for="editObservacoesComplementares" class="form-label">Observações Complementares:</label>
                <textarea id="editObservacoesComplementares" name="observacoes_complementares" class="form-input">${detalhesDesign.observacoes_complementares || ''}</textarea>
            </div>
            ${detalhesDesign.imagem_referencia ? `<div class="mb-4"><label class="form-label">Imagem de Referência Atual:</label><img src="${detalhesDesign.imagem_referencia}" class="max-w-full rounded-lg shadow-md mt-2" /></div>` : ''}
        `;

    } else if (solicitacao.tipo_pedido === 'video') {
        const detalhesVideo = solicitacao.detalhes_solicitacao;
        editDetalhesDiv.innerHTML += `
            <div class="mb-4">
                <label for="editTituloVideo" class="form-label">Título do Vídeo:</label>
                <input type="text" id="editTituloVideo" name="titulo_video" class="form-input" value="${detalhesVideo.titulo_video || ''}" required />
            </div>
            <div class="mb-4">
                <label for="editTempoDuracaoVideo" class="form-label">Tempo de Duração do Vídeo:</label>
                <input type="text" id="editTempoDuracaoVideo" name="tempo_duracao_video" class="form-input" value="${detalhesVideo.tempo_duracao_video || ''}" />
            </div>
            <div class="mb-4">
                <label for="editOndePassaraVideo" class="form-label">Onde Irá Passar o Vídeo:</label>
                <textarea id="editOndePassaraVideo" name="onde_passara_video" class="form-input">${detalhesVideo.onde_passara_video || ''}</textarea>
            </div>
            <div class="mb-4">
                <label for="editDataEntregaVideo" class="form-label">Data de Entrega do Vídeo:</label>
                <input type="date" id="editDataEntregaVideo" name="data_entrega_video" class="form-input" value="${dataEntregaVideo}" required />
            </div>
            <div class="mb-4">
                <label for="editReferenciaVideo" class="form-label">Link de Referência de Vídeo:</label>
                <input type="text" id="editReferenciaVideo" name="referencia_video" class="form-input" value="${detalhesVideo.referencia_video || ''}" />
            </div>
            <div class="mb-4">
                <label for="editPublicoAlvoVideo" class="form-label">Público Alvo do Vídeo:</label>
                <textarea id="editPublicoAlvoVideo" name="publico_alvo_video" class="form-input">${detalhesVideo.publico_alvo_video || ''}</textarea>
            </div>
            <div class="mb-4">
                <label for="editFonteImagens" class="form-label">Fonte das Imagens:</label>
                <input type="text" id="editFonteImagens" name="fonte_imagens" class="form-input" value="${detalhesVideo.fonte_imagens || ''}" />
            </div>
            <div class="mb-4">
                <label for="editRoteiroVideo" class="form-label">Roteiro do Vídeo:</label>
                <textarea id="editRoteiroVideo" name="roteiro_video" class="form-input">${detalhesVideo.roteiro_video || ''}</textarea>
            </div>
        `;
    }

    document.getElementById('cardDetalhes').classList.remove('hidden');
    document.getElementById('cardDetalhes').classList.add('flex');
}

async function salvarAlteracoesCard() {
    const solicitacaoId = document.getElementById('editSolicitacaoId').value;
    const tipoPedido = document.getElementById('editTipoPedido').value;

    const updatedData = {
        id: solicitacaoId,
        nome: currentEditingSolicitacao.nome,
        numero_cliente: currentEditingSolicitacao.numero_cliente,
        email_cliente: currentEditingSolicitacao.email_cliente,

        ministerio: document.getElementById('editMinisterio').value,
        tipo_pedido: tipoPedido,
        detalhes_solicitacao: {}
    };

    if (tipoPedido === 'design') {
        updatedData.detalhes_solicitacao = {
            texto_fundamental: document.getElementById('editTextoFundamental').value,
            data_evento: document.getElementById('editDataEventoDesign').value || null,
            data_entrega_arte: document.getElementById('editDataEntregaArte').value,
            uso_e_objetivo_arte: document.getElementById('editUsoObjetivoArte').value,
            publico_alcancado: document.getElementById('editPublicoAlcancado').value,
            formatos_entrega: document.getElementById('editFormatosEntrega').value.split(',').map(item => item.trim()).filter(item => item !== ''),
            arquivos_necessarios: document.getElementById('editArquivosNecessarios').value.split(',').map(item => item.trim()).filter(item => item !== ''),
            email_aprovacao_orcamento: document.getElementById('editEmailAprovacaoOrcamento').value,
            link_qr_code: document.getElementById('editLinkQrCode').value,
            observacoes_complementares: document.getElementById('editObservacoesComplementares').value,
            imagem_referencia: currentEditingSolicitacao.detalhes_solicitacao.imagem_referencia
        };
    } else if (tipoPedido === 'video') {
        updatedData.detalhes_solicitacao = {
            titulo_video: document.getElementById('editTituloVideo').value,
            tempo_duracao_video: document.getElementById('editTempoDuracaoVideo').value,
            onde_passara_video: document.getElementById('editOndePassaraVideo').value,
            data_entrega_video: document.getElementById('editDataEntregaVideo').value,
            referencia_video: document.getElementById('editReferenciaVideo').value,
            publico_alvo_video: document.getElementById('editPublicoAlvoVideo').value,
            fonte_imagens: document.getElementById('editFonteImagens').value,
            roteiro_video: document.getElementById('editRoteiroVideo').value
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/solicitacoes/${solicitacaoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        const result = await response.json();

        if (result.success) {
            alert('Solicitação atualizada com sucesso!');
            fecharCard();
            await fetchAndRenderSolicitacoes(currentPage, currentFilter);
        } else {
            alert('Erro ao atualizar solicitação: ' + result.message);
        }
    } catch (error) {
        console.error('Erro na requisição de atualização:', error);
        alert('Erro ao conectar com o servidor para atualizar a solicitação.');
    }
}


function adicionarSolicitacaoNaTela(solicitacao, prepend = false) {
    solicitacoesMap[solicitacao.id + '-' + solicitacao.tipo_pedido] = solicitacao;

    const container = document.getElementById('listaSolicitacoes');
    const div = document.createElement('div');
    div.id = `solicitacao-${solicitacao.id}-${solicitacao.tipo_pedido}`;
    div.className = 'solicitacao-card';
    div.dataset.solicitacaoId = solicitacao.id;
    div.dataset.tipoPedido = solicitacao.tipo_pedido;

    let displayPrazo = 'N/A';
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };

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

    div.innerHTML = `
        <div>
            <strong>${solicitacao.nome}</strong><br>
            <span class="text-sm text-gray-600">${specificTitle}</span><br> ${displayPrazo}
            <br>
            Ministério: ${solicitacao.ministerio}
            <br>
            Tipo: ${solicitacao.tipo_pedido.charAt(0).toUpperCase() + solicitacao.tipo_pedido.slice(1)}
            <br>
            Status: ${solicitacao.status ? solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1) : 'Pendente'}
            <br>
            Telefone: ${formatPhoneNumber(solicitacao.numero_cliente)}
        </div>
        <div class="flex items-center gap-2">
            <button class="btn-link"
                     onclick='abrirCard("${solicitacao.id}", "${solicitacao.tipo_pedido}")'>ABRIR CARD</button>
            <button class="btn-icon-success" onclick='enviarParaWebhook(${JSON.stringify(solicitacao)})'>✔</button> 
            <button class="btn-icon-danger" onclick='abrirCancelamento("${solicitacao.id}", "${solicitacao.tipo_pedido}")'>✖</button>
        </div>
    `;

    if (prepend) {
        container.prepend(div);
    } else {
        container.appendChild(div);
    }
}


// === FUNÇÃO DE BUSCA E RENDERIZAÇÃO PRINCIPAL (MODIFICADA) ===
async function fetchAndRenderSolicitacoes(page = 1, tipo = 'todos') {
    currentPage = page;
    currentFilter = tipo;

    try {
        const response = await fetch(`${API_BASE_URL}/solicitacoes?page=${page}&tipo=${tipo}`);
        const result = await response.json();

        const listaSolicitacoesDiv = document.getElementById('listaSolicitacoes');
        listaSolicitacoesDiv.innerHTML = ''; // Limpa a lista atual

        if (result.success && Array.isArray(result.data)) {
            // Limpa o mapa apenas para as solicitações que serão renderizadas
            Object.keys(solicitacoesMap).forEach(key => delete solicitacoesMap[key]);

            if (result.data.length === 0) {
                listaSolicitacoesDiv.innerHTML = '<p class="text-center text-gray-500 my-8">Nenhuma solicitação encontrada para esta página ou filtro.</p>';
            } else {
                result.data.forEach(solicitacao => {
                    adicionarSolicitacaoNaTela(solicitacao);
                });
            }

            // Renderiza os controles de paginação com o total de itens
            renderPaginationControls(result.total, page);
        } else {
            console.error('Erro ao carregar solicitações:', result.message);
            listaSolicitacoesDiv.innerHTML = '<p class="text-center text-red-500 my-8">Erro ao carregar as solicitações.</p>';
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        document.getElementById('listaSolicitacoes').innerHTML = '<p class="text-center text-red-500 my-8">Erro de conexão com o servidor.</p>';
    }
}
// ==============================================================

// === NOVA FUNÇÃO PARA RENDERIZAR OS CONTROLES DE PAGINAÇÃO ===
function renderPaginationControls(totalItems, activePage) {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = '';

    if (totalItems <= ITEMS_PER_PAGE) {
        return; // Não mostra paginação se não houver itens suficientes
    }

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // Botão "Anterior"
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Anterior';
    prevButton.className = 'pagination-btn';
    if (activePage === 1) {
        prevButton.disabled = true;
        prevButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
    prevButton.onclick = () => fetchAndRenderSolicitacoes(activePage - 1, currentFilter);
    paginationControls.appendChild(prevButton);

    // Botões de número de página
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.className = 'pagination-btn';
        if (i === activePage) {
            pageButton.classList.add('active');
        }
        pageButton.onclick = () => fetchAndRenderSolicitacoes(i, currentFilter);
        paginationControls.appendChild(pageButton);
    }

    // Botão "Próximo"
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Próximo';
    nextButton.className = 'pagination-btn';
    if (activePage === totalPages) {
        nextButton.disabled = true;
        nextButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
    nextButton.onclick = () => fetchAndRenderSolicitacoes(activePage + 1, currentFilter);
    paginationControls.appendChild(nextButton);
}
// ==============================================================

function fecharCard() {
    document.getElementById('cardDetalhes').classList.add('hidden');
    document.getElementById('cardDetalhes').classList.remove('flex');
}

async function enviarParaWebhook(solicitacao) {
    if (!confirm('Tem certeza que deseja APROVAR e enviar esta solicitação para o Trello?')) return;

    try {
        const webhookResponse = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(solicitacao),
        });

        if (!webhookResponse.ok) {
            const errorText = await webhookResponse.text();
            throw new Error(`Erro no webhook do Trello: ${webhookResponse.status} - ${errorText}`);
        }

        const statusUpdateResponse = await fetch(`${API_BASE_URL}/solicitacoes/${solicitacao.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status_interno: 'Aprovado',
                tipo_pedido: solicitacao.tipo_pedido
            }),
        });

        const statusUpdateResult = await statusUpdateResponse.json();

        if (!statusUpdateResult.success) {
            throw new Error(`Erro ao atualizar status interno: ${statusUpdateResult.message}`);
        }

        alert('Solicitação enviada para o Trello e status atualizado com sucesso!');

        // Recarrega a página atual para refletir a remoção do item
        fetchAndRenderSolicitacoes(currentPage, currentFilter);

    } catch (error) {
        console.error('Erro no processo de aprovação:', error);
        alert(`Ocorreu um erro: ${error.message}`);
    }
}

function abrirCancelamento(solicitacaoId, tipoPedido) {
    const solicitacao = solicitacoesMap[solicitacaoId + '-' + tipoPedido];
    if (!solicitacao) {
        alert('Erro: Solicitação não encontrada.');
        return;
    }
    currentCancellingSolicitacao = solicitacao;
    document.getElementById('cancelModal').classList.remove('hidden');
    document.getElementById('motivoCancelamento').value = '';
    clearValidationErrors();
}

function fecharCancelamento() {
    document.getElementById('cancelModal').classList.add('hidden');
    currentCancellingSolicitacao = null;
}

async function confirmarCancelamento() {
    clearValidationErrors();
    const motivoCancelamento = document.getElementById('motivoCancelamento').value.trim();
    if (!motivoCancelamento) {
        addError('motivoCancelamento', 'Motivo do cancelamento é obrigatório.');
        return;
    }
    if (!currentCancellingSolicitacao) {
        alert('Erro: Nenhuma solicitação selecionada.');
        return;
    }
    const payload = {
        solicitacao: currentCancellingSolicitacao,
        motivo_cancelamento: motivoCancelamento
    };
    try {
        const response = await fetch(CANCEL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (response.ok) {
            alert('Informação de cancelamento enviada ao webhook com sucesso!');
            fecharCancelamento();
            // Recarrega a página atual para refletir a remoção
            fetchAndRenderSolicitacoes(currentPage, currentFilter);
        } else {
            throw new Error(result.message || 'Erro desconhecido no webhook.');
        }
    } catch (error) {
        console.error('Erro na requisição de cancelamento:', error);
        alert(`Erro ao conectar com o servidor de cancelamento: ${error.message}`);
    }
}

function fecharModalRecusa() {
    document.getElementById('cancelModal').classList.add('hidden');
    document.getElementById('cancelForm').reset();
    clearValidationErrors();
}

async function fetchAllClientsForSearch() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            allClientsForSelection = result.data;
        } else {
            console.error('Erro ao carregar clientes para pesquisa:', result.message);
        }
    }
    catch (error) {
        console.error('Erro na requisição de clientes para pesquisa:', error);
    }
}

function searchClientsForSelection() {
    const searchTerm = document.getElementById('clienteSearch').value.toLowerCase();
    const searchResultsDiv = document.getElementById('searchResults');
    const nomeInput = document.getElementById('nome');
    const numeroClienteInput = document.getElementById('numero_cliente');
    const emailClienteInput = document.getElementById('email_cliente');
    const selectedClientIdInput = document.getElementById('selectedClientId');

    searchResultsDiv.innerHTML = '';

    if (searchTerm.length === 0) {
        selectedClientIdInput.value = '';
        nomeInput.value = '';
        numeroClienteInput.value = '';
        emailClienteInput.value = '';
        nomeInput.disabled = false;
        numeroClienteInput.disabled = false;
        emailClienteInput.disabled = false;
        searchResultsDiv.classList.add('hidden');
        clearValidationErrors();
        return;
    }

    const filteredClients = allClientsForSelection.filter(client => {
        const cleanedPhoneNumber = (client.numero_cliente || '').replace(/\D/g, '');
        const cleanedSearchTerm = searchTerm.replace(/\D/g, '');

        const nameMatches = client.nome.toLowerCase().startsWith(searchTerm);
        const phoneMatches = cleanedPhoneNumber.startsWith(cleanedSearchTerm);
        const emailMatches = (client.email_cliente || '').toLowerCase().startsWith(searchTerm);

        const isLikelyName = /[a-z]/.test(searchTerm) && !/\d/.test(searchTerm);
        const isLikelyPhone = /\d/.test(searchTerm) && !/[a-z]/.test(searchTerm);
        const isLikelyEmail = (searchTerm.includes('@') && searchTerm.includes('.')) || (!isLikelyName && !isLikelyPhone);

        if (isLikelyName) {
            return nameMatches;
        } else if (isLikelyPhone) {
            return phoneMatches;
        } else if (isLikelyEmail) {
            return emailMatches;
        }
        else {
            return nameMatches || phoneMatches || emailMatches;
        }
    });

    if (filteredClients.length > 0) {
        filteredClients.forEach(client => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerText = `${client.nome} - ${formatPhoneNumber(client.numero_cliente)} - ${client.email_cliente}`;
            div.onclick = () => selectClientFromResult(client.id);
            searchResultsDiv.appendChild(div);
        });
        searchResultsDiv.classList.remove('hidden');
    } else {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'search-result-item text-gray-500';
        noResultsDiv.innerText = 'Nenhum cliente encontrado.';
        searchResultsDiv.appendChild(noResultsDiv);
        searchResultsDiv.classList.remove('hidden');
    }
}

function selectClientFromResult(clientId) {
    const client = allClientsForSelection.find(c => c.id == clientId);
    if (client) {
        document.getElementById('selectedClientId').value = client.id;
        document.getElementById('nome').value = client.nome;
        document.getElementById('numero_cliente').value = client.numero_cliente;
        document.getElementById('email_cliente').value = client.email_cliente;

        document.getElementById('nome').disabled = true;
        document.getElementById('numero_cliente').disabled = true;
        document.getElementById('email_cliente').disabled = true;

        document.getElementById('searchResults').classList.add('hidden');
        document.getElementById('clienteSearch').value = client.nome;
        clearValidationErrors();
    }
}

// === FUNÇÃO DE FILTRO MODIFICADA ===
function handleFilterCheckboxChange(changedCheckbox) {
    const filtroTodos = document.getElementById('filtroTodos');
    const filtroDesign = document.getElementById('filtroDesign');
    const filtroVideo = document.getElementById('filtroVideo');

    // Lógica para garantir que apenas uma opção (ou 'Todos') esteja selecionada
    if (changedCheckbox.id === 'filtroTodos') {
        if (changedCheckbox.checked) {
            filtroDesign.checked = false;
            filtroVideo.checked = false;
        } else {
            if (!filtroDesign.checked && !filtroVideo.checked) {
                filtroTodos.checked = true; // Impede que todos fiquem desmarcados
            }
        }
    } else { // Se 'Design' ou 'Vídeo' foi clicado
        if (changedCheckbox.checked) {
            filtroTodos.checked = false;
        } else {
            if (!filtroDesign.checked && !filtroVideo.checked) {
                filtroTodos.checked = true;
            }
        }
    }

    // Determina o valor do filtro e busca os dados do servidor
    let tipoFiltro = 'todos';
    if (filtroDesign.checked) tipoFiltro = 'design';
    if (filtroVideo.checked) tipoFiltro = 'video';

    // Ao filtrar, sempre volta para a página 1 e busca os dados
    fetchAndRenderSolicitacoes(1, tipoFiltro);
}
// ===================================

// A função filtrarSolicitacoesPorTipo() antiga foi removida, pois não é mais necessária.

async function enviarSolicitacao() {
    clearValidationErrors();
    const form = document.getElementById('solicitacaoForm');
    const data = {};
    let isValid = true;

    const nome = document.getElementById('nome').value.trim();
    const numero_cliente = document.getElementById('numero_cliente').value.trim();
    const email_cliente = document.getElementById('email_cliente').value.trim();
    const ministerio = document.getElementById('ministerio').value.trim();
    const tipo_pedido = document.getElementById('tipo_pedido').value;
    const selectedClientId = document.getElementById('selectedClientId').value;

    if (!nome) { addError('nome', 'Nome é obrigatório.'); isValid = false; }
    if (!numero_cliente) { addError('numero_cliente', 'Telefone é obrigatório.'); isValid = false; }
    if (!email_cliente) { addError('email_cliente', 'Email é obrigatório.'); isValid = false; }
    if (!ministerio) { addError('ministerio', 'Ministério é obrigatório.'); isValid = false; }
    if (!tipo_pedido) { addError('tipo_pedido', 'Tipo de pedido é obrigatório.'); isValid = false; }

    data.nome = nome;
    data.numero_cliente = numero_cliente.replace(/\D/g, ''),
        data.email_cliente = email_cliente;
    data.ministerio = ministerio;
    data.tipo_pedido = tipo_pedido;
    data.detalhes_solicitacao = {};
    data.cliente_id = selectedClientId || null;

    if (tipo_pedido === 'design') {
        const data_entrega_arte = document.getElementById('data_entrega_arte').value;
        const uso_e_objetivo_arte = document.getElementById('uso_e_objetivo_arte').value.trim();
        const texto_fundamental = document.getElementById('texto_fundamental').value.trim();
        const data_evento = document.getElementById('data_evento_design').value || null;
        const publico_alcancado = document.getElementById('publico_alcancado').value.trim();
        const formatos_entrega_str = document.getElementById('formatos_entrega').value.trim();
        const arquivos_necessarios_str = document.getElementById('arquivos_necessarios').value.trim();
        const email_aprovacao_orcamento = document.getElementById('email_aprovacao_orcamento').value.trim();
        const link_qr_code = document.getElementById('link_qr_code').value.trim();
        const observacoes_complementares = document.getElementById('observacoes_complementares').value.trim();
        const imagem_referencia_file = document.getElementById('imagem_referencia').files[0];

        if (!data_entrega_arte) { addError('data_entrega_arte', 'Data de entrega é obrigatória.'); isValid = false; }
        if (!texto_fundamental) { addError('texto_fundamental', 'Texto fundamental é obrigatório.'); isValid = false; }

        data.detalhes_solicitacao = {
            data_entrega_arte: data_entrega_arte,
            uso_e_objetivo_arte: uso_e_objetivo_arte,
            texto_fundamental: texto_fundamental,
            data_evento: data_evento,
            publico_alcancado: publico_alcancado,
            formatos_entrega: formatos_entrega_str ? formatos_entrega_str.split(',').map(item => item.trim()) : [],
            arquivos_necessarios: arquivos_necessarios_str ? arquivos_necessarios_str.split(',').map(item => item.trim()) : [],
            email_aprovacao_orcamento: email_aprovacao_orcamento,
            link_qr_code: link_qr_code,
            observacoes_complementares: observacoes_complementares,
            imagem_referencia: ''
        };

        if (isValid && imagem_referencia_file) {
            const formData = new FormData();
            formData.append('refImage', imagem_referencia_file);

            try {
                const uploadResponse = await fetch(`${API_BASE_URL}/solicitacoes/upload_image`, {
                    method: 'POST',
                    body: formData,
                });
                const uploadResult = await uploadResponse.json();

                if (uploadResult.success) {
                    data.detalhes_solicitacao.imagem_referencia = uploadResult.imageUrl;
                    await sendDataToBackend(data);
                } else {
                    alert('Erro ao enviar imagem: ' + uploadResult.message);
                }
            } catch (error) {
                console.error('Erro na requisição de upload de imagem:', error);
                alert('Erro ao conectar com o servidor para upload da imagem.');
            }
        } else if (isValid) {
            await sendDataToBackend(data);
        }

    } else if (tipo_pedido === 'video') {
        const titulo_video = document.getElementById('titulo_video').value.trim();
        const tempo_duracao_video = document.getElementById('tempo_duracao_video').value.trim();
        const onde_passara_video = document.getElementById('onde_passara_video').value.trim();
        const data_entrega_video = document.getElementById('data_entrega_video').value;
        const referencia_video = document.getElementById('referencia_video').value.trim();
        const publico_alvo_video = document.getElementById('publico_alvo_video').value.trim();
        const fonte_imagens = document.getElementById('fonte_imagens').value.trim();
        const roteiro_video = document.getElementById('roteiro_video').value.trim();

        if (!titulo_video) { addError('titulo_video', 'Título do vídeo é obrigatório.'); isValid = false; }
        if (!data_entrega_video) { addError('data_entrega_video', 'Data de entrega é obrigatória.'); isValid = false; }
        if (!roteiro_video) { addError('roteiro_video', 'Roteiro é obrigatório.'); isValid = false; }

        data.detalhes_solicitacao = {
            titulo_video: titulo_video,
            tempo_duracao_video: tempo_duracao_video,
            onde_passara_video: onde_passara_video,
            data_entrega_video: data_entrega_video,
            referencia_video: referencia_video,
            publico_alvo_video: publico_alvo_video,
            fonte_imagens: fonte_imagens,
            roteiro_video: roteiro_video
        };

        if (isValid) {
            await sendDataToBackend(data);
        }
    }
}

function addError(fieldId, message) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.classList.add('input-error');
        let errorMessage = input.nextElementSibling;
        if (!errorMessage || !errorMessage.classList.contains('error-message')) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message text-red-500 text-xs mt-1';
            input.parentNode.insertBefore(errorMessage, input.nextSibling);
        }
        errorMessage.innerText = message;
        errorMessage.classList.add('active');
    }
}

async function sendDataToBackend(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/solicitacoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.status === 409) {
            alert('Erro ao criar solicitação: ' + result.message);
            if (result.message.includes('telefone')) {
                addError('numero_cliente', result.message);
            }
            if (result.message.includes('email')) {
                addError('email_cliente', result.message);
            }
            if (result.message.includes('dados do cliente') && result.message.includes('não correspondem')) {
                addError('clienteSearch', result.message);
            }

        } else if (result.success) {
            alert('Solicitação criada com sucesso!');
            fecharFormulario();
            // Após criar, recarrega a primeira página com o filtro atual para ver o novo item.
            await fetchAndRenderSolicitacoes(1, currentFilter);
        } else {
            alert('Erro ao criar solicitação: ' + result.message);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    }
}


// A função checkForNewSolicitacoes() foi removida pois a recarga da página
// ao aprovar/cancelar já atualiza a lista de forma mais consistente com a paginação.


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('clienteSearch').addEventListener('input', searchClientsForSelection);
    // Carga inicial: busca a página 1 com o filtro 'todos'
    fetchAndRenderSolicitacoes(1, 'todos');
});
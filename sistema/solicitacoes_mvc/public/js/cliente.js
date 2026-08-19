// public/js/cliente.js

const API_BASE_URL = 'http://localhost:80/solicitacoes_mvc/api';
const solicitacoesMap = {};
let currentClient = null; // Armazena os dados do cliente logado

document.getElementById('accessBtn').addEventListener('click', async () => {
    const email = document.getElementById('clientEmail').value.trim();
    if (!email) {
        alert('Por favor, digite seu e-mail.');
        return;
    }
    
    // Primeiro, vamos buscar os dados do cliente pelo email para ter certeza que ele existe e pegar o ID.
    // Como a API de clientes não tem uma rota 'getByEmail', faremos uma busca geral filtrando.
    try {
        const clientResponse = await fetch(`${API_BASE_URL}/clientes?email=${email}`);
        const clientResult = await clientResponse.json();

        if (clientResult.success && clientResult.data.length > 0) {
            currentClient = clientResult.data[0];
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('solicitationsList').classList.remove('hidden');
            document.getElementById('clientNameDisplay').innerText = currentClient.nome;
            document.getElementById('clientEmailDisplay').innerText = currentClient.email_cliente;
            
            // Preenche os campos do modal de nova solicitação
            document.getElementById('nome').value = currentClient.nome;
            document.getElementById('numero_cliente').value = formatPhoneNumber(currentClient.numero_cliente);
            document.getElementById('email_cliente').value = currentClient.email_cliente;

            // Busca e renderiza as solicitações do cliente
            await fetchAndRenderClientSolicitations(currentClient.email_cliente);

        } else {
            alert('Cliente não encontrado. Verifique o e-mail ou crie uma solicitação para se cadastrar.');
            currentClient = null;
        }
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        alert('Erro ao conectar com o servidor para buscar cliente.');
    }
});


function abrirFormulario() {
    if (!currentClient) {
        alert('Por favor, acesse suas solicitações com seu e-mail primeiro.');
        return;
    }
    document.getElementById('formModal').classList.remove('hidden');
    document.getElementById('formModal').classList.add('flex');
    document.getElementById('solicitacaoForm').reset();
    document.getElementById('detalhesDesign').classList.add('hidden');
    document.getElementById('detalhesVideo').classList.add('hidden');
    clearValidationErrors();
}

function fecharFormulario() {
    document.getElementById('formModal').classList.add('hidden');
    document.getElementById('formModal').classList.remove('flex');
    document.getElementById('solicitacaoForm').reset();
    clearValidationErrors();
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

function clearValidationErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('active'));
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

// NOVO: Função para enviar solicitação do lado do cliente
async function enviarSolicitacaoCliente() {
    clearValidationErrors();
    const data = {};
    let isValid = true;
    
    if (!currentClient) {
        alert('Dados do cliente não encontrados. Recarregue a página e faça o login.');
        return;
    }

    const ministerio = document.getElementById('ministerio').value.trim();
    const tipo_pedido = document.getElementById('tipo_pedido').value;

    if (!ministerio) { addError('ministerio', 'Ministério é obrigatório.'); isValid = false; }
    if (!tipo_pedido) { addError('tipo_pedido', 'Tipo de pedido é obrigatório.'); isValid = false; }

    data.nome = currentClient.nome;
    data.numero_cliente = currentClient.numero_cliente;
    data.email_cliente = currentClient.email_cliente;
    data.cliente_id = currentClient.id; // Envia o ID do cliente já existente
    data.ministerio = ministerio;
    data.tipo_pedido = tipo_pedido;
    data.detalhes_solicitacao = {};

    // Detalhes específicos por tipo de pedido
    if (tipo_pedido === 'design') {
        const data_entrega_arte = document.getElementById('data_entrega_arte').value;
        const texto_fundamental = document.getElementById('texto_fundamental').value.trim();
        const data_evento = document.getElementById('data_evento_design').value || null;
        if (!data_entrega_arte) { addError('data_entrega_arte', 'Data de entrega é obrigatória.'); isValid = false; }
        if (!texto_fundamental) { addError('texto_fundamental', 'Texto fundamental é obrigatório.'); isValid = false; }
        data.detalhes_solicitacao = {
            data_entrega_arte, texto_fundamental, data_evento,
            uso_e_objetivo_arte: document.getElementById('uso_e_objetivo_arte').value.trim(),
            publico_alcancado: document.getElementById('publico_alcancado').value.trim(),
            formatos_entrega: document.getElementById('formatos_entrega').value.trim().split(',').map(item => item.trim()),
            arquivos_necessarios: document.getElementById('arquivos_necessarios').value.trim().split(',').map(item => item.trim()),
            email_aprovacao_orcamento: document.getElementById('email_aprovacao_orcamento').value.trim(),
            link_qr_code: document.getElementById('link_qr_code').value.trim(),
            observacoes_complementares: document.getElementById('observacoes_complementares').value.trim(),
            imagem_referencia: ''
        };
        // A lógica de upload de imagem precisa ser implementada aqui se for necessário
    } else if (tipo_pedido === 'video') {
        const titulo_video = document.getElementById('titulo_video').value.trim();
        const data_entrega_video = document.getElementById('data_entrega_video').value;
        const roteiro_video = document.getElementById('roteiro_video').value.trim();
        if (!titulo_video) { addError('titulo_video', 'Título do vídeo é obrigatório.'); isValid = false; }
        if (!data_entrega_video) { addError('data_entrega_video', 'Data de entrega é obrigatória.'); isValid = false; }
        if (!roteiro_video) { addError('roteiro_video', 'Roteiro é obrigatório.'); isValid = false; }
        data.detalhes_solicitacao = {
            titulo_video, data_entrega_video, roteiro_video,
            tempo_duracao_video: document.getElementById('tempo_duracao_video').value.trim(),
            onde_passara_video: document.getElementById('onde_passara_video').value.trim(),
            referencia_video: document.getElementById('referencia_video').value.trim(),
            publico_alvo_video: document.getElementById('publico_alvo_video').value.trim(),
            fonte_imagens: document.getElementById('fonte_imagens').value.trim()
        };
    }

    if (isValid) {
        await sendDataToBackend(data);
    }
}

async function sendDataToBackend(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/solicitacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
            alert('Solicitação criada com sucesso!');
            fecharFormulario();
            await fetchAndRenderClientSolicitations(currentClient.email_cliente); // Recarrega a lista do cliente
        } else {
            alert('Erro ao criar solicitação: ' + result.message);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    }
}

async function fetchAndRenderClientSolicitations(email) {
    document.getElementById('mySolicitacoesContainer').innerHTML = 'Carregando solicitações...';
    try {
        const response = await fetch(`${API_BASE_URL}/solicitacoes/by_client`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email_cliente: email }),
        });
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            document.getElementById('mySolicitacoesContainer').innerHTML = '';
            if (result.data.length === 0) {
                document.getElementById('mySolicitacoesContainer').innerHTML = '<p class="text-gray-500">Nenhuma solicitação encontrada para este e-mail.</p>';
            }
            result.data.forEach(solicitacao => adicionarSolicitacaoNaTelaCliente(solicitacao));
        } else {
            document.getElementById('mySolicitacoesContainer').innerHTML = `<p class="text-red-500">${result.message}</p>`;
        }
    } catch (error) {
        console.error('Erro ao buscar solicitações do cliente:', error);
        document.getElementById('mySolicitacoesContainer').innerHTML = '<p class="text-red-500">Erro ao buscar suas solicitações. Verifique sua conexão.</p>';
    }
}

function adicionarSolicitacaoNaTelaCliente(solicitacao) {
    solicitacoesMap[solicitacao.id + '-' + solicitacao.tipo_pedido] = solicitacao;

    const container = document.getElementById('mySolicitacoesContainer');
    const div = document.createElement('div');
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

    let specificTitle = solicitacao.tipo_pedido === 'design' ? solicitacao.detalhes_solicitacao.texto_fundamental : solicitacao.detalhes_solicitacao.titulo_video;
    specificTitle = specificTitle || 'Sem Título';

    div.innerHTML = `
        <div>
            <strong>${specificTitle}</strong><br>
            <span class="text-sm text-gray-600">${displayPrazo}</span>
            <br>
            Tipo: ${solicitacao.tipo_pedido.charAt(0).toUpperCase() + solicitacao.tipo_pedido.slice(1)}
            <br>
            Status: ${solicitacao.status ? solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1) : 'Pendente'}
            <br>
            ID do Pedido: <span class="break-all-words font-mono text-xs">${solicitacao.id}</span>
        </div>
        <div class="flex items-center gap-2">
            <button class="btn-link" onclick='abrirCardDetalhes("${solicitacao.id}", "${solicitacao.tipo_pedido}")'>Ver Detalhes</button>
        </div>
    `;
    container.prepend(div);
}

function abrirCardDetalhes(solicitacaoId, tipoPedido) {
    const solicitacao = solicitacoesMap[solicitacaoId + '-' + tipoPedido];
    if (!solicitacao) {
        alert('Erro ao carregar detalhes da solicitação.');
        return;
    }
    
    // Preenche o modal de detalhes (igual à lógica da `main.js`)
    document.getElementById('cardTitulo').innerText = solicitacao.nome;
    document.getElementById('cardMinisterio').innerText = `Ministério: ${solicitacao.ministerio}`;
    document.getElementById('cardTipoPedido').innerText = `Tipo: ${solicitacao.tipo_pedido}`;
    document.getElementById('cardStatus').innerText = `Status: ${solicitacao.status ? solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1) : 'Pendente'}`;
    
    let displayPrazo = 'N/A';
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    if (solicitacao.tipo_pedido === 'design' && solicitacao.detalhes_solicitacao.data_entrega_arte) {
        displayPrazo = `Prazo: ${new Date(solicitacao.detalhes_solicitacao.data_entrega_arte).toLocaleDateString('pt-BR', dateOptions)}`;
    } else if (solicitacao.tipo_pedido === 'video' && solicitacao.detalhes_solicitacao.data_entrega_video) {
        displayPrazo = `Prazo: ${new Date(solicitacao.detalhes_solicitacao.data_entrega_video).toLocaleDateString('pt-BR', dateOptions)}`;
    }
    document.getElementById('cardPrazo').innerText = displayPrazo;

    const cardDescricaoDisplay = document.getElementById('cardDescricao');
    const cardImagemDisplay = document.getElementById('cardImagem');
    const cardDetalhesEspecificosDisplay = document.getElementById('cardDetalhesEspecificos');
    
    cardDescricaoDisplay.innerText = '';
    cardDetalhesEspecificosDisplay.innerHTML = '';

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
        } else {
            cardImagemDisplay.classList.add('hidden');
        }
    } else if (solicitacao.tipo_pedido === 'video') {
        const detalhesVideo = solicitacao.detalhes_solicitacao;
        cardDescricaoDisplay.innerText = detalhesVideo.roteiro_video || 'Sem roteiro';
        cardDetalhesEspecificosDisplay.innerHTML += `
            <p class="break-all-words"><strong>Título do Vídeo:</strong> ${detalhesVideo.titulo_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Duração:</strong> ${detalhesVideo.tempo_duracao_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Onde Passará:</strong> ${detalhesVideo.onde_passara_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Referência:</strong> ${detalhesVideo.referencia_video ? `<a href="${detalhesVideo.referencia_video}" target="_blank" class="text-blue-500 underline break-all-words">${detalhesVideo.referencia_video}</a>` : 'N/A'}</p>
            <p class="break-all-words"><strong>Público Alvo:</strong> ${detalhesVideo.publico_alvo_video || 'N/A'}</p>
            <p class="break-all-words"><strong>Fonte Imagens:</strong> ${detalhesVideo.fonte_imagens || 'N/A'}</p>
            <p class="break-all-words"><strong>Roteiro do Vídeo:</strong> ${detalhesVideo.roteiro_video || 'N/A'}</p>
        `;
    }

    document.getElementById('cardDetalhes').classList.remove('hidden');
    document.getElementById('cardDetalhes').classList.add('flex');
}

function fecharCard() {
    document.getElementById('cardDetalhes').classList.add('hidden');
    document.getElementById('cardDetalhes').classList.remove('flex');
}
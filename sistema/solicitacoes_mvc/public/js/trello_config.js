// public/js/trello_config.js

const TRELLO_WEBHOOK_LISTS_URL = 'https://sistema-crescer-n8n.vuvd0x.easypanel.host/webhook/pegar-listas';
const TRELLO_WEBHOOK_SAVE_URL = 'https://sistema-crescer-n8n.vuvd0x.easypanel.host/webhook/atualizar-dados';
const LOCAL_STORAGE_KEY = 'trelloConfig'; // Chave para armazenar no localStorage

// Elementos do DOM
const boardIdInput = document.getElementById('boardId');
const fetchListsBtn = document.getElementById('fetchListsBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const listSelectionFields = document.getElementById('listSelectionFields');
const designListSelect = document.getElementById('designList');
const videoListSelect = document.getElementById('videoList');
const finishedListSelect = document.getElementById('finishedList');
const adjustmentListSelect = document.getElementById('adjustmentList');
const approvedListSelect = document.getElementById('approvedList');
const trelloConfigForm = document.getElementById('trelloConfigForm');

// Event Listeners
fetchListsBtn.addEventListener('click', fetchTrelloLists);
trelloConfigForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Impede o envio padrao do formulario
    saveTrelloConfigToWebhook(); // Chama a nova funcao
});

// Função para limpar mensagens de erro
function clearError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = '';
        document.getElementById(fieldId).classList.remove('input-error');
    }
}

// Função para exibir mensagem de erro
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('active'); // Garante que a mensagem de erro é visível
        document.getElementById(fieldId).classList.add('input-error');
    }
}

// Carregar configurações salvas ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const savedConfig = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (savedConfig) {
        boardIdInput.value = savedConfig.boardId || '';
        if (savedConfig.listsData) {
            populateListSelects(savedConfig.listsData);
            designListSelect.value = savedConfig.designListId || '';
            videoListSelect.value = savedConfig.videoListId || '';
            finishedListSelect.value = savedConfig.finishedListId || '';
            adjustmentListSelect.value = savedConfig.adjustmentListId || '';
            approvedListSelect.value = savedConfig.approvedListId || '';
            listSelectionFields.classList.remove('hidden');
        }
    }
});

// Função para buscar as listas do Trello via webhook
async function fetchTrelloLists() {
    clearError('boardId');
    const boardId = boardIdInput.value.trim();

    if (!boardId) {
        showError('boardId', 'Por favor, informe o ID do Board do Trello.');
        return;
    }

    if (!TRELLO_WEBHOOK_LISTS_URL) {
        alert('URL do Webhook para pegar listas do Trello não configurada. Verifique trello_config.js');
        return;
    }

    loadingSpinner.classList.remove('hidden');
    fetchListsBtn.disabled = true;

    const allSelects = [designListSelect, videoListSelect, finishedListSelect, adjustmentListSelect, approvedListSelect];
    allSelects.forEach(sel => {
        sel.disabled = true;
        sel.innerHTML = '<option value="">Carregando...</option>';
    });


    try {
        const response = await fetch(TRELLO_WEBHOOK_LISTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ boardId: boardId }),
        });

        let result = await response.json();

        if (Array.isArray(result) && result.length === 1 && typeof result[0] === 'object' && result[0] !== null) {
            result = result[0];
        }

        if (response.ok && result && result.dados && Array.isArray(result.dados)) {
            populateListSelects(result.dados);
            listSelectionFields.classList.remove('hidden');
            alert('Listas carregadas com sucesso!');
            const savedConfig = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
            savedConfig.listsData = result.dados;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedConfig));

        } else {
            showError('boardId', result.message || `Erro ao carregar listas do Trello. Status: ${response.status}. Resposta: ` + JSON.stringify(result));
            allSelects.forEach(sel => sel.innerHTML = '<option value="">Erro ao carregar</option>');
        }
    } catch (error) {
        console.error('Erro na requisição do webhook:', error);
        showError('boardId', 'Erro de conexão ou no webhook. Verifique a URL e sua conexão.');
        allSelects.forEach(sel => sel.innerHTML = '<option value="">Erro de conexão</option>');
    } finally {
        loadingSpinner.classList.add('hidden');
        fetchListsBtn.disabled = false;
        allSelects.forEach(sel => sel.disabled = false);
    }
}

// Preencher os dropdowns com as listas recebidas
function populateListSelects(lists) {
    const allSelects = [designListSelect, videoListSelect, finishedListSelect, adjustmentListSelect, approvedListSelect];
    const defaultOption = '<option value="">Selecione uma lista...</option>';

    allSelects.forEach(sel => {
        sel.innerHTML = defaultOption;
    });

    lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = list.name;
        allSelects.forEach(sel => {
            sel.appendChild(option.cloneNode(true));
        });
    });

    const savedConfig = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (savedConfig) {
        designListSelect.value = savedConfig.designListId || '';
        videoListSelect.value = savedConfig.videoListId || '';
        finishedListSelect.value = savedConfig.finishedListId || '';
        adjustmentListSelect.value = savedConfig.adjustmentListId || '';
        approvedListSelect.value = savedConfig.approvedListId || '';
    }
}

// NOVA FUNÇÃO: Salvar as configurações selecionadas enviando para o webhook
async function saveTrelloConfigToWebhook() {
    const fieldsToValidate = {
        designList: designListSelect,
        videoList: videoListSelect,
        finishedList: finishedListSelect,
        adjustmentList: adjustmentListSelect,
        approvedList: approvedListSelect
    };

    let isValid = true;
    for (const key in fieldsToValidate) {
        clearError(key);
        if (!fieldsToValidate[key].value) {
            showError(key, 'Selecione uma lista.');
            isValid = false;
        }
    }

    if (!isValid) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const configToSend = {
        boardId: boardIdInput.value.trim(),
        designListId: designListSelect.value,
        videoListId: videoListSelect.value,
        finishedListId: finishedListSelect.value,
        adjustmentListId: adjustmentListSelect.value,
        approvedListId: approvedListSelect.value
    };

    const currentConfig = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
    const newConfig = {
        ...currentConfig,
        ...configToSend
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));

    try {
        const response = await fetch(TRELLO_WEBHOOK_SAVE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(configToSend),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Configurações do Trello enviadas ao webhook com sucesso! Resposta: ' + (result.message || JSON.stringify(result)));
        } else {
            alert('Erro ao enviar configurações para o webhook: ' + (result.message || JSON.stringify(result)));
        }
    } catch (error) {
        console.error('Erro na requisição para o webhook de salvamento:', error);
        alert('Erro de conexão ou no webhook de salvamento. Verifique a URL e sua conexão.');
    }
}


// Sidebar logic (replicated from main.js for standalone page)
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
// public/js/dashboard.js

const API_BASE_URL = 'http://localhost:80/solicitacoes_mvc/api';

let typesChartInstance = null;
let statusChartInstance = null;

// A função agora aceita parâmetros opcionais
async function loadDashboardData(month = null, year = null) {
    try {
        let apiUrl = `${API_BASE_URL}/dashboard`;

        // Constrói a URL dinamicamente: só adiciona parâmetros se eles existirem
        if (month && year) {
            apiUrl += `?mes=${month}&ano=${year}`;
        }

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success) {
            const data = result.data;

            // O resto da lógica para preencher o dashboard continua a mesma...
            document.getElementById('totalCards').innerText = data.total_cards;
            document.getElementById('cardsAceitos').innerText = data.cards_aceitos;
            document.getElementById('cardsRejeitados').innerText = data.cards_rejeitados;
            document.getElementById('cardsMovidos').innerText = data.cards_movidos;
            document.getElementById('clienteMaisPedidosNome').innerText = data.cliente_mais_pedidos.nome;
            document.getElementById('clienteMaisPedidosCount').innerText = data.cliente_mais_pedidos.total_pedidos;

            const cardsPendente = data.total_cards - (data.cards_aceitos + data.cards_rejeitados + data.cards_movidos);

            if (typesChartInstance) {
                typesChartInstance.destroy();
            }
            if (statusChartInstance) {
                statusChartInstance.destroy();
            }

            const solicitationTypesCtx = document.getElementById('solicitationTypesChart').getContext('2d');
            typesChartInstance = new Chart(solicitationTypesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Design', 'Vídeo'],
                    datasets: [{
                        data: [data.cards_design, data.cards_video],
                        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)'],
                        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom' } }
                }
            });

            const solicitationStatusCtx = document.getElementById('solicitationStatusChart').getContext('2d');
            statusChartInstance = new Chart(solicitationStatusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Aceitas', 'Rejeitadas', 'Pendente', 'Concluídas'],
                    datasets: [{
                        data: [data.cards_aceitos, data.cards_rejeitados, cardsPendente, data.cards_movidos],
                        backgroundColor: ['rgba(67, 185, 3, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(59, 130, 246, 0.8)'],
                        borderColor: ['rgba(67, 185, 3, 1)', 'rgba(239, 68, 68, 1)', 'rgba(255, 206, 86, 1)', 'rgba(59, 130, 246, 1)'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom' } }
                }
            });

        } else {
            console.error('Erro ao carregar dados do dashboard:', result.message);
            alert('Erro ao carregar dados do dashboard.');
        }
    } catch (error) {
        console.error('Erro na requisição para o dashboard:', error);
        alert('Erro ao conectar com o servidor para carregar o dashboard.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const filterMonthSelect = document.getElementById('filterMonth');
    const filterYearSelect = document.getElementById('filterYear');
    const filterButton = document.getElementById('filterButton');

    const today = new Date();
    const currentYear = today.getFullYear();
    const startYear = 2022;
    filterYearSelect.innerHTML = '';
    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        filterYearSelect.appendChild(option);
    }
    filterYearSelect.value = currentYear;

    // Define "Todos os Meses" como o padrão ao carregar a página
    filterMonthSelect.value = 'todos';

    // Carrega os dados GERAIS (sem filtro) ao carregar a página
    loadDashboardData();

    // Adiciona o evento de clique ao botão de filtro
    filterButton.addEventListener('click', () => {
        const selectedMonth = filterMonthSelect.value;
        const selectedYear = filterYearSelect.value;

        // Verifica se o usuário quer ver todos os meses
        if (selectedMonth === 'todos') {
            loadDashboardData(); // Chama a função sem parâmetros
        } else {
            loadDashboardData(selectedMonth, selectedYear); // Chama com os filtros
        }
    });
});
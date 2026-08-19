<?php
// api/controllers/SolicitacaoController.php
require_once __DIR__ . '/../models/Solicitacao.php';

class SolicitacaoController
{
    private $model;
    private $upload_dir;
    private $base_url_for_images;

    public function __construct()
    {
        $this->model = new Solicitacao();
        $this->upload_dir = __DIR__ . '/../../public/uploads/';
        // IMPORTANT: Ajuste a URL base para as imagens se seu projeto estiver em um subdiretório
        $this->base_url_for_images = '/solicitacoes_mvc/public/uploads/';

        if (!is_dir($this->upload_dir)) {
            mkdir($this->upload_dir, 0777, true);
        }
    }

    // ... (Mantenha os métodos existentes como getAll, create, etc.)

    // NOVO MÉTODO ADICIONADO AQUI
    /**
     * Lida com a requisição PUT para atualizar o status_interno de uma solicitação.
     * @param int $id O ID da solicitação vindo da URL.
     */
    public function updateStatus($id)
    {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if ($data === null || !isset($data['status_interno']) || !isset($data['tipo_pedido'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
            return;
        }

        $status = $data['status_interno'];
        $tipo_pedido = $data['tipo_pedido'];
        $motivo = $data['motivo_cancelamento'] ?? null;

        try {
            if ($this->model->updateStatus($id, $tipo_pedido, $status, $motivo)) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Status atualizado com sucesso!']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Solicitação não encontrada ou falha ao atualizar.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro no controlador (updateStatus): " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erro interno do servidor.']);
        }
    }

    public function getHistory()
    {
        $solicitacoes = $this->model->getHistory();
        echo json_encode(['success' => true, 'data' => $solicitacoes]);
    }

    public function getAll()
    {
        // Pega 'page' e 'tipo' da URL, com valores padrão
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $tipo_filtro = isset($_GET['tipo']) ? $_GET['tipo'] : 'todos'; // design, video, ou todos
        $limit = 10; // Itens por página

        $result = $this->model->getAll($page, $limit, $tipo_filtro);

        // O resultado agora contém 'data' e 'total'
        echo json_encode(['success' => true, 'data' => $result['data'], 'total' => $result['total'], 'page' => $page]);
    }

    public function create()
    {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido recebido.']);
            return;
        }

        // Validação básica para campos comuns
        if (!isset($data['nome']) || !isset($data['numero_cliente']) || !isset($data['email_cliente']) || !isset($data['ministerio']) || !isset($data['tipo_pedido']) || !isset($data['detalhes_solicitacao'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios (nome, numero_cliente, email_cliente, ministerio, tipo_pedido, detalhes_solicitacao) ausentes.']);
            return;
        }

        $tipo_pedido = $data['tipo_pedido'];
        $detalhes = $data['detalhes_solicitacao'];

        // Validação específica e inicialização de campos opcionais
        if ($tipo_pedido === 'design') {
            if (!isset($detalhes['data_entrega_arte']) || !isset($detalhes['texto_fundamental'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Campos obrigatórios para Design (data_entrega_arte, texto_fundamental) ausentes.']);
                return;
            }
            // Inicializa campos opcionais para evitar erros
            $detalhes['imagem_referencia'] = $detalhes['imagem_referencia'] ?? '';
            $detalhes['formatos_entrega'] = $detalhes['formatos_entrega'] ?? [];
            $detalhes['arquivos_necessarios'] = $detalhes['arquivos_necessarios'] ?? [];
            $detalhes['data_evento'] = $detalhes['data_evento'] ?? null;
            $detalhes['uso_e_objetivo_arte'] = $detalhes['uso_e_objetivo_arte'] ?? '';
            $detalhes['publico_alcancado'] = $detalhes['publico_alcancado'] ?? '';
            $detalhes['email_aprovacao_orcamento'] = $detalhes['email_aprovacao_orcamento'] ?? '';
            $detalhes['link_qr_code'] = $detalhes['link_qr_code'] ?? '';
            $detalhes['observacoes_complementares'] = $detalhes['observacoes_complementares'] ?? '';
            $data['detalhes_solicitacao'] = $detalhes; // Atualiza os detalhes no array principal

        } elseif ($tipo_pedido === 'video') {
            if (!isset($detalhes['titulo_video']) || !isset($detalhes['data_entrega_video'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Campos obrigatórios para Vídeo (titulo_video, data_entrega_video) ausentes.']);
                return;
            }
            // Inicializa campos opcionais para evitar erros
            $detalhes['tempo_duracao_video'] = $detalhes['tempo_duracao_video'] ?? '';
            $detalhes['onde_passara_video'] = $detalhes['onde_passara_video'] ?? '';
            $detalhes['referencia_video'] = $detalhes['referencia_video'] ?? '';
            $detalhes['publico_alvo_video'] = $detalhes['publico_alvo_video'] ?? '';
            $detalhes['fonte_imagens'] = $detalhes['fonte_imagens'] ?? '';
            $detalhes['roteiro_video'] = $detalhes['roteiro_video'] ?? '';
            $data['detalhes_solicitacao'] = $detalhes; // Atualiza os detalhes no array principal

        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Tipo de pedido inválido.']);
            return;
        }

        try {
            $createdSolicitacao = $this->model->create($data);
            if ($createdSolicitacao !== false) { // Verifica se a criação foi bem-sucedida e retorna o objeto
                http_response_code(201); // Created
                echo json_encode(['success' => true, 'message' => 'Solicitação criada com sucesso!', 'data' => $createdSolicitacao]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Erro ao criar solicitação. Verifique os logs do servidor para mais detalhes.']);
            }
        } catch (Exception $e) {
            // Verifica mensagens de erro específicas do modelo
            if (
                strpos($e->getMessage(), 'Já existe um cliente cadastrado com este número de telefone') !== false ||
                strpos($e->getMessage(), 'Já existe um cliente cadastrado com este endereço de email') !== false ||
                strpos($e->getMessage(), 'Conflito: Email ou Telefone já existem para clientes diferentes.') !== false ||
                strpos($e->getMessage(), 'Os dados do cliente (nome, telefone, email) não correspondem ao cliente selecionado.') !== false
            ) {
                http_response_code(409); // Conflito
            } else {
                http_response_code(500); // Erro Interno do Servidor
            }
            error_log("Erro no controlador (create): " . $e->getMessage()); // Registra a exceção
            echo json_encode(['success' => false, 'message' => 'Erro interno do servidor ao criar solicitação: ' . $e->getMessage()]);
        }
    }

    public function uploadImage()
    {
        $response = ['success' => false, 'message' => '', 'imageUrl' => ''];

        if (isset($_FILES['refImage']) && $_FILES['refImage']['error'] == UPLOAD_ERR_OK) {
            $file_name = uniqid() . '_' . basename($_FILES['refImage']['name']);
            $target_file = $this->upload_dir . $file_name;
            $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

            $check = getimagesize($_FILES['refImage']['tmp_name']);
            if ($check !== false) {
                if (!in_array($imageFileType, ["jpg", "png", "jpeg", "gif"])) {
                    $response['message'] = "Desculpe, apenas arquivos JPG, JPEG, PNG e GIF são permitidos.";
                } else {
                    if (move_uploaded_file($_FILES['refImage']['tmp_name'], $target_file)) {
                        $response['success'] = true;
                        $response['message'] = "O arquivo " . htmlspecialchars(basename($_FILES['refImage']['name'])) . " foi enviado.";
                        $response['imageUrl'] = $this->base_url_for_images . $file_name;
                    } else {
                        $response['message'] = "Desculpe, houve um erro ao enviar seu arquivo.";
                    }
                }
            } else {
                $response['message'] = "O arquivo não é uma imagem válida.";
            }
        } else {
            $response['message'] = "Nenhuma imagem enviada ou erro no upload.";
        }

        echo json_encode($response);
    }

    public function getDashboardMetrics()
    {
        // Se o mês for passado na URL, usa o valor. Senão, usa null.
        $month = isset($_GET['mes']) ? (int) $_GET['mes'] : null;
        $year = isset($_GET['ano']) ? (int) $_GET['ano'] : null;

        // O modelo já sabe que se month/year forem null, ele não deve filtrar.
        $metrics = $this->model->getDashboardMetrics($month, $year);
        echo json_encode(['success' => true, 'data' => $metrics]);
    }

    /**
     * Lida com a requisição PUT para atualizar uma solicitação existente.
     * Espera um JSON no corpo da requisição com os dados completos da solicitação.
     * @param int $id O ID da solicitação a ser atualizada, vindo da URL.
     */
    public function update($id)
    {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido recebido.']);
            return;
        }

        // Adiciona o ID da URL ao array de dados para que o modelo possa usá-lo
        $data['id'] = $id;

        // Validação básica para campos comuns que devem estar presentes na atualização
        if (!isset($data['id']) || !isset($data['nome']) || !isset($data['numero_cliente']) || !isset($data['email_cliente']) || !isset($data['ministerio']) || !isset($data['tipo_pedido']) || !isset($data['detalhes_solicitacao'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios para atualização ausentes.']);
            return;
        }

        // Validação específica para detalhes de design/vídeo, similar à criação
        $tipo_pedido = $data['tipo_pedido'];
        $detalhes = $data['detalhes_solicitacao'];

        if ($tipo_pedido === 'design') {
            if (!isset($detalhes['data_entrega_arte']) || !isset($detalhes['texto_fundamental'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Campos obrigatórios para Design (data_entrega_arte, texto_fundamental) ausentes.']);
                return;
            }
            // Inicializa campos opcionais para evitar erros
            $detalhes['imagem_referencia'] = $detalhes['imagem_referencia'] ?? '';
            $detalhes['formatos_entrega'] = $detalhes['formatos_entrega'] ?? [];
            $detalhes['arquivos_necessarios'] = $detalhes['arquivos_necessarios'] ?? [];
            $detalhes['data_evento'] = $detalhes['data_evento'] ?? null;
            $detalhes['uso_e_objetivo_arte'] = $detalhes['uso_e_objetivo_arte'] ?? '';
            $detalhes['publico_alcancado'] = $detalhes['publico_alcancado'] ?? '';
            $detalhes['email_aprovacao_orcamento'] = $detalhes['email_aprovacao_orcamento'] ?? '';
            $detalhes['link_qr_code'] = $detalhes['link_qr_code'] ?? '';
            $detalhes['observacoes_complementares'] = $detalhes['observacoes_complementares'] ?? '';
            $data['detalhes_solicitacao'] = $detalhes;

        } elseif ($tipo_pedido === 'video') {
            if (!isset($detalhes['titulo_video']) || !isset($detalhes['data_entrega_video'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Campos obrigatórios para Vídeo (titulo_video, data_entrega_video) ausentes.']);
                return;
            }
            // Inicializa campos opcionais para evitar erros
            $detalhes['tempo_duracao_video'] = $detalhes['tempo_duracao_video'] ?? '';
            $detalhes['onde_passara_video'] = $detalhes['onde_passara_video'] ?? '';
            $detalhes['referencia_video'] = $detalhes['referencia_video'] ?? '';
            $detalhes['publico_alvo_video'] = $detalhes['publico_alvo_video'] ?? '';
            $detalhes['fonte_imagens'] = $detalhes['fonte_imagens'] ?? '';
            $detalhes['roteiro_video'] = $detalhes['roteiro_video'] ?? '';
            $data['detalhes_solicitacao'] = $detalhes;

        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Tipo de pedido inválido.']);
            return;
        }

        try {
            if ($this->model->update($data)) {
                http_response_code(200); // OK
                echo json_encode(['success' => true, 'message' => 'Solicitação atualizada com sucesso!']);
            } else {
                http_response_code(500); // Internal Server Error
                echo json_encode(['success' => false, 'message' => 'Erro ao atualizar solicitação. Verifique os logs do servidor para mais detalhes.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro no controlador (update): " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erro interno do servidor ao atualizar solicitação: ' . $e->getMessage()]);
        }
    }

    /**
     * Lida com a requisição para atualizar o ID do card do Trello e o status (nome da lista) de uma solicitação.
     * Espera um JSON no corpo da requisição com 'solicitacao_id', 'trello_card_id', 'trello_list_name' e 'tipo_pedido'.
     */
    public function updateTrelloInfo()
    {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (!isset($data['solicitacao_id']) || !isset($data['trello_card_id']) || !isset($data['trello_list_name']) || !isset($data['tipo_pedido'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios (solicitacao_id, trello_card_id, trello_list_name, tipo_pedido) ausentes.']);
            return;
        }

        $solicitacaoId = $data['solicitacao_id'];
        $trelloCardId = $data['trello_card_id'];
        $trelloListName = $data['trello_list_name'];
        $tipoPedido = $data['tipo_pedido'];

        try {
            if ($this->model->updateTrelloInfo($solicitacaoId, $trelloCardId, $trelloListName, $tipoPedido)) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Trello Card ID e Status atualizados com sucesso!']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Erro ao atualizar Trello Card ID e Status.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro no controlador (updateTrelloInfo): " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erro interno do servidor ao atualizar Trello Card ID e Status: ' . $e->getMessage()]);
        }
    }



    /**
     * Busca uma solicitação pelo Trello Card ID e retorna seus detalhes.
     * Opcionalmente, pode atualizar o status com o nome da lista do Trello.
     */
    public function getSolicitacaoByTrelloCardId()
    {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (!isset($data['trello_card_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID do Trello Card ausente.']);
            return;
        }

        $trelloCardId = $data['trello_card_id'];

        try {
            $solicitacao = $this->model->getSolicitacaoByTrelloCardId($trelloCardId);

            if ($solicitacao) {
                http_response_code(200);
                echo json_encode(['success' => true, 'solicitacao_data' => $solicitacao]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Pedido não encontrado para o código fornecido.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro no controlador (getSolicitacaoByTrelloCardId): " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erro interno do servidor ao buscar pedido: ' . $e->getMessage()]);
        }
    }

    public function getSolicitacoesByClientEmail()
    {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (!isset($data['email_cliente'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email do cliente ausente.']);
            return;
        }

        $email_cliente = $data['email_cliente'];
        try {
            $solicitacoes = $this->model->getSolicitacoesByClientEmail($email_cliente);
            if ($solicitacoes !== false) {
                http_response_code(200);
                echo json_encode(['success' => true, 'data' => $solicitacoes]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Nenhum pedido encontrado para o email fornecido.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro no controlador (getSolicitacoesByClientEmail): " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erro interno do servidor: ' . $e->getMessage()]);
        }
    }
    /**
     * Manipula a requisição para apagar uma solicitação.
     * @param string $tipo_pedido O tipo de pedido vindo da URL.
     * @param int $id O ID da solicitação vindo da URL.
     */
    public function delete($tipo_pedido, $id)
    {
        try {
            if ($this->model->delete($id, $tipo_pedido)) {
                http_response_code(200); // OK
                echo json_encode(['success' => true, 'message' => 'Solicitação apagada com sucesso.']);
            } else {
                http_response_code(404); // Not Found
                echo json_encode(['success' => false, 'message' => 'Falha ao apagar. A solicitação pode não ter sido encontrada.']);
            }
        } catch (Exception $e) {
            http_response_code(500); // Internal Server Error
            error_log("Erro no controlador (delete): " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erro interno do servidor.']);
        }
    }
}
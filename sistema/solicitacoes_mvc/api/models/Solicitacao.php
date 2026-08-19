<?php
// api/models/Solicitacao.php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/Cliente.php'; // Adicione esta linha para incluir o modelo Cliente

class Solicitacao
{
    private $conn;
    private $table_clientes = "clientes";
    private $table_design = "solicitacoes_design";
    private $table_video = "solicitacoes_video";

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // ... (Mantenha todos os outros métodos existentes como create, etc.)

    // NOVO MÉTODO ADICIONADO AQUI
    /**
     * Atualiza o status_interno de uma solicitação e, opcionalmente, o motivo do cancelamento/rejeição.
     * @param int $id O ID da solicitação.
     * @param string $tipo_pedido 'design' ou 'video'.
     * @param string $status O novo status ('Aprovado' ou 'Recusado').
     * @param string|null $motivo O motivo da rejeição (opcional).
     * @return bool True em caso de sucesso, false em caso de falha.
     */
    public function updateStatus($id, $tipo_pedido, $status, $motivo = null)
    {
        $table = ($tipo_pedido === 'design') ? $this->table_design : $this->table_video;

        if (!in_array($status, ['Aprovado', 'Recusado'])) {
            return false; // Status inválido
        }

        $query = "UPDATE " . $table . " SET status_interno = :status_interno, motivo_cancelamento = :motivo WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status_interno', $status);
        $stmt->bindParam(':motivo', $motivo);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        $stmt->execute();

        // **CORREÇÃO PRINCIPAL AQUI**
        // Retorna true apenas se uma linha foi de fato afetada.
        return $stmt->rowCount() > 0;
    }

    public function getHistory()
    {
        $solicitacoes = [];
        $status_filter = "('Aprovado', 'Recusado', 'aguardando aprovação', 'Finalizado')";

        // Buscar solicitações de DESIGN
        $query_design = "
            SELECT
                sd.id, sd.ministerio, sd.status, sd.status_interno, sd.data_criacao, 'design' AS tipo_pedido, sd.trello_card_id,
                c.nome AS cliente_nome, c.numero_cliente, c.email_cliente, sd.motivo_cancelamento,
                sd.texto_fundamental, sd.data_evento, sd.data_entrega_arte, sd.uso_e_objetivo_arte,
                sd.publico_alcancado, sd.imagem_referencia, sd.formatos_entrega, sd.arquivos_necessarios,
                sd.email_aprovacao_orcamento, sd.link_qr_code, sd.observacoes_complementares
            FROM
                " . $this->table_design . " sd
            JOIN
                " . $this->table_clientes . " c ON sd.cliente_id = c.id
            WHERE sd.status_interno IN " . $status_filter;

        $stmt_design = $this->conn->prepare($query_design);
        $stmt_design->execute();

        while ($row = $stmt_design->fetch(PDO::FETCH_ASSOC)) {
            $solicitacao = [
                'id' => $row['id'],
                'nome' => $row['cliente_nome'],
                'numero_cliente' => $row['numero_cliente'],
                'email_cliente' => $row['email_cliente'],
                'ministerio' => $row['ministerio'],
                'tipo_pedido' => $row['tipo_pedido'],
                'status' => $row['status'],
                'status_interno' => $row['status_interno'],
                'data_criacao' => $row['data_criacao'],
                'motivo_cancelamento' => $row['motivo_cancelamento'],
                'trello_card_id' => $row['trello_card_id'],
                'detalhes_solicitacao' => [
                    'texto_fundamental' => $row['texto_fundamental'],
                    'data_evento' => $row['data_evento'],
                    'data_entrega_arte' => $row['data_entrega_arte'],
                    'uso_e_objetivo_arte' => $row['uso_e_objetivo_arte'],
                    'publico_alcancado' => $row['publico_alcancado'],
                    'imagem_referencia' => $row['imagem_referencia'],
                    'formatos_entrega' => ($row['formatos_entrega'] !== null && $row['formatos_entrega'] !== '') ? explode(', ', $row['formatos_entrega']) : [],
                    'arquivos_necessarios' => ($row['arquivos_necessarios'] !== null && $row['arquivos_necessarios'] !== '') ? explode(', ', $row['arquivos_necessarios']) : [],
                    'email_aprovacao_orcamento' => $row['email_aprovacao_orcamento'],
                    'link_qr_code' => $row['link_qr_code'],
                    'observacoes_complementares' => $row['observacoes_complementares']
                ]
            ];
            $solicitacoes[] = $solicitacao;
        }

        // Buscar solicitações de VÍDEO
        $query_video = "
            SELECT
                sv.id, sv.ministerio, sv.status, sv.status_interno, sv.data_criacao, 'video' AS tipo_pedido, sv.trello_card_id,
                c.nome AS cliente_nome, c.numero_cliente, c.email_cliente, sv.motivo_cancelamento,
                sv.titulo_video, sv.tempo_duracao_video, sv.onde_passara_video,
                sv.data_entrega_video, sv.referencia_video, sv.publico_alvo_video,
                sv.fonte_imagens, sv.roteiro_video
            FROM
                " . $this->table_video . " sv
            JOIN
                " . $this->table_clientes . " c ON sv.cliente_id = c.id
            WHERE sv.status_interno IN " . $status_filter;

        $stmt_video = $this->conn->prepare($query_video);
        $stmt_video->execute();

        while ($row = $stmt_video->fetch(PDO::FETCH_ASSOC)) {
            $solicitacao = [
                'id' => $row['id'],
                'nome' => $row['cliente_nome'],
                'numero_cliente' => $row['numero_cliente'],
                'email_cliente' => $row['email_cliente'],
                'ministerio' => $row['ministerio'],
                'tipo_pedido' => $row['tipo_pedido'],
                'status' => $row['status'],
                'status_interno' => $row['status_interno'],
                'data_criacao' => $row['data_criacao'],
                'motivo_cancelamento' => $row['motivo_cancelamento'],
                'trello_card_id' => $row['trello_card_id'],
                'detalhes_solicitacao' => [
                    'titulo_video' => $row['titulo_video'],
                    'tempo_duracao_video' => $row['tempo_duracao_video'],
                    'onde_passara_video' => $row['onde_passara_video'],
                    'data_entrega_video' => $row['data_entrega_video'],
                    'referencia_video' => $row['referencia_video'],
                    'publico_alvo_video' => $row['publico_alvo_video'],
                    'fonte_imagens' => $row['fonte_imagens'],
                    'roteiro_video' => $row['roteiro_video']
                ]
            ];
            $solicitacoes[] = $solicitacao;
        }

        usort($solicitacoes, function ($a, $b) {
            return strtotime($b['data_criacao']) - strtotime($a['data_criacao']);
        });

        return $solicitacoes;
    }


    // Função auxiliar para limpar o número de telefone (apenas dígitos)
    private function cleanPhoneNumber($phoneNumber)
    {
        return preg_replace('/\D/', '', $phoneNumber); // Remove tudo que não for dígito
    }

    public function create(array $data)
    {
        // Inicia a transação
        $this->conn->beginTransaction();

        try {
            $clienteModel = new Cliente();
            $cliente_id = null;
            $numero_cliente_cleaned = $this->cleanPhoneNumber($data['numero_cliente']);

            // Caso 1: Um cliente existente foi selecionado do dropdown do frontend
            if (isset($data['cliente_id']) && !empty($data['cliente_id'])) {
                $selected_client = $clienteModel->getById($data['cliente_id']);
                if ($selected_client) {
                    // Valida que o nome, telefone e email fornecidos correspondem aos dados do cliente selecionado
                    if (
                        $selected_client['nome'] === $data['nome'] &&
                        $this->cleanPhoneNumber($selected_client['numero_cliente']) === $numero_cliente_cleaned &&
                        $selected_client['email_cliente'] === $data['email_cliente']
                    ) {
                        $cliente_id = $selected_client['id'];
                    } else {
                        // Incompatibilidade entre o ID do cliente selecionado e os detalhes fornecidos
                        throw new Exception("Os dados do cliente (nome, telefone, email) não correspondem ao cliente selecionado. Por favor, corrija ou desfaça a seleção do cliente.");
                    }
                } else {
                    throw new Exception("Cliente selecionado não encontrado.");
                }
            } else {
                // Caso 2: Nenhum cliente existente foi explicitamente selecionado, tenta encontrar ou criar com base nos detalhes fornecidos
                $existing_client_id_by_email = $clienteModel->getClienteIdByEmail($data['email_cliente']);
                $existing_client_id_by_phone = $clienteModel->getClienteIdByPhoneNumber($numero_cliente_cleaned);

                if ($existing_client_id_by_email && $existing_client_id_by_phone) {
                    // Ambos email e telefone existem. Verifica se pertencem ao mesmo cliente.
                    if ($existing_client_id_by_email === $existing_client_id_by_phone) {
                        $cliente_id = $existing_client_id_by_email;
                    } else {
                        // Email pertence a um cliente, telefone a outro. Isso é um conflito.
                        throw new Exception("Conflito: Email ou Telefone já existem para clientes diferentes.");
                    }
                } elseif ($existing_client_id_by_email) {
                    $cliente_id = $existing_client_id_by_email;
                } elseif ($existing_client_id_by_phone) {
                    $cliente_id = $existing_client_id_by_phone;
                }

                // Se ainda nenhum cliente foi encontrado, cria um novo
                if ($cliente_id === null) {
                    $client_creation_result = $clienteModel->create([
                        'nome' => $data['nome'],
                        'numero_cliente' => $numero_cliente_cleaned,
                        'email_cliente' => $data['email_cliente']
                    ]);

                    if ($client_creation_result === 'phone_exists' || $client_creation_result === 'email_exists') {
                        throw new Exception("Já existe um cliente cadastrado com este número de telefone ou endereço de email.");
                    } elseif ($client_creation_result === false) {
                        throw new Exception("Erro desconhecido ao criar cliente.");
                    } else {
                        // Cliente::create retorna true em caso de sucesso, então precisamos obter o ID
                        $cliente_id = $clienteModel->getClienteIdByEmail($data['email_cliente']) ?? $clienteModel->getClienteIdByPhoneNumber($numero_cliente_cleaned);
                        if ($cliente_id === null) {
                            throw new Exception("Cliente criado, mas ID não encontrado.");
                        }
                    }
                }
            }

            // Neste ponto, $cliente_id deve estar definido, seja de um cliente existente ou recém-criado.
            if ($cliente_id === null) {
                throw new Exception("Não foi possível determinar o ID do cliente.");
            }

            $tipo_pedido = $data['tipo_pedido'];
            $detalhes = $data['detalhes_solicitacao'];

            $solicitacao_id = false; // Variável para armazenar o ID da solicitação

            if ($tipo_pedido === 'design') {
                $query = "INSERT INTO " . $this->table_design . " (
                    cliente_id, ministerio, status, texto_fundamental, data_evento, data_entrega_arte,
                    uso_e_objetivo_arte, publico_alcancado, imagem_referencia, formatos_entrega,
                    arquivos_necessarios, email_aprovacao_orcamento, link_qr_code, observacoes_complementares
                ) VALUES (
                    :cliente_id, :ministerio, 'pendente', :texto_fundamental, :data_evento, :data_entrega_arte,
                    :uso_e_objetivo_arte, :publico_alcancado, :imagem_referencia, :formatos_entrega,
                    :arquivos_necessarios, :email_aprovacao_orcamento, :link_qr_code, :observacoes_complementares
                )";
                $stmt = $this->conn->prepare($query);

                $stmt->bindParam(":cliente_id", $cliente_id);
                $stmt->bindParam(":ministerio", $data['ministerio']);
                $stmt->bindParam(":texto_fundamental", $detalhes['texto_fundamental']);

                // Correção: Armazenar o resultado da expressão em uma variável antes de passar para bindParam
                $data_evento_param = empty($detalhes['data_evento']) ? null : $detalhes['data_evento'];
                $stmt->bindParam(":data_evento", $data_evento_param);

                $stmt->bindParam(":data_entrega_arte", $detalhes['data_entrega_arte']);
                $stmt->bindParam(":uso_e_objetivo_arte", $detalhes['uso_e_objetivo_arte']);
                $stmt->bindParam(":publico_alcancado", $detalhes['publico_alcancado']);
                $stmt->bindParam(":imagem_referencia", $detalhes['imagem_referencia']);

                $formatos_entrega_str = is_array($detalhes['formatos_entrega']) ? implode(', ', $detalhes['formatos_entrega']) : ''; // Linha corrigida aqui!
                $arquivos_necessarios_str = is_array($detalhes['arquivos_necessarios']) ? implode(', ', $detalhes['arquivos_necessarios']) : '';

                $stmt->bindParam(":formatos_entrega", $formatos_entrega_str);
                $stmt->bindParam(":arquivos_necessarios", $arquivos_necessarios_str);

                $stmt->bindParam(":email_aprovacao_orcamento", $detalhes['email_aprovacao_orcamento']);
                $stmt->bindParam(":link_qr_code", $detalhes['link_qr_code']);
                $stmt->bindParam(":observacoes_complementares", $detalhes['observacoes_complementares']);

            } elseif ($tipo_pedido === 'video') {
                $query = "INSERT INTO " . $this->table_video . " (
                    cliente_id, ministerio, status, titulo_video, tempo_duracao_video, onde_passara_video,
                    data_entrega_video, referencia_video, publico_alvo_video, fonte_imagens, roteiro_video
                ) VALUES (
                    :cliente_id, :ministerio, 'pendente', :titulo_video, :tempo_duracao_video, :onde_passara_video,
                    :data_entrega_video, :referencia_video, :publico_alvo_video, :fonte_imagens, :roteiro_video
                )";
                $stmt = $this->conn->prepare($query);

                $stmt->bindParam(":cliente_id", $cliente_id);
                $stmt->bindParam(":ministerio", $data['ministerio']);
                $stmt->bindParam(":titulo_video", $detalhes['titulo_video']);
                $stmt->bindParam(":tempo_duracao_video", $detalhes['tempo_duracao_video']);
                $stmt->bindParam(":onde_passara_video", $detalhes['onde_passara_video']);
                $stmt->bindParam(":data_entrega_video", $detalhes['data_entrega_video']);
                $stmt->bindParam(":referencia_video", $detalhes['referencia_video']);
                $stmt->bindParam(":publico_alvo_video", $detalhes['publico_alvo_video']);
                $stmt->bindParam(":fonte_imagens", $detalhes['fonte_imagens']);
                $stmt->bindParam(":roteiro_video", $detalhes['roteiro_video']);
            } else {
                throw new Exception("Tipo de pedido inválido.");
            }

            if (!$stmt->execute()) {
                $errorInfo = $stmt->errorInfo();
                error_log("Erro PDO ao inserir na tabela de " . $tipo_pedido . ": " . implode(" ", $errorInfo));
                throw new Exception("Erro ao inserir na tabela de " . $tipo_pedido . ". Detalhes: " . $errorInfo[2]);
            }

            $solicitacao_id = $this->conn->lastInsertId(); // Obtém o ID auto-incrementado

            $this->conn->commit();

            // Após a criação bem-sucedida, buscar os dados completos da solicitação e do cliente
            // para retornar ao frontend, incluindo o ID recém-gerado.
            // Isso simula o comportamento do getAll para um único item.
            $query_select = "
                SELECT
                    s.id, s.ministerio, s.status, s.status_interno, s.data_criacao, :tipo_pedido AS tipo_pedido, s.trello_card_id,
                    c.nome AS cliente_nome, c.numero_cliente, c.email_cliente";

            if ($tipo_pedido === 'design') {
                // Corrigido: Usar 's.' em vez de 'sd.' para o alias da tabela de solicitação
                $query_select .= ", s.texto_fundamental, s.data_evento, s.data_entrega_arte, s.uso_e_objetivo_arte,
                                  s.publico_alcancado, s.imagem_referencia, s.formatos_entrega, s.arquivos_necessarios,
                                  s.email_aprovacao_orcamento, s.link_qr_code, s.observacoes_complementares";
            } elseif ($tipo_pedido === 'video') {
                // Corrigido: Usar 's.' em vez de 'sv.' para o alias da tabela de solicitação
                $query_select .= ", s.titulo_video, s.tempo_duracao_video, s.onde_passara_video,
                                  s.data_entrega_video, s.referencia_video, s.publico_alvo_video,
                                  s.fonte_imagens, s.roteiro_video";
            }

            $query_select .= " FROM " . ($tipo_pedido === 'design' ? $this->table_design : $this->table_video) . " s
                              JOIN " . $this->table_clientes . " c ON s.cliente_id = c.id
                              WHERE s.id = :solicitacao_id";

            $stmt_select = $this->conn->prepare($query_select);
            $stmt_select->bindParam(":solicitacao_id", $solicitacao_id, PDO::PARAM_INT);
            $stmt_select->bindParam(":tipo_pedido", $tipo_pedido); // Bind extra para o tipo_pedido

            $stmt_select->execute();
            $created_row = $stmt_select->fetch(PDO::FETCH_ASSOC);

            if ($created_row) {
                // Formatar os detalhes da solicitação de forma similar ao getAll()
                $formatted_detalhes = [];
                if ($tipo_pedido === 'design') {
                    $formatted_detalhes = [
                        'texto_fundamental' => $created_row['texto_fundamental'],
                        'data_evento' => $created_row['data_evento'],
                        'data_entrega_arte' => $created_row['data_entrega_arte'],
                        'uso_e_objetivo_arte' => $created_row['uso_e_objetivo_arte'],
                        'publico_alcancado' => $created_row['publico_alcancado'],
                        'imagem_referencia' => $created_row['imagem_referencia'],
                        'formatos_entrega' => ($created_row['formatos_entrega'] !== null && $created_row['formatos_entrega'] !== '') ? explode(', ', $created_row['formatos_entrega']) : [],
                        'arquivos_necessarios' => ($created_row['arquivos_necessarios'] !== null && $created_row['arquivos_necessarios'] !== '') ? explode(', ', $created_row['arquivos_necessarios']) : [],
                        'email_aprovacao_orcamento' => $created_row['email_aprovacao_orcamento'],
                        'link_qr_code' => $created_row['link_qr_code'],
                        'observacoes_complementares' => $created_row['observacoes_complementares']
                    ];
                } elseif ($tipo_pedido === 'video') {
                    $formatted_detalhes = [
                        'titulo_video' => $created_row['titulo_video'],
                        'tempo_duracao_video' => $created_row['tempo_duracao_video'],
                        'onde_passara_video' => $created_row['onde_passara_video'],
                        'data_entrega_video' => $created_row['data_entrega_video'],
                        'referencia_video' => $created_row['referencia_video'],
                        'publico_alvo_video' => $created_row['publico_alvo_video'],
                        'fonte_imagens' => $created_row['fonte_imagens'],
                        'roteiro_video' => $created_row['roteiro_video']
                    ];
                }

                $returned_solicitacao = [
                    'id' => $created_row['id'],
                    'nome' => $created_row['cliente_nome'],
                    'numero_cliente' => $created_row['numero_cliente'],
                    'email_cliente' => $created_row['email_cliente'],
                    'ministerio' => $created_row['ministerio'],
                    'tipo_pedido' => $created_row['tipo_pedido'],
                    'status' => $created_row['status'],
                    'status_interno' => $created_row['status_interno'],
                    'data_criacao' => $created_row['data_criacao'],
                    'trello_card_id' => $created_row['trello_card_id'], // Incluir na resposta
                    'detalhes_solicitacao' => $formatted_detalhes
                ];
                return $returned_solicitacao; // Retorna o objeto completo da solicitação
            } else {
                throw new Exception("Solicitação criada, mas não foi possível recuperar os dados completos.");
            }

        } catch (PDOException $e) { // Captura exceções específicas do PDO
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            error_log("PDOException na criação da solicitação: " . $e->getMessage());
            throw new Exception("Erro de banco de dados ao criar solicitação: " . $e->getMessage());
        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            error_log("Erro geral na criação da solicitação: " . $e->getMessage());
            return false; // Retorna false para o controlador
        }
    }

    public function getAll($page = 1, $limit = 10, $tipo_filtro = 'todos')
    {
        $solicitacoes = [];
        $offset = ($page - 1) * $limit;

        // ------------- 1. CONSTRUIR A CLÁUSULA WHERE PARA O FILTRO -------------
        $whereClauseDesign = " WHERE sd.status_interno = 'pendente' ";
        $whereClauseVideo = " WHERE sv.status_interno = 'pendente' ";

        // ======================= INÍCIO DA CORREÇÃO =======================

        // Adicionamos as colunas de VÍDEO como NULL na consulta de DESIGN
        $designQueryPart = "
        SELECT
            sd.id, sd.ministerio, sd.status, sd.status_interno, sd.data_criacao, 'design' AS tipo_pedido, sd.trello_card_id,
            c.nome AS cliente_nome, c.numero_cliente, c.email_cliente,
            sd.texto_fundamental, sd.data_evento, sd.data_entrega_arte, sd.uso_e_objetivo_arte,
            sd.publico_alcancado, sd.imagem_referencia, sd.formatos_entrega, sd.arquivos_necessarios,
            sd.email_aprovacao_orcamento, sd.link_qr_code, sd.observacoes_complementares,
            -- Colunas de vídeo como NULL para igualar a estrutura
            NULL AS titulo_video, NULL AS tempo_duracao_video, NULL AS onde_passara_video,
            NULL AS data_entrega_video, NULL AS referencia_video, NULL AS publico_alvo_video,
            NULL AS fonte_imagens, NULL AS roteiro_video
        FROM " . $this->table_design . " sd
        JOIN " . $this->table_clientes . " c ON sd.cliente_id = c.id
        " . $whereClauseDesign;

        // Adicionamos as colunas de DESIGN como NULL na consulta de VÍDEO
        $videoQueryPart = "
        SELECT
            sv.id, sv.ministerio, sv.status, sv.status_interno, sv.data_criacao, 'video' AS tipo_pedido, sv.trello_card_id,
            c.nome AS cliente_nome, c.numero_cliente, c.email_cliente,
            -- Colunas de design como NULL para igualar a estrutura
            NULL AS texto_fundamental, NULL AS data_evento, NULL AS data_entrega_arte, NULL AS uso_e_objetivo_arte,
            NULL AS publico_alcancado, NULL AS imagem_referencia, NULL AS formatos_entrega, NULL AS arquivos_necessarios,
            NULL AS email_aprovacao_orcamento, NULL AS link_qr_code, NULL AS observacoes_complementares,
            -- Colunas de vídeo
            sv.titulo_video, sv.tempo_duracao_video, sv.onde_passara_video,
            sv.data_entrega_video, sv.referencia_video, sv.publico_alvo_video,
            sv.fonte_imagens, sv.roteiro_video
        FROM " . $this->table_video . " sv
        JOIN " . $this->table_clientes . " c ON sv.cliente_id = c.id
        " . $whereClauseVideo;

        // ======================= FIM DA CORREÇÃO =======================

        $countQuery = "";
        $dataQuery = "";

        if ($tipo_filtro === 'design') {
            $countQuery = "SELECT COUNT(*) FROM " . $this->table_design . " sd " . $whereClauseDesign;
            // Quando o filtro é 'design', não precisamos dos campos nulos de vídeo
            $dataQuery = "
            SELECT
                sd.id, sd.ministerio, sd.status, sd.status_interno, sd.data_criacao, 'design' AS tipo_pedido, sd.trello_card_id,
                c.nome AS cliente_nome, c.numero_cliente, c.email_cliente,
                sd.texto_fundamental, sd.data_evento, sd.data_entrega_arte, sd.uso_e_objetivo_arte,
                sd.publico_alcancado, sd.imagem_referencia, sd.formatos_entrega, sd.arquivos_necessarios,
                sd.email_aprovacao_orcamento, sd.link_qr_code, sd.observacoes_complementares
            FROM " . $this->table_design . " sd
            JOIN " . $this->table_clientes . " c ON sd.cliente_id = c.id
            " . $whereClauseDesign;
        } elseif ($tipo_filtro === 'video') {
            $countQuery = "SELECT COUNT(*) FROM " . $this->table_video . " sv " . $whereClauseVideo;
            // Quando o filtro é 'video', não precisamos dos campos nulos de design
            $dataQuery = "
            SELECT
                sv.id, sv.ministerio, sv.status, sv.status_interno, sv.data_criacao, 'video' AS tipo_pedido, sv.trello_card_id,
                c.nome AS cliente_nome, c.numero_cliente, c.email_cliente,
                sv.titulo_video, sv.tempo_duracao_video, sv.onde_passara_video,
                sv.data_entrega_video, sv.referencia_video, sv.publico_alvo_video,
                sv.fonte_imagens, sv.roteiro_video
            FROM " . $this->table_video . " sv
            JOIN " . $this->table_clientes . " c ON sv.cliente_id = c.id
            " . $whereClauseVideo;
        } else { // 'todos'
            $countQuery = "SELECT
            (SELECT COUNT(*) FROM " . $this->table_design . " sd " . $whereClauseDesign . ") +
            (SELECT COUNT(*) FROM " . $this->table_video . " sv " . $whereClauseVideo . ") AS total";
            // Agora o UNION ALL funcionará, pois ambas as partes têm o mesmo número de colunas
            $dataQuery = "(" . $designQueryPart . ") UNION ALL (" . $videoQueryPart . ")";
        }

        // ------------- 2. OBTER A CONTAGEM TOTAL DE ITENS (PARA A PAGINAÇÃO) -------------
        $stmt_count = $this->conn->prepare($countQuery);
        $stmt_count->execute();
        $total_rows = ($tipo_filtro === 'todos')
            ? $stmt_count->fetch(PDO::FETCH_ASSOC)['total']
            : $stmt_count->fetchColumn();


        // ------------- 3. OBTER OS DADOS DA PÁGINA ATUAL -------------
        $query_final = $dataQuery . " ORDER BY data_criacao DESC LIMIT :limit OFFSET :offset";

        $stmt_data = $this->conn->prepare($query_final);
        $stmt_data->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt_data->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt_data->execute();

        while ($row = $stmt_data->fetch(PDO::FETCH_ASSOC)) {
            // Formata os detalhes da solicitação
            // O código aqui já funciona, pois espera as colunas que agora existem em ambas as queries
            $detalhes = [];
            if ($row['tipo_pedido'] === 'design') {
                $detalhes = [
                    'texto_fundamental' => $row['texto_fundamental'],
                    'data_evento' => $row['data_evento'],
                    'data_entrega_arte' => $row['data_entrega_arte'],
                    'uso_e_objetivo_arte' => $row['uso_e_objetivo_arte'],
                    'publico_alcancado' => $row['publico_alcancado'],
                    'imagem_referencia' => $row['imagem_referencia'],
                    'formatos_entrega' => ($row['formatos_entrega'] !== null && $row['formatos_entrega'] !== '') ? explode(', ', $row['formatos_entrega']) : [],
                    'arquivos_necessarios' => ($row['arquivos_necessarios'] !== null && $row['arquivos_necessarios'] !== '') ? explode(', ', $row['arquivos_necessarios']) : [],
                    'email_aprovacao_orcamento' => $row['email_aprovacao_orcamento'],
                    'link_qr_code' => $row['link_qr_code'],
                    'observacoes_complementares' => $row['observacoes_complementares']
                ];
            } else { // video
                $detalhes = [
                    'titulo_video' => $row['titulo_video'],
                    'tempo_duracao_video' => $row['tempo_duracao_video'],
                    'onde_passara_video' => $row['onde_passara_video'],
                    'data_entrega_video' => $row['data_entrega_video'],
                    'referencia_video' => $row['referencia_video'],
                    'publico_alvo_video' => $row['publico_alvo_video'],
                    'fonte_imagens' => $row['fonte_imagens'],
                    'roteiro_video' => $row['roteiro_video']
                ];
            }

            $solicitacoes[] = [
                'id' => $row['id'],
                'nome' => $row['cliente_nome'],
                'numero_cliente' => $row['numero_cliente'],
                'email_cliente' => $row['email_cliente'],
                'ministerio' => $row['ministerio'],
                'tipo_pedido' => $row['tipo_pedido'],
                'status' => $row['status'],
                'status_interno' => $row['status_interno'],
                'data_criacao' => $row['data_criacao'],
                'trello_card_id' => $row['trello_card_id'],
                'detalhes_solicitacao' => $detalhes
            ];
        }

        // ------------- 4. RETORNAR OS DADOS E O TOTAL -------------
        return [
            'data' => $solicitacoes,
            'total' => (int) $total_rows
        ];
    }


    public function getDashboardMetrics($month = null, $year = null)
    {
        $metrics = [];

        // Define a cláusula WHERE para ser reutilizada. Se mês e ano não forem fornecidos, não haverá filtro.
        $whereClause = "";
        if ($month && $year) {
            $whereClause = " WHERE MONTH(data_criacao) = :month AND YEAR(data_criacao) = :year";
        }

        // Prepara as sub-cláusulas para as tabelas de design e vídeo
        $whereClauseDesign = str_replace("data_criacao", "sd.data_criacao", $whereClause);
        $whereClauseVideo = str_replace("data_criacao", "sv.data_criacao", $whereClause);


        // Total de cards
        $query_total = "SELECT 
                            (SELECT COUNT(*) FROM " . $this->table_design . ($whereClause ? str_replace('data_criacao', 'solicitacoes_design.data_criacao', $whereClause) : '') . ") + 
                            (SELECT COUNT(*) FROM " . $this->table_video . ($whereClause ? str_replace('data_criacao', 'solicitacoes_video.data_criacao', $whereClause) : '') . ") AS total_cards";
        $stmt_total = $this->conn->prepare($query_total);
        if ($month && $year) {
            $stmt_total->bindParam(':month', $month, PDO::PARAM_INT);
            $stmt_total->bindParam(':year', $year, PDO::PARAM_INT);
        }
        $stmt_total->execute();
        $metrics['total_cards'] = $stmt_total->fetch(PDO::FETCH_ASSOC)['total_cards'];

        // Cards aceitos
        $query_aceitos = "SELECT 
                            (SELECT COUNT(*) FROM " . $this->table_design . " WHERE status_interno = 'Aprovado'" . ($whereClause ? " AND MONTH(data_criacao) = :month AND YEAR(data_criacao) = :year" : "") . ") + 
                            (SELECT COUNT(*) FROM " . $this->table_video . " WHERE status_interno = 'Aprovado'" . ($whereClause ? " AND MONTH(data_criacao) = :month AND YEAR(data_criacao) = :year" : "") . ") AS cards_aceitos";
        $stmt_aceitos = $this->conn->prepare($query_aceitos);
        if ($month && $year) {
            $stmt_aceitos->bindParam(':month', $month, PDO::PARAM_INT);
            $stmt_aceitos->bindParam(':year', $year, PDO::PARAM_INT);
        }
        $stmt_aceitos->execute();
        $metrics['cards_aceitos'] = $stmt_aceitos->fetch(PDO::FETCH_ASSOC)['cards_aceitos'];

        // Cards rejeitados
        $query_rejeitados = "SELECT 
                                (SELECT COUNT(*) FROM " . $this->table_design . " WHERE status_interno = 'Recusado'" . ($whereClause ? " AND MONTH(data_criacao) = :month AND YEAR(data_criacao) = :year" : "") . ") + 
                                (SELECT COUNT(*) FROM " . $this->table_video . " WHERE status_interno = 'Recusado'" . ($whereClause ? " AND MONTH(data_criacao) = :month AND YEAR(data_criacao) = :year" : "") . ") AS cards_rejeitados";
        $stmt_rejeitados = $this->conn->prepare($query_rejeitados);
        if ($month && $year) {
            $stmt_rejeitados->bindParam(':month', $month, PDO::PARAM_INT);
            $stmt_rejeitados->bindParam(':year', $year, PDO::PARAM_INT);
        }
        $stmt_rejeitados->execute();
        $metrics['cards_rejeitados'] = $stmt_rejeitados->fetch(PDO::FETCH_ASSOC)['cards_rejeitados'];

        // Cards de vídeo
        $query_video = "SELECT COUNT(*) AS cards_video FROM " . $this->table_video . $whereClause;
        $stmt_video = $this->conn->prepare($query_video);
        if ($month && $year) {
            $stmt_video->bindParam(':month', $month, PDO::PARAM_INT);
            $stmt_video->bindParam(':year', $year, PDO::PARAM_INT);
        }
        $stmt_video->execute();
        $metrics['cards_video'] = $stmt_video->fetch(PDO::FETCH_ASSOC)['cards_video'];

        // Cards de design
        $query_design = "SELECT COUNT(*) AS cards_design FROM " . $this->table_design . $whereClause;
        $stmt_design = $this->conn->prepare($query_design);
        if ($month && $year) {
            $stmt_design->bindParam(':month', $month, PDO::PARAM_INT);
            $stmt_design->bindParam(':year', $year, PDO::PARAM_INT);
        }
        $stmt_design->execute();
        $metrics['cards_design'] = $stmt_design->fetch(PDO::FETCH_ASSOC)['cards_design'];

        // Cards movidos (Finalizados)
        $query_movidos = "SELECT 
                            (SELECT COUNT(*) FROM " . $this->table_design . " WHERE status_interno = 'Finalizado'" . ($whereClause ? " AND MONTH(data_criacao) = :month AND YEAR(data_criacao) = :year" : "") . ") + 
                            (SELECT COUNT(*) FROM " . $this->table_video . " WHERE status_interno = 'Finalizado'" . ($whereClause ? " AND MONTH(data_criacao) = :month AND YEAR(data_criacao) = :year" : "") . ") AS cards_movidos";
        $stmt_movidos = $this->conn->prepare($query_movidos);
        if ($month && $year) {
            $stmt_movidos->bindParam(':month', $month, PDO::PARAM_INT);
            $stmt_movidos->bindParam(':year', $year, PDO::PARAM_INT);
        }
        $stmt_movidos->execute();
        $metrics['cards_movidos'] = $stmt_movidos->fetch(PDO::FETCH_ASSOC)['cards_movidos'];

        // Cliente com mais pedidos
        $query_top_cliente = "
            SELECT c.nome, COUNT(t.id) AS total_pedidos
            FROM clientes c
            LEFT JOIN (
                SELECT id, cliente_id, data_criacao FROM solicitacoes_design
                UNION ALL
                SELECT id, cliente_id, data_criacao FROM solicitacoes_video
            ) AS t ON c.id = t.cliente_id
            " . ($whereClause ? "WHERE MONTH(t.data_criacao) = :month AND YEAR(t.data_criacao) = :year" : "") . "
            GROUP BY c.nome
            ORDER BY total_pedidos DESC
            LIMIT 1";
        $stmt_top_cliente = $this->conn->prepare($query_top_cliente);
        if ($month && $year) {
            $stmt_top_cliente->bindParam(':month', $month, PDO::PARAM_INT);
            $stmt_top_cliente->bindParam(':year', $year, PDO::PARAM_INT);
        }
        $stmt_top_cliente->execute();
        $top_cliente = $stmt_top_cliente->fetch(PDO::FETCH_ASSOC);
        $metrics['cliente_mais_pedidos'] = $top_cliente ? $top_cliente : ['nome' => 'N/A', 'total_pedidos' => 0];

        return $metrics;
    }

    /**
     * Atualiza uma solicitação existente (design ou vídeo) e, opcionalmente, os dados do cliente associado.
     * @param array $data Um array associativo com os dados completos da solicitação a ser atualizada.
     * Deve incluir 'id', 'tipo_pedido', e os detalhes necessários.
     * @return bool True se a atualização for bem-sucedida, false caso contrário.
     */
    public function update(array $data)
    {
        $this->conn->beginTransaction();

        try {
            // Validar dados básicos
            if (!isset($data['id']) || !isset($data['tipo_pedido']) || !isset($data['nome']) || !isset($data['numero_cliente']) || !isset($data['email_cliente'])) {
                throw new Exception("Dados básicos da solicitação para atualização incompletos.");
            }

            $solicitacao_id = $data['id'];
            $tipo_pedido = $data['tipo_pedido'];
            $detalhes = $data['detalhes_solicitacao'];

            // Instancia o modelo Cliente para validações de telefone/email
            $clienteModel = new Cliente();

            // 1. Obter o cliente_id existente da solicitação
            $current_client_id_query = "SELECT cliente_id FROM ";
            if ($tipo_pedido === 'design') {
                $current_client_id_query .= $this->table_design;
            } elseif ($tipo_pedido === 'video') {
                $current_client_id_query .= $this->table_video;
            } else {
                throw new Exception("Tipo de pedido inválido para atualização.");
            }
            $current_client_id_query .= " WHERE id = :id";
            $stmt_client_id = $this->conn->prepare($current_client_id_query);
            $stmt_client_id->bindParam(":id", $solicitacao_id, PDO::PARAM_INT);
            $stmt_client_id->execute();
            $current_client_id_row = $stmt_client_id->fetch(PDO::FETCH_ASSOC);

            if (!$current_client_id_row) {
                throw new Exception("Solicitação não encontrada para atualização.");
            }
            $current_client_id = $current_client_id_row['cliente_id'];

            // 2. Atualizar o cliente (se os dados foram alterados ou apenas para garantir consistência)
            $numero_cliente_cleaned = $this->cleanPhoneNumber($data['numero_cliente']); // Usa a função local cleanPhoneNumber

            // Reutilizando os métodos de validação do modelo Cliente
            if ($clienteModel->existsByPhoneNumber($numero_cliente_cleaned, $current_client_id)) {
                throw new Exception("Já existe outro cliente cadastrado com este número de telefone.");
            }
            if ($clienteModel->existsByEmail($data['email_cliente'], $current_client_id)) {
                throw new Exception("Já existe outro cliente cadastrado com este endereço de email.");
            }

            $query_update_cliente = "UPDATE " . $this->table_clientes . " SET nome = :nome, numero_cliente = :numero_cliente, email_cliente = :email_cliente WHERE id = :id";
            $stmt_update_cliente = $this->conn->prepare($query_update_cliente);
            $stmt_update_cliente->bindParam(":nome", $data['nome']);
            $stmt_update_cliente->bindParam(":numero_cliente", $numero_cliente_cleaned);
            $stmt_update_cliente->bindParam(":email_cliente", $data['email_cliente']);
            $stmt_update_cliente->bindParam(":id", $current_client_id, PDO::PARAM_INT);
            if (!$stmt_update_cliente->execute()) {
                error_log("Erro ao atualizar cliente: " . implode(" ", $stmt_update_cliente->errorInfo()));
                throw new Exception("Erro ao atualizar dados do cliente.");
            }

            // 3. Atualizar os detalhes específicos da solicitação
            $table_to_update = '';
            $query_update_details = '';

            if ($tipo_pedido === 'design') {
                $table_to_update = $this->table_design;
                $query_update_details = "UPDATE " . $table_to_update . " SET
                    ministerio = :ministerio,
                    texto_fundamental = :texto_fundamental,
                    data_evento = :data_evento,
                    data_entrega_arte = :data_entrega_arte,
                    uso_e_objetivo_arte = :uso_e_objetivo_arte,
                    publico_alcancado = :publico_alcancado,
                    imagem_referencia = :imagem_referencia,
                    formatos_entrega = :formatos_entrega,
                    arquivos_necessarios = :arquivos_necessarios,
                    email_aprovacao_orcamento = :email_aprovacao_orcamento,
                    link_qr_code = :link_qr_code,
                    observacoes_complementares = :observacoes_complementares
                    WHERE id = :id";
                $stmt = $this->conn->prepare($query_update_details);

                $formatos_entrega_str = is_array($detalhes['formatos_entrega']) ? implode(', ', $detalhes['formatos_entrega']) : '';
                $arquivos_necessarios_str = is_array($detalhes['arquivos_necessarios']) ? implode(', ', $detalhes['arquivos_necessarios']) : '';

                $stmt->bindParam(":ministerio", $data['ministerio']);
                $stmt->bindParam(":texto_fundamental", $detalhes['texto_fundamental']);
                // Correção: Armazenar o resultado da expressão em uma variável antes de passar para bindParam
                $data_evento_param = empty($detalhes['data_evento']) ? null : $detalhes['data_evento'];
                $stmt->bindParam(":data_evento", $data_evento_param);
                $stmt->bindParam(":data_entrega_arte", $detalhes['data_entrega_arte']);
                $stmt->bindParam(":uso_e_objetivo_arte", $detalhes['uso_e_objetivo_arte']);
                $stmt->bindParam(":publico_alcancado", $detalhes['publico_alcancado']);
                $stmt->bindParam(":imagem_referencia", $detalhes['imagem_referencia']);
                $stmt->bindParam(":formatos_entrega", $formatos_entrega_str);
                $stmt->bindParam(":arquivos_necessarios", $arquivos_necessarios_str);
                $stmt->bindParam(":email_aprovacao_orcamento", $detalhes['email_aprovacao_orcamento']);
                $stmt->bindParam(":link_qr_code", $detalhes['link_qr_code']);
                $stmt->bindParam(":observacoes_complementares", $detalhes['observacoes_complementares']);
                $stmt->bindParam(":id", $solicitacao_id, PDO::PARAM_INT);

            } elseif ($tipo_pedido === 'video') {
                $table_to_update = $this->table_video;
                $query_update_details = "UPDATE " . $table_to_update . " SET
                    ministerio = :ministerio,
                    titulo_video = :titulo_video,
                    tempo_duracao_video = :tempo_duracao_video,
                    onde_passara_video = :onde_passara_video,
                    data_entrega_video = :data_entrega_video,
                    referencia_video = :referencia_video,
                    publico_alvo_video = :publico_alvo_video,
                    fonte_imagens = :fonte_imagens,
                    roteiro_video = :roteiro_video
                    WHERE id = :id";
                $stmt = $this->conn->prepare($query_update_details);

                $stmt->bindParam(":ministerio", $data['ministerio']);
                $stmt->bindParam(":titulo_video", $detalhes['titulo_video']);
                $stmt->bindParam(":tempo_duracao_video", $detalhes['tempo_duracao_video']);
                $stmt->bindParam(":onde_passara_video", $detalhes['onde_passara_video']);
                $stmt->bindParam(":data_entrega_video", $detalhes['data_entrega_video']);
                $stmt->bindParam(":referencia_video", $detalhes['referencia_video']);
                $stmt->bindParam(":publico_alvo_video", $detalhes['publico_alvo_video']);
                $stmt->bindParam(":fonte_imagens", $detalhes['fonte_imagens']);
                $stmt->bindParam(":roteiro_video", $detalhes['roteiro_video']);
                $stmt->bindParam(":id", $solicitacao_id, PDO::PARAM_INT);

            } else {
                throw new Exception("Tipo de pedido inválido.");
            }

            if (!$stmt->execute()) {
                error_log("Erro ao atualizar detalhes na tabela de " . $tipo_pedido . ": " . implode(" ", $stmt->errorInfo()));
                throw new Exception("Erro ao atualizar detalhes da solicitação.");
            }

            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            error_log("Erro na atualização da solicitação: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Atualiza o ID do card do Trello e o status (nome da lista) para uma solicitação específica.
     * @param int $solicitacaoId O ID da solicitação no banco de dados.
     * @param string $trelloCardId O ID do card gerado no Trello.
     * @param string $trelloListName O nome da lista do Trello (novo status).
     * @param string $tipoPedido O tipo de pedido ('design' ou 'video').
     * @return bool True se a atualização for bem-sucedida, false caso contrário.
     */
    public function updateTrelloInfo($solicitacaoId, $trelloCardId, $trelloListName, $tipoPedido)
    {
        $table_to_update = '';
        if ($tipoPedido === 'design') {
            $table_to_update = $this->table_design;
        } elseif ($tipoPedido === 'video') {
            $table_to_update = $this->table_video;
        } else {
            error_log("Tentativa de atualizar Trello Info com tipo de pedido inválido: " . $tipoPedido);
            return false;
        }

        $query = "UPDATE " . $table_to_update . " SET trello_card_id = :trello_card_id, status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":trello_card_id", $trelloCardId);
        $stmt->bindParam(":status", $trelloListName); // Atualiza o status com o nome da lista
        $stmt->bindParam(":id", $solicitacaoId, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return true;
        } else {
            error_log("Erro ao atualizar trello_card_id e status para solicitação ID " . $solicitacaoId . ": " . implode(" ", $stmt->errorInfo()));
            return false;
        }
    }



    /**
     * Busca uma solicitação pelo ID do Trello Card.
     * @param string $trelloCardId O ID do card do Trello.
     * @return array|false A solicitação encontrada ou false se não encontrar.
     */
    public function getSolicitacaoByTrelloCardId($trelloCardId)
    {
        // Tenta buscar em solicitacoes_design
        $query_design = "
            SELECT
                sd.id, sd.ministerio, sd.status, sd.status_interno, sd.data_criacao, 'design' AS tipo_pedido, sd.trello_card_id,
                c.nome AS cliente_nome, c.numero_cliente, c.email_cliente,
                sd.texto_fundamental, sd.data_evento, sd.data_entrega_arte, sd.uso_e_objetivo_arte,
                sd.publico_alcancado, sd.imagem_referencia, sd.formatos_entrega, sd.arquivos_necessarios,
                sd.email_aprovacao_orcamento, sd.link_qr_code, sd.observacoes_complementares
            FROM
                " . $this->table_design . " sd
            JOIN
                " . $this->table_clientes . " c ON sd.cliente_id = c.id
            WHERE sd.trello_card_id = :trello_card_id
        ";
        $stmt_design = $this->conn->prepare($query_design);
        $stmt_design->bindParam(":trello_card_id", $trelloCardId);
        $stmt_design->execute();
        $row = $stmt_design->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $solicitacao = [
                'id' => $row['id'],
                'nome' => $row['cliente_nome'],
                'numero_cliente' => $row['numero_cliente'],
                'email_cliente' => $row['email_cliente'],
                'ministerio' => $row['ministerio'],
                'tipo_pedido' => $row['tipo_pedido'],
                'status' => $row['status'],
                'status_interno' => $row['status_interno'], // Agora não dará mais erro
                'data_criacao' => $row['data_criacao'],
                'trello_card_id' => $row['trello_card_id'],
                'detalhes_solicitacao' => [
                    'texto_fundamental' => $row['texto_fundamental'],
                    'data_evento' => $row['data_evento'],
                    'data_entrega_arte' => $row['data_entrega_arte'],
                    'uso_e_objetivo_arte' => $row['uso_e_objetivo_arte'],
                    'publico_alcancado' => $row['publico_alcancado'],
                    'imagem_referencia' => $row['imagem_referencia'],
                    'formatos_entrega' => ($row['formatos_entrega'] !== null && $row['formatos_entrega'] !== '') ? explode(', ', $row['formatos_entrega']) : [],
                    'arquivos_necessarios' => ($row['arquivos_necessarios'] !== null && $row['arquivos_necessarios'] !== '') ? explode(', ', $row['arquivos_necessarios']) : [],
                    'email_aprovacao_orcamento' => $row['email_aprovacao_orcamento'],
                    'link_qr_code' => $row['link_qr_code'],
                    'observacoes_complementares' => $row['observacoes_complementares']
                ]
            ];
            return $solicitacao;
        }

        // Se não encontrou em design, tenta em solicitacoes_video
        $query_video = "
            SELECT
                sv.id, sv.ministerio, sv.status, sv.status_interno, sv.data_criacao, 'video' AS tipo_pedido, sv.trello_card_id,
                c.nome AS cliente_nome, c.numero_cliente, c.email_cliente,
                sv.titulo_video, sv.tempo_duracao_video, sv.onde_passara_video,
                sv.data_entrega_video, sv.referencia_video, sv.publico_alvo_video,
                sv.fonte_imagens, sv.roteiro_video
            FROM
                " . $this->table_video . " sv
            JOIN
                " . $this->table_clientes . " c ON sv.cliente_id = c.id
            WHERE sv.trello_card_id = :trello_card_id
        ";
        $stmt_video = $this->conn->prepare($query_video);
        $stmt_video->bindParam(":trello_card_id", $trelloCardId);
        $stmt_video->execute();
        $row = $stmt_video->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $solicitacao = [
                'id' => $row['id'],
                'nome' => $row['cliente_nome'],
                'numero_cliente' => $row['numero_cliente'],
                'email_cliente' => $row['email_cliente'],
                'ministerio' => $row['ministerio'],
                'tipo_pedido' => $row['tipo_pedido'],
                'status' => $row['status'],
                'status_interno' => $row['status_interno'], // Agora não dará mais erro
                'data_criacao' => $row['data_criacao'],
                'trello_card_id' => $row['trello_card_id'],
                'detalhes_solicitacao' => [
                    'titulo_video' => $row['titulo_video'],
                    'tempo_duracao_video' => $row['tempo_duracao_video'],
                    'onde_passara_video' => $row['onde_passara_video'],
                    'data_entrega_video' => $row['data_entrega_video'],
                    'referencia_video' => $row['referencia_video'],
                    'publico_alvo_video' => $row['publico_alvo_video'],
                    'fonte_imagens' => $row['fonte_imagens'],
                    'roteiro_video' => $row['roteiro_video']
                ]
            ];
            return $solicitacao;
        }

        return false; // Não encontrou em nenhuma das tabelas
    }

    public function getSolicitacoesByClientEmail($email)
    {
        $clienteModel = new Cliente();
        $cliente_id = $clienteModel->getClienteIdByEmail($email);

        if ($cliente_id === null) {
            return false; // Cliente não encontrado
        }

        $solicitacoes = [];

        // Buscar solicitações de DESIGN
        $query_design = "
        SELECT
            sd.id, sd.ministerio, sd.status, sd.status_interno, sd.data_criacao, 'design' AS tipo_pedido, sd.trello_card_id,
            c.nome AS cliente_nome, c.numero_cliente, c.email_cliente,
            sd.texto_fundamental, sd.data_evento, sd.data_entrega_arte, sd.uso_e_objetivo_arte,
            sd.publico_alcancado, sd.imagem_referencia, sd.formatos_entrega, sd.arquivos_necessarios,
            sd.email_aprovacao_orcamento, sd.link_qr_code, sd.observacoes_complementares
        FROM
            " . $this->table_design . " sd
        JOIN
            " . $this->table_clientes . " c ON sd.cliente_id = c.id
        WHERE sd.cliente_id = :cliente_id
    ";
        $stmt_design = $this->conn->prepare($query_design);
        $stmt_design->bindParam(":cliente_id", $cliente_id, PDO::PARAM_INT);
        $stmt_design->execute();

        while ($row = $stmt_design->fetch(PDO::FETCH_ASSOC)) {
            // Lógica de formatação de detalhes (igual à do getAll)
            $solicitacao = [
                'id' => $row['id'],
                'nome' => $row['cliente_nome'],
                'numero_cliente' => $row['numero_cliente'],
                'email_cliente' => $row['email_cliente'],
                'ministerio' => $row['ministerio'],
                'tipo_pedido' => $row['tipo_pedido'],
                'status' => $row['status'],
                'data_criacao' => $row['data_criacao'],
                'trello_card_id' => $row['trello_card_id'],
                'detalhes_solicitacao' => [
                    'texto_fundamental' => $row['texto_fundamental'],
                    'data_evento' => $row['data_evento'],
                    'data_entrega_arte' => $row['data_entrega_arte'],
                    'uso_e_objetivo_arte' => $row['uso_e_objetivo_arte'],
                    'publico_alcancado' => $row['publico_alcancado'],
                    'imagem_referencia' => $row['imagem_referencia'],
                    'formatos_entrega' => ($row['formatos_entrega'] !== null && $row['formatos_entrega'] !== '') ? explode(', ', $row['formatos_entrega']) : [],
                    'arquivos_necessarios' => ($row['arquivos_necessarios'] !== null && $row['arquivos_necessarios'] !== '') ? explode(', ', $row['arquivos_necessarios']) : [],
                    'email_aprovacao_orcamento' => $row['email_aprovacao_orcamento'],
                    'link_qr_code' => $row['link_qr_code'],
                    'observacoes_complementares' => $row['observacoes_complementares']
                ]
            ];
            $solicitacoes[] = $solicitacao;
        }

        // Buscar solicitações de VÍDEO
        $query_video = "
        SELECT
            sv.id, sv.ministerio, sv.status, sv.status_interno, sv.data_criacao, 'video' AS tipo_pedido, sv.trello_card_id,
            c.nome AS cliente_nome, c.numero_cliente, c.email_cliente,
            sv.titulo_video, sv.tempo_duracao_video, sv.onde_passara_video,
            sv.data_entrega_video, sv.referencia_video, sv.publico_alvo_video,
            sv.fonte_imagens, sv.roteiro_video
        FROM
            " . $this->table_video . " sv
        JOIN
            " . $this->table_clientes . " c ON sv.cliente_id = c.id
        WHERE sv.cliente_id = :cliente_id
    ";
        $stmt_video = $this->conn->prepare($query_video);
        $stmt_video->bindParam(":cliente_id", $cliente_id, PDO::PARAM_INT);
        $stmt_video->execute();

        while ($row = $stmt_video->fetch(PDO::FETCH_ASSOC)) {
            // Lógica de formatação de detalhes (igual à do getAll)
            $solicitacao = [
                'id' => $row['id'],
                'nome' => $row['cliente_nome'],
                'numero_cliente' => $row['numero_cliente'],
                'email_cliente' => $row['email_cliente'],
                'ministerio' => $row['ministerio'],
                'tipo_pedido' => $row['tipo_pedido'],
                'status' => $row['status'],
                'data_criacao' => $row['data_criacao'],
                'trello_card_id' => $row['trello_card_id'],
                'detalhes_solicitacao' => [
                    'titulo_video' => $row['titulo_video'],
                    'tempo_duracao_video' => $row['tempo_duracao_video'],
                    'onde_passara_video' => $row['onde_passara_video'],
                    'data_entrega_video' => $row['data_entrega_video'],
                    'referencia_video' => $row['referencia_video'],
                    'publico_alvo_video' => $row['publico_alvo_video'],
                    'fonte_imagens' => $row['fonte_imagens'],
                    'roteiro_video' => $row['roteiro_video']
                ]
            ];
            $solicitacoes[] = $solicitacao;
        }

        // Ordena por data de criação
        usort($solicitacoes, function ($a, $b) {
            return strtotime($b['data_criacao']) - strtotime($a['data_criacao']);
        });

        return $solicitacoes;
    }

    /**
     * Apaga permanentemente uma solicitação de uma tabela específica.
     * @param int $id O ID da solicitação a ser apagada.
     * @param string $tipo_pedido O tipo de pedido ('design' ou 'video') para determinar a tabela.
     * @return bool Retorna true em caso de sucesso, false em caso de falha.
     */
    public function delete($id, $tipo_pedido)
    {
        $table_to_delete = '';
        if ($tipo_pedido === 'design') {
            $table_to_delete = $this->table_design;
        } elseif ($tipo_pedido === 'video') {
            $table_to_delete = $this->table_video;
        } else {
            // Se o tipo de pedido for inválido, não faz nada.
            return false;
        }

        // Não precisamos de transação aqui, pois é uma única operação de exclusão.
        try {
            $query = "DELETE FROM " . $table_to_delete . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            // Retorna true se alguma linha foi afetada (ou seja, a exclusão ocorreu)
            return $stmt->rowCount() > 0;

        } catch (PDOException $e) {
            // Em caso de erro no banco de dados, registra o erro e retorna false.
            error_log("Erro ao apagar solicitação: " . $e->getMessage());
            return false;
        }
    }



}
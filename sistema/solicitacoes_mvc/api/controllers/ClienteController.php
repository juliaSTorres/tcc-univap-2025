<?php
require_once __DIR__ . '/../models/Cliente.php';

class ClienteController {
    private $model;

    public function __construct() {
        $this->model = new Cliente();
    }

    public function getAll() {
        $searchName = isset($_GET['nome']) ? $_GET['nome'] : '';
        $searchPhone = isset($_GET['telefone']) ? $_GET['telefone'] : '';
        $searchEmail = isset($_GET['email']) ? $_GET['email'] : '';

        $clientes = $this->model->getAll($searchName, $searchPhone, $searchEmail);
        echo json_encode(['success' => true, 'data' => $clientes]);
    }

    public function create() {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (!isset($data['nome']) || !isset($data['numero_cliente']) || !isset($data['email_cliente'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios (nome, numero_cliente, email_cliente) ausentes.']);
            return;
        }

        $result = $this->model->create($data);
        if ($result === true) {
            http_response_code(201); // Created
            echo json_encode(['success' => true, 'message' => 'Cliente criado com sucesso!']);
        } elseif ($result === 'phone_exists') { // Alterado para 'phone_exists'
            http_response_code(409); // Conflict
            echo json_encode(['success' => false, 'message' => 'Já existe um cliente cadastrado com este número de telefone.']);
        } elseif ($result === 'email_exists') { // NOVO: Tratamento para email duplicado
            http_response_code(409); // Conflict
            echo json_encode(['success' => false, 'message' => 'Já existe um cliente cadastrado com este endereço de email.']);
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(['success' => false, 'message' => 'Erro ao criar cliente.']);
        }
    }

    public function update($id) {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (!isset($id) || !isset($data['nome']) || !isset($data['numero_cliente']) || !isset($data['email_cliente'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios (id, nome, numero_cliente, email_cliente) ausentes.']);
            return;
        }
        $data['id'] = $id; // Garante que o ID da URL seja usado

        $result = $this->model->update($data);
        if ($result === true) {
            http_response_code(200); // OK
            echo json_encode(['success' => true, 'message' => 'Cliente atualizado com sucesso!']);
        } elseif ($result === 'phone_exists') { // Alterado para 'phone_exists'
            http_response_code(409); // Conflict
            echo json_encode(['success' => false, 'message' => 'Já existe outro cliente cadastrado com este número de telefone.']);
        } elseif ($result === 'email_exists') { // NOVO: Tratamento para email duplicado
            http_response_code(409); // Conflict
            echo json_encode(['success' => false, 'message' => 'Já existe outro cliente cadastrado com este endereço de email.']);
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar cliente.']);
        }
    }

    public function delete($id) {
        if (!isset($id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID do cliente ausente.']);
            return;
        }

        if ($this->model->delete($id)) {
            http_response_code(200); // OK
            echo json_encode(['success' => true, 'message' => 'Cliente excluído com sucesso!']);
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir cliente.']);
        }
    }
}

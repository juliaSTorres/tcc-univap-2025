<?php
require_once __DIR__ . '/../config/Database.php';

class Cliente {
    private $conn;
    private $table_name = "clientes";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // Função auxiliar para limpar o número de telefone (apenas dígitos)
    private function cleanPhoneNumber($phoneNumber) {
        return preg_replace('/\D/', '', $phoneNumber); // Remove tudo que não for dígito
    }

    // NOVO MÉTODO: Verifica se um cliente com o dado número de telefone já existe
    public function existsByPhoneNumber($phoneNumber, $excludeId = null) {
        $phoneNumberCleaned = $this->cleanPhoneNumber($phoneNumber);
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE numero_cliente = :numero_cliente";
        
        // Se for uma atualização (excludeId fornecido), exclui o próprio cliente da verificação
        if ($excludeId !== null) {
            $query .= " AND id != :exclude_id";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":numero_cliente", $phoneNumberCleaned);
        
        if ($excludeId !== null) {
            $stmt->bindParam(":exclude_id", $excludeId, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }

    // NOVO MÉTODO: Verifica se um cliente com o dado email já existe
    public function existsByEmail($email, $excludeId = null) {
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE email_cliente = :email_cliente";
        
        // Se for uma atualização (excludeId fornecido), exclui o próprio cliente da verificação
        if ($excludeId !== null) {
            $query .= " AND id != :exclude_id";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email_cliente", $email);
        
        if ($excludeId !== null) {
            $stmt->bindParam(":exclude_id", $excludeId, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }

    // NOVO MÉTODO: Obtém o ID de um cliente pelo número de telefone
    public function getClienteIdByPhoneNumber($phoneNumber) {
        $phoneNumberCleaned = $this->cleanPhoneNumber($phoneNumber);
        $query = "SELECT id FROM " . $this->table_name . " WHERE numero_cliente = :numero_cliente LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":numero_cliente", $phoneNumberCleaned);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['id'] : null;
    }

    // NOVO MÉTODO: Obtém o ID de um cliente pelo email
    public function getClienteIdByEmail($email) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email_cliente = :email_cliente LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email_cliente", $email);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['id'] : null;
    }

    // Método para criar um novo cliente
    public function create($data) {
        // Validação básica
        if (empty($data['nome']) || empty($data['numero_cliente']) || empty($data['email_cliente'])) {
            return false;
        }

        $numero_cliente_cleaned = $this->cleanPhoneNumber($data['numero_cliente']);

        // VERIFICAÇÃO DE UNICIDADE DO TELEFONE
        if ($this->existsByPhoneNumber($numero_cliente_cleaned)) {
            error_log("Tentativa de criar cliente com número de telefone existente: " . $numero_cliente_cleaned);
            return 'phone_exists'; // Retorna uma string específica para indicar que o número existe
        }
        
        // VERIFICAÇÃO DE UNICIDADE DO EMAIL
        if ($this->existsByEmail($data['email_cliente'])) {
            error_log("Tentativa de criar cliente com email existente: " . $data['email_cliente']);
            return 'email_exists'; // Retorna uma string específica para indicar que o email existe
        }


        $query = "INSERT INTO " . $this->table_name . " (nome, numero_cliente, email_cliente) VALUES (:nome, :numero_cliente, :email_cliente)";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":nome", $data['nome']);
        $stmt->bindParam(":numero_cliente", $numero_cliente_cleaned);
        $stmt->bindParam(":email_cliente", $data['email_cliente']);

        if ($stmt->execute()) {
            return true;
        }
        error_log("Erro ao criar cliente: " . implode(" ", $stmt->errorInfo()));
        return false;
    }

    // Método para obter todos os clientes (com filtro opcional)
    public function getAll($searchName = '', $searchPhone = '', $searchEmail = '') {
        $query = "SELECT id, nome, numero_cliente, email_cliente, data_cadastro FROM " . $this->table_name . " WHERE 1=1";
        $params = [];

        if (!empty($searchName)) {
            $query .= " AND nome LIKE :searchName";
            $params[':searchName'] = '%' . $searchName . '%';
        }
        if (!empty($searchPhone)) {
            // Limpa o telefone de pesquisa para comparar apenas dígitos
            $searchPhone = $this->cleanPhoneNumber($searchPhone);
            $query .= " AND numero_cliente LIKE :searchPhone";
            $params[':searchPhone'] = '%' . $searchPhone . '%';
        }
        if (!empty($searchEmail)) {
            $query .= " AND email_cliente LIKE :searchEmail";
            $params[':searchEmail'] = '%' . $searchEmail . '%';
        }

        $query .= " ORDER BY nome ASC";

        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => &$val) {
            $stmt->bindParam($key, $val);
        }

        try {
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar clientes: " . $e->getMessage());
            return [];
        }
    }

    // Método para obter um único cliente por ID
    public function getById($id) {
        $query = "SELECT id, nome, numero_cliente, email_cliente, data_cadastro FROM " . $this->table_name . " WHERE id = :id LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Método para atualizar um cliente existente
    public function update($data) {
        if (empty($data['id']) || empty($data['nome']) || empty($data['numero_cliente']) || empty($data['email_cliente'])) {
            return false;
        }

        $numero_cliente_cleaned = $this->cleanPhoneNumber($data['numero_cliente']);

        // VERIFICAÇÃO DE UNICIDADE DO TELEFONE (excluindo o próprio ID do cliente)
        if ($this->existsByPhoneNumber($numero_cliente_cleaned, $data['id'])) {
            error_log("Tentativa de atualizar cliente com número de telefone já existente em outro cliente: " . $numero_cliente_cleaned);
            return 'phone_exists';
        }
        
        // VERIFICAÇÃO DE UNICIDADE DO EMAIL (excluindo o próprio ID do cliente)
        if ($this->existsByEmail($data['email_cliente'], $data['id'])) {
            error_log("Tentativa de atualizar cliente com email já existente em outro cliente: " . $data['email_cliente']);
            return 'email_exists';
        }

        $query = "UPDATE " . $this->table_name . " SET nome = :nome, numero_cliente = :numero_cliente, email_cliente = :email_cliente WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":nome", $data['nome']);
        $stmt->bindParam(":numero_cliente", $numero_cliente_cleaned);
        $stmt->bindParam(":email_cliente", $data['email_cliente']);
        $stmt->bindParam(":id", $data['id'], PDO::PARAM_INT);

        if ($stmt->execute()) {
            return true;
        }
        error_log("Erro ao atualizar cliente: " . implode(" ", $stmt->errorInfo()));
        return false;
    }

    // Método para deletar um cliente
    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return true;
        }
        error_log("Erro ao deletar cliente: " . implode(" ", $stmt->errorInfo()));
        return false;
    }
}

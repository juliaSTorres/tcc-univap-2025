<?php

class Database {
    private $host = "localhost";
    private $port = "3306";
    private $db_name = "Solicitacoes_db";
    private $username = "martinelli"; 
    private $password = "@Leodan1";     
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            error_log("Erro de conexão: " . $exception->getMessage()); // Loga o erro em vez de morrer silenciosamente
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro interno do servidor.']);
            exit();
        }
        return $this->conn;
    }
}
?>
<?php
require_once __DIR__ . '/../models/Cliente.php';
require_once __DIR__ . '/../config/JwtHandler.php';

class LoginController {
    private $clienteModel;
    private $jwtHandler;

    public function __construct() {
        $this->clienteModel = new Cliente();
        $this->jwtHandler = new JwtHandler();
    }

    public function authenticate() {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios.']);
            return;
        }

        $email = $data['email'];
        $password = $data['password'];

        // Admin hardcoded para demonstração
        if ($email === 'admin@admin.com') {
            // VERIFICAÇÃO DE SENHA DO ADMIN
            // Usar password_verify com um hash pre-gerado
            $hashedPasswordAdmin = password_hash('senha123', PASSWORD_DEFAULT); // hash gerado apenas para exemplo
            if (password_verify($password, '$2y$10$w8u3t3n0w7b0o1e2f3g4h5i6j7k8l9m0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6')) { // Substituir pelo hash real
                $token = $this->jwtHandler->generateToken(['email' => $email, 'role' => 'admin']);
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Login de administrador bem-sucedido.', 'token' => $token, 'role' => 'admin']);
                return;
            }
        }

        // Tenta encontrar o cliente pelo email
        $cliente = $this->clienteModel->getClienteByEmail($email);
        
        if ($cliente && password_verify($password, $cliente['hashed_password'])) {
            // Credenciais válidas. Gera o JWT
            $token = $this->jwtHandler->generateToken(['cliente_id' => $cliente['id'], 'email' => $cliente['email'], 'role' => 'cliente']);
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Login de cliente bem-sucedido.', 'token' => $token, 'cliente_id' => $cliente['id'], 'role' => 'cliente']);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos.']);
        }
    }
}
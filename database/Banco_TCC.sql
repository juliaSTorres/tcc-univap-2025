-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 21/11/2025 às 16:52
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `tcc_finalizado`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `numero_cliente` varchar(20) NOT NULL,
  `email_cliente` varchar(255) NOT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `clientes`
--

INSERT INTO `clientes` (`id`, `nome`, `numero_cliente`, `email_cliente`, `data_cadastro`) VALUES
(26, 'Ana Silvaa', '5512988880001', 'ana.silva@email.com', '2025-10-23 02:22:34'),
(27, 'Bruno Costa', '5512988880002', 'bruno.costa@email.com', '2025-10-23 02:22:34'),
(28, 'Carla Dias', '5512988880003', 'carla.dias@email.com', '2025-10-23 02:22:34'),
(29, 'David Martins', '5512988880004', 'david.martins@email.com', '2025-10-23 02:22:34'),
(30, 'Ester Gomes', '55129888800055', 'ester.gomes@email.com', '2025-10-23 02:22:34'),
(31, 'Felipe Rocha', '5512988880006', 'felipe.rocha@email.com', '2025-10-23 02:22:34'),
(32, 'Gabriela Lima', '5512988880007', 'gabriela.lima@email.com', '2025-10-23 02:22:34'),
(33, 'Hugo Alves', '5512988880008', 'hugo.alves@email.com', '2025-10-23 02:22:34'),
(34, 'Isabela Neves', '5512988880009', 'isabela.neves@email.com', '2025-10-23 02:22:34'),
(35, 'João Pereira', '5512988880010', 'joao.pereira@email.com', '2025-10-23 02:22:34'),
(36, 'Enzo Raphael Boquimpani de Moura Nascimento ', '5512991443990', 'enzoraphaelsjc@gmail.com', '2025-10-23 13:29:20'),
(38, 'Julia Torres', '5512988881363', 'juliasenratorres@gmail.com', '2025-10-23 13:39:19'),
(39, 'Leonardo Martinelli de Oliveira Lima', '5512996415762', 'hypedleo1@gmail.com', '2025-10-23 13:55:22');

-- --------------------------------------------------------

--
-- Estrutura para tabela `detalhes_design`
--

CREATE TABLE `detalhes_design` (
  `solicitacao_id` int(11) NOT NULL,
  `texto_fundamental` text DEFAULT NULL,
  `data_evento` datetime DEFAULT NULL,
  `uso_e_objetivo_arte` text DEFAULT NULL,
  `imagem_referencia` varchar(255) DEFAULT NULL,
  `formatos_entrega` text DEFAULT NULL,
  `arquivos_necessarios` text DEFAULT NULL,
  `email_aprovacao_orcamento` varchar(255) DEFAULT NULL,
  `link_qr_code` varchar(255) DEFAULT NULL,
  `observacoes_complementares` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `detalhes_video`
--

CREATE TABLE `detalhes_video` (
  `solicitacao_id` int(11) NOT NULL,
  `titulo_video` varchar(255) DEFAULT NULL,
  `tempo_duracao` varchar(100) DEFAULT NULL,
  `onde_passara_video` text DEFAULT NULL,
  `referencia_video` varchar(255) DEFAULT NULL,
  `fonte_imagens` varchar(255) DEFAULT NULL,
  `roteiro_video` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionarios`
--

CREATE TABLE `funcionarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone_funcionario` varchar(20) DEFAULT NULL,
  `cargo` enum('Administrador','Designer') DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `funcionarios`
--

INSERT INTO `funcionarios` (`id`, `nome`, `email`, `telefone_funcionario`, `cargo`, `senha`, `data_criacao`) VALUES
(1, 'Administrador', 'admin@housinho.com', '5512996415762', 'Administrador', '$2y$10$PpsKSXBgro0aZjnmMMVpf./R2lGc4isAuQE5nNjq8oJgRYvvYFtWe', '2025-10-19 19:23:54'),
(3, 'Leonardo Martinelli de Oliveira Lima', 'martinelliunivap@gmail.com', '5512996415763', 'Designer', '$2y$10$n4T0GwCHcIlPePXPVufLcuSFom.QgtQxeWp5rtVq6piQblB1OrUFi', '2025-10-21 00:15:11'),
(4, 'Julia Senra Torres', 'julia@gmail.com', '5512996415760', 'Designer', '$2y$10$QhuBuv43rjNht6Mx6lcLwufBgXtNzMjXnFpj5GNp3yra.Bh27VzpS', '2025-10-23 02:35:51'),
(5, 'Eduardo Martinelli', 'eduardo@gmail.com', '5512996845971', 'Designer', '$2y$10$ifFTc/yXlDdTrDcDGPC4Geoh049SkJYit0brUjPAeSqH3zij8CMA.', '2025-10-23 13:50:49'),
(6, 'Nikolas Seti', 'seti@gmail.com', '551292001308', 'Designer', '$2y$10$s7Si2rEM0acbLIIJL81qPe42APWyVrp206S92NBNfx8vJryDNXCmS', '2025-10-23 13:51:28');

-- --------------------------------------------------------

--
-- Estrutura para tabela `solicitacoes`
--

CREATE TABLE `solicitacoes` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `tipo_solicitacao` enum('VIDEO','DESIGN') NOT NULL,
  `ministerio` varchar(100) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `data_entrega` datetime DEFAULT NULL,
  `publico_alvo` text DEFAULT NULL,
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  `motivo_rejeicao` varchar(255) DEFAULT NULL,
  `observacao_rejeicao` text DEFAULT NULL,
  `trello_card_id` varchar(255) DEFAULT NULL,
  `trello_list_name` varchar(255) DEFAULT NULL,
  `status_interno` varchar(255) DEFAULT NULL,
  `motivo_cancelamento` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `trello_configuracao`
--

CREATE TABLE `trello_configuracao` (
  `id` int(11) NOT NULL,
  `board_id` varchar(255) NOT NULL,
  `list_design_id` varchar(255) NOT NULL,
  `list_video_id` varchar(255) NOT NULL,
  `list_finished_id` varchar(255) NOT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `adjustment_list_id` varchar(255) DEFAULT NULL,
  `approved_list_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `trello_configuracao`
--

INSERT INTO `trello_configuracao` (`id`, `board_id`, `list_design_id`, `list_video_id`, `list_finished_id`, `data_criacao`, `data_atualizacao`, `adjustment_list_id`, `approved_list_id`) VALUES
(1, '2pdypkfN', '685ab43e7e4132b1b1aa0c38', '685da9cdfbc22fd07cc77968', '685ab47e223dee2ac54c97cf', '2025-10-09 01:34:28', '2025-10-10 03:48:45', '6891e535781dba6c9e7a7e30', '685ab48a26197fa973c692a4');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_cliente` (`numero_cliente`),
  ADD UNIQUE KEY `email_cliente` (`email_cliente`);

--
-- Índices de tabela `detalhes_design`
--
ALTER TABLE `detalhes_design`
  ADD PRIMARY KEY (`solicitacao_id`);

--
-- Índices de tabela `detalhes_video`
--
ALTER TABLE `detalhes_video`
  ADD PRIMARY KEY (`solicitacao_id`);

--
-- Índices de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `solicitacoes`
--
ALTER TABLE `solicitacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Índices de tabela `trello_configuracao`
--
ALTER TABLE `trello_configuracao`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `solicitacoes`
--
ALTER TABLE `solicitacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `trello_configuracao`
--
ALTER TABLE `trello_configuracao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `detalhes_design`
--
ALTER TABLE `detalhes_design`
  ADD CONSTRAINT `detalhes_design_ibfk_1` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacoes` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `detalhes_video`
--
ALTER TABLE `detalhes_video`
  ADD CONSTRAINT `detalhes_video_ibfk_1` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacoes` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `solicitacoes`
--
ALTER TABLE `solicitacoes`
  ADD CONSTRAINT `solicitacoes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

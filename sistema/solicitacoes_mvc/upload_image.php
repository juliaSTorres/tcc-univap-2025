<?php
// This file is included by index.php, so headers are already set.
// It also needs to handle its own JSON response.

$response = ['success' => false, 'message' => '', 'imageUrl' => ''];

if (isset($_FILES['refImage']) && $_FILES['refImage']['error'] == UPLOAD_ERR_OK) {
    // Define the upload directory relative to index.php
    $target_dir = __DIR__ . '/public/uploads/';
    // Define the URL path for the image
    $baseUrlForImages = '/solicitacoes_mvc/public/uploads/'; // Adjust this if your project structure changes

    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $file_name = uniqid() . '_' . basename($_FILES['refImage']['name']);
    $target_file = $target_dir . $file_name;
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    // Check if image file is an actual image or fake image
    $check = getimagesize($_FILES['refImage']['tmp_name']);
    if($check !== false) {
        // Allow certain file formats
        if(!in_array($imageFileType, ["jpg", "png", "jpeg", "gif"])) {
            $response['message'] = "Desculpe, apenas arquivos JPG, JPEG, PNG e GIF são permitidos.";
        } else {
            if (move_uploaded_file($_FILES['refImage']['tmp_name'], $target_file)) {
                $response['success'] = true;
                $response['message'] = "O arquivo ". htmlspecialchars( basename( $_FILES['refImage']['name'])). " foi enviado.";
                $response['imageUrl'] = $baseUrlForImages . $file_name;
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
exit(); // Ensure no further output from index.php
?>
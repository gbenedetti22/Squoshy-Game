<?php
include "util.php";
session_start();

/*
 * File PHP per la gestione del login
 * Il client invia un form tramite POST, il Server controlla se nel database l utente è presente e invia al client l url
 * del file html del gioco. Se l utente non è presente o avvengono altri errori, il Server notifica al Client l errore
 * avvenuto
 */

$username = $_POST['username'];
$password = $_POST['password'];
$response = null;   // viene inizializzata solo se il login avviene con successo
$responseText = "OK"; // risposta di default nel caso tutto vada per il meglio

if (login($username, $password)) {
    header("Location: ../html/game.html");
    exit(0);
} else {
    http_response_code(500);
    session_destroy();
    echo $responseText;
    exit(1);
}

function login($username, $password): bool {
    global $responseText;

    // Stabilisco una connessione con il database
    $db = new mysqli("localhost", USERNAME, PASSWORD, DATABASE_NAME);
    if($db->connect_errno > 0){
        $responseText = "Impossibile connettersi al database";
        return false;
    }

    // Cerco l utente nel db
    $smt = $db->prepare("SELECT * FROM squoshydb.players WHERE username = ?");
    $smt->bind_param("s", $username);
    $smt->execute();
    $result = $smt->get_result();

    //caso in cui l utente non esiste
    if($result->num_rows == 0) {
        $responseText = "Questo utente non esiste";
        $result->close();
        $db->close();
        return false;
    }

    // Controllo che la password sia giusta
    $row = $result->fetch_assoc();
    $db_password = $row['password'];
    if(!password_verify($password, $db_password)) {
        $responseText = "La password inserita non è corretta";
        $result->close();
        $db->close();
        return false;
    }

    // Da qui in poi l utente esiste e la password è corretta

    global $response;

    $response = new stdClass();
    $response->username = $row['username'];
    $response->currentLevel = $row['currentLevel'];
    $response->spawnPointX = $row['spawnPointX'];
    $response->spawnPointY = $row['spawnPointY'];
    $response->currentScore = $row['currentScore'];

    $_SESSION['username'] = $response;
    $result->close();
    $db->close();
    return true;
}
<?php
include "util.php";
session_start();

$username = $_POST['username'];
$password = $_POST['password'];
$response = null;   // viene inizializzata solo se il login avviene con successo
$responseText = "OK";

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

    $db = new mysqli("localhost", "root", "", "squoshydb");
    if($db->connect_errno > 0){
        $responseText = "Impossibile connettersi al database";
        return false;
    }
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

    $row = $result->fetch_assoc();
    $db_password = $row['password'];
    if(!password_verify($password, $db_password)) {
        $responseText = "La password inserita non è corretta";
        return false;
    }

    global $response;

    $response = new stdClass();
    $response->username = $row['username'];
    $response->currentLevel = $row['currentLevel'];
    $response->spawnPointX = $row['spawnPointX'];
    $response->spawnPointY = $row['spawnPointY'];
    $response->currentScore = $row['currentScore'];
    console_log("login ".$response->currentLevel);

    $_SESSION['username'] = $response;
    $result->close();
    $db->close();
    return true;
}
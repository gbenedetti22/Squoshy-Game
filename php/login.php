<?php
include "util.php";
session_start();

$username = $_POST['username'];
$password = $_POST['password'];
$response = null;   // viene inizializzata solo se il login avviene con successo

if (login($username, $password)) {
    $dom = getGameDocument("../html/game.html", $response);
    echo $dom->saveHTML();
    exit(0);
} else {
    http_response_code(404);
    exit(1);
}

function login($username, $password) {
    $db = new mysqli("localhost", "root", "", "squoshydb");
    if($db->connect_errno > 0){
        http_response_code(500);
        die('Unable to connect to database [' . $db->connect_error . ']');
    }
    $smt = $db->prepare("SELECT * FROM squoshydb.players WHERE username = ?");
    $smt->bind_param("s", $username);
    $smt->execute();
    $result = $smt->get_result();

    //caso in cui l utente non esiste
    if($result->num_rows == 0) {
        $result->close();
        $db->close();
        return false;
    }

    $row = $result->fetch_assoc();
    $db_password = $row['password'];
    if(!password_verify($password, $db_password)) {
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
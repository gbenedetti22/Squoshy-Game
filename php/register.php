<?php
include "util.php";

/*
 * File PHP per la gestione della registrazione
 *
 * Il client invia il form al Server tramite POST,
 * successivamente vengono fatti i dovuti controlli (username troppo lungo, password troppo corta ecc)
 * ed infine, se "password" e "ripeti password" corrispondono, viene inserito l utente nel database
 *
 * Il punto di spawn viene messo a (0,0), il punteggio corrente a NULL e il punteggio massimo mai fatto a 0
 * Se la registrazione va a buon fine, l utente viene reindirizzato al file html del gioco (login automatico)
 */

$username = $_POST['username'];
$password = $_POST['password'];
$repeat_password = $_POST['repeat_password'];
$response = null;

if(!isset($username) || !isset($password) || !isset($repeat_password)) {
    http_response_code(500);
    echo "Username o password non settate";
    exit(1);
}

if(strlen($username) > 10) {
    http_response_code(500);
    echo "Username troppo lungo (max 10 caratteri)";
    exit(1);
}

if(strlen($password) > 16) {
    http_response_code(500);
    echo "Password troppo lunga (max 16 caratteri)";
    exit(1);
}

if(ctype_space($username) || ctype_space($password) || ctype_space($repeat_password)) {
    http_response_code(500);
    echo "Username o password contengono spazi";
    exit(1);
}

if($password == $repeat_password) {
    // Stabilisco una connessione con il DB
    $db = new mysqli("localhost", USERNAME, PASSWORD, DATABASE_NAME);
    if($db->connect_error) {
        http_response_code(500);
        echo "Impossibile connettersi al database";
        exit(1);
    }

    // Inserisco nel database l utente
    $smt = $db->prepare("INSERT INTO squoshydb.players(`username`, `password`, `currentLevel`, `spawnPointX`, `spawnPointY`, currentScore , `maxScore`) VALUES (?,?,1,0,0,0,0)");
    $crypted_password = password_hash($password, PASSWORD_BCRYPT);
    $smt->bind_param("ss", $username, $crypted_password);
    $smt->execute();

    // Visto che il nome utente viene usato come chiave primaria, posso anche non controllare se già esiste
    // Di fatto, se esiste già un utente con quello username $smt->affected_rows sarà 0
    if($smt->affected_rows == 1) {
        global $response;
        $db->close();

        // Eseguo un login automatico
        session_start();
        $response = new stdClass();
        $response->username = $username;
        $response->currentLevel = 1;
        $response->spawnPointX = 0;
        $response->spawnPointY = 0;
        $response->currentScore = 0;

        $_SESSION['username'] = $response;

        header("Location: ../html/game.html");
        exit();
    } else {
        http_response_code(500);
        echo "Utente già esistente";
        exit(1);
    }
}else {
    http_response_code(500);
    echo "Le 2 password non corrispondono";
    exit(1);
}
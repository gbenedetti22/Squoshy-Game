<?php
include "util.php";
session_start();

/*
 * File PHP per il salvataggio dello stato corrente tramite dei checkpoint
 *
 * Il Server riceve in input un oggetto contenente
 * la posizione del checkpoint e lo score corrente ottenuto e salva tutto nel Database
 *
 * Risponde con true se è andato tutto bene, false altrimenti
 */
$str_json = file_get_contents('php://input');

$checkpoint = json_decode($str_json);
$username = $_SESSION['username']->username;

// Se il checkpoint ricevuto è uguale a quello sul Database, non salvo nulla
if(!checkPreviousCheckpoint()) {
    echo json_encode(array("success" => true));
    exit();
}

$executed = prepearExecuteQuery("UPDATE squoshydb.players 
SET spawnPointX = ?, spawnPointY = ?, currentScore = ? WHERE username = ?",
    "iiis", $checkpoint->x, $checkpoint->y, $checkpoint->score, $_SESSION['username']->username);

// Aggiorno la sessione corrente con il nuovo punto di spawn
if ($executed) {
    $_SESSION['username']->spawnPointX = $checkpoint->x;
    $_SESSION['username']->spawnPointY = $checkpoint->y;

    echo json_encode(array("success" => true));
    exit();
} else {
    http_response_code(500);
    echo json_encode(array("success" => false));
    session_destroy();
    exit(1);
}

function checkPreviousCheckpoint(): bool {
    global $checkpoint, $username;

    $db = new mysqli("localhost", USERNAME, PASSWORD, DATABASE_NAME);
    if($db->connect_errno > 0) {
        return false;
    }

    // Cerco l utente nel db
    $smt = $db->prepare("SELECT * FROM squoshydb.players WHERE username = ?");
    $smt->bind_param("s", $username);
    $smt->execute();
    $result = $smt->get_result();
    $row = $result->fetch_assoc();
    $previousSpawnX = $row['spawnPointX'];
    $currentCheckpointX = $checkpoint->x;
    $smt->close();
    $db->close();

    if($currentCheckpointX <= $previousSpawnX) {
        return false;
    }

    return true;
}
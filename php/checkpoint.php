<?php
include "util.php";
session_start();

$str_json = file_get_contents('php://input');

$checkpoint = json_decode($str_json);
$username = $_SESSION['username']->username;
$executed = prepearExecuteQuery("UPDATE squoshydb.players SET spawnPointX = ?, spawnPointY = ?, currentScore = ? WHERE username = ?",
    "iiis", $checkpoint->x, $checkpoint->y, $checkpoint->score, $_SESSION['username']->username);

if ($executed) {
    $_SESSION['username']->spawnPointX = $checkpoint->x;
    $_SESSION['username']->spawnPointY = $checkpoint->y;

    echo json_encode(array("success" => true));
    exit();
} else {
    echo json_encode(array("success" => false));
    session_destroy();
    exit(1);
}
<?php
session_start();
include "util.php";

if (isset($_SESSION['username'])) {
    $userData = $_SESSION['username'];

    startGame($userData);
}

function startGame($response)
{
    $dom = getGameDocument("html/game.html", $response);
    echo $dom->saveHTML();
    exit(0);
}
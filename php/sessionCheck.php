<?php
session_start();

if (isset($_SESSION['username'])) {
    header("Location: /ProgettoPWeb/html/game.html");
    exit(0);
}
<?php
session_start();
include "util.php";

if (isset($_SESSION['username'])) {
    header("Location: ../html/game.html");
    exit(0);
}
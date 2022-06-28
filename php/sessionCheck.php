<?php
session_start();

/*
 * File PHP per controllare se l utente è già loggato
 * Questo file viene eseguito subito appena il client apre il file index.php
 *
 * Non è possibile mettere questo if nel file login.php in quanto quello viene chiamato nel momento del submit del form
 * Se l utente è già loggato, viene reindirizzato al file html del gioco dal quale scaricherà tutti i dati
 * (come se si fosse loggato)
 */
if (isset($_SESSION['username'])) {
    header("Location: /ProgettoPWeb/html/game.html");
    exit(0);
}
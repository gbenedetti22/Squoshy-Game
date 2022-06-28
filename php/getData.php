<?php
session_start();

/*
 * File PHP per reperire le informazioni sulla sessione corrente.
 * Utile quando l utente refresha la pagina
 */
if(isset($_SESSION['username'])){
    echo json_encode($_SESSION['username']);
    exit();
}

echo "not logged";
exit(1);
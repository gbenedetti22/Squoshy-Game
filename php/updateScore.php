<?php
include 'util.php';

/*
 * File PHP per la gestione delo score
 * Il Server tiene traccia, mediante la sessione, del livello corrente dell utente e quindi
 * sà se il giocatore ha raggiunto la fine del gioco
 * (NON è quindi il client, ad avvisare il Server, se ha finito il gioco oppure no)
 *
 * Se la fine del gioco è stata raggiunta, il Server setta lo score totale
 */

session_start();

$str_json = file_get_contents('php://input');

$obj = json_decode($str_json);
$score = max($obj->score,0);
$score += 5;

//Se il giocatore non è arrivato in fondo, ma ha semplicemente cambiato livello
if ($_SESSION['username']->currentLevel < $_SESSION['levels']) {
    // Aggiorno lo score nella sessione
    if (isset($_SESSION['username'])) {
        $_SESSION['username']->currentScore = $score;
    } else {
        fail();
    }

    // Aggiorno lo score e il livello corrente sul database
    if (!updatePlayer($_SESSION['username']->currentScore, $_SESSION['username']->currentLevel + 1)) {
        fail();
    }

    // Aggiorno la sessione corrente
    $_SESSION['username']->currentLevel += 1;
    // Questo perchè, nel caso in cui l utente aggiorni la pagina subito dopo un cambio livello, non deve rimanere traccia
    // degli spawnpoint del vecchio livello
    $_SESSION['username']->spawnPointX = 0;
    $_SESSION['username']->spawnPointY = 0;
} else {
    // Se il giocatore ha raggiunto la fine..

    // Calcolo lo score totale
    $totalScore = $score;

    // Setto nel database lo score raggiunto
    if (!setTotalScore($totalScore)) {
        console_log("errore nel settaggio del total score");
        fail();
    }

    $_SESSION['username']->currentScore = 0;
    $_SESSION['username']->currentLevel = 1;
    $_SESSION['username']->spawnPointX = 0;
    $_SESSION['username']->spawnPointY = 0;

    console_log("total score settato");
}

header('Content-Type: application/json');
echo json_encode(array('updated' => true));
exit();

function updatePlayer($score, $new_level): bool
{
    $executed = prepearExecuteQuery("UPDATE squoshydb.players SET
                             currentScore = ?, currentLevel = ?, spawnPointX = 0, spawnPointY = 0 WHERE username = ?",
        "iis", $score, $new_level, $_SESSION['username']->username);

    console_log("updatePlayer: " . ($executed ? "true" : "false"));

    return $executed;
}

//funzione terminatrice: quando il giocatore è arrivato all ultimo livello,
//viene chiamata questa funzione per resettare tutto e aggiornare il punteggio massimo
function setTotalScore($score): bool
{
    $executed = prepearExecuteQuery("UPDATE squoshydb.players SET
                             currentScore = 0, currentLevel = 1, spawnPointX = 0, spawnPointY = 0
                             WHERE username = ?",
        "s", $_SESSION['username']->username);
    if (!$executed)
        return false;

    //prendo max score e guardo se il giocatore ha fatto un punteggio migliore
    $maxScore = getMaxScoreOf($_SESSION['username']->username);
    console_log("max score su db: " . $maxScore);
    if ($maxScore >= $score) {
        return true;
    }

    return prepearExecuteQuery("UPDATE squoshydb.players SET maxScore = ? WHERE username = ?",
        "is", $score, $_SESSION['username']->username);
}

function getMaxScoreOf($username)
{
    $db = new mysqli('localhost', USERNAME, PASSWORD, DATABASE_NAME);
    //query to get maxScore
    $smt = $db->prepare("SELECT maxScore FROM squoshydb.players WHERE username = ?");
    $smt->bind_param("s", $username);
    $smt->execute();
    return $smt->get_result()->fetch_assoc()['maxScore'];
}

function fail(): void
{
    session_destroy();
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(array('updated' => false));
    exit(1);
}
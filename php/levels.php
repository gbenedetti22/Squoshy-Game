<?php
session_start();

/*
 * File PHP per il mantenimento dei livelli
 * Essendo un array e pochi livelli, mi sono permesso di lasciarli dentro al file
 * E' chiaro che al crescere del numero dei livelli, questi debbano andare sul Database
 *
 * Il client richiede il prossimo livello e il Server risponde dandogli la mappa corretta sotto forma di array di string.
 * Questo è possibile sfruttando la sessione: il Server guarda nella sessione corrente a che livello è il giocatore
 */

/*
 * Legenda:
 * 0 -> vuoto
 * 1 -> piattaforma
 * 2 -> coin
 * 3 -> nemici
 * 4 -> torretta
 * 5 -> uccello
 * 6 -> vittoria
 * 7 -> checkpoint
 */

const LEVELS = array(
    1 => [
        "000000000000000000000000000000000",
        "000000000000000000700000000000000",
        "000000000002000001110000000000000",
        "000000001111000000000000000100006",
        "111111111111111111111000111111111",
    ],
    2 => [
        "000000000000000000000000000000000000000000000000000000000000000200000000000000000000000",
        "000000000000000000000000000000030000000000000000000000000000000100000000000000000000000",
        "0000000005000000000000000000011110000000000000000000000000000001000000000000000000000000",
        "0000000000000200000000001111000000000000000000000700000000000111000000000000013100000060",
        "11111000000001000000000000000000000000000010000111100000000011110000000000000111000000100",
    ],
    3 => [
        "0000000000000000200000000000",
        "0000500000000000111000000000",
        "0000000000030001100000000000",
        "000000020011100000000000000000000000000000000000",
        "0000001100000030000111007000400000010000000000000010006",
        "1111111111111111111111111111111111110000000000000011111",
    ]
);

if (!isset($_SESSION['levels'])) {
    $_SESSION['levels'] = count(LEVELS);
}

$response = array("lastLevel" => isLastLevel(), "level" => LEVELS[$_SESSION['username']->currentLevel]);

header("Content-Type: application/json");
echo json_encode($response);
exit();

// Funzione di utility per vedere se il giocatore è arrivato alla fine del livello
function isLastLevel(): bool
{
    return $_SESSION['username']->currentLevel == count(LEVELS);
}
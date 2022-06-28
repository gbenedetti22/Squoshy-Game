<?php

const USERNAME = "root";
const PASSWORD = "";
const DATABASE_NAME = "squoshydb";

// Stampa un messaggio sullo standard output (debug only)
function console_log($message): void
{
    $STDOUT = fopen("php://stdout", "w");
    fwrite($STDOUT, "\n" . $message . "\n");
    fclose($STDOUT);
}

// prepara ed esegue una semplice query sul database
function prepearExecuteQuery($query, $types, &$var1, &...$_): bool
{
    $db = new mysqli("localhost", USERNAME, PASSWORD, DATABASE_NAME);
    $stmt = $db->prepare($query);
    $stmt->bind_param($types, $var1, ...$_);
    $executed = $stmt->execute();
    $db->close();
    return $executed;
}
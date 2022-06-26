<?php
function console_log($message): void
{
    $STDOUT = fopen("php://stdout", "w");
    fwrite($STDOUT, "\n" . $message . "\n");
    fclose($STDOUT);
}

function prepearExecuteQuery($query, $types, &$var1, &...$_): bool
{
    $db = new mysqli("localhost", "root", "", "squoshydb");
    $stmt = $db->prepare($query);
    $stmt->bind_param($types, $var1, ...$_);
    $executed = $stmt->execute();
    $db->close();
    return $executed;
}
<?php
include "util.php";

/*
 * File PHP per reperire la classifica dei 10 miglior giocatori
 * La scelta del numero 10 è arbitraria e non modificabile
 */

$db = new mysqli('localhost', USERNAME, PASSWORD, DATABASE_NAME);
$query = "SELECT username, maxScore FROM squoshydb.players ORDER BY maxScore DESC LIMIT 10";
$result = $db->query($query);
$scores = array();
while ($row = $result->fetch_assoc()) {
    $scores[$row['username']] = $row['maxScore'];
}

$result->close();
$db->close();
header('Content-Type: application/json');
echo json_encode($scores);
exit();
<?php
include "util.php";

$db = new mysqli('localhost', 'root', '', 'squoshydb');
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
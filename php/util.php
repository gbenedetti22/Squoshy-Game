<?php
function console_log($message)
{
    $STDOUT = fopen("php://stdout", "w");
    fwrite($STDOUT, "\n" . $message . "\n");
    fclose($STDOUT);
}

function getGameDocument($path, $data) {
    $dom = new DOMDocument();
    $dom->encoding = 'utf-8';
    $dom->loadHTMLFile($path);

    $fun_call = $dom->createElement("script");
    $fun_call->setAttribute("type", "module");

    $dom->appendChild($fun_call);

    $json = json_encode($data);
    $fun_call->nodeValue = "
    import {setOptions} from \"../js/data.js\"\n
\n
    setOptions($json)
";
    return $dom;
}

function prepearExecuteQuery($query, $types, &$var1, &...$_) {
    $db = new mysqli("localhost", "root", "", "squoshydb");
    $stmt = $db->prepare($query);
    $stmt->bind_param($types, $var1, ...$_);
    $executed = $stmt->execute();
    $db->close();
    return $executed;
}
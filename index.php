<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Squoshy - Welcome</title>
    <link rel="stylesheet" href="./css/login.css">
</head>
<body>

<?php
    include './php/sessionCheck.php';
?>

<div class="form">
    <h1 id="title">SQUOSHY</h1>
    <form method="post" autocomplete="off" id="loginForm">
        <div class="fields">
            <label for="username">Username</label><input type="text" name="username" placeholder="Username" value="pippo" id="username">
            <label for="password">Password</label><input type="password" name="password" placeholder="Password" value="pippo" id="password">
            <input type="submit" value="Login & Play" id="button-submit">
            <label id="logLabel"></label>
        </div>
        <a href="html/register.html">Non sei ancora registrato? Clicca qui!</a>
    </form>
</div>
<script src="./js/login.js"></script>
</body>
</html>
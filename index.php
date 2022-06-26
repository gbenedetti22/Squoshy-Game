<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Squoshy - Welcome</title>
    <link rel="stylesheet" href="./css/login.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css" rel="stylesheet">
</head>
<body>

<?php
    include './php/sessionCheck.php';
?>

<div class="form">
    <h1 id="title">SQUOSHY</h1>
    <form method="post" action="./php/login.php" autocomplete="off" id="loginForm">
        <div class="fields">
            <label for="username">Username</label><input type="text" name="username" placeholder="Username" id="username">
            <div class="input-group">
                <label for="password">Password</label>
                <div class="password-form">
                    <input type="password" name="password" placeholder="Password" id="password">
                    <i class="far fa-eye" id="showPassword"></i>
                </div>
            </div>
            <input type="submit" value="Login & Play" id="button-submit">
            <label id="logLabel"></label>
        </div>
        <div class="register-link">
            <a href="html/register.html">Non sei ancora registrato? Clicca qui!</a>
        </div>
    </form>
</div>

<script src="js/login.js"></script>
</body>
</html>
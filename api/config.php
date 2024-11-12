<?php

function getConfig()
{
    return [
        "MYSQL_HOST" => "127.0.0.1",
        "MYSQL_NAME" => "project_managment",
        "MYSQL_USERNAME" => "root",
        "MYSQL_PASSWORD" => "root",
    ];
}

// disable warnings
error_reporting(E_ALL ^ E_WARNING);

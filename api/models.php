<?php

class Project
{
    static $maxTitleLength = 128;

    static function validateTitle($title)
    {
        if (!$title || !trim($title)) {
            return JSONResponse(["error" => "The project title can't be shorter than 1 character"]);
        }

        $maxLength = Project::$maxTitleLength;
        if (strlen($title) > $maxLength) {
            return JSONResponse(["error" => "The project title can't be longer than {$maxLength} characters"]);
        }

        return $title;
    }
}

class Task
{
    static $maxTitleLength = 128;
    static $maxDescLength = 512;
    static $categories = ["todo", "inprogress", "inreview", "done"];
    static $priorities = ["high", "medium", "low"];

    static function validateTitle($title)
    {
        if (!$title || !trim($title)) {
            return JSONResponse(["error" => "The task title can't be shorter than 1 character"]);
        }

        $maxLength = Task::$maxTitleLength;
        if (strlen($title) > $maxLength) {
            return JSONResponse(["error" => "The task title can't be longer than {$maxLength} characters"]);
        }

        return $title;
    }

    static function validateDesc($desc)
    {
        if (!$desc || $desc === "" || !trim($desc)) {
            return null;
        }

        $maxLength = Task::$maxDescLength;
        if (strlen($desc) > $maxLength) {
            return JSONResponse(["error" => "The task desc can't be longer than {$maxLength} characters"]);
        }

        return $desc;
    }

    static function validateCategory($category)
    {
        if (!$category || $category === "" || !in_array($category, Task::$categories)) {
            return JSONResponse(["error" => "The task category can only be one of these values: " . implode(", ", Task::$categories)]);
        }

        return $category;
    }

    static function validatePriority($priority)
    {
        if (!$priority || $priority === "" || !in_array($priority, Task::$priorities)) {
            return JSONResponse(["error" => "The task priority can only be one of these values: " . implode(", ", Task::$categories)]);
        }

        return $priority;
    }

    static function validateIsCompleted($isCompleted)
    {
        if ($isCompleted && !is_bool($isCompleted)) {
            return JSONResponse(["error" => "The task completed must be valid boolean value"]);
        }

        return $isCompleted;
    }

    static function validateEndedAt($endedAt)
    {
        if (!$endedAt) {
            return (new \DateTime('now'))->format('Y-m-d');
        }

        if (!is_numeric(strtotime($endedAt))) {
            return JSONResponse(["error" => "An unknown TIME format was received"]);
        }

        return $endedAt;
        // $date = date_create_from_format('YY-MM-DDTHH:II:SS', $endedAt);
        // return $date->getTimestamp();
    }
}

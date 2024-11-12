<?php

require_once '../controller.php';
require_once '../utils.php';
require_once '../db.php';
require_once '../models.php';

class TasksRouteController extends RouteController
{
    function get()
    {
        if (array_key_exists("id", array: $_GET)) {
            return $this->getById($_GET["id"]);
        }

        if (array_key_exists("project_id", array: $_GET)) {
            return $this->getByProjectId($_GET["project_id"]);
        }

        return $this->getAll();
    }

    function getAll()
    {
        $conn = openConnection();
        $result = mysqli_query($conn, "SELECT * FROM `tasks`");
        $data = mysqli_fetch_all($result, MYSQLI_ASSOC);
        mysqli_close($conn);
        $result = array_map(function ($item) {
            $item["completed"] = $item["completed"] === 1;
            return $item;
        }, $data);

        return JSONResponse($result, 200);
    }

    function getById($id)
    {
        if (!is_numeric($id)) {
            return JSONResponse(["error" => "Task not found"], 404);
        }

        $conn = openConnection();
        $stmt = mysqli_prepare($conn, "SELECT * FROM `tasks` WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, "d", $id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $data = mysqli_fetch_all($result, MYSQLI_ASSOC);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);
        if (!$data) {
            return JSONResponse(["error" => "Task not found"], 404);
        }

        $result = $data[0];
        $result["completed"] = $result["completed"] === 1;

        return JSONResponse($result, 200);
    }

    function getByProjectId($projectId)
    {
        if (!is_numeric($projectId)) {
            return JSONResponse(["error" => "Task not found"], 404);
        }

        $conn = openConnection();
        $stmt = mysqli_prepare($conn, "SELECT * FROM `tasks` WHERE `project_id` = ?");
        mysqli_stmt_bind_param($stmt, "d", $projectId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $data = mysqli_fetch_all($result, MYSQLI_ASSOC);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);
        if (!$data) {
            return JSONResponse(["error" => "Task not found"], 404);
        }

        $result = array_map(function ($item) {
            $item["completed"] = $item["completed"] === 1;
            return $item;
        }, $data);

        return JSONResponse($result, 200);
    }

    function post()
    {
        if (!array_key_exists("project_id", array: $_GET) || !is_numeric($_GET["project_id"])) {
            return JSONResponse(["error" => "project_id isn't set"]);
        }

        $projectId = $_GET["project_id"];
        $body = $this->getJSONBody();
        $requiredKeys = ["title", "category", "priority"];
        validateBody($body, $requiredKeys);
        $taskTitle = $body->title;
        $taskCategory = $body->category;
        $taskPriority = $body->priority;
        $taskCompleted = $body->completed;
        Task::validateTitle($taskTitle);
        Task::validateCategory($taskCategory);
        Task::validatePriority($taskPriority);
        Task::validateIsCompleted($taskCompleted);
        $taskEndedAt = Task::validateEndedAt($body->ended_at);
        $taskDesc = Task::validateDesc(desc: $body->desc);

        $conn = openConnection();
        $stmt = mysqli_prepare($conn, "INSERT INTO `tasks` (`title`, `desc`, `category`, `priority`, `completed`, `ended_at`, `project_id`) VALUES (?, ?, ?, COALESCE(?, DEFAULT(priority)), COALESCE(?, DEFAULT(completed)), COALESCE(?, DEFAULT(ended_at)), ?)");
        mysqli_stmt_bind_param($stmt, "ssssdsd", $taskTitle, $taskDesc, $taskCategory, $taskPriority, $taskCompleted, $taskEndedAt, $projectId);
        mysqli_stmt_execute($stmt);

        $lastId = mysqli_insert_id($conn);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);

        return $this->getById($lastId);
    }

    function put()
    {
        if (!array_key_exists("id", array: $_GET) || !is_numeric($_GET["id"])) {
            return JSONResponse(["error" => "Task not found"], 404);
        }

        $id = $_GET["id"];

        $body = $this->getJSONBody();
        $requiredKeys = ["title", "category", "priority"];
        validateBody($body, $requiredKeys);
        $taskTitle = $body->title;
        $taskCategory = $body->category;
        $taskPriority = $body->priority;
        $taskCompleted = $body->completed;
        Task::validateTitle($taskTitle);
        Task::validateCategory($taskCategory);
        Task::validatePriority($taskPriority);
        Task::validateIsCompleted($taskCompleted);
        $taskEndedAt = Task::validateEndedAt($body->ended_at);
        $taskDesc = Task::validateDesc(desc: $body->desc);

        $conn = openConnection();
        $stmt = mysqli_prepare($conn, "UPDATE `tasks` SET `title` = ?, `desc` = ?, `category` = ?, `priority` = COALESCE(?, DEFAULT(priority)), `completed` = COALESCE(?, DEFAULT(completed)), `ended_at` = COALESCE(?, DEFAULT(ended_at)) WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, "ssssdsd", $taskTitle, $taskDesc, $taskCategory, $taskPriority, $taskCompleted, $taskEndedAt, $id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);

        return $this->getById($id);
    }

    function delete()
    {
        if (!array_key_exists("id", array: $_GET) || !is_numeric($_GET["id"])) {
            return JSONResponse(["error" => "Task not found"], 404);
        }

        $id = $_GET["id"];

        $conn = openConnection();
        $stmt = mysqli_prepare($conn, "DELETE FROM `tasks` WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, "d", $id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);

        return JSONResponse(["result" => "success"], 200);
    }
}

$routeController = new TasksRouteController;
$routeController->init();

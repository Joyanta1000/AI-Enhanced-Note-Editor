<?php

if (!isset($_GET['title']) || !isset($_GET['content'])) {
    http_response_code(400);
    echo "Missing parameters.";
    exit;
}

$title = $_GET['title'];
$content = $_GET['content'];

// Sanitize title for filename
$filename = preg_replace('/[^A-Za-z0-9_\-]/', '_', $title) . '.html';

// HTML structure
$htmlOutput = <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>$title</title>
</head>
<body>
<h1>$title</h1>
$content
</body>
</html>
HTML;

header('Content-Description: File Transfer');
header('Content-Type: text/html');
header("Content-Disposition: attachment; filename=\"$filename\"");
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');

echo $htmlOutput;
exit;
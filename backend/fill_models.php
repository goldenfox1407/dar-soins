<?php

$dir = __DIR__ . '/app/Models';
$files = glob($dir . '/*.php');

foreach ($files as $file) {
    if (strpos($file, 'User.php') !== false) {
        continue; // Let User model be as is
    }
    $content = file_get_contents($file);
    if (strpos($content, '$guarded') === false) {
        $content = preg_replace(
            '/use HasFactory;/',
            "use HasFactory;\n    protected \$guarded = [];",
            $content
        );
        file_put_contents($file, $content);
        echo "Updated \$file\n";
    }
}

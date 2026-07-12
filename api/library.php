<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$file = 'library.json';

// Initialize library file with empty array if it doesn't exist
if (!file_exists($file)) {
    file_put_contents($file, json_encode([], JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $content = file_get_contents($file);
    echo $content;
    exit;
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || empty($data['name']) || empty($data['version'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid category data. Name and version are required.']);
        exit;
    }

    $library = json_decode(file_get_contents($file), true);
    if (!is_array($library)) {
        $library = [];
    }

    $name = $data['name'];
    $version = $data['version'];
    $libraryKey = $data['libraryKey'] ?? strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));

    // Find if category already exists in the library
    $catIndex = -1;
    foreach ($library as $index => $cat) {
        if ($cat['libraryKey'] === $libraryKey) {
            $catIndex = $index;
            break;
        }
    }

    $newVersion = [
        'version' => $version,
        'description' => $data['description'] ?? '',
        'fields' => $data['fields'] ?? [],
        'template' => $data['template'] ?? '',
        'outputSections' => $data['outputSections'] ?? [],
        'date' => date('Y-m-d H:i:s'),
        'changelog' => $data['changelog'] ?? ''
    ];

    if ($catIndex !== -1) {
        // Category exists, update its details and add version to history
        $library[$catIndex]['name'] = $name;
        $library[$catIndex]['description'] = $data['description'] ?? $library[$catIndex]['description'];
        $library[$catIndex]['latestVersion'] = $version;
        $library[$catIndex]['updatedAt'] = date('Y-m-d H:i:s');

        // Check if this version already exists in history, update it, otherwise append
        $versionExists = false;
        if (!isset($library[$catIndex]['versions']) || !is_array($library[$catIndex]['versions'])) {
            $library[$catIndex]['versions'] = [];
        }
        foreach ($library[$catIndex]['versions'] as $vIdx => $vInfo) {
            if ($vInfo['version'] === $version) {
                $library[$catIndex]['versions'][$vIdx] = $newVersion;
                $versionExists = true;
                break;
            }
        }
        if (!$versionExists) {
            $library[$catIndex]['versions'][] = $newVersion;
        }
    } else {
        // Category is new in library, create it
        $library[] = [
            'libraryKey' => $libraryKey,
            'name' => $name,
            'description' => $data['description'] ?? '',
            'latestVersion' => $version,
            'createdAt' => date('Y-m-d H:i:s'),
            'updatedAt' => date('Y-m-d H:i:s'),
            'versions' => [$newVersion]
        ];
    }

    // Save back to JSON file
    if (file_put_contents($file, json_encode($library, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Category published successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write data to database file.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed.']);
?>

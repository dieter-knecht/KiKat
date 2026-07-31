<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$file = __DIR__ . '/library.json';

if (!file_exists($file)) {
    file_put_contents($file, '[]');
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    $content = file_get_contents($file);
    if ($content === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Fehler beim Lesen der Datenbank']);
        exit;
    }
    echo $content;
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);

    if (!$data || empty($data['name']) || empty($data['version'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Ungültige Daten. Name und Version werden zwingend benötigt.']);
        exit;
    }

    $library = json_decode(file_get_contents($file), true);
    if (!is_array($library)) {
        $library = [];
    }

    $name = $data['name'];
    $version = $data['version'];
    
    // Generiere libraryKey, falls nicht vorhanden
    if (empty($data['libraryKey'])) {
        $libraryKey = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $name), '-'));
    } else {
        $libraryKey = $data['libraryKey'];
    }

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
        $library[$catIndex]['name'] = $name;
        if (!empty($data['description'])) {
            $library[$catIndex]['description'] = $data['description'];
        }
        $library[$catIndex]['latestVersion'] = $version;
        $library[$catIndex]['updatedAt'] = date('Y-m-d H:i:s');

        if (!isset($library[$catIndex]['versions']) || !is_array($library[$catIndex]['versions'])) {
            $library[$catIndex]['versions'] = [];
        }

        $vIdx = -1;
        foreach ($library[$catIndex]['versions'] as $i => $v) {
            if ($v['version'] === $version) {
                $vIdx = $i;
                break;
            }
        }

        if ($vIdx !== -1) {
            $library[$catIndex]['versions'][$vIdx] = $newVersion;
        } else {
            $library[$catIndex]['versions'][] = $newVersion;
        }
    } else {
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

    $saved = file_put_contents($file, json_encode($library, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($saved === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Konnte nicht in library.json schreiben. (Fehlende Rechte?)']);
        exit;
    }

    echo json_encode(['success' => true, 'message' => 'Kategorie erfolgreich veröffentlicht.']);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);

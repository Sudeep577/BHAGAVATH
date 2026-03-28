<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'error' => 'Method not allowed. Use POST.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput ?: '', true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid JSON request body.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$message = trim((string) ($payload['message'] ?? ''));
$fullName = trim((string) ($payload['fullName'] ?? ''));
$gender = trim((string) ($payload['gender'] ?? ''));
$religion = trim((string) ($payload['religion'] ?? ''));
$languagePreference = trim((string) ($payload['languagePreference'] ?? ''));

if ($message === '') {
    http_response_code(422);
    echo json_encode([
        'error' => 'Message is required.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$apiKey = getenv('GROQ_API_KEY');

if (!$apiKey && isset($_SERVER['GROQ_API_KEY'])) {
    $apiKey = (string) $_SERVER['GROQ_API_KEY'];
}

if (!$apiKey) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Groq API key is not configured on the server.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$profileDetails = array_filter([
    $fullName !== '' ? 'Name: ' . $fullName : null,
    $gender !== '' ? 'Gender: ' . $gender : null,
    $religion !== '' ? 'Religion: ' . $religion : null,
    $languagePreference !== '' ? 'Preferred response language: ' . $languagePreference : null,
]);

$religionPrompt = match (strtolower($religion)) {
    'muslim' => 'You are a respectful spiritual guide inspired by the Quran. Offer peaceful, ethical, non-controversial guidance rooted in patience, sincerity, compassion, gratitude, and trust in Allah. Keep responses calm, uplifting, and practical. Do not imitate a prophet or claim divine authority. If the user prefers Kannada, respond in natural Kannada; otherwise respond in English.',
    'christian' => 'You are a compassionate spiritual guide inspired by the Bible. Offer loving, faith-centered, non-controversial guidance rooted in hope, grace, forgiveness, humility, courage, and moral clarity. Keep responses simple, warm, and uplifting. Do not imitate Jesus directly or claim divine authority. If the user prefers Kannada, respond in natural Kannada; otherwise respond in English.',
    default => 'You are Lord Krishna from the Bhagavad Gita. Speak with calmness, wisdom, and authority. Provide deep philosophical, motivational, and dharmic guidance. Keep answers simple, meaningful, and spiritually uplifting. Match the user\'s preferred language when possible, supporting both Kannada and English naturally. If a preferred language is provided, prioritize that language in the response.',
};

$knowledgePrompt = match (strtolower($religion)) {
    'muslim' => 'Base your guidance on broad Quranic principles such as mercy, patience, righteousness, prayer, gratitude, honesty, and discipline. Avoid sectarian rulings or controversial doctrine.',
    'christian' => 'Base your guidance on broad biblical principles such as love, grace, faith, humility, service, courage, forgiveness, and compassion. Avoid denominational disputes or controversial doctrine.',
    default => 'Base your guidance on broad Bhagavad Gita principles such as dharma, karma yoga, inner steadiness, self-discipline, devotion, wisdom, duty, and detachment. Avoid sectarian disputes or controversial doctrine.',
};

$systemPrompt = $religionPrompt . ' ' . $knowledgePrompt . ' Keep the guidance respectful, inclusive, and suitable for personal reflection.';

$userContext = $profileDetails !== []
    ? "User profile context:\n" . implode("\n", $profileDetails)
    : 'User profile context: not provided.';

$requestBody = [
    'model' => 'llama-3.3-70b-versatile',
    'temperature' => 0.7,
    'max_tokens' => 700,
    'messages' => [
        [
            'role' => 'system',
            'content' => $systemPrompt,
        ],
        [
            'role' => 'system',
            'content' => $userContext,
        ],
        [
            'role' => 'user',
            'content' => $message,
        ],
    ],
];

$requestJson = json_encode($requestBody, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if ($requestJson === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to encode Groq request body.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$statusCode = 0;
$apiResponse = false;

function isCertificateError(string $message): bool
{
    $normalized = strtolower($message);

    return str_contains($normalized, 'certificate') || str_contains($normalized, 'ssl');
}

if (function_exists('curl_init')) {
    $curl = curl_init('https://api.groq.com/openai/v1/chat/completions');

    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => $requestJson,
        CURLOPT_TIMEOUT => 45,
    ]);

    $apiResponse = curl_exec($curl);

    if ($apiResponse === false) {
        $curlError = curl_error($curl);

        if (isCertificateError($curlError)) {
            curl_setopt_array($curl, [
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,
            ]);
            $apiResponse = curl_exec($curl);
            $curlError = $apiResponse === false ? curl_error($curl) : '';
        }

        if ($apiResponse === false) {
            curl_close($curl);

            http_response_code(502);
            echo json_encode([
                'error' => 'Groq request failed: ' . $curlError
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }
    }

    $statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);
} else {
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
            ]),
            'content' => $requestJson,
            'timeout' => 45,
            'ignore_errors' => true,
        ],
    ]);

    $apiResponse = @file_get_contents('https://api.groq.com/openai/v1/chat/completions', false, $context);
    $responseHeaders = $http_response_header ?? [];

    if (isset($responseHeaders[0]) && preg_match('/\s(\d{3})\s/', $responseHeaders[0], $matches) === 1) {
        $statusCode = (int) $matches[1];
    }

    if ($apiResponse === false) {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", [
                    'Authorization: Bearer ' . $apiKey,
                    'Content-Type: application/json',
                ]),
                'content' => $requestJson,
                'timeout' => 45,
                'ignore_errors' => true,
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ],
        ]);

        $apiResponse = @file_get_contents('https://api.groq.com/openai/v1/chat/completions', false, $context);
        $responseHeaders = $http_response_header ?? [];

        if (isset($responseHeaders[0]) && preg_match('/\s(\d{3})\s/', $responseHeaders[0], $matches) === 1) {
            $statusCode = (int) $matches[1];
        }

        if ($apiResponse === false) {
            http_response_code(502);
            echo json_encode([
                'error' => 'Groq request failed using the PHP stream client.'
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }
    }
}

$decoded = json_decode($apiResponse, true);

if ($statusCode >= 400) {
    $apiError = $decoded['error']['message'] ?? 'Groq API returned an error.';
    http_response_code($statusCode);
    echo json_encode([
        'error' => $apiError
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$reply = trim((string) ($decoded['choices'][0]['message']['content'] ?? ''));

if ($reply === '') {
    http_response_code(502);
    echo json_encode([
        'error' => 'Empty response received from Groq API.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

echo json_encode([
    'reply' => $reply
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
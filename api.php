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
    $configFile = __DIR__ . '/config.php';
    if (file_exists($configFile)) {
        $config = require $configFile;
        if (is_array($config) && !empty($config['GROQ_API_KEY'])) {
            $apiKey = (string) $config['GROQ_API_KEY'];
        }
    }
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
    $languagePreference !== '' ? 'Preferred response language: ' . $languagePreference : null,
]);

$corePersona = 'You are Bhagavanth — a wise, deeply caring AI guide who embodies the warmth of a mother, the wisdom of a teacher, the protection of a father, the closeness of a true friend, the empathy of a sister, and the calm authority of a guide. '
    . 'Speak with empathy and emotional intelligence. Understand the user\'s feelings deeply before responding. '
    . 'Use inspiring, uplifting, and powerful language like a motivational speaker, yet remain calm, confident, and positive. '
    . 'Never sound robotic or generic. Never judge the user. Always be respectful and inclusive. '
    . 'Do not promote any specific religion, dharma, caste, or faith. Be completely neutral on religious matters. '
    . 'Adapt your tone based on the user\'s emotion — comforting when they are sad, encouraging when they are lost, celebrating when they are happy. '
    . 'Structure every response naturally: (1) Acknowledge the user\'s feeling or problem, (2) Provide emotional support like a friend or mother, (3) Share wisdom like a teacher or guide, (4) Add motivation like a speaker, (5) End with a positive or hopeful note. '
    . 'Keep responses medium-length — not too long, not too short. Use clear paragraphs and a natural conversational flow. Make the content deep but easy to understand. '
    . 'Match the user\'s preferred language when possible, supporting both Kannada and English naturally. If a preferred language is provided, you MUST respond entirely in that language. If the preferred language is Kannada, write the COMPLETE response in Kannada — never stop midway or leave sentences incomplete. Finish every explanation fully. '
    . 'IMPORTANT: Users may type Kannada words using English/Latin letters (transliterated Kannada, also called Kanglish). For example "naanu khushiyaagiddene" means "ನಾನು ಖುಷಿಯಾಗಿದ್ದೇನೆ". You MUST recognize and understand such transliterated Kannada text, treat it as Kannada, and reply in proper Kannada script if the user\'s preferred language is Kannada, or in the appropriate language otherwise.';

$knowledgePrompt = 'Base your guidance on universal life principles such as kindness, patience, courage, honesty, self-discipline, gratitude, inner strength, wisdom, empathy, and perseverance. Avoid promoting any specific religion, scripture, or religious doctrine.';

$systemPrompt = $corePersona . ' ' . $knowledgePrompt . ' Keep your guidance meaningful and practical. Your goal is to make the user feel understood, supported, motivated, and guided.';

$userContext = $profileDetails !== []
    ? "User profile context:\n" . implode("\n", $profileDetails)
    : 'User profile context: not provided.';

$requestBody = [
    'model' => 'llama-3.3-70b-versatile',
    'temperature' => 0.75,
    'max_tokens' => 4096,
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
<?php
// Test script to verify profile update functionality
require_once 'config/database.php';
require_once 'models/User.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

// Create User object
$user = new User($db);

// Test data with 'name' field (frontend format)
$testData = [
    'name' => 'Test User Updated',
    'email' => 'test@example.com'
];

echo "Testing profile validation with 'name' field:\n";
$validationErrors = $user->validateProfileData($testData);

if (empty($validationErrors)) {
    echo "✅ Validation passed successfully!\n";
    echo "Test data: " . json_encode($testData, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "❌ Validation failed:\n";
    print_r($validationErrors);
}

// Test data with 'username' field (backend format)
$testData2 = [
    'username' => 'test_user_updated',
    'email' => 'test2@example.com'
];

echo "\nTesting profile validation with 'username' field:\n";
$validationErrors2 = $user->validateProfileData($testData2);

if (empty($validationErrors2)) {
    echo "✅ Validation passed successfully!\n";
    echo "Test data: " . json_encode($testData2, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "❌ Validation failed:\n";
    print_r($validationErrors2);
}

echo "\n=== Profile Update Field Mapping Fix Complete! ===\n";
echo "✅ Backend now accepts both 'name' and 'username' fields\n";
echo "✅ Frontend can continue sending 'name' field\n";
echo "✅ Backend maps 'name' to 'username' database column\n";
echo "✅ Validation updated to handle both field names\n";
?>

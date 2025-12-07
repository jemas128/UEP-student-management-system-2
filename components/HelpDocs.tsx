import React, { useState } from 'react';
import { FileText, Server, Database, Copy, Check } from 'lucide-react';

export const HelpDocs = () => {
  const [copied, setCopied] = useState(false);

  const phpCode = `<?php
/**
 * UEP Student Management System - Backend API
 * Save this file as 'api.php' in your public_html or htdocs folder.
 */

// 1. CORS & Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Database Connection (UPDATE THESE CREDENTIALS)
$host = "sql.byet.host"; // Your Database Host
$db_user = "YOUR_DB_USERNAME";
$db_pass = "YOUR_DB_PASSWORD";
$db_name = "YOUR_DB_NAME";

$conn = new mysqli($host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// 3. Helper Functions
function getJsonInput() {
    return json_decode(file_get_contents("php://input"), true);
}

function sendResponse($success, $data = null, $message = '') {
    echo json_encode(["success" => $success, "data" => $data, "message" => $message]);
    exit();
}

// 4. Router Logic
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// --- GET REQUESTS (Read Data) ---
if ($method === 'GET') {
    
    // Fetch All Users
    if ($action === 'get_users') {
        $result = $conn->query("SELECT * FROM users ORDER BY id DESC");
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        sendResponse(true, $users);
    }

    // Fetch All Subjects
    if ($action === 'get_subjects') {
        $result = $conn->query("SELECT * FROM subjects");
        $subjects = [];
        while ($row = $result->fetch_assoc()) {
            $subjects[] = $row;
        }
        sendResponse(true, $subjects);
    }

    // Fetch All Grades
    if ($action === 'get_grades') {
        $result = $conn->query("SELECT * FROM grades");
        $grades = [];
        while ($row = $result->fetch_assoc()) {
            $grades[] = $row;
        }
        sendResponse(true, $grades);
    }
}

// --- POST REQUESTS (Create & Update) ---
if ($method === 'POST') {
    $data = getJsonInput();

    // Save/Update User
    if ($action === 'save_user') {
        $username = $conn->real_escape_string($data['username']);
        $password = $conn->real_escape_string($data['password']);
        $fullName = $conn->real_escape_string($data['fullName']);
        $email = $conn->real_escape_string($data['email']);
        $role = $conn->real_escape_string($data['role']);
        $status = $conn->real_escape_string($data['status']);
        
        // If ID exists and is numeric, it's an UPDATE
        if (isset($data['id']) && is_numeric($data['id'])) {
            $id = $data['id'];
            $sql = "UPDATE users SET username='$username', password='$password', full_name='$fullName', email='$email', role='$role', status='$status' WHERE id=$id";
        } else {
            // INSERT
            $sql = "INSERT INTO users (username, password, full_name, email, role, status) VALUES ('$username', '$password', '$fullName', '$email', '$role', '$status')";
        }

        if ($conn->query($sql) === TRUE) {
             $newId = isset($id) ? $id : $conn->insert_id;
            sendResponse(true, ["id" => $newId], "User saved");
        } else {
            sendResponse(false, null, "Error: " . $conn->error);
        }
    }

    // Save/Update Subject
    if ($action === 'save_subject') {
        $name = $conn->real_escape_string($data['name']);
        $code = $conn->real_escape_string($data['code']);
        $credits = intval($data['credits']);

        if (isset($data['id']) && is_numeric($data['id'])) {
            $id = $data['id'];
            $sql = "UPDATE subjects SET name='$name', code='$code', credits=$credits WHERE id=$id";
        } else {
            $sql = "INSERT INTO subjects (name, code, credits) VALUES ('$name', '$code', $credits)";
        }

        if ($conn->query($sql) === TRUE) {
             $newId = isset($id) ? $id : $conn->insert_id;
            sendResponse(true, ["id" => $newId], "Subject saved");
        } else {
            sendResponse(false, null, $conn->error);
        }
    }

    // Save/Update Grade
    if ($action === 'save_grade') {
        $studentId = intval($data['studentId']);
        $subjectId = intval($data['subjectId']);
        $score = intval($data['score']);
        $semester = "Fall 2024";

        // Check if grade exists for this student+subject
        $check = $conn->query("SELECT id FROM grades WHERE student_id=$studentId AND subject_id=$subjectId");
        
        if ($check->num_rows > 0) {
            $row = $check->fetch_assoc();
            $gradeId = $row['id'];
            $sql = "UPDATE grades SET score=$score WHERE id=$gradeId";
        } else {
            $sql = "INSERT INTO grades (student_id, subject_id, score, semester) VALUES ($studentId, $subjectId, $score, '$semester')";
        }

        if ($conn->query($sql) === TRUE) {
             $newId = isset($gradeId) ? $gradeId : $conn->insert_id;
            sendResponse(true, ["id" => $newId], "Grade saved");
        } else {
            sendResponse(false, null, $conn->error);
        }
    }
}

// --- DELETE REQUESTS ---
if ($method === 'DELETE') {
    $id = intval($_GET['id']);

    if ($action === 'delete_user') {
        $conn->query("DELETE FROM users WHERE id=$id");
        sendResponse(true, null, "User deleted");
    }

    if ($action === 'delete_subject') {
        $conn->query("DELETE FROM subjects WHERE id=$id");
        sendResponse(true, null, "Subject deleted");
    }
}

$conn->close();
?>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-maroon-900">System Documentation</h1>
        <p className="text-gray-600 mt-2">Deployment guide for UEP Student Management System.</p>
      </div>

      {/* SQL Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-maroon-800 flex items-center mb-4">
          <Database className="mr-2 h-5 w-5" /> 
          Step 1: Database Setup (MySQL)
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Log in to your <strong>Byet.host phpMyAdmin</strong> and run this SQL to create the necessary tables.
        </p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-xs leading-relaxed">
{`-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'STUDENT') NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    email VARCHAR(100)
);

-- 2. Subjects Table
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    credits INT NOT NULL
);

-- 3. Grades Table
CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject_id INT,
    score INT,
    semester VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 4. Create Default Admin (User: admin, Pass: admin)
INSERT INTO users (username, password, full_name, role, status, email)
VALUES ('admin', 'admin', 'System Administrator', 'ADMIN', 'APPROVED', 'admin@uep.edu.ph');`}
        </pre>
      </div>

      {/* PHP Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-maroon-800 flex items-center">
            <Server className="mr-2 h-5 w-5" /> 
            Step 2: Backend API Code (api.php)
          </h2>
          <button 
            onClick={copyToClipboard}
            className="flex items-center space-x-2 text-sm bg-maroon-50 text-maroon-800 px-3 py-1.5 rounded-lg hover:bg-maroon-100 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Create a file named <strong>api.php</strong> in your hosting file manager (htdocs) and paste the code below. 
          <span className="text-red-600 font-bold ml-1">Don't forget to edit the $db_user, $db_pass, and $db_name!</span>
        </p>
        
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-xs leading-relaxed h-96">
            {phpCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
# UEP Student Management System (SMS) - Deployment Guide

**Version:** 1.2.0 (Hosting Compatibility Mode)  
**Theme:** Maroon & White (UEP Branding)  
**Stack:** React (Frontend) + PHP (Backend) + MySQL (Database)

---

## 🚀 Phase 1: Hosting Setup (Byet.host)

1.  **Register:** Go to [Byet.host](https://byet.host/) and sign up for a free account.
2.  **VistaPanel:** Once registered, check your email for credentials and log in to the **VistaPanel** (Control Panel).
3.  **Note your Details:** On the VistaPanel main page, look on the right side for **Account Details**. You need:
    *   FTP Host Name (e.g., `ftpupload.net`)
    *   FTP Username (e.g., `b12_3456789`)
    *   MySQL Host Name (e.g., `sql123.byetcluster.com`)
    *   MySQL Username (Same as FTP usually)
    *   MySQL Password (The password you created during signup)

---

## 🗄️ Phase 2: Database Setup

1.  **Create Database:**
    *   In VistaPanel, click **"MySQL Databases"**.
    *   In the "New Database" field, type a name (e.g., `uepsms`).
    *   Click "Create Database".
    *   *Note:* Your database name will have a prefix (e.g., `b12_3456789_uepsms`). Copy this full name.

2.  **Import Tables (phpMyAdmin):**
    *   In VistaPanel, click **"phpMyAdmin"**.
    *   Click "Connect Now" next to your new database.
    *   Click the **"SQL"** tab at the top.
    *   Paste the following SQL code and click **"Go"**:

```sql
-- 1. Users Table
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

-- 4. Create Default Admin Account
-- Username: admin, Password: admin
INSERT INTO users (username, password, full_name, role, status, email)
VALUES ('admin', 'admin', 'System Administrator', 'ADMIN', 'APPROVED', 'admin@uep.edu.ph');
```

---

## ⚙️ Phase 3: Backend API (PHP)

1.  **Open File Manager:**
    *   In VistaPanel, click **"Online File Manager"**.
    *   Navigate into the **`htdocs`** folder.

2.  **Create API File:**
    *   Create a new file named **`api.php`**.
    *   Paste the code below. **CRITICAL:** You MUST update the `$host`, `$db_user`, `$db_pass`, and `$db_name` variables with the details from Phase 1 & 2.

```php
<?php
// FILE: api.php

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Use POST for deletes
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// DATABASE CREDENTIALS - EDIT THESE!
$host = "sqlxxx.byetcluster.com"; // Found in VistaPanel
$db_user = "b12_xxxxxx";          // Found in VistaPanel
$db_pass = "your_password";       // Your account password
$db_name = "b12_xxxxxx_uepsms";   // The DB name created in Phase 2

$conn = new mysqli($host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "DB Connection Failed: " . $conn->connect_error]));
}

// HELPER FUNCTIONS
function getJsonInput() {
    return json_decode(file_get_contents("php://input"), true);
}
function sendResponse($success, $data = null, $message = '') {
    echo json_encode(["success" => $success, "data" => $data, "message" => $message]);
    exit();
}

// LOGIC
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// GET (Read)
if ($method === 'GET') {
    if ($action === 'get_users') {
        $result = $conn->query("SELECT id, username, password, full_name as fullName, role, status, email FROM users ORDER BY id DESC");
        $data = [];
        while ($row = $result->fetch_assoc()) $data[] = $row;
        sendResponse(true, $data);
    }
    if ($action === 'get_subjects') {
        $result = $conn->query("SELECT * FROM subjects");
        $data = [];
        while ($row = $result->fetch_assoc()) $data[] = $row;
        sendResponse(true, $data);
    }
    if ($action === 'get_grades') {
        $result = $conn->query("SELECT id, student_id as studentId, subject_id as subjectId, score, semester FROM grades");
        $data = [];
        while ($row = $result->fetch_assoc()) $data[] = $row;
        sendResponse(true, $data);
    }
}

// POST (Create/Update AND Delete)
if ($method === 'POST') {
    $data = getJsonInput();

    // -- DELETE ACTIONS (Using POST for compatibility) --
    if ($action === 'delete_user') {
        $id = intval($_GET['id']);
        if($id > 0) {
            $conn->query("DELETE FROM users WHERE id=$id");
            sendResponse(true, null, "Deleted");
        } else {
            sendResponse(false, null, "Invalid ID");
        }
    }

    if ($action === 'delete_subject') {
        $id = intval($_GET['id']);
        if($id > 0) {
            $conn->query("DELETE FROM subjects WHERE id=$id");
            sendResponse(true, null, "Deleted");
        } else {
            sendResponse(false, null, "Invalid ID");
        }
    }

    // -- SAVE ACTIONS --
    if ($action === 'save_user') {
        $user = $conn->real_escape_string($data['username']);
        $pass = $conn->real_escape_string($data['password']);
        $name = $conn->real_escape_string($data['fullName']);
        $email = $conn->real_escape_string($data['email']);
        $role = $conn->real_escape_string($data['role']);
        $status = $conn->real_escape_string($data['status']);
        
        if (isset($data['id']) && is_numeric($data['id'])) {
            $id = $data['id'];
            $sql = "UPDATE users SET username='$user', password='$pass', full_name='$name', email='$email', role='$role', status='$status' WHERE id=$id";
        } else {
            $sql = "INSERT INTO users (username, password, full_name, email, role, status) VALUES ('$user', '$pass', '$name', '$email', '$role', '$status')";
        }
        
        if ($conn->query($sql)) {
            $newId = isset($id) ? $id : $conn->insert_id;
            sendResponse(true, ["id" => $newId], "Saved");
        } else {
            sendResponse(false, null, $conn->error);
        }
    }

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
        
        if ($conn->query($sql)) {
            $newId = isset($id) ? $id : $conn->insert_id;
            sendResponse(true, ["id" => $newId], "Saved");
        } else {
            sendResponse(false, null, $conn->error);
        }
    }

    if ($action === 'save_grade') {
        $stu = intval($data['studentId']);
        $sub = intval($data['subjectId']);
        $scr = intval($data['score']);
        
        $check = $conn->query("SELECT id FROM grades WHERE student_id=$stu AND subject_id=$sub");
        if ($check->num_rows > 0) {
            $row = $check->fetch_assoc();
            $gid = $row['id'];
            $sql = "UPDATE grades SET score=$scr WHERE id=$gid";
            $savedId = $gid;
        } else {
            $sql = "INSERT INTO grades (student_id, subject_id, score, semester) VALUES ($stu, $sub, $scr, 'Fall 2024')";
        }
        
        if ($conn->query($sql)) {
            $finalId = isset($savedId) ? $savedId : $conn->insert_id;
            sendResponse(true, ["id" => $finalId], "Saved");
        } else {
            sendResponse(false, null, $conn->error);
        }
    }
}

$conn->close();
?>
```

---

## 🔌 Phase 4: Connecting React to PHP

**Update:** We now use `POST` for deletions to ensure compatibility with all hosting providers.

1.  Open `services/storage.ts`.
2.  Delete everything.
3.  Paste the code below.
4.  **Important:** Change `API_URL` to your website address.

```typescript
// FILE: services/storage.ts (Production Version)
import { User, Subject, Grade, AnalysisResult } from '../types';

// REPLACE THIS WITH YOUR ACTUAL BYET.HOST URL
const API_URL = 'http://your-website-name.byethostXX.com/api.php';

// Helper to ensure IDs are strings
const normalizeId = (item: any) => ({ ...item, id: String(item.id) });

export const storage = {
  // Users
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_URL}?action=get_users`);
      const json = await res.json();
      return json.success ? json.data.map(normalizeId) : [];
    } catch (e) {
      console.error("API Error:", e);
      return [];
    }
  },

  async saveUser(user: User): Promise<void> {
    await fetch(`${API_URL}?action=save_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  },

  async deleteUser(userId: string): Promise<void> {
    // UPDATED: Using POST for delete to avoid hosting restrictions
    await fetch(`${API_URL}?action=delete_user&id=${userId}`, { method: 'POST' });
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    try {
      const res = await fetch(`${API_URL}?action=get_subjects`);
      const json = await res.json();
      return json.success ? json.data.map(normalizeId) : [];
    } catch (e) { return []; }
  },

  async saveSubject(subject: Subject): Promise<void> {
    await fetch(`${API_URL}?action=save_subject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject)
    });
  },

  async deleteSubject(subjectId: string): Promise<void> {
    // UPDATED: Using POST for delete
    await fetch(`${API_URL}?action=delete_subject&id=${subjectId}`, { method: 'POST' });
  },

  // Grades
  async getGrades(): Promise<Grade[]> {
    try {
      const res = await fetch(`${API_URL}?action=get_grades`);
      const json = await res.json();
      return json.success ? json.data.map((g: any) => ({
        ...g,
        id: String(g.id),
        studentId: String(g.studentId),
        subjectId: String(g.subjectId)
      })) : [];
    } catch (e) { return []; }
  },

  async saveGrade(grade: Grade): Promise<void> {
    await fetch(`${API_URL}?action=save_grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grade)
    });
  },

  // AI Analysis (Local Storage is fine for this feature)
  async saveAnalysis(result: AnalysisResult): Promise<void> {
    const data = JSON.parse(localStorage.getItem('sms_analysis') || '[]');
    data.push(result);
    localStorage.setItem('sms_analysis', JSON.stringify(data));
  },

  getAnalysis(studentId: string): AnalysisResult | undefined {
    const data = JSON.parse(localStorage.getItem('sms_analysis') || '[]');
    return data.filter((a: AnalysisResult) => String(a.studentId) === String(studentId)).pop();
  }
};
```

---

## 🛠️ Phase 5: Build & Upload

1.  In your terminal, run: `npm run build`
2.  Open the newly created **`dist`** folder.
3.  Upload **all files** inside `dist` to your `htdocs` folder on Byet.host.
4.  Ensure `api.php` is also in `htdocs`.
5.  Your site is now live!
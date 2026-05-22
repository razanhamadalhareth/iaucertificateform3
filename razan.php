<?php
// إعدادات الهيدر لمنع مشاكل الـ CORS والسماح باستقبال الـ JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// بيانات الاتصال بقاعدة بيانات Railway الخاصة بك
$host = "kodama.proxy.rlwy.net";
$user = "root";
$password = "GzIRneVJjghDzVVhtDpjvmWfVgINbtzC";
$database = "railway";
$port = 15362;

// إنشاء الاتصال
$conn = new mysqli($host, $user, $password, $database, $port);

// التحقق من نجاح الاتصال
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "فشل الاتصال بقاعدة البيانات: " . $conn->connect_error]);
    exit();
}

// تعيين الترميز ليدعم اللغة العربية بشكل صحيح
$conn->set_charset("utf8mb4");

// استقبال البيانات القادمة من الـ Fetch (JSON)
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($data)) {
    
    // سحب القيم ومطابقتها مع المسميات الجديدة لجدولك في الداتابيز
    $name = $conn->real_escape_string($data['name'] ?? '');
    $national_id = $conn->real_escape_string($data['national_id'] ?? '');
    $university_id = $conn->real_escape_string($data['university_id'] ?? '');
    $college = $conn->real_escape_string($data['college'] ?? '');
    $program = $conn->real_escape_string($data['program'] ?? '');
    $graduation_year = $conn->real_escape_string($data['graduation_year'] ?? '');
    $email = $conn->real_escape_string($data['email'] ?? '');
    $phone = $conn->real_escape_string($data['phone'] ?? '');
    
    // ملاحظة: request_id يتولد تلقائياً (Auto Increment)
    // status تأخذ القيمة الافتراضية 'pending' تلقائياً إذا لم نرسلها، أو نحددها هنا
    // submission_date يأخذ وقت الإدخال الحالي تلقائياً من الداتابيز

    // جملة الإدخال (INSERT) المحدثة بأسماء الحقول الدقيقة لجدولك
    $sql = "INSERT INTO requests (name, national_id, university_id, college, program, graduation_year, email, phone) 
            VALUES ('$name', '$national_id', '$university_id', '$college', '$program', '$graduation_year', '$email', '$phone')";

    if ($conn->query($sql) === TRUE) {
        // جلب الـ ID الذي تم إنشاؤه تلقائياً لنعطيه للمستخدم كرقم مرجعي للطلب
        $inserted_id = $conn->insert_id;
        
        echo json_encode([
            "status" => "success", 
            "message" => "تم حفظ البيانات بنجاح", 
            "ref_num" => $inserted_id // سنستخدم الـ Auto Increment ID هنا كرقم مرجعي مؤقتاً
        ]);
    } else {
        // معالجة خطأ الحقول الفريدة (مثل تكرار الإيميل)
        if ($conn->errno == 1062) {
            echo json_encode(["status" => "error", "message" => "البريد الإلكتروني مسجل مسبقاً في النظام!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "خطأ أثناء الحفظ: " . $conn->error]);
        }
    }
} else {
    echo json_encode(["status" => "error", "message" => "لم يتم استقبال أي بيانات"]);
}

$conn->close();
?>
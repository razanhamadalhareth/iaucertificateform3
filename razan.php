<?php
// إعدادات الهيدر للسماح باستقبال البيانات عبر الـ CORS ومنع المشاكل مع جيت هوب
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// التعامل مع طلبات التمهيد الـ OPTIONS من المتصفح لضمان عدم الحظر
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// بيانات الاتصال بقاعدة بيانات Railway الخاصة بك
$host = "kodama.proxy.rlwy.net";
$user = "root";
$password = "GzIRneVJjghDzVVhtDpjvmWfVgINbtzC";
$database = "railway";
$port = 15362;

// إنشاء الاتصال
$conn = new mysqli($host, $user, $password, $database, $port);

// التحقق من نجاح الاتصال بالداتابيز
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "فشل الاتصال بقاعدة البيانات: " . $conn->connect_error]);
    exit();
}

// تعيين الترميز ليدعم اللغة العربية بشكل صحيح
$conn->set_charset("utf8mb4");

// استقبال ومعالجة البيانات القادمة من الـ POST (بصيغة FormData)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // سحب القيم ومطابقتها مع الحقول باستخدام المصفوفة الحية $_POST لحل حظر ملفات الـ JSON في الاستضافات المجانية
    $name = $conn->real_escape_string($_POST['name'] ?? '');
    $national_id = $conn->real_escape_string($_POST['national_id'] ?? '');
    $university_id = $conn->real_escape_string($_POST['university_id'] ?? '');
    $college = $conn->real_escape_string($_POST['college'] ?? '');
    $program = $conn->real_escape_string($_POST['program'] ?? '');
    $graduation_year = $conn->real_escape_string($_POST['graduation_year'] ?? '');
    $email = $conn->real_escape_string($_POST['email'] ?? '');
    $phone = $conn->real_escape_string($_POST['phone'] ?? '');
    
    // التحقق من أن الحقول الأساسية ليست فارغة
    if (!empty($name) && !empty($national_id) && !empty($university_id)) {
        
        // جملة الإدخال (INSERT) المحدثة بأسماء الحقول الدقيقة لجدول Railway الخاص بك
        $sql = "INSERT INTO requests (name, national_id, university_id, college, program, graduation_year, email, phone) 
                VALUES ('$name', '$national_id', '$university_id', '$college', '$program', '$graduation_year', '$email', '$phone')";

        if ($conn->query($sql) === TRUE) {
            // جلب الـ Auto Increment ID التلقائي من الجدول لنعطيه للمستخدم كرقم طلب مرجعي
            $inserted_id = $conn->insert_id;
            
            echo json_encode([
                "status" => "success", 
                "message" => "تم حفظ البيانات بنجاح في قاعدة البيانات الحية", 
                "ref_num" => $inserted_id
            ]);
        } else {
            // معالجة خطأ القيود الفريدة (مثل تكرار الإيميل أو رقم الهوية إذا كانت فريدة)
            if ($conn->errno == 1062) {
                echo json_encode(["status" => "error", "message" => "البيانات المدخلة (الإيميل أو الهوية) مسجلة مسبقاً في النظام!"]);
            } else {
                echo json_encode(["status" => "error", "message" => "خطأ أثناء الحفظ في الداتابيز: " . $conn->error]);
            }
        }
    } else {
        echo json_encode(["status" => "error", "message" => "الرجاء تعبئة كافة الحقول الأساسية المطلوبة"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "طريقة الطلب غير مدعومة، يجب إرسال POST الطلب"]);
}

$conn->close();
?>

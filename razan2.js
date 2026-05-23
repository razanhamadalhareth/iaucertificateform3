// تجميع البيانات بصيغة FormData بدلاً من JSON
  var formData = new FormData();
  formData.append('name', document.getElementById('f-name').value);
  formData.append('national_id', document.getElementById('f-id').value);
  formData.append('university_id', document.getElementById('f-sid').value);
  formData.append('college', document.getElementById('f-col').value);
  formData.append('program', document.getElementById('f-prog').value);
  formData.append('graduation_year', document.getElementById('f-yr').value);
  formData.append('email', document.getElementById('f-email').value);
  formData.append('phone', document.getElementById('f-phone').value);

  // إرسال البيانات عبر الـ Fetch إلى ملف razan.php
  fetch('https://iaucertificateform.infinityfreeapp.com/razan.php', {
    method: 'POST',
    body: formData // نرسل الـ formData مباشرة بدون هيدرز معقدة
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if(data.status === 'success') {
      document.getElementById('refNum').textContent = "REQ-" + data.ref_num;
      document.getElementById('successOverlay').classList.add('show');
    } else {
      alert('تنبيه من السيرفر: ' + data.message);
    }
  })
  .catch(function(err) {
    console.error('Error:', err);
    alert('فشل الاتصال بالسيرفر، تأكد من تحديث الأكواد');
  });

// عناصر الصفحة
const bookingModal = document.getElementById('bookingModal');
const bookNowBtn = document.getElementById('bookNowBtn');
const servicesBtn = document.getElementById('servicesBtn');
const closeModal = document.getElementById('closeModal');
const bookingForm = document.getElementById('bookingForm');
const successMessage = document.getElementById('successMessage');

// فتح نموذج الحجز عند الضغط على "احجز الآن"
bookNowBtn.addEventListener('click', () => {
    openBookingModal();
});

// زر "تصفح الخدمات" ينقلنا لقسم الخدمات
servicesBtn.addEventListener('click', () => {
    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
});

// عند الضغط على أي بطاقة خدمة، نفتح النموذج مباشرة
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
        openBookingModal();
    });
    card.style.cursor = 'pointer';
});

// فتح النموذج
function openBookingModal() {
    bookingModal.classList.add('active');
    successMessage.classList.remove('active');
    bookingForm.style.display = 'block';
}

// إغلاق النموذج بزر الإغلاق (×)
closeModal.addEventListener('click', () => {
    bookingModal.classList.remove('active');
});

// إغلاق النموذج عند الضغط خارج الصندوق الأبيض
bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        bookingModal.classList.remove('active');
    }
});

// التحقق من الحقول عند الإرسال
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault(); // نمنع إعادة تحميل الصفحة

    const studentName = document.getElementById('studentName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const university = document.getElementById('university').value.trim();
    const major = document.getElementById('major').value.trim();
    const level = document.getElementById('level').value;
    const serviceType = document.getElementById('serviceType').value;
    const appointmentDate = document.getElementById('appointmentDate').value;

    // التأكد من تعبئة الحقول الأساسية
    if (!studentName || !phone || !university || !major || !level || !serviceType || !appointmentDate) {
        alert('من فضلك عبّئ جميع الحقول المطلوبة قبل الإرسال.');
        return;
    }

    // التحقق البسيط من رقم الهاتف (أرقام فقط، 8 أرقام على الأقل)
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phone)) {
        alert('رقم الهاتف غير صحيح، من فضلك تأكد من كتابته بشكل صحيح.');
        return;
    }

    // إرسال بيانات الحجز فعليًا للسيرفر
    const bookingData = {
        studentName,
        phone,
        university,
        major,
        level,
        serviceType,
        appointmentDate,
        notes: document.getElementById('notes').value.trim()
    };

    fetch('https://mindful-growth-production-7692.up.railway.app/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // نجح الحفظ: نخفي النموذج ونظهر رسالة النجاح
            bookingForm.style.display = 'none';
            successMessage.classList.add('active');

            // بعد 3 ثواني نغلق النافذة ونرجع النموذج لوضعه الطبيعي
            setTimeout(() => {
                bookingModal.classList.remove('active');
                bookingForm.reset();
                bookingForm.style.display = 'block';
                successMessage.classList.remove('active');
            }, 3000);
        } else {
            alert(data.message || 'حدث خطأ أثناء إرسال الحجز');
        }
    })
    .catch(error => {
        console.error('خطأ في الاتصال بالسيرفر:', error);
        alert('تعذّر الاتصال بالسيرفر. تأكد إن السيرفر شغّال.');
    });
});

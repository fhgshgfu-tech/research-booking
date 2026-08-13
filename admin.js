// الاتصال بـ Supabase
const supabaseUrl = 'https://otgwlbwkdlwgyrqkbsla.supabase.co';
const supabaseKey = 'sb_publishable_OOwHupffONcCunGytkbyvw_FWjv7eza';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// عناصر الصفحة
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const usernameInput = document.getElementById('username'); // رح نستخدمه كإيميل
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const bookingsBody = document.getElementById('bookingsBody');

// التحقق عند فتح الصفحة: هل المستخدم مسجل دخول مسبقًا؟
checkSession();

async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        showDashboard();
    } else {
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
    }
}

// عند الضغط على زر الدخول
loginBtn.addEventListener('click', async () => {
    const email = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        loginError.textContent = 'من فضلك عبّئ الإيميل وكلمة السر';
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginError.textContent = 'الإيميل أو كلمة السر غير صحيحة';
        return;
    }

    loginError.textContent = '';
    showDashboard();
});

// السماح بالضغط على Enter لتسجيل الدخول
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

// إظهار لوحة التحكم بعد نجاح الدخول
function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    loadBookings();
}

// تسجيل الخروج
logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    dashboard.style.display = 'none';
    loginScreen.style.display = 'flex';
    usernameInput.value = '';
    passwordInput.value = '';
});

// جلب الحجوزات من السيرفر وعرضها بالجدول
function loadBookings() {
   fetch('https://mindful-growth-production-7692.up.railway.app/api/bookings')
        .then(response => response.json())
        .then(bookings => {
            bookingsBody.innerHTML = '';

            if (bookings.length === 0) {
                bookingsBody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px;">لا توجد حجوزات حتى الآن</td></tr>';
                return;
            }

            bookings.forEach(booking => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${booking.studentName}</td>
                    <td>${booking.phone}</td>
                    <td>${booking.university}</td>
                    <td>${booking.major}</td>
                    <td>${booking.level}</td>
                    <td>${booking.serviceType}</td>
                    <td>${booking.appointmentDate}</td>
                    <td>${booking.notes || '-'}</td>
                    <td>${booking.createdAt || booking.created_at || ''}</td>
                `;
                bookingsBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('خطأ أثناء جلب الحجوزات:', error);
            bookingsBody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px; color:red;">تعذّر الاتصال بالسيرفر</td></tr>';
        });
}

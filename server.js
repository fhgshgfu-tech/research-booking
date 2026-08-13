const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Railway يحدد PORT تلقائياً
const PORT = process.env.PORT || 3000;

// السماح للواجهة الأمامية بالتواصل مع السيرفر
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ===============================
// Supabase
// ===============================

const supabaseUrl = 'https://otgwlbwkdlwgyrqkbsla.supabase.co';

// هذا مفتاح Publishable وليس Service Role
const supabaseKey = process.env.SUPABASE_KEY ||
    'sb_publishable_OOwHupffONcCunGytkbyvw_FWjv7eza';

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

// ===============================
// الصفحة الرئيسية
// ===============================

app.get('/', (req, res) => {
    res.status(200).send(`
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Research Booking API</title>
            </head>
            <body style="font-family: Arial; text-align:center; margin-top:50px;">
                <h1>السيرفر يعمل بنجاح ✅</h1>
                <p>Research Booking API</p>
            </body>
        </html>
    `);
});

// ===============================
// فحص حالة السيرفر
// ===============================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'السيرفر يعمل بنجاح ✅',
        service: 'Research Booking API'
    });
});

// ===============================
// إضافة حجز جديد
// ===============================

app.post('/api/bookings', async (req, res) => {

    try {

        const {
            studentName,
            phone,
            university,
            major,
            level,
            serviceType,
            appointmentDate,
            notes
        } = req.body;

        // التحقق من البيانات المطلوبة
        if (
            !studentName ||
            !phone ||
            !university ||
            !major ||
            !level ||
            !serviceType ||
            !appointmentDate
        ) {
            return res.status(400).json({
                success: false,
                message: 'من فضلك عبّئ جميع الحقول المطلوبة'
            });
        }

        // حفظ الحجز
        const { data, error } = await supabase
            .from('bookings')
            .insert([
                {
                    studentName: studentName.trim(),
                    phone: phone.trim(),
                    university: university.trim(),
                    major: major.trim(),
                    level: level,
                    serviceType: serviceType,
                    appointmentDate: appointmentDate,
                    notes: notes ? notes.trim() : null
                }
            ])
            .select()
            .single();

        if (error) {

            console.error('Supabase Error:', error);

            return res.status(500).json({
                success: false,
                message: 'حدث خطأ أثناء حفظ الحجز',
                error: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: 'تم حفظ الحجز بنجاح ✅',
            booking: data
        });

    } catch (error) {

        console.error('Server Error:', error);

        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في السيرفر'
        });
    }
});

// ===============================
// جلب الحجوزات
// ===============================
// هذه الصفحة مخصصة للأدمن لاحقاً
// وليس للزبون
// ===============================

app.get('/api/bookings', async (req, res) => {

    try {

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('id', { ascending: false });

        if (error) {

            console.error('Supabase Error:', error);

            return res.status(500).json({
                success: false,
                message: 'حدث خطأ أثناء جلب الحجوزات'
            });
        }

        return res.status(200).json({
            success: true,
            bookings: data
        });

    } catch (error) {

        console.error('Server Error:', error);

        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في السيرفر'
        });
    }
});

// ===============================
// تشغيل السيرفر
// ===============================

// مهم جداً لـ Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

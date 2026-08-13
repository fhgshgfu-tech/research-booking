const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

// السماح لملف script.js بالتواصل مع السيرفر
app.use(cors());
app.use(express.json());

// الاتصال بـ Supabase
const supabaseUrl = 'https://otgwlbwkdlwgyrqkbsla.supabase.co';
const supabaseKey = 'sb_publishable_OOwHupffONcCunGytkbyvw_FWjv7eza';
const supabase = createClient(supabaseUrl, supabaseKey);

// اختبار: التأكد إن السيرفر شغال
app.get('/', (req, res) => {
    res.send('السيرفر يعمل بنجاح ✅');
});

// استقبال حجز جديد وتخزينه بـ Supabase
app.post('/api/bookings', async (req, res) => {
    const { studentName, phone, university, major, level, serviceType, appointmentDate, notes } = req.body;

    if (!studentName || !phone || !university || !major || !level || !serviceType || !appointmentDate) {
        return res.status(400).json({ success: false, message: 'من فضلك عبّئ جميع الحقول المطلوبة' });
    }

    const { data, error } = await supabase
        .from('bookings')
        .insert([{ studentName, phone, university, major, level, serviceType, appointmentDate, notes }])
        .select();

    if (error) {
        console.error('خطأ أثناء حفظ الحجز:', error.message);
        return res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ الحجز' });
    }

    res.json({ success: true, message: 'تم حفظ الحجز بنجاح', booking: data[0] });
});

// جلب كل الحجوزات (لاستخدامها بلوحة تحكم الأدمن)
app.get('/api/bookings', async (req, res) => {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('خطأ أثناء جلب الحجوزات:', error.message);
        return res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب الحجوزات' });
    }

    res.json(data);
});

app.listen(PORT, () => {
    console.log(`السيرفر يعمل على http://localhost:${PORT}`);
});

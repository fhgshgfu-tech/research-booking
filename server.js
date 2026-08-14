const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// السماح لملف script.js بالتواصل مع السيرفر
app.use(cors({
    origin: '*'
}));
app.use(express.json());

// الاتصال بـ Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
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

// حذف حجز معين
app.delete('/api/bookings/:id', async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('خطأ أثناء حذف الحجز:', error.message);
        return res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف الحجز' });
    }

    res.json({ success: true, message: 'تم حذف الحجز بنجاح' });
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

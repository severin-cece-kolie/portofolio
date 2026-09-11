// Serverless email proxy for Vercel (EmailJS REST)
// Requires environment variables set on the platform:
// EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_USER_ID, CONTACT_EMAIL

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { user_name, user_email, subject, message } = req.body || {};
        if (!user_name || !user_email || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const service_id = process.env.EMAILJS_SERVICE_ID;
        const template_id = process.env.EMAILJS_TEMPLATE_ID;
        const user_id = process.env.EMAILJS_USER_ID; // EmailJS user/public id
        const to_email = process.env.CONTACT_EMAIL || process.env.TO_EMAIL;

        if (!service_id || !template_id || !user_id) {
            return res.status(500).json({ error: 'Email service not configured' });
        }

        const payload = {
            service_id,
            template_id,
            user_id,
            template_params: {
                user_name,
                user_email,
                subject: subject || 'Contact depuis portfolio',
                message,
                to_email
            }
        };

        const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!r.ok) {
            const text = await r.text();
            console.error('[send-email] EmailJS response:', r.status, text);
            return res.status(502).json({ error: 'Failed to send email' });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('[send-email] Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

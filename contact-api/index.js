require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch'); // if not globally available

const app = express();
app.use(cors());
app.use(express.json());

// ⏱ Rate limiting
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 5,
  message: 'Too many contact form submissions. Try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

let failureCache = {}; // simple in-memory tracking

// 📩 Contact endpoint
app.post('/contact', contactLimiter, async (req, res) => {
  const { name, email, message, honeypot, captchaToken } = req.body;

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  console.log(`[${new Date().toISOString()}] Request from IP ${ip} | UA: ${userAgent}`);

  // 🐝 Honeypot detection
  if (honeypot && honeypot.trim() !== '') {
    console.warn('Honeypot field filled. Possible bot.');
    return res.status(400).send('Bot detected.');
  }

  // ❄️ Cooldown logic
  if (failureCache[ip] && failureCache[ip].count >= 3 && Date.now() - failureCache[ip].last < 5 * 60 * 1000) {
    return res.status(429).send('Too many failed attempts. Please wait a few minutes.');
  }

  try {
    // ✅ Verify reCAPTCHA
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captchaToken}`;
    const captchaRes = await fetch(verifyUrl, { method: 'POST' });
    const captchaData = await captchaRes.json();

    if (!captchaData.success || (captchaData.score !== undefined && captchaData.score < 0.5)) {
      console.warn(`Captcha failed for IP ${ip}`);
      failureCache[ip] = {
        count: (failureCache[ip]?.count || 0) + 1,
        last: Date.now(),
      };
      return res.status(400).send('reCAPTCHA failed');
    }

    // 📤 Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Contact from ${name}`,
      text: message,
      replyTo: email,
    });

    // ✅ Clear failures on success
    delete failureCache[ip];

    res.send('Message sent successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).send('Failed to send message.');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Sending...');

    if (!captchaToken) {
      setStatus('Please complete the CAPTCHA');
      return;
    }

    try {
      const res = await fetch('https://demo-form-submit.onrender.com/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, captchaToken }),
      });

      const msg = await res.text();
      setStatus(msg);
    } catch (error) {
      setStatus('Something went wrong.');
    }
  };

  return (
    <>
      <div className="contact-form-container">
        <form onSubmit={handleSubmit} className="contact-form">
          <h2>Contact Us</h2>

          <input
            name="name"
            placeholder="Your Name"
            onChange={handleChange}
            value={formData.name}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Your Email"
            onChange={handleChange}
            value={formData.email}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            onChange={handleChange}
            value={formData.message}
            required
            rows={4}
          />
          <ReCAPTCHA
            sitekey="6LeuxokrAAAAAMRaogDjMi4b2Jf8-SpUKU82WOwh"
            onChange={(token: string | null) => {
              if (token) setCaptchaToken(token);
            }}
          />

          <button type="submit">Send Message</button>
          {status && <p className="status">{status}</p>}
        </form>
      </div>

      <style>{`
        .contact-form-container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding: 24px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fafafa;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .contact-form h2 {
          margin-bottom: 10px;
          font-size: 1.5rem;
          color: #333;
          text-align: center;
        }

        .contact-form input,
        .contact-form textarea {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }

        .contact-form textarea {
          resize: vertical;
        }

        .contact-form button {
          background-color: #007BFF;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s;
        }

        .contact-form button:hover {
          background-color: #0056b3;
        }

        .status {
          text-align: center;
          font-size: 0.9rem;
          color: #333;
        }
      `}</style>
    </>
  );
};

export default App;

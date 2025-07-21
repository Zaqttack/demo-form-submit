import { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('Sending...');
    console.log("Form data:", formData);
    try {
      const response = await fetch('https://demo-form-submit.onrender.com/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.text();
      setStatus(result);
    } catch (err) {
      setStatus('Error sending message.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <textarea name="message" placeholder="Message" onChange={handleChange} required />
      <button type="submit">Send</button>
      <p>{status}</p>
    </form>
  );
}

export default App;

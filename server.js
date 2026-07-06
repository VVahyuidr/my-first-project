const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'messages.json');

app.use(cors());
app.use(bodyParser.json());

// Serve static site
app.use(express.static(path.join(__dirname)));

function readMessages(){
  try{
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  }catch(e){
    return [];
  }
}

function writeMessages(msgs){
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(msgs, null, 2), 'utf8');
}

app.post('/api/messages', (req, res) => {
  const { name, email, message } = req.body || {};
  if(!name || !email || !message){
    return res.status(400).json({ error: 'Missing fields' });
  }
  const msgs = readMessages();
  const now = new Date().toISOString();
  const entry = { id: Date.now().toString(), name, email, message, createdAt: now, handled: false };
  msgs.unshift(entry);
  writeMessages(msgs);
  res.json({ success: true, stored: true, id: entry.id });
});

app.get('/api/messages', (req, res) => {
  const msgs = readMessages();
  res.json(msgs);
});

app.post('/api/reply', async (req, res) => {
  const { id, replySubject, replyBody } = req.body || {};
  if(!id || !replyBody){
    return res.status(400).json({ error: 'Missing id or replyBody' });
  }
  const msgs = readMessages();
  const idx = msgs.findIndex(m => m.id === id);
  if(idx === -1) return res.status(404).json({ error: 'Message not found' });

  const recipient = msgs[idx].email;

  // If SMTP configured, send email via nodemailer
  if(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS){
    try{
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: recipient,
        subject: replySubject || 'Reply from Wahyu Indrawan',
        text: replyBody
      });
      // mark handled
      msgs[idx].handled = true;
      msgs[idx].repliedAt = new Date().toISOString();
      writeMessages(msgs);
      return res.json({ success: true, sent: true });
    }catch(err){
      return res.status(500).json({ error: 'Failed to send email', detail: String(err) });
    }
  }

  // Fallback: return a mailto link the admin can open
  const subject = encodeURIComponent(replySubject || 'Reply from Wahyu Indrawan');
  const body = encodeURIComponent(replyBody);
  const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;

  // mark handled locally
  msgs[idx].handled = true;
  msgs[idx].repliedAt = new Date().toISOString();
  writeMessages(msgs);

  res.json({ success: true, sent: false, mailto });
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

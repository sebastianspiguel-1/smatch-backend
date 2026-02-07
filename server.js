const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '🚀 SMatch Backend API' });
});

app.post('/register', async (req, res) => {
  try {
    const { email, full_name, user_type, company_name } = req.body;
    if (!email || !full_name || !user_type) {
      return res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
    }
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, full_name, user_type, company_name: user_type === 'company' ? company_name : null }])
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, user: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/jobs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active');
    if (error) throw error;
    res.json({ success: true, jobs: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/jobs', async (req, res) => {
  try {
    const { title, description, location, remote, salary_min, salary_max, company_user_id } = req.body;
    if (!title || !description || !company_user_id) {
      return res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
    }
    const { data, error } = await supabase
      .from('jobs')
      .insert([{ title, description, location, remote: remote || false, salary_min, salary_max, company_user_id, status: 'active' }])
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, job: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/applications', async (req, res) => {
  try {
    const { job_id, candidate_user_id } = req.body;
    if (!job_id || !candidate_user_id) {
      return res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
    }
    const { data, error } = await supabase
      .from('applications')
      .insert([{ job_id, candidate_user_id, status: 'pending' }])
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, application: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/applications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*');
    if (error) throw error;
    res.json({ success: true, applications: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
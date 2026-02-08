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

// ============================================
// ASSESSMENTS ENDPOINTS
// ============================================

// Guardar resultado de assessment
app.post('/api/assessments', async (req, res) => {
  try {
    const {
      candidate_name,
      candidate_email,
      challenge_id,
      overall_score,
      detection_score,
      prioritization_score,
      communication_score,
      time_efficiency,
      recommendation,
      green_flags,
      yellow_flags,
      red_flags,
      total_time
    } = req.body;

    const { data, error } = await supabase
      .from('assessments')
      .insert([{
        candidate_name,
        candidate_email,
        challenge_id: challenge_id || 1,
        overall_score,
        detection_score,
        prioritization_score,
        communication_score,
        time_efficiency,
        recommendation,
        green_flags,
        yellow_flags,
        red_flags,
        total_time
      }])
      .select();

    if (error) {
      console.error('Error saving assessment:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      assessment: data[0],
      message: 'Assessment saved successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/assessments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtener todos los assessments
app.get('/api/assessments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ assessments: data });

  } catch (error) {
    console.error('Error in GET /api/assessments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtener assessments por email de candidato
app.get('/api/assessments/candidate/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('candidate_email', email)
      .order('completed_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ assessments: data });

  } catch (error) {
    console.error('Error in GET /api/assessments/candidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
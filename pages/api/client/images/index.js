import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { regNo, applicantNo, s3Url, s3Key } = req.body

  if (!regNo || !applicantNo || !s3Url) {
    return res.status(400).json({ success: false, message: 'Missing fields' })
  }

  try {
    // INSERT new row every time (not upsert)
    const { error } = await supabase.from('workers').insert({
      reg_no: regNo,
      applicant_no: applicantNo,
      photo_url: s3Url,
      s3_key: s3Key,
      uploaded_at: new Date().toISOString()
    })

    if (error) throw error

    return res.json({ success: true })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

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

  try {
    // INSERT not upsert — store each photo as separate row
    await supabase.from('workers').insert({
      reg_no: regNo,
      applicant_no: applicantNo,
      photo_url: s3Url,
      uploaded_at: new Date().toISOString()
    })

    return res.json({ success: true })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

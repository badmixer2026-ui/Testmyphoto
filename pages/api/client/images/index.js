import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { regNo, applicantNo, s3Key, s3Url, applicantName } = req.body

  if (!regNo || !applicantNo) {
    return res.status(400).json({ 
      success: false, 
      message: 'regNo and applicantNo required' 
    })
  }

  try {
    await supabase.from('workers').upsert({
      reg_no: regNo,
      applicant_no: applicantNo,
      photo_url: s3Url,
      uploaded_at: new Date().toISOString()
    })

    return res.json({ 
      success: true, 
      message: 'Photo saved successfully' 
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

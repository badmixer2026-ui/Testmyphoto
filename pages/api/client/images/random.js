import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  const { regNo, applicantNo } = req.query

  if (!regNo || !applicantNo) {
    return res.status(400).json({ 
      success: false, 
      message: 'regNo and applicantNo required' 
    })
  }

  try {
    const { data, error } = await supabase
      .from('workers')
      .select('photo_url')
      .eq('reg_no', regNo)
      .eq('applicant_no', applicantNo)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return res.json({ 
        success: false, 
        message: 'No photo found' 
      })
    }

    return res.json({ 
      success: true,
      data: { 
        fetchUrl: data.photo_url,
        s3Url: data.photo_url
      }
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

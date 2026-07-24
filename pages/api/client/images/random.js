import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  const { regNo, applicantNo } = req.query

  if (!regNo || !applicantNo) {
    return res.status(400).json({ success: false, message: 'regNo and applicantNo required' })
  }

  try {
    const { data, error } = await supabase
      .from('workers')
      .select('photo_url, id')
      .eq('reg_no', regNo)
      .eq('applicant_no', applicantNo)

    if (error || !data || data.length === 0) {
      return res.json({ success: false, message: 'No photo found' })
    }

    // True random pick
    const picked = data[Math.floor(Math.random() * data.length)]
    const photoUrl = picked.photo_url

    // App reads: response.data.fetchUrl then response.data.s3Url
    return res.json({
      success: true,
      valid: true,
      data: {
        fetchUrl: photoUrl,
        s3Url: photoUrl,
        imageUrl: photoUrl
      }
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

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
    // Try both string and number match
    const { data, error } = await supabase
      .from('workers')
      .select('photo_url, id')
      .eq('reg_no', regNo)
      .or(`applicant_no.eq.${applicantNo},applicant_no.eq."${applicantNo}"`)

    if (error || !data || data.length === 0) {
      // Try with just reg_no in case applicant_no type differs
      const { data: data2 } = await supabase
        .from('workers')
        .select('photo_url')
        .eq('reg_no', regNo)

      if (!data2 || data2.length === 0) {
        return res.json({ success: false, message: 'No photo found' })
      }

      const picked = data2[Math.floor(Math.random() * data2.length)]
      return res.json({
        success: true,
        valid: true,
        data: {
          fetchUrl: picked.photo_url,
          s3Url: picked.photo_url
        }
      })
    }

    const picked = data[Math.floor(Math.random() * data.length)]

    return res.json({
      success: true,
      valid: true,
      data: {
        fetchUrl: picked.photo_url,
        s3Url: picked.photo_url
      }
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

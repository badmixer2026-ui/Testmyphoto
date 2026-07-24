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
    // Get ALL photos for this worker
    const { data, error } = await supabase
      .from('workers')
      .select('photo_url, id')
      .eq('reg_no', regNo)
      .eq('applicant_no', applicantNo)

    if (error || !data || data.length === 0) {
      return res.json({ success: false, message: 'No photo found' })
    }

    // Shuffle array properly
    const shuffled = data.sort(() => Math.random() - 0.5)

    // Pick first after shuffle = truly random
    const picked = shuffled[0]

    return res.json({
      success: true,
      data: {
        fetchUrl: picked.photo_url,
        s3Url: picked.photo_url,
        total: data.length
      }
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

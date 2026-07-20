import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  const { reg_no, applicant_no } = req.query

  if (!reg_no || !applicant_no) {
    return res.status(400).json({ 
      success: false, 
      message: 'reg_no and applicant_no required' 
    })
  }

  try {
    const { data, error } = await supabase
      .from('workers')
      .select('photo_url')
      .eq('reg_no', reg_no)
      .eq('applicant_no', applicant_no)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return res.json({ success: false, message: 'No photo found' })
    }

    return res.json({ 
      success: true, 
      data: { fetchUrl: data.photo_url } 
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

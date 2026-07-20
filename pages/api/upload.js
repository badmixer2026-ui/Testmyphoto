import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { reg_no, applicant_no, photo_base64 } = req.body

  if (!reg_no || !applicant_no || !photo_base64) {
    return res.status(400).json({ 
      success: false, 
      message: 'reg_no, applicant_no and photo_base64 required' 
    })
  }

  try {
    // Convert base64 to file
    const base64Data = photo_base64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const fileName = `${reg_no}/${applicant_no}.jpg`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('worker-photos')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('worker-photos')
      .getPublicUrl(fileName)

    const photo_url = data.publicUrl

    // Save to database
    await supabase.from('workers').upsert({
      reg_no,
      applicant_no,
      photo_url,
      uploaded_at: new Date().toISOString()
    })

    return res.json({ success: true, photo_url })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

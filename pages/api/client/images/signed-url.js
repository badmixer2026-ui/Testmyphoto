import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { regNo, applicantNo, fileName } = req.body

  if (!regNo || !applicantNo) {
    return res.status(400).json({ 
      success: false, 
      message: 'regNo and applicantNo required' 
    })
  }

  try {
    const s3Key = `${regNo}/${applicantNo}/${fileName || 'photo.jpg'}`

    // Create signed upload URL
    const { data, error } = await supabase.storage
      .from('worker-photos')
      .createSignedUploadUrl(s3Key)

    if (error) throw error

    const s3Url = supabase.storage
      .from('worker-photos')
      .getPublicUrl(s3Key).data.publicUrl

    return res.json({
      success: true,
      data: {
        uploadUrl: data.signedUrl,
        s3Key: s3Key,
        s3Url: s3Url
      }
    })

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

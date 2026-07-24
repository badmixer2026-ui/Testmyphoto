import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { regNo, applicantNo } = req.body

  if (!regNo || !applicantNo) {
    return res.status(400).json({ success: false, message: 'regNo and applicantNo required' })
  }

  // Count existing photos for this worker
  const { data: existing } = await supabase
    .from('workers')
    .select('id')
    .eq('reg_no', regNo)
    .eq('applicant_no', applicantNo)

  const count = existing ? existing.length : 0

  if (count >= 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Maximum 6 photos reached for this worker' 
    })
  }

  // Unique filename using timestamp
  const uniqueFileName = `${Date.now()}.jpg`
  const s3Key = `${regNo}/${applicantNo}/${uniqueFileName}`
  const s3Url = `${process.env.SUPABASE_URL}/storage/v1/object/public/worker-photos/${s3Key}`
  const uploadUrl = `https://testmyphoto.vercel.app/api/client/images/put?regNo=${encodeURIComponent(regNo)}&applicantNo=${encodeURIComponent(applicantNo)}&fileName=${encodeURIComponent(uniqueFileName)}`

  return res.json({
    success: true,
    data: { uploadUrl, s3Key, s3Url }
  })
}

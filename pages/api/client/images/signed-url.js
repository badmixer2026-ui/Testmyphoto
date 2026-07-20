export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { regNo, applicantNo, fileName } = req.body

  // Return YOUR server as the upload URL
  // App will PUT image bytes directly to this URL
  const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/client/images/upload-binary?regNo=${encodeURIComponent(regNo)}&applicantNo=${encodeURIComponent(applicantNo)}&fileName=${encodeURIComponent(fileName || 'photo.jpg')}`

  return res.json({
    success: true,
    data: {
      uploadUrl: uploadUrl,
      s3Key: `${regNo}/${applicantNo}/${fileName || 'photo.jpg'}`,
      s3Url: uploadUrl
    }
  })
}

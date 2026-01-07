import React, { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  Upload,
  Loader2,
  Sparkles,
  Eraser,
  Brush,
  Download
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { storage, db, auth } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore'

// Debug logging helper
const debugLog = (location, message, data, hypothesisId = null) => {
  fetch('http://127.0.0.1:7242/ingest/ba7c5992-520a-4290-a7f1-ab8b4e907062', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      hypothesisId
    })
  }).catch(() => {})
}

const BackgroundChanger = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [runId, setRunId] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)

  // Canvas & Mask state
  const [imageLoaded, setImageLoaded] = useState(false)
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(20)
  const [outputImage, setOutputImage] = useState(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false)
  const canvasContainerRef = useRef(null)

  // Hidden mask canvas
  const maskCanvasRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setOutputImage(null)
      setImageLoaded(false)
      setRunId(null)

      // Load image to canvas
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          imageRef.current = img
          setImageLoaded(true)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  useEffect(() => {
    fetch('/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Not logged in')
      })
      .then(() => setLoggedIn(true))
      .catch(() => navigate('/'))
  }, [loggedIn, navigate])

  // Initialize canvases once image is loaded
  useEffect(() => {
    if (
      imageLoaded &&
      imageRef.current &&
      canvasRef.current &&
      maskCanvasRef.current
    ) {
      const canvas = canvasRef.current
      const maskCanvas = maskCanvasRef.current
      const img = imageRef.current

      // Resize canvas to match image aspect ratio but fit within container
      const maxWidth = Math.min(600, window.innerWidth - 60)
      const scale = maxWidth / img.width
      canvas.width = maxWidth
      canvas.height = img.height * scale

      maskCanvas.width = canvas.width
      maskCanvas.height = canvas.height

      // Draw original image on main canvas
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Initialize mask canvas with black (no mask)
      const maskCtx = maskCanvasRef.current.getContext('2d')
      maskCtx.fillStyle = 'black'
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
    }
  }, [imageLoaded])

  const startDrawing = (e) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    const maskCtx = maskCanvasRef.current.getContext('2d')
    maskCtx.beginPath()
  }

  const handleMouseMove = (e) => {
    if (!imageLoaded || !canvasRef.current || !canvasContainerRef.current)
      return
    const container = canvasContainerRef.current
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCursorPos({ x, y })

    // Continue drawing if already drawing
    if (isDrawing) {
      draw(e)
    }
  }

  const handleMouseEnter = () => {
    setIsHoveringCanvas(true)
  }

  const handleMouseLeave = () => {
    setIsHoveringCanvas(false)
    setIsDrawing(false)
  }

  const draw = (e) => {
    if (!isDrawing || !imageLoaded) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const maskCtx = maskCanvasRef.current.getContext('2d')

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Draw visible feedback (semi-transparent red) on main canvas
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)

    // Draw actual white mask on hidden mask canvas
    maskCtx.lineWidth = brushSize
    maskCtx.lineCap = 'round'
    maskCtx.strokeStyle = 'white'

    maskCtx.lineTo(x, y)
    maskCtx.stroke()
    maskCtx.beginPath()
    maskCtx.moveTo(x, y)
  }

  const getMaskBlob = () => {
    return new Promise((resolve) => {
      maskCanvasRef.current.toBlob((blob) => resolve(blob), 'image/png')
    })
  }

  // Helper function to convert file/blob to base64 data URL
  const fileToDataURL = (file) => {
    // #region agent log
    debugLog(
      'BackgroundChanger.jsx:154',
      'fileToDataURL entry',
      {
        fileType: file?.type,
        fileSize: file?.size,
        fileName: file?.name
      },
      'A'
    )
    // #endregion
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        // #region agent log
        debugLog(
          'BackgroundChanger.jsx:161',
          'fileToDataURL success',
          {
            resultLength: result?.length,
            resultPrefix: result?.substring(0, 50),
            isDataUrl: result?.startsWith('data:')
          },
          'A'
        )
        // #endregion
        resolve(result)
      }
      reader.onerror = (error) => {
        // #region agent log
        debugLog(
          'BackgroundChanger.jsx:170',
          'fileToDataURL error',
          {
            error: error?.message || String(error)
          },
          'A'
        )
        // #endregion
        reject(error)
      }
      reader.readAsDataURL(file)
    })
  }

  const pollForResults = async (runId, creationId, userId) => {
    setStatusText('Waiting for magic (this may take 20-30s)...')

    const checkStatus = async () => {
      try {
        // Use same API key as initial call
        const apiKey =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl8zNk00Nkk5U1FtUXVBWUJnN01qRGZKTmJtanAiLCJpYXQiOjE3Njc3NDYzODAsIm9yZ19pZCI6Im9yZ18zNk00ODJNdWUzODlUMGZJWm8xSUFaT1lnNTcifQ.iuqsjag2zGGXirK_1nCzlBJgSZbiZbyb_0qFzI02kmE' ||
          import.meta.env.VITE_COMFY_DEPLOY_API_KEY

        // #region agent log
        debugLog(
          'BackgroundChanger.jsx:166',
          'Polling status check',
          {
            runId,
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey?.length
          },
          'B'
        )
        // #endregion

        if (!apiKey) {
          throw new Error('ComfyDeploy API key is missing')
        }

        const res = await fetch(
          `https://api.comfydeploy.com/api/run/${runId}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`
            }
          }
        )

        // #region agent log
        debugLog(
          'BackgroundChanger.jsx:174',
          'Poll response status',
          {
            status: res.status,
            statusText: res.statusText,
            ok: res.ok
          },
          'D'
        )
        // #endregion

        if (!res.ok) {
          if (res.status === 404) {
            // Run not found yet, keep polling
            return false
          }
          throw new Error(`Status check failed: ${res.statusText}`)
        }

        const data = await res.json()
        // #region agent log
        debugLog(
          'BackgroundChanger.jsx:191',
          'Poll response data',
          {
            status: data.status,
            hasOutputs: !!data.outputs,
            outputsLength: data.outputs?.length,
            hasError: !!data.error,
            responseKeys: Object.keys(data)
          },
          'D'
        )
        // #endregion
        console.log('Poll response:', data)

        // Check if generation is complete
        if (data.status === 'completed' || data.status === 'success') {
          // Look for output images in various possible formats
          let outputUrl = null

          if (data.outputs && Array.isArray(data.outputs)) {
            for (const output of data.outputs) {
              // Check for images array
              if (
                output.data?.images &&
                Array.isArray(output.data.images) &&
                output.data.images.length > 0
              ) {
                outputUrl = output.data.images[0].url || output.data.images[0]
                break
              }
              // Check for output_images array
              if (
                output.data?.output_images &&
                Array.isArray(output.data.output_images) &&
                output.data.output_images.length > 0
              ) {
                outputUrl =
                  output.data.output_images[0].url ||
                  output.data.output_images[0]
                break
              }
              // Check for direct image URL
              if (output.data?.image_url) {
                outputUrl = output.data.image_url
                break
              }
            }
          }

          // Also check top-level image fields
          if (!outputUrl && data.image_url) {
            outputUrl = data.image_url
          }
          if (!outputUrl && data.output_image) {
            outputUrl = data.output_image
          }

          if (outputUrl) {
            console.log('📥 Downloading output image from ComfyDeploy...')
            setStatusText('Saving result to Firebase...')

            try {
              // Download the image from ComfyDeploy
              const imageResponse = await fetch(outputUrl)
              if (!imageResponse.ok) {
                throw new Error('Failed to download output image')
              }
              const imageBlob = await imageResponse.blob()

              // Upload to Firebase Storage
              console.log('📤 Uploading output to Firebase Storage...')
              const outputRef = ref(
                storage,
                `users/${userId}/outputs/${Date.now()}_result.png`
              )
              await uploadBytes(outputRef, imageBlob)
              const firebaseOutputUrl = await getDownloadURL(outputRef)
              console.log('✅ Output saved to Firebase:', firebaseOutputUrl)

              // Update Firestore record with Firebase URL
              if (creationId && userId) {
                await updateDoc(
                  doc(db, `users/${userId}/creations`, creationId),
                  {
                    outputUrl: firebaseOutputUrl,
                    comfyDeployUrl: outputUrl, // Keep original for reference
                    status: 'completed',
                    completedAt: serverTimestamp()
                  }
                )
                console.log('✅ Firestore record updated')
              }

              // Show from Firebase
              setOutputImage(firebaseOutputUrl)
              setLoading(false)
              setStatusText('Done!')
              return true
            } catch (uploadError) {
              console.error('❌ Error uploading to Firebase:', uploadError)
              // Fallback: show ComfyDeploy URL if Firebase upload fails
              setOutputImage(outputUrl)
              setLoading(false)
              setStatusText('Done! (using ComfyDeploy URL)')
              // Still try to update Firestore with ComfyDeploy URL
              if (creationId && userId) {
                try {
                  await updateDoc(
                    doc(db, `users/${userId}/creations`, creationId),
                    {
                      outputUrl: outputUrl,
                      status: 'completed',
                      completedAt: serverTimestamp(),
                      firebaseUploadFailed: true
                    }
                  )
                } catch (e) {
                  console.error('Failed to update Firestore:', e)
                }
              }
              return true
            }
          } else {
            console.warn('No output image found in response:', data)
          }
        } else if (data.status === 'failed' || data.status === 'error') {
          // Update Firestore on failure
          if (creationId && userId) {
            try {
              await updateDoc(
                doc(db, `users/${userId}/creations`, creationId),
                {
                  status: 'failed',
                  error: data.error || 'Generation failed',
                  completedAt: serverTimestamp()
                }
              )
            } catch (e) {
              console.error('Failed to update Firestore on error:', e)
            }
          }
          throw new Error(data.error || 'Generation failed on ComfyDeploy')
        }
        // If status is 'pending' or 'processing', continue polling
      } catch (err) {
        console.warn('Polling error:', err)
        // Don't throw on network errors, just continue polling
        if (err.message && !err.message.includes('404')) {
          // Only show error for non-404 errors after a few attempts
          setStatusText(`Error checking status: ${err.message}`)
        }
      }
      return false
    }

    // Poll every 3 seconds, with a maximum timeout of 5 minutes
    let attempts = 0
    const maxAttempts = 100 // 100 attempts * 3 seconds = 5 minutes max
    const interval = setInterval(async () => {
      attempts++
      const done = await checkStatus()
      if (done || attempts >= maxAttempts) {
        clearInterval(interval)
        if (attempts >= maxAttempts && !done) {
          setLoading(false)
          setStatusText('Timeout: Generation took too long')
          alert(
            'The generation is taking longer than expected. Please try again.'
          )
        }
      }
    }, 3000)
  }

  const handleGenerate = async () => {
    // #region agent log
    debugLog(
      'BackgroundChanger.jsx:330',
      'handleGenerate entry',
      {
        hasFile: !!file,
        hasPrompt: !!prompt,
        promptLength: prompt?.length,
        fileName: file?.name,
        fileSize: file?.size
      },
      'ALL'
    )
    // #endregion
    console.log('🚀 handleGenerate called', { file: !!file, prompt })

    if (!file || !prompt) {
      console.warn('❌ Missing file or prompt', {
        file: !!file,
        prompt: !!prompt
      })
      alert('Please upload an image and enter a background description')
      return
    }

    setLoading(true)
    setStatusText('Preparing files...')
    console.log('📤 Starting file preparation...')

    try {
      const user = auth.currentUser
      const userId = user ? user.uid : 'anonymous'
      // #region agent log
      debugLog(
        'BackgroundChanger.jsx:346',
        'User context',
        {
          userId,
          hasUser: !!user
        },
        'ALL'
      )
      // #endregion
      console.log('👤 User:', userId)

      // 1. Convert original image to base64 data URL
      console.log('📤 Converting image to base64...')
      // #region agent log
      debugLog(
        'BackgroundChanger.jsx:348',
        'Before image conversion',
        {
          fileType: file.type,
          fileSize: file.size
        },
        'A'
      )
      // #endregion
      const inputImageDataUrl = await fileToDataURL(file)
      // #region agent log
      debugLog(
        'BackgroundChanger.jsx:351',
        'After image conversion',
        {
          dataUrlLength: inputImageDataUrl?.length,
          dataUrlPrefix: inputImageDataUrl?.substring(0, 100)
        },
        'A'
      )
      // #endregion
      console.log('✅ Image converted to data URL')

      // 2. Convert mask to base64 data URL
      console.log('📤 Converting mask to base64...')
      const maskBlob = await getMaskBlob()
      // #region agent log
      debugLog(
        'BackgroundChanger.jsx:356',
        'Before mask conversion',
        {
          maskBlobSize: maskBlob?.size,
          maskBlobType: maskBlob?.type
        },
        'A'
      )
      // #endregion
      const maskDataUrl = await fileToDataURL(maskBlob)
      // #region agent log
      debugLog(
        'BackgroundChanger.jsx:357',
        'After mask conversion',
        {
          dataUrlLength: maskDataUrl?.length,
          dataUrlPrefix: maskDataUrl?.substring(0, 100)
        },
        'A'
      )
      // #endregion
      console.log('✅ Mask converted to data URL')

      setStatusText('Sending to ComfyDeploy...')

      // 3. Call ComfyDeploy API directly with base64 data
      const deploymentId =
        import.meta.env.VITE_COMFY_DEPLOY_DEPLOYMENT_ID ||
        'a83a6835-79ee-44b0-ad65-cbad9b6ada88'
      // Use the provided API key or fallback to env variable
      const apiKey =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl8zNk00Nkk5U1FtUXVBWUJnN01qRGZKTmJtanAiLCJpYXQiOjE3Njc3NDYzODAsIm9yZ19pZCI6Im9yZ18zNk00ODJNdWUzODlUMGZJWm8xSUFaT1lnNTcifQ.iuqsjag2zGGXirK_1nCzlBJgSZbiZbyb_0qFzI02kmE' ||
        import.meta.env.VITE_COMFY_DEPLOY_API_KEY

      // #region agent log
      debugLog(
        'BackgroundChanger.jsx:362',
        'API configuration',
        {
          hasApiKey: !!apiKey,
          apiKeyLength: apiKey?.length,
          apiKeyPrefix: apiKey?.substring(0, 20),
          deploymentId,
          envDeploymentId: import.meta.env.VITE_COMFY_DEPLOY_DEPLOYMENT_ID,
          envApiKey: !!import.meta.env.VITE_COMFY_DEPLOY_API_KEY
        },
        'B'
      )
      // #endregion
      console.log('🔑 API Config:', {
        hasApiKey: !!apiKey,
        deploymentId,
        apiKeyLength: apiKey?.length
      })

      if (!apiKey) {
        throw new Error('ComfyDeploy API key is missing.')
      }

      const requestBody = {
        inputs: {
          input_image: inputImageDataUrl,
          input_text: prompt,
          mask: maskDataUrl
        }
      }

      // #region agent log
      debugLog(
        'BackgroundChanger.jsx:376',
        'Request body before API call',
        {
          hasInputImage: !!requestBody.inputs.input_image,
          inputImageLength: requestBody.inputs.input_image?.length,
          inputText: requestBody.inputs.input_text,
          hasMask: !!requestBody.inputs.mask,
          maskLength: requestBody.inputs.mask?.length,
          url: `https://api.comfydeploy.com/api/run/deployment/${deploymentId}`
        },
        'C'
      )
      // #endregion
      console.log('🌐 Calling ComfyDeploy API...', {
        url: `https://api.comfydeploy.com/api/run/deployment/${deploymentId}`,
        body: requestBody
      })

      // #region agent log
      debugLog(
        'BackgroundChanger.jsx:389',
        'Before fetch call',
        {
          url: `https://api.comfydeploy.com/api/run/deployment/${deploymentId}`,
          method: 'POST',
          hasAuthHeader: true
        },
        'C'
      )
      // #endregion
      const res = await fetch(
        `https://api.comfydeploy.com/api/run/deployment/${deploymentId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      )

      // #region agent log
      debugLog(
        'BackgroundChanger.jsx:401',
        'After fetch call',
        {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          headers: Object.fromEntries(res.headers.entries())
        },
        'C'
      )
      // #endregion
      console.log('📥 API Response status:', res.status, res.statusText)

      if (!res.ok) {
        const errorText = await res.text()
        // #region agent log
        debugLog(
          'BackgroundChanger.jsx:404',
          'API error response',
          {
            status: res.status,
            statusText: res.statusText,
            errorText: errorText?.substring(0, 500)
          },
          'C'
        )
        // #endregion
        console.error('❌ API Error Response:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `HTTP ${res.status}: ${res.statusText}` }
        }
        throw new Error(
          errorData.error ||
            errorData.message ||
            `API request failed: ${res.statusText}`
        )
      }

      const data = await res.json()
      // #region agent log
      debugLog(
        'BackgroundChanger.jsx:415',
        'API success response',
        {
          hasRunId: !!data.run_id,
          runId: data.run_id,
          hasError: !!data.error,
          error: data.error,
          status: data.status,
          responseKeys: Object.keys(data)
        },
        'D'
      )
      // #endregion
      console.log('✅ API Response data:', data)

      if (data.error) {
        console.error('❌ API returned error:', data.error)
        throw new Error(data.error)
      }

      if (!data.run_id) {
        console.error('❌ No run_id in response:', data)
        throw new Error('No run_id received from ComfyDeploy API')
      }

      console.log('✅ Run ID received:', data.run_id)
      setRunId(data.run_id)

      // 4. Save to Firestore and get document ID
      // Also upload to Firebase for backup/history (optional, in background)
      console.log('💾 Saving to Firestore...')
      let inputUrl = 'sent-directly'
      let maskUrl = 'sent-directly'

      // Upload to Firebase for backup (optional, non-blocking)
      try {
        const inputRef = ref(
          storage,
          `users/${userId}/inputs/${Date.now()}_original_${file.name}`
        )
        await uploadBytes(inputRef, file)
        inputUrl = await getDownloadURL(inputRef)

        const maskRef = ref(
          storage,
          `users/${userId}/inputs/${Date.now()}_mask.png`
        )
        await uploadBytes(maskRef, maskBlob)
        maskUrl = await getDownloadURL(maskRef)
        console.log('✅ Files also backed up to Firebase')
      } catch (firebaseError) {
        console.warn(
          '⚠️ Firebase backup failed (continuing anyway):',
          firebaseError
        )
      }

      const creationRef = await addDoc(
        collection(db, `users/${userId}/creations`),
        {
          type: 'background-changer',
          inputUrl,
          maskUrl,
          prompt,
          runId: data.run_id,
          createdAt: serverTimestamp(),
          status: 'processing'
        }
      )
      const creationId = creationRef.id
      console.log('✅ Firestore record created:', creationId)

      // 5. Start polling for results (pass creationId and userId)
      console.log('🔄 Starting to poll for results...')
      pollForResults(data.run_id, creationId, userId)
    } catch (error) {
      console.error('❌ Generation error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      alert('Error: ' + error.message)
      setLoading(false)
      setStatusText('')
    }
  }

  return (
    <div
      className="container"
      style={{
        padding: '120px 2rem 60px',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    >
      <button
        onClick={() => navigate('/')}
        className="btn btn-secondary"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="glass" style={{ padding: '2rem' }}>
        <h2
          style={{
            fontSize: '2rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}
        >
          Change Background
        </h2>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Step 1: Editor */}
          {!outputImage && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}
              >
                <label style={{ color: 'var(--text-muted)' }}>
                  1. Upload & Mask Product
                </label>

                {imageLoaded && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center'
                    }}
                  >
                    <Brush size={16} />
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      style={{ width: '100px' }}
                    />
                  </div>
                )}
              </div>

              <div
                ref={canvasContainerRef}
                style={{
                  border: '2px dashed var(--glass-border)',
                  borderRadius: '16px',
                  padding: '1rem',
                  textAlign: 'center',
                  position: 'relative',
                  background: 'rgba(0,0,0,0.2)',
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {!imageLoaded && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <Upload
                      size={32}
                      style={{
                        marginBottom: '1rem',
                        color: 'var(--text-muted)'
                      }}
                    />
                    <p>Click to upload image</p>
                  </div>
                )}

                {/* Hidden mask canvas for data generation */}
                <canvas ref={maskCanvasRef} style={{ display: 'none' }} />

                {/* Visible drawing canvas */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={handleMouseMove}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{
                    opacity: imageLoaded ? 1 : 0,
                    cursor: 'crosshair',
                    maxWidth: '100%',
                    touchAction: 'none'
                  }}
                />

                {/* Brush size preview circle */}
                {imageLoaded && isHoveringCanvas && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${cursorPos.x}px`,
                      top: `${cursorPos.y}px`,
                      width: `${brushSize}px`,
                      height: `${brushSize}px`,
                      borderRadius: '50%',
                      border: '2px solid rgba(255, 255, 255, 0.9)',
                      pointerEvents: 'none',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1000,
                      boxShadow:
                        '0 0 0 1px rgba(0, 0, 0, 0.6), 0 0 12px rgba(255, 255, 255, 0.4)',
                      transition: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                )}
              </div>
              {imageLoaded && (
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.5rem',
                    textAlign: 'center'
                  }}
                >
                  Draw over the area you want to KEEP (masking functionality).
                </p>
              )}
            </div>
          )}

          {/* Output Display */}
          {outputImage && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem' }}>Your Magic Result</h3>
              <div
                className="glass"
                style={{
                  padding: '1rem',
                  display: 'inline-block',
                  marginBottom: '1rem'
                }}
              >
                <img
                  src={outputImage}
                  alt="Generated"
                  style={{ maxWidth: '100%', borderRadius: '8px' }}
                />
              </div>
              <div>
                <a
                  href={outputImage}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Download size={20} /> Download
                </a>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setOutputImage(null)
                    setImageLoaded(false)
                    setFile(null)
                  }}
                  style={{ marginLeft: '1rem' }}
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Prompt & Action */}
          {!outputImage && (
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: 'var(--text-muted)'
                }}
              >
                2. Describe New Background
              </label>
              <textarea
                className="glass-input"
                rows="3"
                placeholder="e.g., A minimalist marble table with sunlight..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  color: 'white'
                }}
              />

              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault()
                  console.log('🔘 Button clicked!')
                  handleGenerate()
                }}
                disabled={loading || !file || !prompt}
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  fontSize: '1.1rem'
                }}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles size={24} />
                )}
                {loading ? statusText || 'Processing...' : 'Generate Magic'}
              </button>
              {!import.meta.env.VITE_COMFY_DEPLOY_API_KEY && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '8px',
                    color: '#fca5a5',
                    fontSize: '0.9rem'
                  }}
                >
                  ⚠️ Warning: ComfyDeploy API key not found. Please set
                  VITE_COMFY_DEPLOY_API_KEY in your .env file.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BackgroundChanger

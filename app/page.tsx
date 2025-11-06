'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [text, setText] = useState('Hello Video!')
  const [bgColor, setBgColor] = useState('#667eea')
  const [textColor, setTextColor] = useState('#ffffff')
  const [animationType, setAnimationType] = useState<'bounce' | 'spin' | 'wave'>('bounce')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = textColor
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.save()

      if (animationType === 'bounce') {
        const bounce = Math.abs(Math.sin(elapsed / 500)) * 50
        ctx.translate(centerX, centerY - bounce)
      } else if (animationType === 'spin') {
        ctx.translate(centerX, centerY)
        ctx.rotate((elapsed / 1000) % (2 * Math.PI))
      } else if (animationType === 'wave') {
        ctx.translate(centerX, centerY)
        const scale = 1 + Math.sin(elapsed / 300) * 0.3
        ctx.scale(scale, scale)
      }

      ctx.fillText(text, 0, 0)
      ctx.restore()

      // Draw timestamp
      ctx.fillStyle = textColor
      ctx.font = '16px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(`${(elapsed / 1000).toFixed(1)}s`, canvas.width - 20, 30)

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [text, bgColor, textColor, animationType])

  const startRecording = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    chunksRef.current = []
    const stream = canvas.captureStream(30)
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const downloadVideo = () => {
    if (!videoUrl) return

    const a = document.createElement('a')
    a.href = videoUrl
    a.download = 'video.webm'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Video Creator</h1>

        <div className={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className={styles.canvas}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.inputGroup}>
            <label>Text:</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Background Color:</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className={styles.colorInput}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Text Color:</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className={styles.colorInput}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Animation:</label>
            <select
              value={animationType}
              onChange={(e) => setAnimationType(e.target.value as any)}
              className={styles.select}
            >
              <option value="bounce">Bounce</option>
              <option value="spin">Spin</option>
              <option value="wave">Wave</option>
            </select>
          </div>
        </div>

        <div className={styles.buttons}>
          {!isRecording ? (
            <button onClick={startRecording} className={styles.button}>
              Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className={`${styles.button} ${styles.stopButton}`}>
              Stop Recording
            </button>
          )}
        </div>

        {videoUrl && (
          <div className={styles.videoPreview}>
            <h2 className={styles.subtitle}>Preview</h2>
            <video src={videoUrl} controls className={styles.video} />
            <button onClick={downloadVideo} className={styles.button}>
              Download Video
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

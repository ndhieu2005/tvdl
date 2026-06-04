'use client'

import { useEffect, useRef, useState } from 'react'

interface SwaggerWrapperProps {
  spec: object
}

export default function SwaggerWrapper({ spec }: SwaggerWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const loadSwaggerUI = async () => {
      try {
        // Check if SwaggerUI is already loaded
        if (window.SwaggerUIBundle) {
          initSwaggerUI()
          return
        }

        // Load CSS first
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css'
        document.head.appendChild(link)

        // Load JavaScript
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js'
        script.onload = () => {
          setTimeout(() => {
            initSwaggerUI()
          }, 100) // Small delay to ensure everything is loaded
        }
        script.onerror = () => {
          setError('Failed to load Swagger UI')
          setIsLoading(false)
        }

        document.body.appendChild(script)

        // Cleanup function
        return () => {
          try {
            if (document.body.contains(script)) {
              script.remove()
            }
            if (document.head.contains(link)) {
              link.remove()
            }
          } catch (e) {
            console.warn('Error cleaning up Swagger UI assets:', e)
          }
        }
      } catch (err) {
        setError('Failed to initialize Swagger UI')
        setIsLoading(false)
      }
    }

    const initSwaggerUI = () => {
      if (!containerRef.current || !window.SwaggerUIBundle) return

      try {
        window.SwaggerUIBundle({
          spec: spec,
          dom_id: containerRef.current,
          deepLinking: true,
          presets: [
            window.SwaggerUIBundle.presets.apis,
            window.SwaggerUIBundle.presets.standalone
          ],
          plugins: [
            window.SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: 'StandaloneLayout',
          tryItOutEnabled: true,
          displayOperationId: false,
          displayRequestDuration: true,
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          docExpansion: 'list',
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          onComplete: () => {
            setIsLoading(false)
            setError(null)
          }
        })
      } catch (err) {
        setError('Failed to render Swagger UI')
        setIsLoading(false)
      }
    }

    loadSwaggerUI()
  }, [spec])

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 font-semibold mb-2">Error Loading API Documentation</div>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading API Documentation...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="swagger-wrapper">
      <div ref={containerRef} id="swagger-ui-container" />
      <style jsx global>{`
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-ui .scheme-container {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
        .swagger-ui .wrapper {
          padding: 0;
        }
        .swagger-ui .information-container {
          background: transparent;
        }
      `}</style>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SwaggerUIBundle: any
  }
}
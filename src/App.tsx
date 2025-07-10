import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Button } from './components/ui/button'

import { Textarea } from './components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Badge } from './components/ui/badge'
import { Loader2, Download, Sparkles, ImageIcon, Wand2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: number
  size: string
  quality: string
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [quality, setQuality] = useState('high')
  const [generating, setGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to generate an image')
      return
    }

    setGenerating(true)
    try {
      const { data } = await blink.ai.generateImage({
        prompt: prompt.trim(),
        size,
        quality,
        n: 1
      })

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data[0].url,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        size,
        quality
      }

      setGeneratedImages(prev => [newImage, ...prev])
      toast.success('Image generated successfully!')
      
    } catch {
      toast.error('Failed to generate image. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-generated-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded!')
    } catch {
      toast.error('Failed to download image')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Image Generator
                </h1>
                <p className="text-sm text-gray-600">Create stunning visuals with AI</p>
              </div>
            </div>
            {user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => blink.auth.logout()}
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Generation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5 text-purple-600" />
                <span>Generate Your Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your image
                </label>
                <Textarea
                  placeholder="A majestic mountain landscape at sunset with vibrant colors, snow-capped peaks, and a serene lake reflecting the sky..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] text-base"
                  disabled={generating}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Size
                  </label>
                  <Select value={size} onValueChange={setSize} disabled={generating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                      <SelectItem value="1024x1792">Portrait (1024×1792)</SelectItem>
                      <SelectItem value="1792x1024">Landscape (1792×1024)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <Select value={quality} onValueChange={setQuality} disabled={generating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generateImage}
                disabled={generating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 text-lg"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <ImageIcon className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-800">Your Creations</h2>
              <Badge variant="secondary">{generatedImages.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {generatedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="overflow-hidden bg-white/70 backdrop-blur-sm border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <Button
                              onClick={() => downloadImage(image.url, image.prompt)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-gray-800 hover:bg-white"
                              size="sm"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                            {image.prompt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {image.size}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {image.quality}
                              </Badge>
                            </div>
                            <span>{new Date(image.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready to create amazing images?
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter a creative prompt above and watch as AI transforms your words into stunning visuals.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default App
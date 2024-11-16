import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from './hooks/use-toast'

import { Github, Key } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import leetCode from '@/assets/leetcode.png'
const Popup = () => {
  const [openAIKey, setOpenAIKey] = React.useState('')
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    ;(async function loadOpenAPIKey() {
      if (!chrome) return
      try {
        const apiKeyFromStorage = (await chrome.storage.local.get(
          'apiKey'
        )) as {
          apiKey?: string
        }
        if (apiKeyFromStorage.apiKey) {
          setOpenAIKey(apiKeyFromStorage.apiKey)
          toast({
            title: 'API Key Found',
            description: 'Your OpenAI API key is already configured.',
            duration: 3000,
          })
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load API key from storage.',
          duration: 3000,
        })
      }
      setIsLoaded(true)
    })()
  }, [])

  const handleAddOpenAPIKey = async () => {
    if (!openAIKey) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter an API key',
        duration: 3000,
      })
      return
    }

    setIsSaving(true)
    try {
      await chrome.storage.local.set({ apiKey: openAIKey })
      toast({
        title: 'Success',
        description: 'API key saved successfully!',
        duration: 3000,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save API key',
        duration: 3000,
      })
    }
    setIsSaving(false)
  }

  if (!isLoaded) {
    return (
      <div className="w-[350px] h-[500px] flex items-center justify-center bg-[#121627]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    )
  }

  return (
    <Card className="w-[350px] bg-[#121627] border-none shadow-lg">
      <CardHeader className="space-y-2">
        <div className="w-full h-20 overflow-hidden">
          <img
            className="mx-auto h-20 w-auto object-contain"
            src={leetCode}
            alt="LeetCode Whisper Logo"
          />
        </div>
        <div className="text-center space-y-1">
          <h1 className="font-bold text-3xl text-white">
            LeetCode <span className="text-orange-500">Whisper</span>
          </h1>
          <p className="text-sm text-slate-400">
            Your Companion to Beat LeetCode!
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="apiKey"
            className="flex items-center gap-2 text-white font-bold text-lg"
          >
            <Key className="w-4 h-4" />
            OpenAI API Key
          </label>
          <div className="space-y-2">
            <Input
              id="apiKey"
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="sk-proj-xxxx"
              className="text-sm text-white bg-[#1a1f35] border-slate-700 focus:border-orange-500"
            />
            <Button
              onClick={handleAddOpenAPIKey}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                'Save API Key'
              )}
            </Button>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center">
          <a
            href="https://github.com/piyushgarg-dev/leetcode-whisper-chrome-extension"
            className="flex items-center gap-2 text-[#86ccee] hover:text-blue-400 transition-colors text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-4 h-4" />
            Request a feature!
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

export default Popup

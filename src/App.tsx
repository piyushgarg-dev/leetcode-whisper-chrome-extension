import React from 'react'
import leetCode from '@/assets/leetcode.png'
import Show from './components/Show'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import './App.css'

const Popup: React.FC = () => {
  const [openAIKey, setOpenAIKey] = React.useState<string>('') // Current input
  const [savedKey, setSavedKey] = React.useState<string>('') // Saved API key
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false) // To load the Popup
  const [isKeyVisible, setIsKeyVisible] = React.useState(false)  // State to control visibility of the API Key

  // Load API key from storage when popup is opened
  React.useEffect(() => {
    (async function loadOpenAPIKey() {
      if (!chrome) return
      const apiKeyFromStorage = (await chrome.storage.local.get('apiKey')) as {
        apiKey?: string;
      };
      if (apiKeyFromStorage.apiKey) {
        setOpenAIKey(apiKeyFromStorage.apiKey)
        setSavedKey(apiKeyFromStorage.apiKey)
      }
      // if (apiKeyFromStorage.apiKey) {
      //   setOpenAIKey(`${apiKeyFromStorage.apiKey.substring(0, 12)}-XXXXXX`);
      // }
      setIsLoaded(true);
    })();
  }, []);

  // Save the API key to local storage
  const handleSaveAPIKey = async () => {
    if (!openAIKey.trim()) return
    await chrome.storage.local.set({ apiKey: openAIKey.trim() })
    setSavedKey(openAIKey.trim()) // Update saved key
  }

  // Clear the API key from local storage and state
  const handleClearAPIKey = async () => {
    await chrome.storage.local.remove('apiKey')
    setOpenAIKey('') // Reset input field
    setSavedKey('') // Clear saved key
  }

  // Determine if Save button should be disabled
  const isSaveButtonDisabled = !openAIKey.trim() || openAIKey.trim() === savedKey

  // Disabled Clear button if no input OR no saved key
  const isClearButtonDisabled = openAIKey === '' && savedKey === ''

  return (
    <div className="relative w-[350px] bg-gradient-to-tr from-[#0e0d0d] to-[#28333e] p-6">
      <Show show={isLoaded}>
        <div>
          <div className="w-full h-20 overflow-hidden">
            <img
              className="mx-auto h-20 w-auto"
              src={leetCode}
              width={150}
              height={150}
            />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-3xl text-white">
              LeetCode <span className="text-whisperOrange">Whisper</span>
            </h1>
            <p className="text-base text-slate-400">
              Your Companion to Beat LeetCode!
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-4">
            <label htmlFor="text" className="text-white font-bold text-xl">
              Enter Your OpenAI API key
            </label>
            <div className="flex w-full items-center gap-2">
              <Input
                type={isKeyVisible ? 'text' : 'password'}  // Toggle input type
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="Ex. 0aBbnGgzXXXXXX"
                className="bg-white text-black outline-none max-w-full"
              />
              <Button
                onClick={() => setIsKeyVisible((prev) => !prev)} // Toggle visibility
                className="w-[70px] text-white bg-transparent border-2 border-white rounded-lg p-3 hover:bg-white hover:text-black transition-all duration-300 ease-in-out"
              >
                {isKeyVisible ? 'Hide' : 'Show'}
              </Button>
            </div>
            <div className="flex justify-center gap-2.5">
              <Button
                onClick={handleSaveAPIKey}
                disabled={isSaveButtonDisabled}
                className="w-full dark text-[14px] hover:bg-whisperOrange transition-all duration-300 ease-in-out"
              >
                Save
              </Button>
              <Button
                onClick={handleClearAPIKey}
                disabled={isClearButtonDisabled}
                className="dark text-[14px] w-full hover:bg-neutral-300 transition-all duration-300 ease-in-out">
                Clear
              </Button>
            </div>
          </div>
          <div className=" h-16 flex items-end my-2 justify-center">
            <p className="text-white text-[14.5px]">
              Want more features?&nbsp;
              <a
                href="https://github.com/piyushgarg-dev/leetcode-whisper-chrome-extension"
                className="font-medium gradient-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                &nbsp;Request a feature!
              </a>
            </p>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default Popup

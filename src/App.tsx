import leetCode from '@/assets/leetcode.png'
import React from 'react'
import Show from './components/Show'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { FormDescription } from './components/ui/form'

const Popup: React.FC = () => {
  const [openAIKey, setOpenAIKey] = React.useState('')
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    ;(async function loadOpenAPIKey() {
      if (!chrome) return
      const apiKeyFromStorage = (await chrome.storage.local.get('apiKey')) as {
        apiKey?: string;
      };
      if (apiKeyFromStorage.apiKey)
        setOpenAIKey(`${apiKeyFromStorage.apiKey.substring(0, 12)}-XXXXXX`);
      setIsLoaded(true);
    })();
  }, []);

  const handleAddOpenAPIKey = async () => {
    if (openAIKey) {
      await chrome.storage.local.set({ apiKey: openAIKey })
    }
  }

  return (
    <div className="dark relative w-[350px] bg-[#121627] p-4  text-black">
      <Show show={isLoaded}>
        <div className="">
          <div className="w-full  h-20 overflow-hidden ">
            <img
              className="mx-auto h-20 w-auto"
              src={leetCode}
              width={150}
              height={150}
            />
          </div>
          <div className="text-center">
            <h1 className=" font-bold text-3xl text-white">
              LeetCode <span className="text-whisperOrange">Whisper</span>
            </h1>
            <p className="text-base text-slate-400">
              Your Companion to Beat LeetCode!
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-2">
            <label htmlFor="text" className="text-white font-bold text-xl">
              Enter Your OpenAI API key
            </label>
            <Input
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="Ex. 0aBbnGgzXXXXXX"
              className="bg-white text-black outline-none"
            />

            <Button onClick={handleAddOpenAPIKey} className="dark">
              Save
            </Button>
          </div>
          <div className=" h-16 flex items-center justify-center">
            <p className="text-white text-[14px]">
              Want more features?&nbsp;
              <a
                href="https://github.com/piyushgarg-dev/leetcode-whisper-chrome-extension"
                className="text-[#86ccee]"
                target="_blank"
              >
                {' '}
                Request a feature!
              </a>
            </p>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default Popup

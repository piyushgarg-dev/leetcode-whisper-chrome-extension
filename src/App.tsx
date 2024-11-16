import leetCode from '@/assets/leetcode.png'
import React from 'react'
import Show from './components/Show'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { z } from "zod";

const openAIApiKeySchema = z.string().superRefine((key, ctx) => {
  // Check the minimum length to 32
  if (key.length < 32) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 32,
      type: "string",
      inclusive: true,
      message: "Invalid API key",
    });
    return;
  }

  // If OpenAI API dones't start with sk-anyCombination_of_alphanumeric
  if (!/^sk-[a-zA-Z0-9-_]+$/.test(key)) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_string,
      validation: "regex",
      message: "Invalid API key",
    });
  }
});
const Popup: React.FC = () => {
  const [openAIKey, setOpenAIKey] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInvalidApiKey, setIsInvalidApiKey] = React.useState('');

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

  React.useEffect(() => {
    if (!openAIKey)
      setIsInvalidApiKey(""); //Clear Error Message, if API key removed

  }, [openAIKey])

  const handleAddOpenAPIKey = async () => {
    if (openAIKey) {
      try {
        const validKey = openAIApiKeySchema.parse(openAIKey);
        setIsInvalidApiKey("");
        await chrome.storage.local.set({ apiKey: validKey });

      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.issues.map(issue => issue.message).join(", ");
          setIsInvalidApiKey(errorMessage);
        }
      }
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
            <label htmlFor="text" className='text-white font-bold text-xl'>Enter Your OpenAI API key</label>
            <label htmlFor="text" className='text-red-400 text-base'>{isInvalidApiKey}</label>
            <Input
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="Ex. 0aBbnGgzXXXXXX"
              className='text-xs text-white focus:outline-none outline-none  border-[1px] border-slate-600'  //API input box Text color turned white to Black
              onKeyDown={(e) => e.key === 'Enter' ? handleAddOpenAPIKey() : null}   //API Key Validation on pressing "Enter" key
            />
            <Button onClick={handleAddOpenAPIKey} className={openAIKey ? `dark` : `bg-gray-400 cursor-not-allowed hover:bg-gray-400`}>
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

import { useEffect, useState } from "react";

import leetCode from "@/assets/leetcode.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function Popup() {
  const [openAIKey, setOpenAIKey] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    async function loadOpenAPIKey() {
      if (typeof chrome !== "undefined" && chrome.storage) {
        const apiKeyFromStorage = (await chrome.storage.local.get(
          "apiKey",
        )) as { apiKey?: string };
        if (apiKeyFromStorage.apiKey) setOpenAIKey(apiKeyFromStorage.apiKey);
      }
      setIsLoaded(true);
    }
    loadOpenAPIKey();
  }, []);

  const handleAddOpenAPIKey = async () => {
    if (openAIKey && typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({ apiKey: openAIKey });
    }
  };

  const isValidKey = openAIKey.trim().length > 0;

  return (
    <div className='w-[350px] h-[550px] bg-[#1a1a1a] text-white p-4 font-sans'>
      {isLoaded && (
        <Card className='w-full h-full bg-[#282828] border-none shadow-lg'>
          <CardHeader className='text-center pb-2'>
            <div className='w-full flex justify-center mb-4'>
              <img
                className='mx-auto'
                src={leetCode}
                width={150}
                height={150}
              />
            </div>
            <CardTitle className='text-2xl font-bold text-[#ffa116]'>
              LeetCode Whisper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='mt-6 space-y-4'>
              <label
                htmlFor='apiKey'
                className='text-lg font-semibold text-zinc-300 block'
              >
                Enter Your OpenAI API key
              </label>
              <div className='relative'>
                <Input
                  id='apiKey'
                  type={showKey ? "text" : "password"}
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  placeholder='Ex. 0aBbnGgzXXXXXX'
                  className='bg-[#3c3c3c] border-zinc-700 text-white placeholder-zinc-500 focus:ring-[#ffa116] focus:border-[#ffa116] pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowKey(!showKey)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white focus:outline-none'
                >
                  {showKey ? (
                    <EyeOff className='h-5 w-5' aria-hidden='true' />
                  ) : (
                    <Eye className='h-5 w-5' aria-hidden='true' />
                  )}
                </button>
              </div>
              <Button
                onClick={handleAddOpenAPIKey}
                disabled={!isValidKey}
                className={`w-full transition-all duration-200 ${
                  isValidKey
                    ? "bg-[#ffa116] hover:bg-[#ff9100] text-black"
                    : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                }`}
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

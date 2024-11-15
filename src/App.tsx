import React from 'react';
import leetCode from '@/assets/leetcode.png';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

const Popup: React.FC = () => {
  const [openAIKey, setOpenAIKey] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    (async function loadOpenAPIKey() {
      if (!chrome) return;
      const apiKeyFromStorage = (await chrome.storage.local.get('apiKey')) as {
        apiKey?: string;
      };
      if (apiKeyFromStorage.apiKey) setOpenAIKey(apiKeyFromStorage.apiKey);
      setIsLoaded(true);
    })();
  }, []);

  const handleAddOpenAPIKey = async () => {
    if (openAIKey) {
      await chrome.storage.local.set({ apiKey: openAIKey });
    }
  };

  const handleClearInput = async () => {
    setOpenAIKey('');
    await chrome.storage.local.remove('apiKey');
  };

  return (
    <div className="dark relative w-[350px] h-[400px] bg-[#000000] text-white p-4">
      {isLoaded && (
        <div>
          <div className="w-full mt-10">
            <img className="mx-auto" src={leetCode} width={100} height={100} />
          </div>
          <div className="text-center">
            <h1 className="text-white font-bold text-2xl">LeetCode Whisper</h1>
          </div>
          <div className="mt-10 flex flex-col gap-2">
            <label htmlFor="text" className='text-white font-bold text-xl'>Enter Your OpenAI API key</label>
            <Input
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="Ex. 0aBbnGgzXXXXXX"
              className='!outline-none text-white font-semibold my-2 border-2 border-cyan-500'
            />
            <div className='flex gap-5 mx-auto'>
              <Button onClick={handleAddOpenAPIKey} className="bg-cyan-500 w-20">
                Save
              </Button>
              <Button onClick={handleClearInput} className="bg-red-500 w-20">
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;

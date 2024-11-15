import React from 'react';
import leetCode from '@/assets/leetcode.png';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

const Popup: React.FC = () => {
  const [openAIKey, setOpenAIKey] = React.useState('');
  const [skewedKey, setSkewedKey] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    (async function loadOpenAPIKey() {
      if (!chrome) return;
      const apiKey = (await chrome.storage.local.get('apiKey')).apiKey;
      if (apiKey) {
        setSkewedKey(obscureKey(apiKey));
      }
      setIsLoaded(true);
    })();
  }, []);

  const handleAddOpenAPIKey = async () => {
    if (openAIKey) {
      await chrome.storage.local.set({ apiKey: openAIKey });
      setSkewedKey(obscureKey(openAIKey));
      setOpenAIKey('');
    }
  };

  async function removeOpenAPIKey() {
    await chrome.storage.local.remove('apiKey');
    setOpenAIKey('');
    setSkewedKey('');
  }

  return (
    <div className="dark relative w-[350px] h-[550px] bg-black text-white p-4">
      {isLoaded && (
        <div>
          <div className="w-full mt-10">
            <img className="mx-auto" src={leetCode} width={150} height={150} />
          </div>
          <div className="text-center">
            <h1 className="text-white font-bold text-2xl">LeetCode Whisper</h1>
          </div>
          <div className="mt-10 flex flex-col gap-2">
            <label htmlFor="text" className="text-white font-bold text-xl">
              Enter Your OpenAI API key
            </label>
            <Input
              value={openAIKey || skewedKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="Ex. 0aBbnGgzXXXXXX"
              className="bg-white outline-none text-black"
            />
            <Button onClick={handleAddOpenAPIKey} className="dark">
              Save
            </Button>

            <Button onClick={removeOpenAPIKey} variant={'outline'}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Replace the middle of the string with asterisks
function obscureKey(key: string, visibleStart = 7, visibleEnd = 4) {
  if (key.length <= visibleStart + visibleEnd) {
    return key;
  }

  const start = key.slice(0, visibleStart);
  const end = key.slice(-visibleEnd);
  const hiddenPart = '*'.repeat(key.length - visibleStart - visibleEnd);

  return `${start}${hiddenPart}${end}`;
}

export default Popup;
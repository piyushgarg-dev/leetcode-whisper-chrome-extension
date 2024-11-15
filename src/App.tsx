import React from 'react';
import leetCode from '@/assets/leetcode.png';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

const Popup: React.FC = () => {
  const [openAIKey, setOpenAIKey] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isKeyAvailable, setIsKeyAvailable] = React.useState(false);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    (async function loadOpenAPIKey() {
      if (!chrome) return;
      const apiKeyFromStorage = (await chrome.storage.local.get('apiKey')) as {
        apiKey?: string;
      };
      if (apiKeyFromStorage.apiKey) {
        setOpenAIKey(apiKeyFromStorage.apiKey);
        setIsKeyAvailable(true); // Key is available
      }
      setIsLoaded(true);
    })();
  }, []);

  const handleAddOpenAPIKey = async () => {
    if (openAIKey) {
      await chrome.storage.local.set({ apiKey: openAIKey });
      setIsKeyAvailable(true); // After saving or updating, the key is available
      setMessage('API Key Updated Successfully!');
    }
  };

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
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="Ex. 0aBbnGgzXXXXXX"
              className="bg-white text-black outline-none"
            />
            {isKeyAvailable && (
              <p className="text-green-500 text-sm">API Key Available</p>
            )}
            {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
            <Button onClick={handleAddOpenAPIKey} className="dark">
              {isKeyAvailable ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;

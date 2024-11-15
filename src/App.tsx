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

  return (
    <div className="relative w-[350px] h-[450px] bg-gray-700 text-white p-6 flex flex-col justify-between">
      {isLoaded && (
        <>
          <div className="space-y-6">
            <div className="flex justify-center items-center">
              <img 
                src={leetCode} 
                alt="LeetCode Logo" 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg p-2"
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">LeetCode Whisper</h1>
              <p className="mt-2 text-sm text-purple-100">Enhance your coding experience</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-sm font-medium text-purple-100">
                Enter Your OpenAI API Key
              </label>
              <Input
                id="apiKey"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="Ex. sk-aBbnGgzXXXXXX"
                className="bg-white/10 border-white/20 text-white placeholder-purple-200"
              />
            </div>
            <Button 
              onClick={handleAddOpenAPIKey} 
              className="w-full bg-white text-purple-600 hover:bg-purple-100 transition-colors"
            >
              Save API Key
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Popup;
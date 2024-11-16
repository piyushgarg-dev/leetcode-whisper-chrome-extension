import leetCode from '@/assets/leetcode.png';
import React from 'react';
import Show from './components/Show';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

const Popup: React.FC = () => {
  const [apiKey, setApiKey] = React.useState('');
  const [keyType, setKeyType] = React.useState<'openai' | 'google-gemini'>('openai');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [storedKey, setStoredKey] = React.useState(''); // Track the saved key

  React.useEffect(() => {
    (async function loadKeys() {
      if (!chrome) return;
      const keysFromStorage = (await chrome.storage.local.get(['apiKey', 'giminiKey'])) as {
        apiKey?: string;
        giminiKey?: string;
      };
      if (keyType === 'openai' && keysFromStorage.apiKey) {
        setStoredKey(`${keysFromStorage.apiKey.substring(0, 12)}-XXXXXX`);
      } else if (keyType === 'google-gemini' && keysFromStorage.giminiKey) {
        setStoredKey(`${keysFromStorage.giminiKey.substring(0, 12)}-XXXXXX`);
      } else {
        setStoredKey(''); // No key stored
      }
      setIsLoaded(true);
    })();
  }, [keyType]);

  const handleAddOrUpdateKey = async () => {
    if (!apiKey) return;
    if (keyType === 'openai') {
      await chrome.storage.local.set({ apiKey });
    } else if (keyType === 'google-gemini') {
      await chrome.storage.local.set({ giminiKey: apiKey });
    }
    setStoredKey(`${apiKey.substring(0, 12)}-XXXXXX`); // Update the displayed stored key
    setApiKey(''); // Clear input after saving
    alert(`${keyType === 'openai' ? 'OpenAI' : 'Google Gemini'} key ${
      storedKey ? 'updated' : 'saved'
    } successfully!`);
  };

  const handleRemoveKey = async () => {
    if (keyType === 'openai') {
      await chrome.storage.local.remove('apiKey');
    } else if (keyType === 'google-gemini') {
      await chrome.storage.local.remove('giminiKey');
    }
    setStoredKey(''); // Clear the displayed stored key
    alert(`${keyType === 'openai' ? 'OpenAI' : 'Google Gemini'} key removed successfully!`);
  };

  return (
    <div className="dark relative w-[350px] bg-black p-4 text-black">
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
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setKeyType('openai')}
                className={`${
                  keyType === 'openai' ? 'bg-gray-700 text-white' : 'bg-gray-500'
                }`}
              >
                OpenAI
              </Button>
              <Button
                onClick={() => setKeyType('google-gemini')}
                className={`${
                  keyType === 'google-gemini' ? 'bg-gray-700 text-white' : 'bg-gray-500'
                }`}
              >
                Google Gemini
              </Button>
            </div>
            {storedKey ? (
              <>
                <p className="text-white font-bold text-xl">
                  {keyType === 'openai' ? 'OpenAI API Key' : 'Google Gemini Key'}: {storedKey}
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setApiKey('')} // Open for edit
                    className="bg-gray-700 text-white"
                  >
                    Update
                  </Button>
                  <Button
                    onClick={handleRemoveKey}
                    className="bg-red-600 text-white"
                  >
                    Remove
                  </Button>
                </div>
              </>
            ) : (
              <>
                <label htmlFor="key" className="text-white font-bold text-xl">
                  Enter Your {keyType === 'openai' ? 'OpenAI API Key' : 'Google Gemini Key'}
                </label>
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    keyType === 'openai'
                      ? 'Ex. 0aBbnGgzXXXXXX'
                      : 'Ex. gGmN9iZXXXXXX'
                  }
                  className="bg-white text-black outline-none"
                />
                <Button onClick={handleAddOrUpdateKey} className="bg-gray-700 text-white">
                  Save
                </Button>
              </>
            )}
          </div>
          <div className="h-16 flex items-center justify-center">
            <p className="text-white text-[14px]">
              Want more features?&nbsp;
              <a
                href="https://github.com/piyushgarg-dev/leetcode-whisper-chrome-extension"
                className="text-[#86ccee]"
                target="_blank"
              >
                Request a feature!
              </a>
            </p>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Popup;

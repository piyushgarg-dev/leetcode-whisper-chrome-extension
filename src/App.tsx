import React from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Show from './components/Show';
import leetCode from '@/assets/leetcode.png'

const Popup = () => {
  const [provider, setProvider] = React.useState('openai');
  const [apiKey, setApiKey] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    (async function loadStoredData() {
      if (!chrome) return;

      const data = await chrome.storage.local.get(['provider', 'openaiKey', 'claudeKey']);

      if (data.provider) {
        setProvider(data.provider);
        const key = data.provider === 'openai' ? data.openaiKey : data.claudeKey;
        if (key) {
          setApiKey(`${key.substring(0, 12)}-XXXXXX`);
        }
      }

      setIsLoaded(true);
    })();
  }, []);

  const handleSaveKey = async () => {
    if (!apiKey) return;

    await chrome.storage.local.set({
      provider,
      [`${provider}Key`]: apiKey
    });
  };

  const getPlaceholder = () => {
    return provider === 'openai'
      ? 'sk-0aBbnGgzXXXXXX'
      : 'sk_ant_1234XXXXXX';
  };

  return (
    <div className="dark relative w-[350px] bg-[#121627] p-4 text-black">
      <Show show={isLoaded}>
        <div>
          <div className="w-full h-20 overflow-hidden">
            <img
              className="mx-auto h-20 w-auto"
              src={leetCode}
              width={150}
              height={150}
              alt="LeetCode Logo"
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

          <div className="mt-8 flex flex-col gap-6">
            <div className="space-y-2">
              <Label className="text-white font-bold text-xl">Select AI Provider</Label>
              <RadioGroup
                value={provider}
                onValueChange={setProvider}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai" />
                  <Label htmlFor="openai" className="text-white">OpenAI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="claude" id="claude" />
                  <Label htmlFor="claude" className="text-white">Claude</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-white font-bold text-xl">
                Enter Your {provider === 'openai' ? 'OpenAI' : 'Claude'} API Key
              </Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={getPlaceholder()}
                className="bg-white text-black outline-none"
              />
              <Button onClick={handleSaveKey} className="w-full dark">
                Save
              </Button>
            </div>
          </div>

          <div className="h-16 flex items-center justify-center">
            <p className="text-white text-[14px]">
              Want more features?&nbsp;
              <a
                href="https://github.com/piyushgarg-dev/leetcode-whisper-chrome-extension"
                className="text-[#86ccee]"
                target="_blank"
                rel="noopener noreferrer"
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

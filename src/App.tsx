import React from "react";
import leetCode from "@/assets/leetcode.png";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

const Popup: React.FC = () => {
  const [openAIKey, setOpenAIKey] = React.useState("");
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    (async function loadOpenAPIKey() {
      if (!chrome) return;
      const apiKeyFromStorage = (await chrome.storage.local.get("apiKey")) as {
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
    <div className="bg-transparent dark relative w-[350px] h-[550px] bg-black p-4 text-white">
      {isLoaded && (
        <div>
          <div className="w-full mt-10">
            <img className="mx-auto" src={leetCode} width={150} height={150} />
          </div>
          <div className="text-center">
            <h1 className="text-white font-bold text-2xl">LeetCode Whisper</h1>
          </div>
          <div className="mt-10 flex flex-col gap-2">
            <Input
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="OpenAI API Key"
              className="text-black"
            />
            <Button onClick={handleAddOpenAPIKey} className="dark">
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;

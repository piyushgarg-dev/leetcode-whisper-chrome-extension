import React from "react";
import leetCode from "@/assets/leetcode.png";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

const Popup: React.FC = () => {
  const [openAIKey, setOpenAIKey] = React.useState("");
  const [localOpenAIKey, setLocalOpenAIKey] = React.useState("");
  const [changeOpenAIKey, setChangeOpenAIKey] = React.useState("");
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [chnageOpenAIKeyPopupEnabled, setChangeOpenAIKeyPopupEnabled] =
    React.useState<boolean>(false);

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
    if (localOpenAIKey) {
      await chrome.storage.local.set({ apiKey: localOpenAIKey });
      await chrome.tabs.reload();
    }
  };

  const handelRemoveOpenAPIKey = async () => {
    await chrome.storage.local.remove("apiKey");
    setOpenAIKey("");
  };

  const handelChangeOpenAPIKey = async () => {
    if (changeOpenAIKey) {
      await chrome.storage.local.set({ apiKey: changeOpenAIKey });
      setChangeOpenAIKeyPopupEnabled(false);
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
          {openAIKey ? (
            <>
              {chnageOpenAIKeyPopupEnabled ? (
                <OpenAIKeyInput
                  onChange={(e) => {
                    setChangeOpenAIKey(e.target.value);
                  }}
                  onClick={handelChangeOpenAPIKey}
                  value={changeOpenAIKey}
                  label="Change Your OpenAI API key"
                />
              ) : (
                <div className="space-y-10">
                  <p className="text-white text-base text-center font-medium">
                    Your OpenAI API key is saved successfully
                  </p>
                  <div className="flex justify-around ">
                    <Button
                      variant={"secondary"}
                      onClick={handelRemoveOpenAPIKey}
                    >
                      Remove API Key
                    </Button>
                    <Button
                      onClick={() => setChangeOpenAIKeyPopupEnabled(true)}
                    >
                      Change API Key
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <OpenAIKeyInput
              onChange={(e) => setLocalOpenAIKey(e.target.value)}
              onClick={handleAddOpenAPIKey}
              value={localOpenAIKey}
              label="Enter Your OpenAI API key"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Popup;

function OpenAIKeyInput({
  value,
  onChange,
  onClick,
  label,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
  label: string;
}) {
  return (
    <div className="mt-10 flex flex-col gap-2">
      <label htmlFor="text" className="text-white font-bold text-xl">
        {label}
      </label>
      <Input
        value={value}
        onChange={onChange}
        placeholder="Ex. 0aBbnGgzXXXXXX"
        className="bg-white outline-none text-black"
      />
      <Button onClick={onClick} className="dark">
        Save
      </Button>
    </div>
  );
}

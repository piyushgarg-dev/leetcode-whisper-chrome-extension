import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Code2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import leetCode from "@/assets/leetcode.png";

const Popup: React.FC = () => {
  const [openAIKey, setOpenAIKey] = React.useState("");
  const [isLoaded, setIsLoaded] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);

  React.useEffect(() => {
    async function loadOpenAPIKey() {
      if (typeof chrome === "undefined" || !chrome.storage) return;
      const apiKeyFromStorage = (await chrome.storage.local.get("apiKey")) as {
        apiKey?: string;
      };
      if (apiKeyFromStorage.apiKey) setOpenAIKey(apiKeyFromStorage.apiKey);
      setIsLoaded(true);
    }
    loadOpenAPIKey();
  }, []);

  const handleAddOpenAPIKey = async () => {
    if (!openAIKey) {
      setError("Please enter OpenAI API Key");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        await chrome.storage.local.set({ apiKey: openAIKey });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError("Failed to save API key. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <Card className="w-[350px] h-[550px] flex items-center justify-center bg-gradient-to-b from-gray-800 to-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-b from-gray-900 to-black w-[350px] h-[550px] shadow-xl border border-gray-800 rounded-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
            <Code2 className="h-6 w-6" />
            LeetCode Whisper
          </CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Your AI-powered LeetCode assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full mb-6">
          <img
            className="mx-auto rounded-lg shadow-lg"
            src={leetCode}
            width={150}
            height={150}
          />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-gray-300">
              OpenAI API Key
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="pr-10 text-white bg-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2 text-gray-400 hover:text-gray-200"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert
              variant="default"
              className="border-green-500 text-green-500"
            >
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                OpenAI API Key saved successfully
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleAddOpenAPIKey}
            className="w-full bg-primary hover:bg-primary/90 transition"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Saving..." : "Save API Key"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-400">
        <p>
          Made with ❤️ by{" "}
          <a
            href="https://github.com/yourusername/leetcode-whisper"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Your Name
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Popup;

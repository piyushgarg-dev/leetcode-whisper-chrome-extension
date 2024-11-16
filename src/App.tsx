import leetCode from '@/assets/leetcode.png';
import avatar1 from '@/assets/avatar1.jpg'; // Predefined avatar 1
import avatar2 from '@/assets/avatar2.webp'; // Predefined avatar 2
import React from 'react';
import Show from './components/Show';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

const Popup: React.FC = () => {
  const [openAIKey, setOpenAIKey] = React.useState('');
  const [username, setUsername] = React.useState('User');
  const [avatarUrl, setAvatarUrl] = React.useState('https://github.com/shadcn.png'); // Default avatar
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    (async function loadUserData() {
      if (!chrome?.storage?.local) return; // Ensure chrome storage is accessible
      const { apiKey, username: storedUsername, avatarUrl: storedAvatar } = await chrome.storage.local.get(['apiKey', 'username', 'avatarUrl']);
      if (apiKey) setOpenAIKey(apiKey);
      if (storedUsername) setUsername(storedUsername);
      if (storedAvatar) setAvatarUrl(storedAvatar);
      setIsLoaded(true);
    })();
  }, []);

  const handleSaveUserData = async () => {
    await chrome.storage.local.set({ apiKey: openAIKey, username, avatarUrl });
    setIsEditing(false);
  };

  const handleAvatarSelect = (url: string) => {
    setAvatarUrl(url);
  };

  return (
    <div className="dark relative w-[350px] bg-[#121627] p-4 text-black">
      <Show show={isLoaded}>
        <div>
          {/* Top Bar with Username, Avatar, and Edit Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img className="h-10 w-10 rounded-full" src={avatarUrl} alt="Avatar" />
              <p className="text-xl font-bold text-white">{username}</p>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} className="dark">
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {/* Edit Mode Fields */}
          {isEditing && (
            <div className="mt-4 flex flex-col gap-2">
              <label htmlFor="username" className="text-white font-bold text-xl">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="text-xs text-white focus:outline-none outline-none border-[1px] border-slate-600"
              />

              <label htmlFor="avatar" className="text-white font-bold text-xl mt-4">
                Select Avatar
              </label>
              <div className="flex gap-2">
                <img
                  src={avatar1}
                  alt="Avatar 1"
                  className={`h-12 w-12 rounded-full cursor-pointer ${avatarUrl === avatar1 ? 'border-2 border-blue-500' : ''}`}
                  onClick={() => handleAvatarSelect(avatar1)}
                />
                <img
                  src={avatar2}
                  alt="Avatar 2"
                  className={`h-12 w-12 rounded-full cursor-pointer ${avatarUrl === avatar2 ? 'border-2 border-blue-500' : ''}`}
                  onClick={() => handleAvatarSelect(avatar2)}
                />
              </div>

              <Button onClick={handleSaveUserData} className="dark mt-4">
                Save Changes
              </Button>
            </div>
          )}

          {/* Rest of the Popup UI */}
          {!isEditing && (
            <>
              <div className="w-full h-20 overflow-hidden">
                <img className="mx-auto h-20 w-auto" src={leetCode} width={150} height={150} />
              </div>
              <div className="text-center mt-4">
                <h1 className="font-bold text-3xl text-white">
                  LeetCode <span className="text-whisperOrange">Whisper</span>
                </h1>
                <p className="text-base text-slate-400">
                  Your Companion to Beat LeetCode!
                </p>
              </div>
              <div className="mt-10 flex flex-col gap-2">
                <label htmlFor="text" className="text-white font-bold text-xl">
                  OpenAI API key
                </label>
                <Input
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  placeholder="sk-proj-xxxx"
                  className="text-xs text-white focus:outline-none outline-none border-[1px] border-slate-600"
                />

                <Button onClick={handleSaveUserData} className="dark">
                  Save API Key
                </Button>
              </div>
              <div className="h-16 flex items-center justify-center mt-4">
                <p className="text-white text-[14px]">
                  Want more features?&nbsp;
                  <a href="https://github.com/piyushgarg-dev/leetcode-whisper-chrome-extension" className="text-[#86ccee]" target="_blank">
                    Request a feature!
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </Show>
    </div>
  );
};

export default Popup;

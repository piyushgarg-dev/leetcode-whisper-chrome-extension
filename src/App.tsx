import React from 'react';
import leetCode from '@/assets/leetcode.png';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

const Popup: React.FC = () => {
  const [AIKey, setAIKey] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [selectAtModel,setSelectAtModel] = React.useState([])

  React.useEffect(() => {
    (async function loadOpenAPIKey() {
      if (!chrome) return;
      const { apiKey, selectedModel } = await chrome.storage.local.get([
        'apiKey',
        'selectedModel',
      ]);
      if (apiKey) setAIKey(apiKey);
      if (selectedModel) setSelectAtModel(selectedModel);
      setIsLoaded(true);
    })();
  }, []);

  const handleAddOpenAPIKey = async () => {
    if (AIKey) {
      
      await chrome.storage.local.set({ 
        apiKey: AIKey,
        selectedModel: selectAtModel
      });
    }
   
  };
  const handleChange = (e:any)=>{
     setSelectAtModel(e.target.value)
     console.log(e.target.value)
     
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
             {/* Creating a Dropdown for selecting AI model like chatgpt,gemini,claude etc */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-white">Select AI Model:</span>
                <select value={selectAtModel} onChange={handleChange} className='bg-transparent p-2 border border-gray-400 text-white'>
                  <option value="chatgpt" className='text-black'>ChatGPT</option>
                  <option value="gemini" className='text-black'>Gemini</option>
                  <option value="claude" className='text-black'>Claude</option>
                </select>
              </div>
              </div>
            <label htmlFor="text" className='text-white font-bold text-xl'>Enter Your API key</label>
            <Input
              value={AIKey}
              onChange={(e) => setAIKey(e.target.value)}
              placeholder="Ex. 0aBbnGgzXXXXXX"
              className='bg-white text-black outline-none'
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

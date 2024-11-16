import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from './ui/sheet'
import { PreviousChat } from '@/content/content'
import { Menu } from 'lucide-react'

interface SideBarProps {
  previousChats: PreviousChat[]
  onClickPriviousChat: (problemName: string) => void
}

const SideBar: React.FC<SideBarProps> = ({
  previousChats,
  onClickPriviousChat,
}) => {
  return (
    <Sheet>
      <SheetTrigger>
        <button className="btn">
          <Menu />
        </button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Previous Chats</SheetTitle>
        </SheetHeader>

        {previousChats.map((chat, index) => (
          <div key={index} className="py-2 border-b last:border-0">
            <h4
              className="text-lg p-1 font-semibold capitalize cursor-pointer bg-[#333333]  hover:text-yellow rounded-lg"
              onClick={() => onClickPriviousChat(chat.problemName)}
            >
              {index + 1}. {chat.problemName.replace(/-/g, ' ')}
            </h4>
          </div>
        ))}
      </SheetContent>
    </Sheet>
  )
}

export default SideBar

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type Message = {
  id: string
  user: string
  text: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([{ id: "1", user: "System", text: "Welcome to the game chat!" }])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage) {
      const message: Message = {
        id: Date.now().toString(),
        user: "You", // This should be the actual user's name
        text: newMessage,
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  return (
    <Card className="w-[300px] h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>Game Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-semibold">{message.user}: </span>
            <span>{message.text}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </CardFooter>
    </Card>
  )
}


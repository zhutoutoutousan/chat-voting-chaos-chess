"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type Room = {
  id: string
  name: string
  players: number
}

export default function GameLobby() {
  const [rooms, setRooms] = useState<Room[]>([
    { id: "1", name: "Room 1", players: 1 },
    { id: "2", name: "Room 2", players: 2 },
    { id: "3", name: "Room 3", players: 0 },
  ])
  const [newRoomName, setNewRoomName] = useState("")

  const handleCreateRoom = () => {
    if (newRoomName) {
      const newRoom: Room = {
        id: Date.now().toString(),
        name: newRoomName,
        players: 0,
      }
      setRooms([...rooms, newRoom])
      setNewRoomName("")
    }
  }

  const handleJoinRoom = (roomId: string) => {
    // TODO: Implement room joining logic
    console.log("Joining room:", roomId)
  }

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle>Game Lobby</CardTitle>
        <CardDescription>Join an existing room or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rooms.map((room) => (
            <div key={room.id} className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-gray-500">Players: {room.players}/2</p>
              </div>
              <Button onClick={() => handleJoinRoom(room.id)}>Join</Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Input
          placeholder="New room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="w-2/3"
        />
        <Button onClick={handleCreateRoom}>Create Room</Button>
      </CardFooter>
    </Card>
  )
}


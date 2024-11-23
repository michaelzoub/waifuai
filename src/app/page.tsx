"use client"
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import dynamic from 'next/dynamic'
import Live2D from "./components/V2";
import { neonColors, waifuNames } from "./data/random";


export default function Home() {

  const prod = "https://waifuainode-production.up.railway.app/" //"http://localhost:3001"

  const socket = io(prod);

  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState("")
  const [lipsync, setLipsync] = useState(false)
  const [thinking, setThinking] = useState(false)

  const containerRef: any = useRef(null)

  useEffect(() => {

    async function fetchMessages() {
      console.log("fetchmessage hit")
      const response = await fetch("/api/fetchmessage", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      const body = await response.json()
      console.log(body)
      console.log(body.body)
      setMessages(body.body)
    }
    fetchMessages()

    socket.on("message", (msg) => {
      console.log(messages)
      console.log("msg: ", msg)
      setMessages((prev: any[]) => [...(prev || []), msg])
    });

  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight - containerRef.current.clientHeight;
    }
  }, [messages])

  function sendButton(event: any) {
    const amountOfCharacters = newMessage.split("")
    console.log(amountOfCharacters.length)
    if (amountOfCharacters.length < 100) {
      if (event.key == "Enter" || event.type == "click") {
        const waifuNumber = Math.floor(Math.random() * 50)
        const colorNumber = Math.floor(Math.random() * 10)
        setThinking(true)
        socket.emit("message", { text: newMessage, timestamp: Date.now(), name: waifuNames[waifuNumber], color: neonColors[colorNumber] })
        console.log(neonColors[colorNumber])
        async function audio() {
          const response = await fetch("/api/sendtoai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(newMessage)
          })
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audioPlayer = document.getElementById("audio") as HTMLAudioElement;
          setLipsync(true)
          audioPlayer.src = audioUrl;
          audioPlayer?.play();
        }
        audio()
        setThinking(true)
        setTimeout(() => {
          setThinking(false);
        }, 2000);
        //setMessages((prev:any) => [...prev, newMessage])
        setNewMessage("")
        console.log(newMessage)
        console.log(messages)
  
      } else {
        setError("PLS LESS CHARACTERS")
      }
      }
  }

  return (
    <main className="w-full h-screen bg-white gap-2">
      <div className="flex absolute w-full h-[2%]">
        <h1 className="m-4 w-fit text-pink-400 text-xl font-semibold">Waifu AI!</h1>
      </div>
      <div className="w-full h-screen flex flex-col md:flex-row">
      <div className="flex w-full md:w-[78%] h-[500px] md:h-[90%] my-auto border-[2px] border-black rounded-lg mx-auto overflow-hidden">
        <div className="absolute m-2 text-red-500 font-semibold">● Live</div>
        <Live2D></Live2D>
        <div className={`${thinking? "absolute text-white rounded-full p-2 w-fit h-fit bg-orange-400 border-[2px] border-zinc-300 m-20" : "hidden"}`}>Thinking...</div>
        <audio id="audio"></audio>
      </div>
      <div className="w-full md:w-[20%] h-[100px] md:h-[90%] my-auto">
        <div className="overflow-scroll h-[100%] md:h-[95%] w-full px-0 md:px-4" ref={containerRef} style={{flexDirection: 'column'}}>
          <div className={`${messages ? "hidden" : "visible text-black mx-auto my-auto"}`}>Loading...</div>
          {messages?.map((e:any) => 
            <div className="flex gap-2 w-full px-4 py-2 m-0 md:m-1 rounded-lg border-[0px] border-black mx-auto break-all overflow-hidden text-black md:mx-0" key={e.timestamp}><div style={{ color: e.color }}>{e.name}:</div> {e.text}</div>
          )}
        </div>
        <div className="w-full h-[50px] md:h-[5%] flex flex-row gap-2">
          <input className="w-full border-[2px] border-black rounded-lg px-2" placeholder="Talk to waifu!" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onSubmit={sendButton}></input>
          <button className="text-white bg-pink-500 border-[2px] border-pink-300 p-1 px-4  rounded-lg" onClick={sendButton}>Send</button>
        </div>
        <div className={`${error? "p-1 bg-red-500 border-[2px] border-red-400 w-fit m-1 rounded-lg text-xs text-white" : "hidden"}`}>{error}</div>
      </div>
      </div>
    </main>
  );
}

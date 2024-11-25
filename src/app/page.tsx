"use client"
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import dynamic from 'next/dynamic'
import Live2D from "./components/V2";
import { neonColors, waifuNames } from "./data/random";
import Link from "next/link";
import background from "/public/backgroundai.png"
import { atom } from 'jotai'
import twitch from "/public/twitch.png"
import Navbar from "./components/navbar";


export default function Home() {

  const prod = "https://waifuainode-production.up.railway.app/" //"http://localhost:3001"

  const socket = io(prod);

  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState("")
  const [lipsync, setLipsync] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [opened, setOpened] = useState(false)
  const [ca, setCa] = useState(false)
  const [viewers, setViewers] = useState<number>(0)
  const [dark, setDark] = useState(false)
  const [loading, setLoading] = useState(true)
  const [waifuName, setWaifuName] = useState("")
  const [nameColor, setNameColor] = useState("")

  const darkmode = atom(dark)

  const containerRef: any = useRef(null)

  useEffect(() => {

    const waifuNumber = Math.floor(Math.random() * 50)
    const colorNumber = Math.floor(Math.random() * 10)
    setWaifuName(waifuNames[waifuNumber])
    setNameColor(neonColors[colorNumber])

    const randomViewers = Math.floor(Math.random() * 100) * 10
    setViewers(randomViewers)

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

    setTimeout(() => {
      setLoading(false)
    }, 1500)
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight - containerRef.current.clientHeight;
    }
  }, [messages])

  function sendButton(event: any) {
    const amountOfCharacters = newMessage.split("")
    console.log(amountOfCharacters.length)
    if (amountOfCharacters.length < 100) {
      if (event.key == "Enter" || event.type == "click") {
        setThinking(true)
        socket.emit("message", { text: newMessage, timestamp: Date.now(), name: waifuName, color: nameColor })
        console.log(nameColor)
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
    <main className={`${dark ? "flex flex-col w-full min-h-screen md:h-screen bg-zinc-900 text-white" : "flex flex-col w-full min-h-screen md:h-screen bg-zinc-100 text-black"}`}>
      <div className={`${loading? "absolute flex w-full h-screen bg-white z-[1000]" : "hidden"}`}>
        <div className="loading z-[1000] my-auto mx-auto"></div>
      </div>
      <Navbar darkmode={dark}></Navbar>
      <div className="w-full h-screen flex flex-col overflow-y-visible md:overflow-hidden md:flex-row justify-between">
      <div className={`${opened ? `w-[10%] h-screen py-4 px-1 pt-2 md: md:opacity-100 md:z-50 md:!static opacity-0 z-[-10] h-0 md:h-screen z-50 md:border-r-[1px] ${dark ? "border-zinc-600 bg-zinc-900" : "border-zinc-300"}` : "md:flex md:opacity-100 h-0 md:h-screen md:z-50 w-[1%] p-4 pt-2 opacity-0 :z-[-10]"}`}>
        <div className="flex flex-col">
          <div className="w-full flex flex-row justify-end">
            <button className="w-fit p-1 rounded-lg transition delay-150 ease-in-out hover:bg-zinc-400" onClick={() => setOpened((e) => !e)}>{opened ? <div>←</div> : <div>→</div>}</button>
          </div>
          <div className={`${opened ? "visible flex flex-col" : "hidden"}`}>
            <div className="w-full p-1 rounded-lg transition delay-150 ease-in-out hover:bg-zinc-400">Test</div>
            <div className="w-full p-1 rounded-lg transition delay-150 ease-in-out hover:bg-zinc-400">Twitter</div>
            <div className="relative">
              <div className="w-full p-1 rounded-lg transition delay-150 ease-in-out hover:bg-zinc-400" onMouseEnter={() => setCa(true)}>CA: ?</div>
              <div className={`${ca ? `${dark ? "absolute text-sm rounded-lg p-2 mt-[-35px] border-[1px] border-zinc-500 bg-zinc-700" : "absolute text-sm rounded-lg p-2 mt-[-35px] border-[1px] border-zinc-500 bg-white"}` : "hidden"}`}     style={{left: '100%', marginLeft: '10px',}} onMouseLeave={() => setCa(false)}>398047u2040fh92hgr92hf9h238f32f</div>
            </div>
            <div className="mt-6 p-1 rounded-full w-[62px] border-[1px]">
              <button className={`${dark ? "animatedark" : "animatelight"} transition delay-150 ease-in-out text-left text-sm`} onClick={() => setDark((e) => !e)}>{dark ? "☾" : "☼"}</button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-[70%] h-[500px] md:h-[90%] ">
        <div className={`${opened? "flex w-full h-[500px] md:h-[90%] my- border-[0px] border-black rounded- overflow-hidden bg-[url('/backgroundai.png')]" : "flex w-full h-[500px] md:h-[90%] my-auto border-[0px] border-black rounded- mx- overflow-hidden bg-[url('/backgroundai.png')]"}`}>
          <div className="flex flex-row justify-between absolute md:w-[68%] w-full font-semibold">
            <div className="m-2 text-white rounded-lg p-2 bg-red-500 font-semibold">● Live</div>
            <div className="m-2 text-red-500 font-semibold">👁 {viewers} viewers</div>
          </div>
          <Live2D></Live2D>
          <div className={`${thinking? "absolute text-white rounded-full p-2 w-fit h-fit bg-orange-400 border-[2px] border-zinc-300 m-20" : "hidden"}`}>Thinking...</div>
          <audio id="audio"></audio>
        </div>
        <div className="flex flex-row md:h-fit h-0 md:opacity-100 opacity-0">
          <Image src={twitch} className="rounded-full" width={75} height={50} alt="pfp"></Image>
          <div className="flex flex-col m-2 gap-0">
            <h1 className="font-medium text-xl z-50">Asuna</h1>
            <h1 className="font-semibold text-2xl">Your favorite waifu Asuna is strimming.</h1>
          </div>
        </div>
      </div>
      <div className={`w-full md:w-[20%] h-[300px] md:mt-[0px] mt-[-30px] md:h-[100%] pb-4 my-auto z-50 border-l-[0px] md:border-l-[1px] ${dark ? "border-zinc-600 bg-zinc-900" : "border-zinc-300 bg-zinc-50"}`}>
        <div className={`${dark ? "w-full h-[6%] overflow-hidden font-semibold bg-zinc-700" : "w-full h-[6%] overflow-hidden font-semibold bg-zinc-100"}`}>
          <div className="animation flex text-red-300 whitespace-nowrap my-2 mx-2 p-2">DONOS: 100$ / 231$ /234$ / 54359$ / 453$ / 100$ / 231$ /234$ / 54359$ / 453$</div>
        </div>
        <div className="overflow-scroll h-[100%] md:h-[87%] w-full px-0 md:px-4" ref={containerRef} style={{flexDirection: 'column'}}>
          <div className={`${messages ? "hidden" : "visible mx-auto my-auto"}`}>Loading...</div>
          {messages?.map((e:any) => 
            <div className="flex gap-2 w-full px-4 py-2 m-0 md:m-1 rounded-lg border-[0px] border-black mx-auto break-all overflow-hidden md:mx-0" key={e.timestamp}><div style={{ color: e.color }} className="font-semibold">{e.name}:</div> {e.text}</div>
          )}
        </div>
        <div className="w-full h-[50px] md:h-[7%] flex flex-col gap-1">
          <input className={`${dark ? "mx-2 border-[1px] border-black rounded-lg px-2 py-1 bg-zinc-700" : "mx-2 border-[1px] border-black rounded-lg px-2 py-1 bg-zinc-50"}`} placeholder="Talk to waifu!" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onSubmit={sendButton}></input>
          <div className={`${darl ? "w-full px-2 flex flex-row justify-between bg-zinc-700" : "w-full px-2 flex flex-row justify-between bg-zinc-50"}`}>
            <div></div>
            <button className="text-white bg-pink-500 border-[2px] border-pink-300 p-1 px-4 text-sm rounded-lg" onClick={sendButton}>Chat</button>
          </div>
        </div>
        <div className={`${error? "p-1 bg-red-500 border-[2px] border-red-400 w-fit m-1 rounded-lg text-xs text-white" : "hidden"}`}>{error}</div>
      </div>
      </div>
    </main>
  );
}

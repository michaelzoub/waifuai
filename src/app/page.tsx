"use client"
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import dynamic from 'next/dynamic'
import Live2D from "./components/V2";
import { neonColors, waifuNames } from "./data/random";
import Link from "next/link";
import background from "/public/backgroundai.png"
import twitch from "/public/twitch.png"
import Navbar from "./components/navbar";
import { kol } from "./data/kols";
import { useAtom } from "jotai";
import { darker } from "./components/navbar";
import { motion } from "framer-motion";


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
  //const [dark, setDark] = useState(false)
  const [dark] = useAtom(darker)
  const [loading, setLoading] = useState(true)
  const [waifuName, setWaifuName] = useState("")
  const [nameColor, setNameColor] = useState("")
  const [follow, setFollow] = useState(false)
  const [volume, setVolume] = useState(90)
  const [play, setPlay] = useState(false)
  const [polling, setPolling] = useState(false)
  const [time, setTime] = useState(0)

  const containerRef: any = useRef(null)
  const audioRef: any = useRef(null)
  const scrollRef:any = useRef(null)

  const pollObject = {
    type: "poll",
    questions: ["Perform a dance", "Send it to the moon", "Play a user's song"]
  }

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

  useEffect(() => {
    const audio = audioRef.current
    audio.volume = (volume / 100)
  }, [volume])

  useEffect(() => {
    setInterval(() => {
      setTime((e) => e + 1)
    }, 1000)
  }, [])

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

  useEffect(() => {
    const audio = audioRef.current
    if (play) {
      audio.src = "/chill.mp3"
      audio.volume = (volume / 100)
      audio?.play()
    } else {
      audio?.pause()
    }
  }, [play])


  return (
    <main className={`${dark ? `flex flex-col w-full min-h-screen md:overflow-hidden md:h-screen bg-zinc-900 text-white ${loading ? "overflow-y-hidden" : "overflow-visible"}` : `flex flex-col w-full min-h-screen ${opened? "h-screen overflow-hidden" : "overflow-visible"} md:overflow-hidden md:h-screen bg-zinc-100 text-black ${loading ? "overflow-y-hidden" : "overflow-visible"}`}`}>
      <div className={`${loading? "absolute flex w-full h-screen bg-white z-[1000] overflow-hidden" : "hidden"}`}>
        <div className="loading z-[1000] my-auto mx-auto"></div>
      </div>
      <Navbar darkmode={dark}></Navbar>
      <audio src={"/chill.mp3"} ref={audioRef}></audio>
      <div className={`w-full min-h-screen md:h-screen flex flex-col md:overflow-hidden md:flex-row ${opened? "h-full overflow-y-hidden" : ""} ${loading ? "overflow-hidden" : "overflow-visible overflow-y-visible"} ${dark ? "bg-zinc-900" : "bg-zinc-100"}`}>
      <div className={`${opened ? `w-full md:w-[15%] absolute z-[10000] h-screen overflow-hidden py-4 px-1 pt-2 md: md:opacity-100 md:z-50 md:!static opacity-100 h-0 md:h-screen z-50 md:border-r-[1px] overflow-y-hidden ${dark ? "border-zinc-600 bg-zinc-900" : "border-zinc-300 bg-zinc-200"}` : "z-1000 md:flex md:opacity-100 h-20 md:h-screen md:z-50 w-[90px] p-4 md:p-1 justify-center pt-2 opacity-100 :z-[-10]"}`}>
        <div className="flex flex-col">
          <div className="w-full flex flex-row justify-between items-center">
            <h1 className={`${opened ? "visible font-semibold" : "hidden opacity-0"}`}>Recommended</h1>
            <button className="w-fit p-1 rounded-lg transition delay-150 ease-in-out hover:text-zinc-400" onClick={() => setOpened((e) => !e)}>
              <motion.div animate={{rotate: opened ? 180 : 0}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M8 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </motion.div>
            </button>
          </div>
          <div className={`${opened ? "visible flex flex-col mt-4" : "visible pt-4 opacity-0 absolute md:!static md:opacity-100 md:z-50 z-[-100]"}`}>
            <div className="flex flex-col gap-2" key="list">
              {
                kol.map((e) => 
                  <Link href={e.link} target="_blank" className={`flex flex-row gap-2 p-1 rounded-md overflow-hidden ${dark ? "hover:bg-zinc-700" : "hover:bg-zinc-300"}`} key={e.name}>
                    <Image src={e.profilepic} alt="pfp" width={30} height={30} className={`w-8 h-8 rounded-full lg:w-10 lg:h-10 ${opened ? "visible" : "visible"}`}></Image>
                    <div className={`flex flex-col text-sm ${opened ? "visible" : "hidden"}`} key={e.link}>
                      <h1 className={`text-lg font-semibold ${opened ? "visible" : "visible"}`}>{e.name}</h1>
                      <h1 className={`text-pink-500 ${opened ? "visible" : "visible"}`}>{e.at}</h1>
                      <h1 className={`text-sm text-zinc-400 ${opened ? "visible" : "visible"}`}>{e.followers}</h1>
                    </div>
                  </Link>
                )
              }
              <button className="mx-auto text-pink-500 m-4 transition delay-150 ease-in-out hover:text-pink-400"></button>
            </div>
          </div>
        </div>
      </div>
      <div className={`w-full md:w-[75%] md:h-[90%]  ${opened ? "h-[500px]" : "h-[600px]"}`}>
        <div className={`${opened? "flex w-full h-[500px] md:h-[90%] my- border-[0px] border-black rounded- overflow-hidden bg-[url('/house.png')]" : "flex flex-grow w-full h-[550px] md:h-[86%] my-auto border-[0px] border-black rounded- mx- overflow-hidden bg-white bg-[url('/house.png')]"}`}>
          <div className="flex flex-row justify- absolute md:w-[64%] w-full font-semibold">
            <div className="m-2 text-white rounded-sm p-2 px-4 bg-red-600 font-semibold">Live</div>
          </div>
          <Live2D></Live2D>
          <div className={`${thinking? "absolute text-white rounded-full p-2 w-fit h-fit bg-orange-400 border-[2px] border-zinc-300 m-20" : "hidden"}`}>Thinking...</div>
          <audio id="audio"></audio>
        </div>
        <div className="flex flex-col lg:flex-row justify-between md:h-fit h-0 md:opacity-100 opacity-0 items-center">
          <div className="flex flex-row">
            <Image src={twitch} className="w-20 h-20 rounded-full" width={85} height={35} alt="pfp"></Image>
            <div className="flex flex-col m-2 gap-0">
              <h1 className="font-medium text-2xl z-50 font-semibold">Asuna</h1>
              <h1 className="font-medium text-md mt-[-3px] text-pink-500 font-semibold">Just chatting | Anime | WAIFUU</h1>
              <div className={`w-fit flex flex-row justify-between items-center ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                <div className="m-2 text-red-500 font-semibold text-sm m-2">👁 {viewers} viewers</div>
                <div className="text-sm">•</div>
                <div className="m-2 font-medium text-sm m-2">{time <= 600 ? (<span>0{Math.floor(time / 60)}</span>) : (<span>{Math.floor(time / 60)}</span>)}:{time <= 9 ? <span>0{time % 60}</span> : <span>{time % 60}</span>}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-row justify-end text-white gap-2 m-2 text-sm items-center">
              <Link href="https://x.com/asunagpt" className={`py-1 px-4 rounded-sm transition delay-150 ease-in-out ${follow ? "bg-zinc-300" : "bg-pink-400"}`} onClick={() => setFollow(true)} target="_blank">♥ Follow</Link>
              <button className="bg-zinc-300 py-1 px-4 rounded-sm ">Donate :)</button>
              <button className="bg-zinc-300 py-1 px-4 rounded-sm ">★ Subscribe</button>
            </div> 
          </div>
        </div>
      </div>
      <div className={`w-full md:w-[20%] h-[450px] md:mt-[0px] mt-[-30px] md:h-[97%] pb-4 my-auto z-50 border-l-[0px] md:border-l-[1px] ${dark ? "border-zinc-600 bg-zinc-900" : "border-zinc-300 bg-zinc-100 md:bg-zinc-50"}`}>
        <div className={`${dark ? "w-full h-fit md:h-[6%] overflow-hidden font-semibold bg-zinc-700" : "w-full h-fit md:h-[6%] overflow-hidden font-semibold bg-zinc-100"}`}>
          <div className="animation flex text-red-300 whitespace-nowrap my-2 mx-2 p-2">DONOS: 100$ / 231$ /234$ / 54359$ / 453$ / 100$ / 231$ /234$ / 54359$ / 453$</div>
        </div>
        <div className="overflow-scroll h-[250px] md:h-[80%] w-full px-0 md:px-4" ref={containerRef} style={{flexDirection: 'column'}}>
          <div className={`${messages ? "hidden" : "visible mx-auto my-auto"}`}>Loading...</div>
          {messages?.map((e:any) => 
            <div className="flex gap-2 w-full px-4 py-1 m-0 md:m-1 rounded-lg border-[0px] border-black mx-auto break-all overflow-hidden md:mx-0" key={e.timestamp}><div style={{ color: e.color }} className="font-semibold no-wrap whitespace-nowrap">{e.name}:</div> {e.text}</div>
          )}
        </div>
        <div className={`flex flex-row items-center justify-center gap-2 w-full text-left px-2 text-xl border-t-[1px] ${dark ? "border-zinc-500" : ""}`}>
          <button className="px-2 rounded-md" onClick={() => setPlay((e: boolean) => !e)}>
            {
              !play?           
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="48">
              <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg> : 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="48">
              <rect x="6" y="5" width="4" height="14" fill="currentColor"/>
              <rect x="14" y="5" width="4" height="14" fill="currentColor"/>
            </svg>
            }
          </button>
          <input type="range" min="0" max="100" value={volume} className="w-[100%] transition-all slider" onChange={(e:any) => setVolume(e.target.value)}></input>
        </div>
        <div className={`${dark ? "border-t-[1px] pt-3 border-zinc-500 bg-zinc-900 w-full h-[200px] md:h-[7%] flex flex-row md:flex-col gap-0 md:gap-1 px-2" : "border-t-[1px] pt-3 bg-zinc-50 w-full h-[200px] md:h-[7%] flex flex-row md:flex-col gap-0 md:gap-1 px-2"}`}>
          <input className={`${dark ? " mx-1 md:mx-auto border-[0px] w-full h-fit border-black rounded-md px-2 py-1 bg-zinc-700" : "mx-1 md:mx-auto border-[0px] w-full h-fit border-black rounded-md px-2 py-1 bg-zinc-200"}`} placeholder="Talk to waifu!" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onSubmit={sendButton}></input>
          <div className="w-20 md:w-full flex flex-row justify-end md:justify-between h-fit">
            <div></div>
            <button className="text-white bg-pink-500 border-[2px] border-pink-300 p-1 px-4 text-sm rounded-md" onClick={sendButton}>Chat</button>
          </div>
        </div>
        <div className={`${error? "p-1 bg-red-500 border-[2px] border-red-400 w-fit m-1 rounded-md text-xs text-white" : "hidden"}`}>{error}</div>
      </div>
      </div>
    </main>
  );
}

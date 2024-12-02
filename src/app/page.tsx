"use client"
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { slurs } from "./data/slurs";
import { donors } from "./data/donors";
import { throttle } from 'lodash';
import { wordsToCheck } from "./data/livedata";
import pako from "pako"

export default function Home() {

  const prod = "wss://waifuainode-production.up.railway.app" //"wss://waifuainode-production.up.railway.app"

  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState("")
  const [lipsync, setLipsync] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [opened, setOpened] = useState(true)
  const [ca, setCa] = useState(false)
  const [viewers, setViewers] = useState<number>(0)
  //const [dark, setDark] = useState(false)
  const [dark] = useAtom(darker)
  const [loading, setLoading] = useState(true)
  const [waifuName, setWaifuName] = useState("")
  const [nameColor, setNameColor] = useState("")
  const [follow, setFollow] = useState(false)
  const [volume, setVolume] = useState(60)
  const [play, setPlay] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0); 
  const [currentTime, setCurrentTime] = useState(0); 
  const [username, setUsername] = useState<any>()
  const [newUser, setNewUser] = useState<any>()
  const [noti, setNoti] = useState("")
  const [heartClicked, setHeartClicked] = useState<{ [key: string]: boolean }>({})
  const [hint, setHint] = useState(true)
  const[asunaTalking, setAsunaTalking] = useState(false)

  const info = [
    {
      type: "/telegram",
      response: "https://t.me/asunagpt"
    }, 
    {
      type: "/twitter",
      response: "https://x.com/asunagpt"
    }, 
    {
      type: "/ca",
      response: "2JDP7KH7ipkJN7KpgBxzD6v726DnFu7q7Pw9DGGGXrfX"
    }
  ]

  const [socket, setSocket] = useState<any>(null);

  const containerRef: any = useRef(null)
  const audioRef: any = useRef(null)
  const scrollRef:any = useRef(null)
  const lastMessageTimeRef = useRef<any>()

  //connect to websocket

  const connectSocket = useCallback(() => {

    const newSocket = io(prod, {
      reconnection: true, 
      reconnectionAttempts: 5, 
      reconnectionDelay: 1000, 
      reconnectionDelayMax: 5000,
      //timeout: 20000, 
      transports: ['websocket']
    });

    newSocket.on("message", (msg:any) => {
      console.log(messages)
      console.log("msg: ", msg)
      setMessages((prev: any[]) => [...(prev || []), msg])
    })

    newSocket.on("viewerCount", (viewerers:any) => {
      setViewers(viewerers)
    })

    newSocket.on("username", (sub:any) => {
      setNoti(sub)
      setTimeout(() => {
        setNoti("")
      }, 3000)
      console.log(sub)
    })

    newSocket.on("upvote", (upvote:any) => {
      setMessages((prevMessages) => 
        prevMessages.map((message) => 
            message._id === upvote._id
                ? { ...message, upvotes: upvote.upvotes } 
                : message 
        )
    );
    })

    const audioQueue: any = []

    newSocket.on("asuna", (receivedData:any) => {
      const decompressedData = pako.ungzip(receivedData)
      const blob = new Blob([decompressedData], { type: 'audio/mp3' })
      audioQueue.push(blob)
      console.log(audioQueue)
      playAudio()
    })

    function playAudio() {
      if (asunaTalking || audioQueue.length === 0) {
        return
      } else {
        setAsunaTalking(true)
        const blob: any = audioQueue.shift()
        const receivedAudioUrl = URL.createObjectURL(blob)
        const audioPlayer = document.getElementById("audio") as HTMLAudioElement
        audioPlayer.src = receivedAudioUrl
        audioPlayer?.play()

        audioPlayer.onended = () => {
          URL.revokeObjectURL(receivedAudioUrl)
          setAsunaTalking(false)
          playAudio()
        }

        audioPlayer.onerror = () => {
          console.error("Error playing audio")
          setAsunaTalking(false)
          playAudio()
        }
    }
  }

    setSocket(newSocket)

    return () => {
      newSocket.off("message")
      newSocket.off("viewerCount")
      newSocket.off("username")
    }
  }, [])

  useEffect(() => {
    const cleanup = connectSocket();
    return cleanup;
  }, [connectSocket])

  useEffect(() => {

    const username = localStorage.getItem("username")
    console.log("localstorage username: ", username)
    if (username) {
      setUsername(username)
      setWaifuName(username)
    } else {
      console.log("No username")
    }

    if (window.innerWidth <= 768) {
      setOpened(false)
    }

    const waifuNumber = Math.floor(Math.random() * 50)
    const colorNumber = Math.floor(Math.random() * 10)
    //setWaifuName(waifuNames[waifuNumber])
    setNameColor(neonColors[colorNumber])

    async function fetchMessages() {
      
      console.log("fetchmessage hit")
      const response = await fetch(`/api/fetchmessage?timestamp=${Date.now()}`, {
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

  }, [])

  useEffect(() => {

    setTimeout(() => {
      setLoading(false)
    }, 1500)
    if (!username && containerRef.current) {
      containerRef.current.scrollTop = 0
      return
    } if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight - containerRef.current.clientHeight;
    }
  }, [messages, username])

  useEffect(() => {
    const audio = audioRef.current
    audio.volume = (volume / 100)
  }, [volume])

  useEffect(() => {

    const audio = audioRef.current
    const updateDuration = () => setDuration(audio.duration)
    const updateCurrentTime = () => setCurrentTime(audio.currentTime)
    audio.volume = (volume / 100)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("timeupdate", updateCurrentTime)

    setInterval(() => {
      setTime((e) => e + 1)
    }, 1000)
  }, [])

  const throttledSendButton = throttle((event) => {
      
  
    const amountOfCharacters = newMessage.split("")
    console.log(amountOfCharacters.length)

    if (amountOfCharacters.length < 100) {
      if (!username) {
        return
      }


      if (event.key === "Enter" || event.type === "click") {
        const currentTime = Date.now();

        //update the last message time only if we're not rate-limited
        if (currentTime - lastMessageTimeRef.current < 8000) {
          window.alert("RATE LIMIT EXCEEDED. Please wait 8 seconds.");
          return
        }
    
        lastMessageTimeRef.current = currentTime;
        if (!slurs.some(slur => newMessage.toLowerCase().includes(slur.toLowerCase()))) {

          setThinking(true)
          socket.emit("message", { text: newMessage, timestamp: Date.now(), name: waifuName, color: nameColor, type: "", upvotes: 0 })
          console.log(nameColor);

          let returnBotMessage;
          info.forEach((e:any) => {
            if (newMessage.toLowerCase().includes(e.type)) {
              socket.emit("message", { text: e.response, timestamp: Date.now(), name: "Mod", color: nameColor, type: "MOD", upvotes: 0 })
            }
          })

          async function realTimeData() {
            const chainId = "solana"
            const pairId = "C4d2wPEA5uvgEJBsu7USWb4ojLGrRtaAfiLKnSY1HZ4G"
            const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairId}`, {
                method: 'GET',
                headers: {
                  
                },
            })
            const data = await response.json()
            const marketCap = data.pairs[0].marketCap
            console.log(data)
            console.log(marketCap)
            return marketCap
          }

          let marketCap:any

          console.log(newMessage)

          async function audio() {

            //make a system to check every wordsToCheck instead of doing it semi manually
            const hasAsu = wordsToCheck[0].name.some((word:string) => newMessage.toLowerCase().includes(word))
            const hasWord = wordsToCheck[0].description.some((word:string) => newMessage.toLowerCase().includes(word))
            console.log("words: ", hasAsu, hasWord)

            if (hasAsu && hasWord) {
              const receivedData = await realTimeData()
              marketCap = `(for Asuna live d4t4: ${receivedData})`
            } else {
              marketCap = ""
            }

            const response = await fetch("/api/sendtoai", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(`${newMessage}${marketCap}`)
            })
            const audioBlob = await response.blob()
            const arrayBuffer = await audioBlob.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)
            const compressedData = pako.gzip(uint8Array)
            const audioUrl = URL.createObjectURL(audioBlob)
            const audioPlayer = document.getElementById("audio") as HTMLAudioElement
            setLipsync(true)
            audioPlayer.src = audioUrl
            socket.emit("asuna", compressedData)
            audioPlayer?.play()
          }

          audio();
          setThinking(true);

          // Reset thinking state after 2 seconds
          setTimeout(() => {
            setThinking(false);
          }, 2000);

          // Reset the message input field
          setNewMessage("");
          console.log(newMessage);
          console.log(messages);
        } else {
          window.alert("No slurs");
        }
      }
    }
  
  }, 5000)

  function handleSliderChange(e:any) {
    const newSoundVolume = e.target.value
    setVolume(newSoundVolume);
  
    const volumeValue = newSoundVolume / 100;
    if (audioRef.current) {
      audioRef.current.volume = volumeValue
    }
  }

  function handleUsername(e: any) {
    if (e.type === "click" || e.key === "Enter") {
      const newUsername = newUser
      console.log("target value: ", newUsername)
      setUsername(newUsername)
      setWaifuName(newUsername)
      localStorage.setItem("username", newUsername)
    }
  }

  function followButtonClick() {
    if (username) {
      socket.emit("username", username)
    }
  }

  async function handleHeartClick(messageId:any) {
    //store in database and use websocket to show to everyone else
    const isLiked = heartClicked[messageId._id]
    const newHeartState = !isLiked;
    setHeartClicked((prev) => ({ ...prev, [messageId._id]: newHeartState }));
    console.log(messageId)
    console.log(newHeartState)
    if (newHeartState) {
    const response = await fetch("/api/heartclick", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messageId: messageId })
    })
    const returnedAmount = await response.json()
    console.log(returnedAmount)
    socket.emit("upvote", returnedAmount.body)
    } else {
      messageId.upvotes = messageId.upvotes - 1
      const response = await fetch("/api/downvote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messageId: messageId })
      })
      const returnedAmount = await response.json()
      socket.emit("downvote", returnedAmount.body)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (play) {
      audio.src = "/night.mp3"
      audio.volume = (volume / 100)
      audio?.play()
    } else {
      audio?.pause()
    }
  }, [play])


  return (
    <main className={`${dark ? `flex flex-col w-full min-h-screen md:overflow-hidden md:h-screen bg-zinc-900 text-white ${loading ? "overflow-y-hidden" : "overflow-visible"}` : `flex flex-col w-full min-h-screen md:overflow-hidden md:h-screen bg-zinc-100 text-black ${loading ? "overflow-y-hidden" : "overflow-visible"}`}`}>
      <div className={`${loading? "absolute flex w-full h-[160%] md:h-screen bg-white z-[10000] overflow-hidden" : "hidden"}`}>
        <div className="loading z-[100000] mt-[40%] md:my-auto mx-auto"></div>
      </div>
      <Navbar darkmode={dark}></Navbar>
      <audio src={"/night.mp3"} ref={audioRef}></audio>
      <div className={`w-full min-h-screen md:h-[94%] flex flex-col md:overflow-hidden md:flex-row ${opened? "h-[94%] overflow-y-hidden" : ""} ${loading ? "overflow-hidden" : "overflow-visible overflow-y-visible"} ${dark ? "bg-zinc-900" : "bg-zinc-100"}`}>
      <section className={`${opened ? `w-full md:w-[15%] absolute z-[5000] h-full overflow- py-4 px-1 pt-2 md: md:opacity-100 md:z-50 md:!static opacity-100 md:h-full z-50 md:border-r-[1px] ${dark ? "border-zinc-600 bg-zinc-900" : "border-zinc-300 bg-zinc-100 md:bg-zinc-200"}` : `z-1000 md:flex md:opacity-100 h-20 md:h-full md:z-50 w-[90px] p-4 md:p-1 justify-center pt-2 opacity-100 :z-[-10] ${dark ? "border-zinc-600 bg-zinc-900" : "border-zinc-300 bg-zinc-100 md:bg-zinc-200"}`}`}>
        <div className="h-[95%] flex flex-col justify-start md:justify-between">
          <div className="h-[85%] overflow-y-scroll md:overflow-visible md:h-full">
          <div className="w-full flex flex-row justify-between items-center">
            <h1 className={`${opened ? "visible font-semibold" : "hidden opacity-0"}`}>Recommended</h1>
            <button className="w-fit p-1 rounded-lg transition delay-150 ease-in-out hover:text-zinc-400" onClick={() => setOpened((e) => !e)}>
              <motion.div animate={{rotate: opened ? 180 : 0}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M8 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none"/>
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
          <div className={`flex flex-col items-center justify- bg-pink- mt-[0px] rounded-lg py-1 px-4 gap-0 w-[90%] mx-auto text-left px- text-xl h-fit ${opened ? "visible" : "hidden"} ${dark ? "border-zinc-500 bg-black" : "bg-zinc-300"}`}>
            <div className="flex flex-col justify-center p-1 px-1 pb-4 w-full">
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-2 items-center">
                  <h1 className={`text-xl ${play ? "text-green-500" : "text-red-500"}`}>●</h1>
                  <h1 className="text-sm">Chill Lofi</h1>
                </div>
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
                    </div>
                    <div className="flex flex-row items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                  </svg>
                <input type="range" min="0" max="100" step="0.1" value={volume} onChange={(e:any) => setVolume(e.target.value)} className="transition-all slider"></input>
                </div>
            </div>
          </div>
        </div>
      </section>
      <section className={`relative w-full md:h-[94%]  ${opened ? "h-[200px] md:w-[70%]" : "md:w-[80%] h-[600px]"}`}> {/* used to be h-[500px] */}
        <div className={`${opened? "flex w-full h-[500px] md:h-[86%] my- border-[0px] border-black rounded- overflow-hidden bg-[url('/house.png')] bg-cover bg-fixed" : "static flex flex-grow w-full h-[550px] md:h-[90%] my-auto border-[0px] border-black rounded- mx- overflow-hidden bg-white bg-[url('/house.png')] md:bg-cover md:bg-fixed"}`}>
          <div className="flex flex-row justify-between absolute md:w-[100%] w-full font-semibold">
            <div className="m-2 text-white rounded-sm p-2 px-4 bg-red-600 font-semibold h-fit">Live</div>
            {noti && <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className=""
            >
              <div className="bg-[#ff69b4] mx-4 mt-4 p-3 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="#ff69b4" 
                      className="w-5 h-5"
                    >
                      <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      New Follower!
                    </p>
                    <p className="text-white/80 text-xs">
                      <span className="text-zinc-700">{noti}</span> just followed
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>}
          </div>
          <div className="relative w-full h-full mt-28 md:0">
            <Live2D />
          </div>
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
                <div className="m-2 font-medium text-sm m-2">
                  <span>{String(Math.floor(time / 60)).padStart(2, "0")}</span>:
                  <span>{String(time % 60).padStart(2, "0")}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-row justify-end text-white gap-2 m-2 text-sm items-center">
              <Link href="https://x.com/asunagpt" className={`py-1 px-4 rounded-sm transition delay-150 ease-in-out ${follow ? "bg-pink-500" : "bg-pink-500"}`} onClick={followButtonClick} target="_blank">♥ Follow</Link>
              <Link href="https://dexscreener.com/solana/c4d2wpea5uvgejbsu7uswb4ojlgrrtaafilknsy1hz4g" className="bg-zinc-300 py-1 px-4 rounded-sm text-zinc-600">BUY $ASU (CA) :)</Link>
              <Link href="https://t.me/asunagpt" className="bg-zinc-300 py-1 px-4 rounded-sm text-zinc-600">★ Telegram</Link>
            </div> 
          </div>
        </div>
      </section>
      <section className={`w-full h-[450px] md:mt-[0px] mt-[-30px] md:h-[100%] pb-4 my-auto z-50 border-l-[0px] md:border-l-[1px] ${opened? " md:w-[20%]" : "md:w-[20%]"} ${dark ? "border-zinc-600 bg-zinc-900" : "border-zinc-300 bg-zinc-100 md:bg-zinc-50"}`}>
        <div className={`flex justify-center items-center md:hidden`}>
        <div className="flex flex-row justify-end text-white gap-2 m-2 text-sm items-center">
              <Link href="https://x.com/asunagpt" className={`py-1 px-4 rounded-sm transition delay-150 ease-in-out ${follow ? "bg-pink-500" : "bg-pink-500"}`} onClick={followButtonClick} target="_blank">♥ Follow</Link>
              <Link href="https://dexscreener.com/solana/c4d2wpea5uvgejbsu7uswb4ojlgrrtaafilknsy1hz4g" className="bg-zinc-300 py-1 px-4 rounded-sm text-zinc-600">BUY $ASU (CA) :)</Link>
              <Link href="https://t.me/asunagpt" className="bg-zinc-300 py-1 px-4 rounded-sm text-zinc-600">★ Telegram</Link>
        </div>
        </div>
        <div className={`${dark ? "flex justify-center border-y-[1px] border-zinc-600 md:border-y-0 w-full h-fit md:h-[6%] overflow-hidden font-semibold bg-zinc-700" : "flex justify-center border-y-[1px] border-zinc-300 md:border-y-0 w-full h-fit md:h-[6%] overflow-hidden font-semibold bg-zinc-100"}`}>
          <div className={`animation flex gap-1 whitespace-nowrap mx-2 p-2 h-fit my-auto ${dark ? "text-white" : "text-black"}`} key="donors">DONOS: 
            {
              donors.map((e:any) => 
                <div className="flex flex-row gap-1">
                  <div className="text-pink-500">{e.name}</div> : <div className="text-zinc-500">{e.amount}$</div>
                </div>
              )
            }
          </div>
        </div>
        <div className={`relative ${username ? "overflow-y-scroll" : "overflow-hidden"} overflow-x-hidden custom-scrollbar h-[250px] md:h-[82%] w-full px-0 md:px-4`} ref={containerRef} style={{flexDirection: 'column'}}>
          <div className={`${messages ? "hidden" : "visible mx-auto my-auto"}`}>Loading...</div>
          <div className={`${username ? "hidden" : "absolute left-0 bottom-0 w-full flex flex-col h-full gap-1 items-center backdrop-blur-sm z-50 justify-center px-2"}`}>
            <h1 className="font-semibold text-lg text-left">Enter a username to chat:</h1>
            <input className={`${dark ? "mx-auto md:mx-auto border-[0px] w-full h-fit border-black rounded-md px-2 py-2 bg-zinc-700" : "mx-auto md:mx-auto border-[0px] w-full h-fit border-black rounded-md px-2 py-2 bg-zinc-200"}`} placeholder="Username" value={username} onKeyDown={handleUsername} onChange={(e:any) => setNewUser(e.target.value)}></input>
            <button className="py-1 px-4 rounded-sm transition delay-150 ease-in-out bg-pink-500 my-2 rounded-md text-white w-full hover:bg-pink-400" onClick={handleUsername}>Select</button>
          </div>
          <div className={`${username ? "visible" : "visible"}`}>
          {messages?.map((e: any) => (
            <div
              key={e._id}
              className={`flex justify-between gap-0 w-full pr-2 pl-1 py-1 m-0 md:m-1 rounded-lg border-[0px] border-black mx-auto break-words overflow-hidden md:mx-0 ${e.type ? "bg-pink-100 break-all" : ""}`}
            >
              <div className="flex flex-row gap-2">
                <div style={{ color: e.color }} className="font-semibold whitespace-nowrap">
                  {e.name}:
                </div>
                
                <span className={`${e.type ? "text-red-500 font-semibold" : ""}`}>
                  {e.text}
                </span>
              </div>

              <div className={`flex flex-col justify-end items-end m-[1px] mx-1 my-auto ${e.type ? "hidden" : "visible"}`}>
                <svg
                  onClick={() => handleHeartClick(e)}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110"
                  style={{
                    color: heartClicked[e._id] ? 'red' : 'gray',
                    fill: heartClicked[e._id] ? 'red' : 'transparent',
                    fillOpacity: heartClicked[e._id] ? 1 : 0.2
                  }}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <div className="text-zinc-500 text-2xs mx-auto">{e.upvotes}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={`flex flex-row p-4 w-full bg-pink-500 rounded-lg mb-2 static text-white justify-between ${hint ? "visible" : "hidden"}`}>
          <h1 className="w-[85%] break-word">Vote for the best comment!</h1>
          <button className="text-2xs top-0" onClick={() => setHint(false)}>✖</button>
        </div>
        </div>
        <div className={`${username ? "visible" : "visible"} ${dark ? "border-t-[1px] pt-3 border-zinc-500 bg-zinc-900 w-full h-[100px] md:h-[6%] flex flex-row md:flex-col gap-0 md:gap-1 px-2" : "border-t-[1px] pt-3 bg-zinc-50 w-full h-[100px] md:h-[6%] flex flex-row md:flex-col gap-0 md:gap-1 px-2"}`}>
          <div className="w-full flex flex-row items-center items-center justify-end h-full overflow-hidden px-1">
            <input className={`${dark ? "mx-auto md:mx-auto border-[0px] w-full h-fit border-black rounded-md px-2 py-2 bg-zinc-700" : "mx-auto md:mx-auto border-[0px] w-full h-fit border-black rounded-md px-2 py-2 bg-zinc-200"}`} placeholder="Talk to waifu!" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={throttledSendButton}></input>
            <div className="absolute justify-end w-fit md:w-fit flex flex-row my-auto overflow-hidden z-0">
              <button className="flex justify-end text-white bg-pink-500 border-[2px] border-pink-400 p-1 px-4 text-xs rounded-md m-1" onClick={throttledSendButton}>↑</button>
            </div>
          </div>
        </div>
        <div className={`${error? "absolute w-full md:w-0 md:mt-0" : "hidden"}`}>
          <div className={`${error? "ml-1 mx-auto p-1 px-3 bg-red-500 border-[2px] border-red-400 w-fit rounded-md text-xs text-white" : "hidden"}`}>{error}</div>
        </div>
      </section>
      </div>
    </main>
  );
}

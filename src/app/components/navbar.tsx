"use client"
import { useState } from "react";
import { atom, useAtom } from 'jotai'

interface NavbarProps {
    darkmode: boolean;
  }

  export const darker = atom(false)

export default function Navbar({darkmode}: NavbarProps) {

    const [dark, setDark] = useAtom(darker)

    return (
        <header className={`${dark? "z-[500] flex flex-row w-full h-[6%] bg-zinc-900 z-100 justify-between py-3 px-2 text-white" : "z-[500] flex flex-row w-full h-[6%] bg-zinc-50 z-100 justify-between py-3 px-2 text-black"}`}>
            <div className="font-semibold text-xl my-auto mx-2">Asuna<span className="text-pink-400">Chat</span></div>
            <div className={`flex flex-row rounded-full w-[62px] border-[1px] ${!dark ? "border-zinc-400" : "border-zinc-200"}`}>
              <button className={`${dark ? "animatedark" : "animatelight"} transition delay-150 ease-in-out text-left text-sm pl-1`} onClick={() => setDark((e) => !e)}>{dark ? "☾" : "☼"}</button>
            </div>
        </header>
    )
}
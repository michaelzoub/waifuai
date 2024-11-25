interface NavbarProps {
    darkmode: boolean;
  }

export default function Navbar({darkmode}: NavbarProps) {
    return (
        <header className={`${darkmode? "flex flex-row w-full h-[4%] bg-zinc-800 z-100" : "flex flex-row w-full h-[4%] bg-zinc-50 z-100"}`}>
            <div className="font-semibold text-xl text-pink-500 my-auto mx-2">Asuna AI!</div>
        </header>
    )
}
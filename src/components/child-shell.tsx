"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBarIcon, HomeIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { usePlayer } from "./player-provider";

const links = [
  { href: "/heim", label: "HEIM", icon: HomeIcon },
  { href: "/aefingar", label: "ÆFINGAR", icon: ListBulletIcon },
  { href: "/framfarir", label: "FRAMFARIR", icon: ChartBarIcon },
];

export function ChildShell({
  children,
  hideNavigation = false,
  immersive = false,
}: {
  children: React.ReactNode;
  hideNavigation?: boolean;
  immersive?: boolean;
}) {
  const pathname = usePathname();
  const { player } = usePlayer();
  const showNavigation = !hideNavigation && !immersive;

  return <div className="min-h-dvh bg-pitch-50 text-ink">
    {!immersive && <header className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
      <Link href="/heim" className="text-xl font-black tracking-tight" aria-label="Aukaæfing heim">AUKA<span className="text-pitch-600">ÆFING</span></Link>
      {player && <Link href="/leikmenn" className="flex min-h-12 items-center gap-2 rounded-full bg-white px-3 shadow-sm" aria-label="Skipta um leikmann">
        <span className={`grid size-8 place-items-center rounded-full ${player.color}`}>{player.avatar}</span><span className="font-bold">{player.name}</span>
      </Link>}
    </header>}
    <main className={`mx-auto max-w-lg px-4 ${immersive ? "pb-32 pt-3" : hideNavigation ? "pb-8" : "pb-28"}`}>{children}</main>
    {showNavigation && <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-lg justify-around border-t border-pitch-100 bg-white/95 px-2 pb-[max(.6rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur" aria-label="Aðalvalmynd">
      {links.map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link key={href} href={href} className={`flex min-h-14 min-w-20 flex-col items-center justify-center gap-1 rounded-xl text-[.68rem] font-extrabold ${active ? "bg-pitch-50 text-pitch-700" : "text-slate-500"}`}><Icon className="size-6" strokeWidth={active ? 2.6 : 2}/>{label}</Link>; })}
    </nav>}
  </div>;
}

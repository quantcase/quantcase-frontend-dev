import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <p>QUANTCASE DEMO PAGES</p>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            QuantCase Frontend
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 mt-4">
            Active Pages
            <br />- Screener / Home
            <br />- Screener / Management
            <br />
          </p>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <Link href="/screener/home">
              <Button>Screener</Button>
            </Link>
          </div>
          <p className="italic max-w-md text-sm leading-8 text-zinc-500 dark:text-zinc-400 mt-4">
            Helper Pages
            <br />- Transcript
            <br />- Summary
            <br />
            <br />{" "}
            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
              <Link href="/summary">
                <Button variant={"outline"}>Summary</Button>
              </Link>
              <Link href="/transcript">
                <Button variant={"outline"}>Transcript</Button>
              </Link>
            </div>
          </p>
        </div>
      </main>
    </div>
  );
}

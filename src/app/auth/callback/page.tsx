"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    const complete = async () => {
      const client = getSupabaseBrowserClient();
      if (!client) { setError(true); return; }
      const code = params.get("code");
      if (code) {
        const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);
        if (exchangeError) { setError(true); return; }
      } else {
        const { data } = await client.auth.getSession();
        if (!data.session) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const retry = await client.auth.getSession();
          if (!retry.data.session) { setError(true); return; }
        }
      }
      router.replace(params.get("next") || "/leikmenn");
    };
    void complete();
  }, [params, router]);

  return <main className="grid min-h-dvh place-items-center bg-pitch-50 px-5 text-center text-ink">
    <div>{error ? <><h1 className="text-2xl font-black">Innskráning mistókst</h1><p className="mt-2 text-slate-600">Opnaðu nýjan innskráningartengil og reyndu aftur.</p></> : <p className="font-black">Klára innskráningu…</p>}</div>
  </main>;
}

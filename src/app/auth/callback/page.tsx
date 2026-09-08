"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { callbackEvidence, callbackHasError, safeLocalRedirect } from "./callback-utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const complete = async () => {
      const client = getSupabaseBrowserClient();
      if (!client) { setError(true); return; }

      const search = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      if (callbackHasError(search, hash)) { setError(true); return; }

      const { code, accessToken } = callbackEvidence(search, hash);
      if (!code && !accessToken) { setError(true); return; }

      if (code) {
        const { data, error: exchangeError } = await client.auth.exchangeCodeForSession(code);
        if (exchangeError || !data.session) { setError(true); return; }
      } else {
        let session = (await client.auth.getSession()).data.session;
        if (!session) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          session = (await client.auth.getSession()).data.session;
        }
        if (!session || session.access_token !== accessToken) { setError(true); return; }
      }

      router.replace(safeLocalRedirect(search.get("next")));
    };
    void complete();
  }, [router]);

  return <main className="grid min-h-dvh place-items-center bg-pitch-50 px-5 text-center text-ink">
    <div>{error ? <><h1 className="text-2xl font-black">Innskráning mistókst</h1><p className="mt-2 text-slate-600">Opnaðu nýjan innskráningartengil og reyndu aftur.</p></> : <p className="font-black">Klára innskráningu…</p>}</div>
  </main>;
}

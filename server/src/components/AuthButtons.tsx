"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") return <button disabled>Loading…</button>;

  if (!session) {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => signIn("google")}>Sign in with Google</button>
        <button onClick={() => signIn("apple")}>Sign in with Apple</button>
        <button onClick={() => signIn("email", { email: prompt("Email?") || "" })}>
          Magic Link
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <span>Hi, {session.user?.name ?? session.user?.email}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}


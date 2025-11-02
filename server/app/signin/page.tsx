"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main style={{ padding: 24 }}>
      <h2>Sign in</h2>
      <button onClick={() => signIn("google")}>Continue with Google</button>
      <button onClick={() => signIn("apple")}>Continue with Apple</button>
      <button
        onClick={() => {
          const email = prompt("Email?");
          if (email) signIn("email", { email });
        }}
      >
        Magic Link
      </button>
    </main>
  );
}


import { AuthButtons } from "@/components/AuthButtons";

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>🍝 NoshLog - Home Cooked Meal Rating</h1>
      <AuthButtons />
      <p style={{ marginTop: 24 }}>API is up. Try these endpoints:</p>
      <ul>
        <li><code>GET /api/health</code></li>
        <li><code>GET /api/meals</code></li>
        <li><code>POST /api/meals</code></li>
        <li><code>POST /api/compare</code></li>
        <li><code>GET /api/private/me</code> (protected)</li>
        <li><code>POST /api/ratings</code></li>
        <li><code>GET /api/top?userId=...</code></li>
      </ul>
    </main>
  );
}

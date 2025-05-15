export async function analyzeDeal(id: string) {
  return {
    id,
    summary: "AI analysis coming soon",
    score:   Math.floor(Math.random() * 100),
  };
}
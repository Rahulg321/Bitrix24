/* Swap in Resend, Postmark, SES, etc. later */
export async function sendReset(email: string) {
  console.log(`[dev] sending password-reset link to ${email}`);
  // simulate latency
  await new Promise((r) => setTimeout(r, 400));
  return true;
}

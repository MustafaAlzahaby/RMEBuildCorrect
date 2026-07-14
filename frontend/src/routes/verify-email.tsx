import { Link, useSearchParams } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { resendVerificationEmail, verifyEmail } from "@/api/auth";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    token ? "loading" : "idle",
  );
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email is verified. You can sign in now.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed.");
      });
  }, [token]);

  const resend = async () => {
    if (!email || resending || cooldown > 0) return;
    setResending(true);
    setResendMessage("");
    try {
      const result = await resendVerificationEmail(email);
      setResendMessage("A new verification link has been requested. Check your inbox and spam folder.");
      setCooldown(result.retryAfterSeconds ?? 60);
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : "Unable to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  if (token) {
    return (
      <div className="container mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-wide">
          {status === "loading" ? "Verifying email" : status === "success" ? "Email verified" : "Verification failed"}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {status === "loading" ? "Please wait while we activate your account." : message}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        <MailCheck className="h-7 w-7" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-wide">Check your email</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        We've sent a verification link to{" "}
        <span className="font-medium text-foreground">{email ?? "your work email"}</span>.
        Click it to activate your account.
      </p>
      <p className="mt-4 text-xs text-muted-foreground">
        The link expires for your security. Check your spam folder if it is not in your inbox.
      </p>
      {email && (
        <Button
          type="button"
          variant="ghost"
          className="mt-3"
          disabled={resending || cooldown > 0}
          onClick={resend}
        >
          {resending
            ? "Sending…"
            : cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Resend verification email"}
        </Button>
      )}
      {resendMessage && <p className="mt-2 text-xs text-muted-foreground">{resendMessage}</p>}
      <Button asChild variant="outline" className="mt-6">
        <Link to="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}

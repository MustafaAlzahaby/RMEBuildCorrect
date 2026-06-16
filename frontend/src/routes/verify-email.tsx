import { Link, useSearchParams } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
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
        Didn't get it? Check your spam folder or contact IT support.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}

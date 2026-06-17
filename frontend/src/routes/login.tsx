import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { EMAIL_DOMAIN, isValidCompanyEmail } from "@/api/auth";
import { toast } from "sonner";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidCompanyEmail(email)) {
      setError(`Email must end with ${EMAIL_DOMAIN}`);
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-gradient shadow-red-glow">
          <HardHat className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use your Rowad work email.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            placeholder={`yourname${EMAIL_DOMAIN}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 bg-surface"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">Only {EMAIL_DOMAIN} addresses are allowed.</p>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 bg-surface"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full bg-primary-gradient text-primary-foreground hover:opacity-90">
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/register" className="text-primary hover:underline">Create one</Link>
        </p>
      </form>
    </div>
  );
}

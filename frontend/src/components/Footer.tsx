import { HardHat } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-sidebar">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HardHat className="h-4 w-4 text-primary" />
          <span>Rowad Academy — Internal training platform</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Rowad Modern Engineering. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

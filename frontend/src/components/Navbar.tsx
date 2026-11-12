import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  HardHat,
  Menu,
  Moon,
  Sun,
  Shield,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/utils";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  function toggleTheme() {
    const dark = !isDark;
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
    try {
      localStorage.setItem("rowad-theme", dark ? "dark" : "light");
    } catch {
      // The toggle still works for this visit.
    }
  }

  const navLinks = (
    <>
      {!isAuthenticated && (
        <NavLink
          to="/"
          end
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"
            }`
          }
        >
          Home
        </NavLink>
      )}
      {isAuthenticated && (
        <NavLink
          to="/dashboard"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"
            }`
          }
        >
          Guides
        </NavLink>
      )}
      {isAdmin && (
        <NavLink
          to="/admin"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"
            }`
          }
        >
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-gradient shadow-red-glow">
            <HardHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
              Rowad
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
              Field Guide
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">{navLinks}</nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={toggleTheme}
            aria-label="Dark mode"
            aria-pressed={isDark}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1 hover:bg-accent transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium pr-1 sm:inline">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Guides
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="mr-2 h-4 w-4" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="min-h-11">
                <Link to="/login">
                  <UserIcon className="mr-1 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-primary-gradient text-primary-foreground hover:opacity-90"
              >
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-sidebar md:hidden">
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="container mx-auto flex flex-col gap-1 px-4 py-3 [&>a]:flex [&>a]:min-h-11 [&>a]:items-center"
          >
            {navLinks}
          </nav>
        </div>
      )}
    </header>
  );
}

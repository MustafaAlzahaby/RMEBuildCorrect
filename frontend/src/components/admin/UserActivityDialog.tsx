import { Activity } from "lucide-react";
import type { AdminUser } from "@/api/users";
import { LibraryActivityTimeline } from "./LibraryActivityTimeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function UserActivityDialog({ user }: { user: AdminUser }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" aria-label={`View activity for ${user.name}`}>
          View activity
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl gap-0 p-0 [&>button:last-child]:-top-10 [&>button:last-child]:right-0 [&>button:last-child]:grid [&>button:last-child]:size-8 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:border [&>button:last-child]:bg-background [&>button:last-child]:opacity-100 [&>button:last-child]:shadow-sm">
        <div className="max-h-[min(90dvh,calc(100dvh-6rem))] space-y-4 overflow-y-auto overscroll-contain rounded-[inherit] p-4 sm:p-6">
          <DialogHeader className="flex-row items-center gap-3 rounded-xl border bg-primary/5 p-4 text-start">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Activity className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="break-words">{user.name} · Activity</DialogTitle>
              <DialogDescription className="break-words">{user.email}</DialogDescription>
            </div>
          </DialogHeader>
          <LibraryActivityTimeline userId={user.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

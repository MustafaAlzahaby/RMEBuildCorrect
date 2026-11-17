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
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl gap-4 overflow-auto p-4 sm:p-6">
        <DialogHeader className="flex-row items-center gap-3 rounded-xl border bg-primary/5 p-4 pe-9 text-start">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1">
            <DialogTitle className="break-words">{user.name} · Activity</DialogTitle>
            <DialogDescription className="break-words">{user.email}</DialogDescription>
          </div>
        </DialogHeader>
        <LibraryActivityTimeline userId={user.id} />
      </DialogContent>
    </Dialog>
  );
}

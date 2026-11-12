import { useEffect, useState, type FormEvent } from "react";
import { BookOpen, FolderKanban, Pencil, Plus, Shield, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { listCategories, createCategory, updateCategory, deleteCategory } from "@/api/categories";
import { AdminGuides } from "@/components/admin/AdminGuides";
import { listUsers, setUserActive, updateUserRole } from "@/api/users";
import { categoryLabel } from "@/lib/categories";
import type { Category, User, UserRole } from "@/types";
import { toast } from "sonner";

export function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-gradient">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            Content workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Add practical content to the right subsection. Manage your library and team here.
          </p>
        </div>
      </header>

      <Tabs defaultValue="lessons" className="flex flex-col gap-6 md:flex-row">
        <TabsList
          aria-label="Administration"
          className="flex h-auto w-full flex-row gap-1 bg-surface p-1 md:w-56 md:self-start md:flex-col md:items-stretch"
        >
          <TabsTrigger value="lessons" className="min-h-12 justify-start gap-2">
            <BookOpen className="h-4 w-4" /> Guides
          </TabsTrigger>
          <TabsTrigger value="categories" className="min-h-12 justify-start gap-2">
            <FolderKanban className="h-4 w-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="users" className="min-h-12 justify-start gap-2">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
        </TabsList>

        <div className="min-w-0 flex-1">
          <TabsContent value="categories">
            <CategoriesAdmin />
          </TabsContent>
          <TabsContent value="lessons">
            <AdminGuides />
          </TabsContent>
          <TabsContent value="users">
            <UsersAdmin />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

/* ----------------------- Categories ----------------------- */

function CategoriesAdmin() {
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () =>
    listCategories()
      .then(setItems)
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Could not load categories"),
      );
  useEffect(() => {
    refresh();
  }, []);

  const onSubmit = async (data: Omit<Category, "id" | "lessonCount">) => {
    if (editing) {
      await updateCategory(editing.id, data);
      toast.success("Category updated");
    } else {
      await createCategory(data);
      toast.success("Category created");
    }
    setOpen(false);
    setEditing(null);
    refresh();
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-display text-lg uppercase tracking-wide">Categories</h2>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary-gradient text-primary-foreground">
              <Plus className="mr-1 h-4 w-4" /> Add category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
              <DialogDescription>
                Create a division or choose its parent to add a subsection.
              </DialogDescription>
            </DialogHeader>
            <CategoryForm initial={editing} categories={items} onSubmit={onSubmit} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Parent</TableHead>
            <TableHead>Guides</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono text-xs font-semibold text-primary">
                {c.code || "—"}
              </TableCell>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {items.find((item) => item.id === c.parentId)?.name ?? "Division"}
              </TableCell>
              <TableCell>{c.lessonCount}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditing(c);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    if (!confirm(`Delete "${c.name}"?`)) return;
                    await deleteCategory(c.id);
                    toast.success("Deleted");
                    refresh();
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CategoryForm({
  initial,
  categories,
  onSubmit,
}: {
  initial: Category | null;
  categories: Category[];
  onSubmit: (data: Omit<Category, "id" | "lessonCount">) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [parentId, setParentId] = useState(initial?.parentId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const parents = categories.filter((item) => !item.parentId && item.id !== initial?.id);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        code: code.trim(),
        parentId: parentId || null,
        description,
        icon: "BookOpen",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save category");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Choose a parent division to create a subsection for your guides.
      </p>
      <fieldset disabled={saving} className="space-y-4">
        <div>
          <Label htmlFor="category-parent">Parent division</Label>
          <Select
            value={parentId || "none"}
            onValueChange={(value) => setParentId(value === "none" ? "" : value)}
          >
            <SelectTrigger id="category-parent" className="mt-2 h-11 bg-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None — create a top-level division</SelectItem>
              {parents.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {categoryLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category-name">{parentId ? "Subsection name" : "Division name"}</Label>
          <Input
            id="category-name"
            required
            minLength={2}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={parentId ? "e.g. Cast-in-place concrete" : "e.g. Concrete"}
            className="mt-2 h-11 bg-surface"
          />
        </div>
        <div>
          <Label htmlFor="category-code">Specification code</Label>
          <Input
            id="category-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={parentId ? "e.g. 033000" : "e.g. 03"}
            className="mt-2 h-11 bg-surface font-mono"
          />
        </div>
        <div>
          <Label htmlFor="category-description">Description (optional)</Label>
          <Textarea
            id="category-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 bg-surface"
          />
        </div>
        <details className="rounded-lg border border-border p-3">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Advanced URL settings (optional)
          </summary>
          <Label htmlFor="category-slug" className="mt-3 block">
            URL name
          </Label>
          <Input
            id="category-slug"
            value={slug}
            minLength={2}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="Generated automatically from the name"
            className="mt-2 bg-surface"
          />
        </details>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="submit" disabled={saving}>
          {saving
            ? "Saving…"
            : initial
              ? "Save changes"
              : parentId
                ? "Create subsection"
                : "Create division"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ----------------------- Users ----------------------- */

function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const refresh = () => listUsers().then(setUsers);
  useEffect(() => {
    refresh();
  }, []);

  const onRoleChange = async (id: string, role: UserRole) => {
    await updateUserRole(id, role);
    toast.success("Role updated");
    refresh();
  };

  const onToggleActive = async (u: User) => {
    await setUserActive(u.id, !u.active);
    toast.success(u.active ? "Deactivated" : "Activated");
    refresh();
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="font-display text-lg uppercase tracking-wide">Users</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {u.email}
              </TableCell>
              <TableCell>
                <Select value={u.role} onValueChange={(v) => onRoleChange(u.id, v as UserRole)}>
                  <SelectTrigger className="h-8 w-28 bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge
                    variant={u.verified ? "default" : "secondary"}
                    className={u.verified ? "bg-emerald-600/20 text-emerald-400" : ""}
                  >
                    {u.verified ? "Verified" : "Unverified"}
                  </Badge>
                  <Badge variant={u.active ? "outline" : "destructive"} className="w-fit">
                    {u.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onToggleActive(u)}>
                  {u.active ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

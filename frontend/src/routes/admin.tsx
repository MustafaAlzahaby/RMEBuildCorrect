import { useEffect, useRef, useState, type FormEvent } from "react";
import { BookOpen, FolderKanban, Pencil, Plus, Shield, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { listCategories, createCategory, updateCategory, deleteCategory } from "@/api/categories";
import { listLessons, createLesson, updateLesson, deleteLesson, type LessonFormInput } from "@/api/lessons";
import { listUsers, setUserActive, updateUserRole } from "@/api/users";
import type { Category, Lesson, User, UserRole } from "@/types";
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
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage categories, guides and users.</p>
        </div>
      </header>

      <Tabs defaultValue="categories" className="flex flex-col gap-6 md:flex-row">
        <TabsList className="flex h-auto w-full flex-row gap-1 bg-surface p-1 md:w-56 md:flex-col md:items-stretch">
          <TabsTrigger value="categories" className="justify-start gap-2">
            <FolderKanban className="h-4 w-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="lessons" className="justify-start gap-2">
            <BookOpen className="h-4 w-4" /> Guides
          </TabsTrigger>
          <TabsTrigger value="users" className="justify-start gap-2">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent value="categories"><CategoriesAdmin /></TabsContent>
          <TabsContent value="lessons"><LessonsAdmin /></TabsContent>
          <TabsContent value="users"><UsersAdmin /></TabsContent>
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

  const refresh = () => listCategories().then(setItems);
  useEffect(() => { refresh(); }, []);

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
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary-gradient text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            </DialogHeader>
            <CategoryForm initial={editing} onSubmit={onSubmit} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead>Guides</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{c.description}</TableCell>
              <TableCell>{c.lessonCount}</TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}>
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
  onSubmit,
}: {
  initial: Category | null;
  onSubmit: (data: Omit<Category, "id" | "lessonCount">) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "BookOpen");

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit({ name, slug, description, icon });
      }}
      className="space-y-3"
    >
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 bg-surface" />
      </div>
      <div>
        <Label>Slug</Label>
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} required className="mt-1 bg-surface" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 bg-surface" />
      </div>
      <div>
        <Label>Icon (lucide name)</Label>
        <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="mt-1 bg-surface" />
      </div>
      <DialogFooter>
        <Button type="submit" className="bg-primary-gradient text-primary-foreground">Save</Button>
      </DialogFooter>
    </form>
  );
}

/* ----------------------- Lessons ----------------------- */

function LessonsAdmin() {
  const [items, setItems] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => {
    listLessons().then(setItems);
    listCategories().then(setCategories);
  };
  useEffect(() => { refresh(); }, []);

  const onSubmit = async (data: LessonFormInput) => {
    if (editing) {
      await updateLesson(editing.id, data);
      toast.success("Guide updated");
    } else {
      await createLesson(data);
      toast.success("Guide created");
    }
    setOpen(false);
    setEditing(null);
    refresh();
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-display text-lg uppercase tracking-wide">Guides</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary-gradient text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> New</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit guide" : "New guide"}</DialogTitle>
            </DialogHeader>
            <LessonForm initial={editing} categories={categories} onSubmit={onSubmit} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium">{l.title}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{l.categoryName}</TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(l); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    if (!confirm(`Delete "${l.title}"?`)) return;
                    await deleteLesson(l.id);
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

function LessonForm({
  initial,
  categories,
  onSubmit,
}: {
  initial: Lesson | null;
  categories: Category[];
  onSubmit: (data: LessonFormInput) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [bestPractices, setBestPractices] = useState(initial?.bestPractices ?? "");
  const [methodStatement, setMethodStatement] = useState(initial?.methodStatement ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const submitLesson = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("Choose a category before saving the guide.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        title,
        categoryId,
        description,
        instructions,
        bestPractices,
        methodStatement,
        videoUrl: initial?.videoUrl ?? "",
        images: initial?.images ?? [],
        pdfUrl: initial?.pdfUrl ?? "",
        videoFile,
        imageFiles,
        pdfFile,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save guide";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submitLesson}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 bg-surface" />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1 bg-surface" disabled={categories.length === 0}>
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categories.length === 0 && (
            <p className="mt-1 text-xs text-destructive">No categories are available.</p>
          )}
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 bg-surface" />
      </div>
      <div>
        <Label>Instructions</Label>
        <Textarea rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} className="mt-1 bg-surface" />
      </div>
      <div>
        <Label>Best Practices</Label>
        <Textarea rows={3} value={bestPractices} onChange={(e) => setBestPractices(e.target.value)} className="mt-1 bg-surface" />
      </div>
      <div>
        <Label>Method Statement</Label>
        <Textarea rows={3} value={methodStatement} onChange={(e) => setMethodStatement(e.target.value)} className="mt-1 bg-surface" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label>Video file</Label>
          <Input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="mt-1 bg-surface"
            onChange={(e) => {
              setVideoFile(e.target.files?.[0] ?? null);
              e.currentTarget.value = "";
            }}
          />
          {videoFile && (
            <SelectedFile
              file={videoFile}
              onRemove={() => {
                setVideoFile(null);
                if (videoInputRef.current) videoInputRef.current.value = "";
              }}
            />
          )}
        </div>
        <div>
          <Label>Image(s)</Label>
          <Input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="mt-1 bg-surface"
            onChange={(e) => {
              const selected = Array.from(e.target.files ?? []);
              setImageFiles((current) => [...current, ...selected]);
              e.currentTarget.value = "";
            }}
          />
          {imageFiles.map((file, index) => (
            <SelectedFile
              key={`${file.name}-${file.lastModified}-${index}`}
              file={file}
              onRemove={() => {
                setImageFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
                if (imageInputRef.current) imageInputRef.current.value = "";
              }}
            />
          ))}
        </div>
        <div>
          <Label>PDF</Label>
          <Input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="mt-1 bg-surface"
            onChange={(e) => {
              setPdfFile(e.target.files?.[0] ?? null);
              e.currentTarget.value = "";
            }}
          />
          {pdfFile && (
            <SelectedFile
              file={pdfFile}
              onRemove={() => {
                setPdfFile(null);
                if (pdfInputRef.current) pdfInputRef.current.value = "";
              }}
            />
          )}
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button
          type="submit"
          disabled={saving || categories.length === 0}
          className="bg-primary-gradient text-primary-foreground"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function SelectedFile({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="mt-2 flex min-w-0 items-center gap-2 border-l-2 border-primary/60 pl-2 text-xs">
      <span className="min-w-0 flex-1 truncate text-foreground" title={file.name}>
        {file.name}
      </span>
      <span className="shrink-0 text-muted-foreground">{formatFileSize(file.size)}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        title="Remove selected file"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ----------------------- Users ----------------------- */

function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const refresh = () => listUsers().then(setUsers);
  useEffect(() => { refresh(); }, []);

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
              <TableCell className="hidden text-muted-foreground md:table-cell">{u.email}</TableCell>
              <TableCell>
                <Select value={u.role} onValueChange={(v) => onRoleChange(u.id, v as UserRole)}>
                  <SelectTrigger className="h-8 w-28 bg-surface"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant={u.verified ? "default" : "secondary"} className={u.verified ? "bg-emerald-600/20 text-emerald-400" : ""}>
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

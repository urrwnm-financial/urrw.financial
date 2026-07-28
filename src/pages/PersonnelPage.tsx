import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Personnel } from "@/lib/types";
import { SUBJECT_GROUPS } from "@/lib/types";
import { addPersonnel, deletePersonnel, listPersonnel, updatePersonnel } from "@/lib/personnel-api";
import { useAuth } from "@/lib/auth-context";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Users,
  Loader2,
} from "lucide-react";

const emptyForm = {
  username: "",
  password: "",
  name: "",
  position: "",
  subjectGroup: SUBJECT_GROUPS[0] as string,
};

export default function PersonnelPage() {
  const { logout } = useAuth();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Personnel | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setLoadError("");
    try {
      const rows = await listPersonnel();
      setPersonnel(rows);
    } catch {
      setLoadError("โหลดข้อมูลบุคลากรไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return personnel;
    return personnel.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        p.subjectGroup.toLowerCase().includes(q),
    );
  }, [personnel, query]);

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowPassword(false);
    setDialogOpen(true);
  }

  function openEditDialog(p: Personnel) {
    setEditingId(p.id);
    setForm({
      username: p.username,
      password: "",
      name: p.name,
      position: p.position,
      subjectGroup: p.subjectGroup,
    });
    setFormError("");
    setShowPassword(false);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!form.username.trim() || !form.name.trim() || !form.position.trim()) {
      setFormError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (!editingId && !form.password.trim()) {
      setFormError("กรุณากรอกรหัสผ่าน");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editingId) {
        const updated = await updatePersonnel(editingId, form);
        setPersonnel((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await addPersonnel(form);
        setPersonnel((prev) => [created, ...prev]);
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      setFormError(message.includes("duplicate") ? "ชื่อผู้ใช้นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น" : "บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePersonnel(deleteTarget.id);
      setPersonnel((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setLoadError("ลบข้อมูลไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-primary/15 bg-background/80 shadow-[0_1px_0_hsl(var(--accent)/0.25)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 shrink items-center gap-2 sm:gap-2.5">
            <img
              src="/logo.png"
              alt="logo"
              className="h-9 w-9 shrink-0 object-contain drop-shadow-[0_4px_8px_rgba(15,23,42,0.35)] sm:h-10 sm:w-10"
            />
            <div className="min-w-0 leading-tight">
              <p
                className="animate-gradient-text truncate bg-clip-text text-xl font-extrabold tracking-tight text-transparent"
                style={{
                  fontFamily: "'Blern', sans-serif",
                  backgroundImage: "linear-gradient(90deg, #7a1f2b, #d4212c, #d4af37, #d4212c, #7a1f2b)",
                }}
              >
                Financial
              </p>
              <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
                ระบบติดตามแผนปฏิบัติการและงบประมาณราชกัญญาฯ
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">ระบบพร้อมใช้งาน</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground md:flex">
                ผู้ดูแลระบบ
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">บุคลากร</h2>
            <p className="text-sm text-muted-foreground">ทั้งหมด {personnel.length} คน</p>
          </div>
          <Button
            onClick={openAddDialog}
            className="gap-1.5 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            เพิ่มบุคลากร
          </Button>
        </div>

        <div className="relative mb-4 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อ ตำแหน่ง หรือกลุ่มสาระ..."
            className="rounded-lg pl-9"
          />
        </div>

        {loadError && (
          <div className="mb-4 border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {loadError}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-accent/25 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>ชื่อ</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>กลุ่มสาระการเรียนรู้</TableHead>
                <TableHead>ชื่อผู้ใช้</TableHead>
                <TableHead className="w-[100px] text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/50" />
                      <span className="text-sm">
                        {personnel.length === 0 ? "ยังไม่มีข้อมูลบุคลากร" : "ไม่พบข้อมูลที่ค้นหา"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.position}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-none font-normal">
                        {p.subjectGroup}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.username}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditDialog(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มบุคลากร"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">ชื่อ - นามสกุล</Label>
              <Input
                id="name"
                className="rounded-lg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="เช่น นายสมชาย ใจดี"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="position">ตำแหน่ง</Label>
              <Input
                id="position"
                className="rounded-lg"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="เช่น ครู, ครูผู้ช่วย, หัวหน้ากลุ่มสาระ"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subjectGroup">กลุ่มสาระการเรียนรู้</Label>
              <Select
                value={form.subjectGroup}
                onValueChange={(v) => setForm({ ...form, subjectGroup: v })}
              >
                <SelectTrigger id="subjectGroup" className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">ชื่อผู้ใช้ (Username)</Label>
              <Input
                id="username"
                className="rounded-lg"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="เช่น somchai.j"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">
                รหัสผ่าน (Password){" "}
                {editingId && <span className="font-normal text-muted-foreground">— เว้นว่างหากไม่เปลี่ยน</span>}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="rounded-lg pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingId ? "••••••••" : "กรอกรหัสผ่าน"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="rounded-lg"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {editingId ? "บันทึกการแก้ไข" : "เพิ่มบุคลากร"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ต้องการลบข้อมูลของ <span className="font-medium text-foreground">{deleteTarget?.name}</span> ใช่หรือไม่?
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setDeleteTarget(null)}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              className="rounded-lg"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              ลบข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

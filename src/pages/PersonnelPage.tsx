import { useEffect, useMemo, useRef, useState } from "react";
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
import { PREFIXES, SUBJECT_GROUPS } from "@/lib/types";
import { addPersonnel, deletePersonnel, listPersonnel, updatePersonnel } from "@/lib/personnel-api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/AppHeader";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Users,
  Loader2,
  ShieldAlert,
} from "lucide-react";

const emptyForm = {
  username: "",
  password: "",
  prefix: PREFIXES[0] as string,
  firstName: "",
  lastName: "",
  position: "",
  subjectGroup: SUBJECT_GROUPS[0] as string,
  role: "staff",
};

export default function PersonnelPage({ onBack }: { onBack: () => void }) {
  const { user, credentials } = useAuth();
  const isAdmin = user?.role === "admin";
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIsSelf, setEditingIsSelf] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Personnel | null>(null);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

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
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        p.subjectGroup.toLowerCase().includes(q),
    );
  }, [personnel, query]);

  function openAddDialog() {
    setEditingId(null);
    setEditingIsSelf(false);
    setForm(emptyForm);
    setFormError("");
    setFieldErrors({});
    setShowPassword(false);
    setDialogOpen(true);
  }

  function openEditDialog(p: Personnel) {
    setEditingId(p.id);
    setEditingIsSelf(p.username === user?.username);
    setForm({
      username: p.username,
      password: "",
      prefix: p.prefix,
      firstName: p.firstName,
      lastName: p.lastName,
      position: p.position,
      subjectGroup: p.subjectGroup,
      role: p.role,
    });
    setFormError("");
    setFieldErrors({});
    setShowPassword(false);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!credentials) return;

    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = "กรุณากรอกชื่อ";
    if (!form.lastName.trim()) errors.lastName = "กรุณากรอกนามสกุล";
    if (!form.position.trim()) errors.position = "กรุณากรอกตำแหน่ง";
    if (!form.username.trim()) errors.username = "กรุณากรอกชื่อผู้ใช้";
    if (!editingId && !form.password.trim()) errors.password = "กรุณากรอกรหัสผ่าน";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstRef = errors.firstName
        ? firstNameRef
        : errors.lastName
          ? lastNameRef
          : errors.position
            ? positionRef
            : errors.username
              ? usernameRef
              : passwordRef;
      firstRef.current?.focus();
      return;
    }

    setFieldErrors({});
    setSaving(true);
    setFormError("");
    try {
      if (editingId) {
        const updated = await updatePersonnel(credentials, editingId, form);
        setPersonnel((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        toast({ title: "บันทึกการแก้ไขสำเร็จ", description: `${updated.prefix}${updated.firstName} ${updated.lastName}` });
      } else {
        const created = await addPersonnel(credentials, form);
        setPersonnel((prev) => [created, ...prev]);
        toast({ title: "เพิ่มบุคลากรสำเร็จ", description: `${created.prefix}${created.firstName} ${created.lastName}` });
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("duplicate")) {
        setFieldErrors({ username: "ชื่อผู้ใช้นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น" });
        usernameRef.current?.focus();
      } else if (message.includes("last admin")) {
        setFormError("ต้องมีผู้ดูแลระบบเหลืออย่างน้อย 1 คน ไม่สามารถลดสิทธิ์คนนี้ได้");
      } else {
        setFormError("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !credentials) return;
    setDeleting(true);
    try {
      await deletePersonnel(credentials, deleteTarget.id);
      setPersonnel((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast({ title: "ลบข้อมูลสำเร็จ", description: `${deleteTarget.prefix}${deleteTarget.firstName} ${deleteTarget.lastName}` });
      setDeleteTarget(null);
    } catch {
      toast({ variant: "destructive", title: "ลบข้อมูลไม่สำเร็จ", description: "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        roleLabel="ผู้ดูแลระบบ"
        navSlot={
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-1.5 rounded-lg text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            กลับไปสแกนเอกสาร
          </Button>
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 flex items-start justify-between gap-4 sm:mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">บุคลากร</h1>
            <p className="text-sm text-muted-foreground">ข้อมูลบุคลากรทั้งหมด</p>
          </div>
          {isAdmin && (
            <Button size="sm" className="gap-1.5 rounded-lg" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              เพิ่มบุคลากร
            </Button>
          )}
        </div>

        {!isAdmin && (
          <div className="bento-cell flex flex-col items-center gap-3 p-8 text-center sm:p-12">
            <ShieldAlert className="h-10 w-10 text-destructive/70" />
            <div>
              <p className="font-semibold text-foreground">ต้องเป็นผู้ดูแลระบบ (admin)</p>
              <p className="mt-1 text-sm text-muted-foreground">
                บัญชีนี้ไม่มีสิทธิ์จัดการข้อมูลบุคลากร กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ
              </p>
            </div>
          </div>
        )}

        {isAdmin && (
        <>
        {loadError && (
          <div className="mb-4 border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {loadError}
          </div>
        )}

        <div className="bento-cell mb-4 p-3 sm:mb-6 sm:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อ ตำแหน่ง หรือกลุ่มสาระ..."
              aria-label="ค้นหาบุคลากร"
              className="rounded-lg border-none bg-transparent pl-9 shadow-none focus-visible:ring-1"
            />
          </div>
        </div>

        {loading && (
          <div className="bento-cell flex h-32 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bento-cell flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Users className="h-8 w-8 text-muted-foreground/50" />
            <span className="text-sm">
              {personnel.length === 0 ? "ยังไม่มีข้อมูลบุคลากร" : "ไม่พบข้อมูลที่ค้นหา"}
            </span>
          </div>
        )}

        {/* Mobile: stacked bento cards (table doesn't fit small screens) */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filtered.map((p) => (
              <div key={p.id} className="bento-cell p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {p.prefix}
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{p.position}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditDialog(p)}
                      aria-label={`แก้ไข ${p.prefix}${p.firstName} ${p.lastName}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(p)}
                      aria-label={`ลบ ${p.prefix}${p.firstName} ${p.lastName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-none font-normal">
                    {p.subjectGroup}
                  </Badge>
                  {p.role === "admin" && (
                    <Badge className="rounded-none font-normal">ผู้ดูแลระบบ</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{p.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop/tablet: table */}
        <div className="bento-cell hidden overflow-hidden sm:block">
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
              {!loading &&
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span>
                          {p.prefix}
                          {p.firstName} {p.lastName}
                        </span>
                        {p.role === "admin" && (
                          <Badge className="rounded-none font-normal">ผู้ดูแลระบบ</Badge>
                        )}
                      </div>
                    </TableCell>
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
                          aria-label={`แก้ไข ${p.prefix}${p.firstName} ${p.lastName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(p)}
                          aria-label={`ลบ ${p.prefix}${p.firstName} ${p.lastName}`}
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
        </>
        )}
      </main>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มบุคลากร"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prefix">คำนำหน้า</Label>
                <Select
                  value={form.prefix}
                  onValueChange={(v) => setForm({ ...form, prefix: v })}
                >
                  <SelectTrigger id="prefix" className="h-11 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PREFIXES.map((pre) => (
                      <SelectItem key={pre} value={pre}>
                        {pre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="firstName">
                  ชื่อ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  ref={firstNameRef}
                  value={form.firstName}
                  onChange={(e) => {
                    setForm({ ...form, firstName: e.target.value });
                    if (fieldErrors.firstName) setFieldErrors({ ...fieldErrors, firstName: "" });
                  }}
                  placeholder="เช่น สมชาย"
                  aria-invalid={!!fieldErrors.firstName}
                  className={cn("h-11 rounded-lg", fieldErrors.firstName && "border-destructive focus-visible:ring-destructive")}
                />
                {fieldErrors.firstName && <p className="text-xs text-destructive">{fieldErrors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">
                  นามสกุล <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  ref={lastNameRef}
                  value={form.lastName}
                  onChange={(e) => {
                    setForm({ ...form, lastName: e.target.value });
                    if (fieldErrors.lastName) setFieldErrors({ ...fieldErrors, lastName: "" });
                  }}
                  placeholder="เช่น ใจดี"
                  aria-invalid={!!fieldErrors.lastName}
                  className={cn("h-11 rounded-lg", fieldErrors.lastName && "border-destructive focus-visible:ring-destructive")}
                />
                {fieldErrors.lastName && <p className="text-xs text-destructive">{fieldErrors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="position">
                ตำแหน่ง <span className="text-destructive">*</span>
              </Label>
              <Input
                id="position"
                ref={positionRef}
                value={form.position}
                onChange={(e) => {
                  setForm({ ...form, position: e.target.value });
                  if (fieldErrors.position) setFieldErrors({ ...fieldErrors, position: "" });
                }}
                placeholder="เช่น ครู, ครูผู้ช่วย, หัวหน้ากลุ่มสาระ"
                aria-invalid={!!fieldErrors.position}
                className={cn("h-11 rounded-lg", fieldErrors.position && "border-destructive focus-visible:ring-destructive")}
              />
              {fieldErrors.position && <p className="text-xs text-destructive">{fieldErrors.position}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subjectGroup">กลุ่มสาระการเรียนรู้</Label>
              <Select
                value={form.subjectGroup}
                onValueChange={(v) => setForm({ ...form, subjectGroup: v })}
              >
                <SelectTrigger id="subjectGroup" className="h-11 rounded-lg">
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
              <Label htmlFor="role">สิทธิ์การใช้งาน</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
                disabled={editingIsSelf}
              >
                <SelectTrigger id="role" className="h-11 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">ผู้ใช้งานทั่วไป</SelectItem>
                  <SelectItem value="admin">ผู้ดูแลระบบ (admin)</SelectItem>
                </SelectContent>
              </Select>
              {editingIsSelf && (
                <p className="text-xs text-muted-foreground">ไม่สามารถแก้ไขสิทธิ์ของบัญชีตัวเองได้</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">
                ชื่อผู้ใช้ (Username) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                ref={usernameRef}
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: "" });
                }}
                placeholder="เช่น somchai.j"
                aria-invalid={!!fieldErrors.username}
                className={cn("h-11 rounded-lg", fieldErrors.username && "border-destructive focus-visible:ring-destructive")}
              />
              {fieldErrors.username && <p className="text-xs text-destructive">{fieldErrors.username}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">
                รหัสผ่าน (Password) {!editingId && <span className="text-destructive">*</span>}{" "}
                {editingId && <span className="font-normal text-muted-foreground">— เว้นว่างหากไม่เปลี่ยน</span>}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                  }}
                  placeholder={editingId ? "••••••••" : "กรอกรหัสผ่าน"}
                  aria-invalid={!!fieldErrors.password}
                  className={cn("h-11 rounded-lg pr-10", fieldErrors.password && "border-destructive focus-visible:ring-destructive")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
            </div>

            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" className="h-11 rounded-lg" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="h-11 rounded-lg"
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
            ต้องการลบข้อมูลของ{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.prefix}
              {deleteTarget?.firstName} {deleteTarget?.lastName}
            </span>{" "}
            ใช่หรือไม่?
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
          <DialogFooter>
            <Button variant="outline" className="h-11 rounded-lg" onClick={() => setDeleteTarget(null)}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              className="h-11 rounded-lg"
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

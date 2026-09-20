import { useEffect, useRef, useState } from "react";
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
import { AppHeader } from "@/components/AppHeader";
import { DOCUMENT_TYPES, FISCAL_YEARS } from "@/lib/types";
import type { DocumentScan } from "@/lib/types";
import { getScanFileUrl, listDocumentScans, updateDocumentScan } from "@/lib/scan-api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Loader2, Pencil, ScanLine, Users } from "lucide-react";

export default function RecentScansPage({
  onBack,
  onOpenPersonnel,
}: {
  onBack: () => void;
  onOpenPersonnel: () => void;
}) {
  const { user, credentials } = useAuth();
  const isAdmin = user?.role === "admin";

  const [scans, setScans] = useState<DocumentScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editingScan, setEditingScan] = useState<DocumentScan | null>(null);
  const [form, setForm] = useState({
    docType: DOCUMENT_TYPES[0] as string,
    fiscalYear: FISCAL_YEARS[0] as number,
    projectName: "",
    activityName: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const projectNameRef = useRef<HTMLInputElement>(null);
  const activityNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setLoadError("");
    try {
      const rows = await listDocumentScans();
      setScans(rows);
    } catch {
      setLoadError("โหลดรายการเอกสารไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(scan: DocumentScan) {
    setEditingScan(scan);
    setForm({
      docType: scan.docType,
      fiscalYear: scan.fiscalYear,
      projectName: scan.projectName,
      activityName: scan.activityName,
    });
    setFieldErrors({});
  }

  async function handleSave() {
    if (!editingScan || !credentials) return;

    const errors: Record<string, string> = {};
    if (!form.projectName.trim()) errors.projectName = "กรุณากรอกชื่อโครงการ";
    if (!form.activityName.trim()) errors.activityName = "กรุณากรอกชื่อกิจกรรม";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      (errors.projectName ? projectNameRef : activityNameRef).current?.focus();
      return;
    }

    setSaving(true);
    try {
      const updated = await updateDocumentScan(credentials, editingScan.id, form);
      setScans((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast({ title: "บันทึกการแก้ไขสำเร็จ", description: updated.projectName });
      setEditingScan(null);
    } catch {
      toast({ variant: "destructive", title: "บันทึกไม่สำเร็จ", description: "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        roleLabel={isAdmin ? "ผู้ดูแลระบบ" : "ทั่วไป"}
        navSlot={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5 rounded-lg text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              สแกนเอกสาร
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenPersonnel}
                className="gap-1.5 rounded-lg text-xs"
              >
                <Users className="h-3.5 w-3.5" />
                จัดการบุคลากร
              </Button>
            )}
          </div>
        }
      />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">เอกสารที่สแกนล่าสุด</h1>
        </div>

        {loadError && (
          <div className="mb-4 border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {loadError}
          </div>
        )}

        {loading && (
          <div className="bento-cell flex h-24 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!loading && scans.length === 0 && (
          <div className="bento-cell flex h-24 flex-col items-center justify-center gap-1 text-muted-foreground">
            <ScanLine className="h-5 w-5 text-muted-foreground/50" />
            <span className="text-xs">ยังไม่มีเอกสารที่บันทึก</span>
          </div>
        )}

        {!loading && scans.length > 0 && (
          <div className="space-y-2">
            {scans.map((s) => (
              <button
                key={s.id}
                onClick={() => openEdit(s)}
                className="bento-cell flex w-full items-center justify-between gap-3 p-3 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{s.projectName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.docType} · {s.activityName} · ปี {s.fiscalYear}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  <span>{s.scannedByUsername}</span>
                  <Pencil className="h-3.5 w-3.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!editingScan} onOpenChange={(open) => !open && setEditingScan(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลเอกสาร</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {editingScan && (
              <div
                className="mx-auto w-full max-w-[160px] overflow-hidden rounded-lg border border-accent/20"
                style={{ aspectRatio: 210 / 297 }}
              >
                <img
                  src={getScanFileUrl(editingScan.filePath)}
                  alt="เอกสารที่สแกน"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="editDocType">ประเภทเอกสาร</Label>
              <Select value={form.docType} onValueChange={(v) => setForm({ ...form, docType: v })}>
                <SelectTrigger id="editDocType" className="h-11 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editFiscalYear">ปีงบประมาณ</Label>
              <Select
                value={String(form.fiscalYear)}
                onValueChange={(v) => setForm({ ...form, fiscalYear: Number(v) })}
              >
                <SelectTrigger id="editFiscalYear" className="h-11 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FISCAL_YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editProjectName">
                ชื่อโครงการ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editProjectName"
                ref={projectNameRef}
                value={form.projectName}
                onChange={(e) => {
                  setForm({ ...form, projectName: e.target.value });
                  if (fieldErrors.projectName) setFieldErrors({ ...fieldErrors, projectName: "" });
                }}
                aria-invalid={!!fieldErrors.projectName}
                className={cn("h-11 rounded-lg", fieldErrors.projectName && "border-destructive focus-visible:ring-destructive")}
              />
              {fieldErrors.projectName && <p className="text-xs text-destructive">{fieldErrors.projectName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editActivityName">
                ชื่อกิจกรรม <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editActivityName"
                ref={activityNameRef}
                value={form.activityName}
                onChange={(e) => {
                  setForm({ ...form, activityName: e.target.value });
                  if (fieldErrors.activityName) setFieldErrors({ ...fieldErrors, activityName: "" });
                }}
                aria-invalid={!!fieldErrors.activityName}
                className={cn("h-11 rounded-lg", fieldErrors.activityName && "border-destructive focus-visible:ring-destructive")}
              />
              {fieldErrors.activityName && <p className="text-xs text-destructive">{fieldErrors.activityName}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="h-11 rounded-lg" onClick={() => setEditingScan(null)}>
              ยกเลิก
            </Button>
            <Button className="h-11 gap-1.5 rounded-lg" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

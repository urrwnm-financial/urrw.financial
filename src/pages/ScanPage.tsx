import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppHeader } from "@/components/AppHeader";
import { DOCUMENT_TYPES, FISCAL_YEARS } from "@/lib/types";
import { addDocumentScan } from "@/lib/scan-api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Camera,
  X,
  RotateCcw,
  Check,
  FileImage,
  Loader2,
  ScanLine,
  Users,
} from "lucide-react";

const emptyForm = {
  docType: DOCUMENT_TYPES[0] as string,
  fiscalYear: FISCAL_YEARS[0] as number,
  projectName: "",
  activityName: "",
};

const A4_RATIO = 210 / 297;

export default function ScanPage({
  onOpenPersonnel,
  onOpenRecentScans,
}: {
  onOpenPersonnel: () => void;
  onOpenRecentScans: () => void;
}) {
  const { user, credentials } = useAuth();
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "camera" | "preview">("form");
  const [cameraError, setCameraError] = useState("");
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const docTypeRef = useRef<HTMLButtonElement>(null);
  const fiscalYearRef = useRef<HTMLButtonElement>(null);
  const projectNameRef = useRef<HTMLInputElement>(null);
  const activityNameRef = useRef<HTMLInputElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!form.projectName.trim()) errors.projectName = "กรุณากรอกชื่อโครงการ";
    if (!form.activityName.trim()) errors.activityName = "กรุณากรอกชื่อกิจกรรม";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      (errors.projectName ? projectNameRef : activityNameRef).current?.focus();
      return false;
    }
    setFieldErrors({});
    return true;
  }

  async function startCamera() {
    if (!validateForm()) return;
    setCameraError("");
    setStep("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError("เปิดกล้องไม่สำเร็จ กรุณาอนุญาตการใช้กล้อง หรือเลือกไฟล์ PDF แทน");
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    const videoRatio = video.videoWidth / video.videoHeight;
    let sx: number, sy: number, sw: number, sh: number;
    if (videoRatio > A4_RATIO) {
      sh = video.videoHeight;
      sw = sh * A4_RATIO;
      sx = (video.videoWidth - sw) / 2;
      sy = 0;
    } else {
      sw = video.videoWidth;
      sh = sw / A4_RATIO;
      sx = 0;
      sy = (video.videoHeight - sh) / 2;
    }

    canvas.width = 1240;
    canvas.height = Math.round(1240 / A4_RATIO);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopCamera();
        setCapturedBlob(blob);
        setCapturedUrl(URL.createObjectURL(blob));
        setStep("preview");
      },
      "image/jpeg",
      0.92,
    );
  }

  function retake() {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedBlob(null);
    setCapturedUrl(null);
    startCamera();
  }

  function cancelCamera() {
    stopCamera();
    setCameraError("");
    setStep("form");
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCameraError("");
    setCapturedBlob(file);
    setCapturedUrl(URL.createObjectURL(file));
    setStep("preview");
  }

  async function confirmSave() {
    if (!capturedBlob || !credentials) return;
    setSaving(true);
    try {
      await addDocumentScan(credentials, form, capturedBlob);
      toast({ title: "บันทึกเอกสารสำเร็จ", description: form.projectName });
      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
      setCapturedBlob(null);
      setCapturedUrl(null);
      setForm(emptyForm);
      setStep("form");
    } catch {
      toast({ variant: "destructive", title: "บันทึกไม่สำเร็จ", description: "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setSaving(false);
    }
  }

  const fiscalYearLabel = useMemo(() => String(form.fiscalYear), [form.fiscalYear]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        roleLabel={isAdmin ? "ผู้ดูแลระบบ" : "ทั่วไป"}
        navSlot={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenRecentScans}
              className="gap-1.5 rounded-lg text-xs"
            >
              <ScanLine className="h-3.5 w-3.5" />
              เอกสารล่าสุด
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
          <h1 className="text-xl font-semibold tracking-tight text-foreground">สแกนเอกสาร</h1>
          <p className="text-sm text-muted-foreground">กรอกข้อมูลเอกสารก่อนสแกน (ขนาด A4)</p>
        </div>

        {step === "form" && (
          <div className="bento-cell space-y-4 p-4 sm:p-6">
            <div className="space-y-1.5">
              <Label htmlFor="docType">ประเภทเอกสาร</Label>
              <Select value={form.docType} onValueChange={(v) => setForm({ ...form, docType: v })}>
                <SelectTrigger id="docType" ref={docTypeRef} className="h-11 rounded-lg">
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
              <Label htmlFor="fiscalYear">ปีงบประมาณ</Label>
              <Select
                value={fiscalYearLabel}
                onValueChange={(v) => setForm({ ...form, fiscalYear: Number(v) })}
              >
                <SelectTrigger id="fiscalYear" ref={fiscalYearRef} className="h-11 rounded-lg">
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
              <Label htmlFor="projectName">
                ชื่อโครงการ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="projectName"
                ref={projectNameRef}
                value={form.projectName}
                onChange={(e) => {
                  setForm({ ...form, projectName: e.target.value });
                  if (fieldErrors.projectName) setFieldErrors({ ...fieldErrors, projectName: "" });
                }}
                placeholder="เช่น โครงการส่งเสริมการอ่าน"
                aria-invalid={!!fieldErrors.projectName}
                className={cn("h-11 rounded-lg", fieldErrors.projectName && "border-destructive focus-visible:ring-destructive")}
              />
              {fieldErrors.projectName && <p className="text-xs text-destructive">{fieldErrors.projectName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="activityName">
                ชื่อกิจกรรม <span className="text-destructive">*</span>
              </Label>
              <Input
                id="activityName"
                ref={activityNameRef}
                value={form.activityName}
                onChange={(e) => {
                  setForm({ ...form, activityName: e.target.value });
                  if (fieldErrors.activityName) setFieldErrors({ ...fieldErrors, activityName: "" });
                }}
                placeholder="เช่น กิจกรรมวันภาษาไทยแห่งชาติ"
                aria-invalid={!!fieldErrors.activityName}
                className={cn("h-11 rounded-lg", fieldErrors.activityName && "border-destructive focus-visible:ring-destructive")}
              />
              {fieldErrors.activityName && <p className="text-xs text-destructive">{fieldErrors.activityName}</p>}
            </div>

            {cameraError && (
              <p role="alert" className="text-sm text-destructive">
                {cameraError}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button onClick={startCamera} className="h-11 flex-1 gap-1.5 rounded-lg">
                <Camera className="h-4 w-4" />
                สแกนเอกสาร
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 gap-1.5 rounded-lg"
              >
                <FileImage className="h-4 w-4" />
                เลือกไฟล์ PDF แทน
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handleFilePicked}
                className="hidden"
              />
            </div>
          </div>
        )}

        {step === "camera" && (
          <div className="bento-cell flex flex-col items-center gap-4 p-4 sm:p-6">
            <div
              className="relative mx-auto w-full max-w-sm overflow-hidden rounded-xl bg-black"
              style={{ aspectRatio: A4_RATIO }}
            >
              <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
              <CornerBrackets />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              จัดเอกสารให้อยู่ในกรอบ แล้วกดถ่ายภาพ
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={cancelCamera} aria-label="ยกเลิกการสแกน" className="h-11 w-11">
                <X className="h-5 w-5" />
              </Button>
              <button
                onClick={capturePhoto}
                aria-label="ถ่ายภาพ"
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary bg-primary-foreground shadow-lg transition-transform active:scale-95"
              >
                <span className="h-12 w-12 rounded-full bg-primary" />
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                aria-label="เลือกไฟล์ PDF แทน"
                className="h-11 w-11"
              >
                <FileImage className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && capturedUrl && (
          <div className="bento-cell flex flex-col items-center gap-4 p-4 sm:p-6">
            <div
              className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-accent/20"
              style={{ aspectRatio: A4_RATIO }}
            >
              {capturedBlob?.type === "application/pdf" ? (
                <iframe src={capturedUrl} title="ตัวอย่างเอกสารที่สแกน" className="h-full w-full" />
              ) : (
                <img src={capturedUrl} alt="ตัวอย่างเอกสารที่สแกน" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={retake} className="h-11 flex-1 gap-1.5 rounded-lg" disabled={saving}>
                <RotateCcw className="h-4 w-4" />
                ถ่ายใหม่
              </Button>
              <Button onClick={confirmSave} className="h-11 flex-1 gap-1.5 rounded-lg" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                ยืนยันและบันทึก
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
}

function CornerBrackets() {
  const base = "absolute h-6 w-6 border-accent";
  return (
    <>
      <span className={cn(base, "left-2 top-2 border-l-4 border-t-4")} />
      <span className={cn(base, "right-2 top-2 border-r-4 border-t-4")} />
      <span className={cn(base, "bottom-2 left-2 border-b-4 border-l-4")} />
      <span className={cn(base, "bottom-2 right-2 border-b-4 border-r-4")} />
    </>
  );
}

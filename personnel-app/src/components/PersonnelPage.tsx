import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SUBJECT_GROUPS, type Personnel } from '@/types'
import {
  GraduationCap,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react'

interface PersonnelPageProps {
  personnel: Personnel[]
  onAdd: (p: Omit<Personnel, 'id'>) => void
  onUpdate: (id: string, p: Omit<Personnel, 'id'>) => void
  onDelete: (id: string) => void
  currentUser: string
  onLogout: () => void
}

const emptyForm: Omit<Personnel, 'id'> = {
  username: '',
  password: '',
  name: '',
  position: '',
  subjectGroup: SUBJECT_GROUPS[0],
}

export function PersonnelPage({
  personnel,
  onAdd,
  onUpdate,
  onDelete,
  currentUser,
  onLogout,
}: PersonnelPageProps) {
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Personnel, 'id'>>(emptyForm)
  const [showPassword, setShowPassword] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Personnel | null>(null)
  const [formError, setFormError] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return personnel
    return personnel.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        p.subjectGroup.toLowerCase().includes(q),
    )
  }, [personnel, query])

  function openAddDialog() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setShowPassword(false)
    setDialogOpen(true)
  }

  function openEditDialog(p: Personnel) {
    setEditingId(p.id)
    setForm({
      username: p.username,
      password: p.password,
      name: p.name,
      position: p.position,
      subjectGroup: p.subjectGroup,
    })
    setFormError('')
    setShowPassword(false)
    setDialogOpen(true)
  }

  function handleSubmit() {
    if (!form.username.trim() || !form.password.trim() || !form.name.trim() || !form.position.trim()) {
      setFormError('กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return
    }
    const duplicate = personnel.find(
      (p) => p.username === form.username && p.id !== editingId,
    )
    if (duplicate) {
      setFormError('ชื่อผู้ใช้นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น')
      return
    }

    if (editingId) {
      onUpdate(editingId, form)
    } else {
      onAdd(form)
    }
    setDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-slate-900 text-white">
              <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight text-slate-900">
                ระบบจัดการบุคลากร
              </h1>
              <p className="text-xs text-slate-500">เข้าสู่ระบบในชื่อ {currentUser}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-slate-600 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              บุคลากร
            </h2>
            <p className="text-sm text-slate-500">
              ทั้งหมด {personnel.length} คน
            </p>
          </div>
          <Button
            onClick={openAddDialog}
            className="gap-1.5 rounded-none bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            เพิ่มบุคลากร
          </Button>
        </div>

        <div className="relative mb-4 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อ ตำแหน่ง หรือกลุ่มสาระ..."
            className="rounded-none pl-9"
          />
        </div>

        <div className="border border-slate-200 bg-white">
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
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-slate-300" />
                      <span className="text-sm">
                        {personnel.length === 0 ? 'ยังไม่มีข้อมูลบุคลากร' : 'ไม่พบข้อมูลที่ค้นหา'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-slate-900">{p.name}</TableCell>
                  <TableCell className="text-slate-600">{p.position}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-none font-normal">
                      {p.subjectGroup}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{p.username}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        onClick={() => openEditDialog(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
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
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากร'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">ชื่อ - นามสกุล</Label>
              <Input
                id="name"
                className="rounded-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="เช่น นายสมชาย ใจดี"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="position">ตำแหน่ง</Label>
              <Input
                id="position"
                className="rounded-none"
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
                <SelectTrigger id="subjectGroup" className="rounded-none">
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
                className="rounded-none"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="เช่น somchai.j"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">รหัสผ่าน (Password)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="rounded-none pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="กรอกรหัสผ่าน"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-slate-400 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              className="rounded-none bg-slate-900 hover:bg-slate-800"
              onClick={handleSubmit}
            >
              {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มบุคลากร'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-none sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            ต้องการลบข้อมูลของ <span className="font-medium text-slate-900">{deleteTarget?.name}</span> ใช่หรือไม่?
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setDeleteTarget(null)}
            >
              ยกเลิก
            </Button>
            <Button
              className="rounded-none bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              ลบข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

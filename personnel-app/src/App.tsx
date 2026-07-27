import { useState } from 'react'
import { LoginPage } from '@/components/LoginPage'
import { PersonnelPage } from '@/components/PersonnelPage'
import type { Personnel } from '@/types'

const initialPersonnel: Personnel[] = [
  {
    id: crypto.randomUUID(),
    username: 'somchai.j',
    password: 'teach1234',
    name: 'นายสมชาย ใจดี',
    position: 'หัวหน้ากลุ่มสาระ',
    subjectGroup: 'คณิตศาสตร์',
  },
  {
    id: crypto.randomUUID(),
    username: 'suda.p',
    password: 'teach1234',
    name: 'นางสุดา พงษ์ไพศาล',
    position: 'ครู',
    subjectGroup: 'ภาษาไทย',
  },
  {
    id: crypto.randomUUID(),
    username: 'anan.k',
    password: 'teach1234',
    name: 'นายอนันต์ คำแก้ว',
    position: 'ครูผู้ช่วย',
    subjectGroup: 'วิทยาศาสตร์และเทคโนโลยี',
  },
]

function App() {
  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  function handleAdd(p: Omit<Personnel, 'id'>) {
    setPersonnel((prev) => [...prev, { ...p, id: crypto.randomUUID() }])
  }

  function handleUpdate(id: string, p: Omit<Personnel, 'id'>) {
    setPersonnel((prev) => prev.map((item) => (item.id === id ? { ...p, id } : item)))
  }

  function handleDelete(id: string) {
    setPersonnel((prev) => prev.filter((item) => item.id !== id))
  }

  if (!currentUser) {
    return <LoginPage personnel={personnel} onLogin={setCurrentUser} />
  }

  return (
    <PersonnelPage
      personnel={personnel}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
    />
  )
}

export default App

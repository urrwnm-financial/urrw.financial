export interface Personnel {
  id: string
  username: string
  password: string
  name: string
  position: string
  subjectGroup: string
}

export const SUBJECT_GROUPS = [
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และเทคโนโลยี',
  'สังคมศึกษา ศาสนา และวัฒนธรรม',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะ',
  'การงานอาชีพ',
  'ภาษาต่างประเทศ',
  'งานสนับสนุนการศึกษา',
] as const

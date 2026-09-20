export interface Personnel {
  id: string;
  username: string;
  prefix: string;
  firstName: string;
  lastName: string;
  position: string;
  subjectGroup: string;
  role: string;
}

export interface AuthUser {
  username: string;
  name: string;
  role: string;
}

export const PREFIXES = ["นาย", "นาง", "นางสาว", "ดร.", "ว่าที่ร้อยตรี"] as const;

export const SUBJECT_GROUPS = [
  "ภาษาไทย",
  "คณิตศาสตร์",
  "วิทยาศาสตร์และเทคโนโลยี",
  "สังคมศึกษา ศาสนา และวัฒนธรรม",
  "สุขศึกษาและพลศึกษา",
  "ศิลปะ",
  "การงานอาชีพ",
  "ภาษาต่างประเทศ",
  "งานสนับสนุนการศึกษา",
] as const;

export interface DocumentScan {
  id: string;
  docType: string;
  fiscalYear: number;
  projectName: string;
  activityName: string;
  filePath: string;
  scannedByUsername: string;
  createdAt: string;
}

export const DOCUMENT_TYPES = [
  "รายงานผลการดำเนินการ (มีลายเซ็น)",
  "โครงการ (มีลายเซ็น)",
  "ใบขออนุมัติใช้งบประมาณ",
  "บันทึกข้อไม่จัดกิจกรรม",
] as const;

export const FISCAL_YEARS = [2569, 2570, 2571, 2572] as const;

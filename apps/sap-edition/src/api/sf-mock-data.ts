// SAP SuccessFactors mock data — simulates OData responses
// Entities: FOCompany, FODepartment, Position, EmpJob, PerPersonal

export interface SFCompany {
  externalCode: string;
  name: string;
  country: string;
}

export interface SFDepartment {
  externalCode: string;
  name: string;
  nameEn: string;
  parentDepartment: string;
  headOfDepartment: string;
  costCenter: string;
}

export interface SFPosition {
  code: string;
  title: string;
  titleEn: string;
  department: string;
  jobCode: string;
  parentPosition: string;
  fte: number;
  location: string;
}

export interface SFEmpJob {
  userId: string;
  position: string;
  department: string;
  managerId: string;
  matrixManager: string;
  title: string;
  startDate: string;
  employmentType: string;
}

export interface SFPerson {
  userId: string;
  firstName: string;
  lastName: string;
  firstNameEn: string;
  lastNameEn: string;
  email: string;
  phone: string;
  photoUrl: string;
}

// ── Mock Data: Tymphany-like org structure ──

export const mockCompanies: SFCompany[] = [
  { externalCode: "CORP", name: "Tymphany Group", country: "TW" },
];

export const mockDepartments: SFDepartment[] = [
  { externalCode: "CORP-HQ", name: "總部", nameEn: "Headquarters", parentDepartment: "", headOfDepartment: "E001", costCenter: "CC-000" },
  { externalCode: "CORP-RD", name: "研發中心", nameEn: "R&D Center", parentDepartment: "CORP-HQ", headOfDepartment: "E003", costCenter: "CC-100" },
  { externalCode: "CORP-RD-SW", name: "軟體開發部", nameEn: "Software Dev", parentDepartment: "CORP-RD", headOfDepartment: "E004", costCenter: "CC-110" },
  { externalCode: "CORP-RD-HW", name: "硬體工程部", nameEn: "Hardware Eng", parentDepartment: "CORP-RD", headOfDepartment: "E005", costCenter: "CC-120" },
  { externalCode: "CORP-SALES", name: "全球業務處", nameEn: "Global Sales", parentDepartment: "CORP-HQ", headOfDepartment: "E006", costCenter: "CC-200" },
  { externalCode: "CORP-SALES-TW", name: "台灣業務", nameEn: "Taiwan Sales", parentDepartment: "CORP-SALES", headOfDepartment: "E007", costCenter: "CC-210" },
  { externalCode: "CORP-SALES-CN", name: "中國業務", nameEn: "China Sales", parentDepartment: "CORP-SALES", headOfDepartment: "E008", costCenter: "CC-220" },
  { externalCode: "CORP-HR", name: "人力資源處", nameEn: "Human Resources", parentDepartment: "CORP-HQ", headOfDepartment: "E009", costCenter: "CC-300" },
  { externalCode: "CORP-FIN", name: "財務處", nameEn: "Finance", parentDepartment: "CORP-HQ", headOfDepartment: "E010", costCenter: "CC-400" },
];

export const mockPositions: SFPosition[] = [
  { code: "POS-CEO", title: "執行長", titleEn: "CEO", department: "CORP-HQ", jobCode: "JC-CEO", parentPosition: "", fte: 1, location: "台北" },
  { code: "POS-COS", title: "幕僚長", titleEn: "Chief of Staff", department: "CORP-HQ", jobCode: "JC-COS", parentPosition: "POS-CEO", fte: 1, location: "台北" },
  { code: "POS-CTO", title: "技術長", titleEn: "CTO", department: "CORP-RD", jobCode: "JC-CTO", parentPosition: "POS-CEO", fte: 1, location: "台北" },
  { code: "POS-SW-MGR", title: "軟體開發經理", titleEn: "SW Dev Manager", department: "CORP-RD-SW", jobCode: "JC-MGR", parentPosition: "POS-CTO", fte: 1, location: "台北" },
  { code: "POS-HW-MGR", title: "硬體工程經理", titleEn: "HW Eng Manager", department: "CORP-RD-HW", jobCode: "JC-MGR", parentPosition: "POS-CTO", fte: 1, location: "深圳" },
  { code: "POS-COO", title: "營運長", titleEn: "COO", department: "CORP-SALES", jobCode: "JC-COO", parentPosition: "POS-CEO", fte: 1, location: "台北" },
  { code: "POS-TW-MGR", title: "台灣業務經理", titleEn: "TW Sales Mgr", department: "CORP-SALES-TW", jobCode: "JC-MGR", parentPosition: "POS-COO", fte: 1, location: "台北" },
  { code: "POS-CN-MGR", title: "中國業務經理", titleEn: "CN Sales Mgr", department: "CORP-SALES-CN", jobCode: "JC-MGR", parentPosition: "POS-COO", fte: 1, location: "深圳" },
  { code: "POS-CHRO", title: "人資長", titleEn: "CHRO", department: "CORP-HR", jobCode: "JC-CHRO", parentPosition: "POS-CEO", fte: 1, location: "台北" },
  { code: "POS-CFO", title: "財務長", titleEn: "CFO", department: "CORP-FIN", jobCode: "JC-CFO", parentPosition: "POS-CEO", fte: 1, location: "台北" },
  { code: "POS-ARCH", title: "首席架構師", titleEn: "Chief Architect", department: "CORP-RD", jobCode: "JC-ARCH", parentPosition: "POS-CTO", fte: 1, location: "台北" },
];

export const mockPersons: SFPerson[] = [
  { userId: "E001", firstName: "王", lastName: "大明", firstNameEn: "David", lastNameEn: "Wang", email: "david.wang@tymphany.com", phone: "+886-2-1234-5678", photoUrl: "" },
  { userId: "E002", firstName: "林", lastName: "小芳", firstNameEn: "Fang", lastNameEn: "Lin", email: "fang.lin@tymphany.com", phone: "", photoUrl: "" },
  { userId: "E003", firstName: "陳", lastName: "小華", firstNameEn: "Hua", lastNameEn: "Chen", email: "hua.chen@tymphany.com", phone: "", photoUrl: "" },
  { userId: "E004", firstName: "李", lastName: "大方", firstNameEn: "Frank", lastNameEn: "Lee", email: "frank.lee@tymphany.com", phone: "", photoUrl: "" },
  { userId: "E005", firstName: "張", lastName: "建國", firstNameEn: "JG", lastNameEn: "Zhang", email: "jg.zhang@tymphany.com", phone: "", photoUrl: "" },
  { userId: "E006", firstName: "張", lastName: "大帥", firstNameEn: "Tom", lastNameEn: "Chang", email: "tom.chang@tymphany.com", phone: "", photoUrl: "" },
  { userId: "E007", firstName: "孫", lastName: "六", firstNameEn: "Sam", lastNameEn: "Sun", email: "sam.sun@tymphany.com", phone: "", photoUrl: "" },
  { userId: "E008", firstName: "鄭", lastName: "九", firstNameEn: "Zoe", lastNameEn: "Cheng", email: "zoe.cheng@tymphany.com", phone: "", photoUrl: "" },
  { userId: "E009", firstName: "吳", lastName: "美麗", firstNameEn: "Mary", lastNameEn: "Wu", email: "mary.wu@tymphany.com", phone: "", photoUrl: "" },
  { userId: "E010", firstName: "陳", lastName: "美華", firstNameEn: "May", lastNameEn: "Chen", email: "may.chen@tymphany.com", phone: "", photoUrl: "" },
];

export const mockEmpJobs: SFEmpJob[] = [
  { userId: "E001", position: "POS-CEO", department: "CORP-HQ", managerId: "", matrixManager: "", title: "CEO", startDate: "2015-01-01", employmentType: "FT" },
  { userId: "E002", position: "POS-COS", department: "CORP-HQ", managerId: "E001", matrixManager: "", title: "Chief of Staff", startDate: "2020-03-15", employmentType: "FT" },
  { userId: "E003", position: "POS-CTO", department: "CORP-RD", managerId: "E001", matrixManager: "", title: "CTO", startDate: "2016-06-01", employmentType: "FT" },
  { userId: "E004", position: "POS-SW-MGR", department: "CORP-RD-SW", managerId: "E003", matrixManager: "", title: "SW Dev Manager", startDate: "2018-09-01", employmentType: "FT" },
  { userId: "E005", position: "POS-HW-MGR", department: "CORP-RD-HW", managerId: "E003", matrixManager: "", title: "HW Eng Manager", startDate: "2019-02-01", employmentType: "FT" },
  { userId: "E006", position: "POS-COO", department: "CORP-SALES", managerId: "E001", matrixManager: "", title: "COO", startDate: "2017-04-01", employmentType: "FT" },
  { userId: "E007", position: "POS-TW-MGR", department: "CORP-SALES-TW", managerId: "E006", matrixManager: "", title: "TW Sales Mgr", startDate: "2020-01-15", employmentType: "FT" },
  { userId: "E008", position: "POS-CN-MGR", department: "CORP-SALES-CN", managerId: "E006", matrixManager: "E003", title: "CN Sales Mgr", startDate: "2021-07-01", employmentType: "FT" },
  { userId: "E009", position: "POS-CHRO", department: "CORP-HR", managerId: "E001", matrixManager: "", title: "CHRO", startDate: "2019-11-01", employmentType: "FT" },
  { userId: "E010", position: "POS-CFO", department: "CORP-FIN", managerId: "E001", matrixManager: "", title: "CFO", startDate: "2018-01-15", employmentType: "FT" },
  // POS-ARCH is vacant — no EmpJob record
];

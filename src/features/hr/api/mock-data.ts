import type {
  AbsenceTrendPoint,
  Announcement,
  AttendanceMetrics,
  AttendanceOverviewPoint,
  AttendanceRecord,
  Department,
  DepartmentCostPoint,
  DepartmentDistributionPoint,
  Employee,
  EmployeeDocument,
  HeadcountGrowthPoint,
  HrKpis,
  LateTrendPoint,
  LeaveBalance,
  LeaveDashboardMetrics,
  LeaveRequest,
  OrgUnit,
  PayrollDashboardMetrics,
  PayrollEntry,
  PerformanceReview,
  SalaryCostPoint,
  Shift,
  TurnoverPoint,
  UpcomingEvent,
} from "../types"

const now = Date.now()
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString()
const daysFromNow = (n: number) => new Date(now + n * 86400000).toISOString()

// --- Departments ---

export const mockDepartments: Department[] = [
  { id: "dept-hr", name: "HR Department", code: "HR", managerId: "emp-3", managerName: "Thandar Oo", employeeCount: 4, status: "active" },
  { id: "dept-finance", name: "Finance Department", code: "FIN", managerId: "emp-4", managerName: "Zaw Myint", employeeCount: 6, status: "active" },
  { id: "dept-sales", name: "Sales Department", code: "SLS", managerId: "emp-1", managerName: "Aung Kyaw", employeeCount: 18, status: "active" },
  { id: "dept-warehouse", name: "Warehouse Department", code: "WHS", managerId: "emp-5", managerName: "Min Zaw", employeeCount: 12, status: "active" },
  { id: "dept-marketing", name: "Marketing Department", code: "MKT", employeeCount: 5, status: "active" },
]

// --- Organization Tree ---

export const mockOrgUnits: OrgUnit[] = [
  { id: "org-company", name: "Fashion ERP/POS Co.", type: "company", parentId: null },
  { id: "org-head-office", name: "Head Office", type: "office", parentId: "org-company" },
  { id: "org-hr", name: "HR Department", type: "department", parentId: "org-head-office" },
  { id: "org-finance", name: "Finance Department", type: "department", parentId: "org-head-office" },
  { id: "org-sales-dept", name: "Sales Department", type: "department", parentId: "org-head-office" },
  { id: "org-branch-office", name: "Branch Office", type: "office", parentId: "org-company" },
  { id: "org-store-a", name: "Store A — Yangon", type: "store", parentId: "org-branch-office" },
  { id: "org-store-b", name: "Store B — Mandalay", type: "store", parentId: "org-branch-office" },
  { id: "org-warehouse", name: "Central Warehouse", type: "warehouse", parentId: "org-branch-office" },
]

// --- Shifts ---

export const mockShifts: Shift[] = [
  { id: "shift-morning", name: "Morning Shift", startTime: "08:00", endTime: "17:00", breakMinutes: 60, workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], gracePeriodMinutes: 10 },
  { id: "shift-evening", name: "Evening Shift", startTime: "13:00", endTime: "22:00", breakMinutes: 45, workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], gracePeriodMinutes: 10 },
  { id: "shift-night", name: "Night Shift", startTime: "20:00", endTime: "05:00", breakMinutes: 45, workingDays: ["Mon", "Wed", "Fri", "Sat"], gracePeriodMinutes: 15 },
]

// --- Employees ---

export const mockEmployees: Employee[] = [
  {
    id: "emp-1",
    employeeCode: "EMP-0001",
    name: "Aung Kyaw",
    photoUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200",
    gender: "male",
    dateOfBirth: "1988-04-12",
    phone: "+95 9 111 222 33",
    email: "aung.kyaw@fashionerp.example",
    address: "12 Bogyoke Rd, Yangon",
    departmentId: "dept-sales",
    departmentName: "Sales Department",
    designation: "Sales Manager",
    branchId: "org-store-a",
    branchName: "Store A — Yangon",
    employmentType: "full_time",
    joiningDate: daysAgo(900),
    shiftId: "shift-morning",
    shiftName: "Morning Shift",
    workingHoursPerWeek: 45,
    location: "Yangon",
    status: "active",
  },
  {
    id: "emp-2",
    employeeCode: "EMP-0002",
    name: "Su Myat Noe",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    gender: "female",
    dateOfBirth: "1995-09-03",
    phone: "+95 9 222 333 44",
    email: "sumyat.noe@fashionerp.example",
    address: "45 Pyay Road, Yangon",
    departmentId: "dept-sales",
    departmentName: "Sales Department",
    designation: "Sales Associate",
    branchId: "org-store-a",
    branchName: "Store A — Yangon",
    employmentType: "full_time",
    joiningDate: daysAgo(150),
    managerId: "emp-1",
    managerName: "Aung Kyaw",
    shiftId: "shift-morning",
    shiftName: "Morning Shift",
    workingHoursPerWeek: 40,
    location: "Yangon",
    status: "active",
  },
  {
    id: "emp-3",
    employeeCode: "EMP-0003",
    name: "Thandar Oo",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
    gender: "female",
    dateOfBirth: "1985-01-20",
    phone: "+95 9 333 444 55",
    email: "thandar.oo@fashionerp.example",
    address: "8 Kaba Aye Pagoda Rd, Yangon",
    departmentId: "dept-hr",
    departmentName: "HR Department",
    designation: "HR Manager",
    branchId: "org-head-office",
    branchName: "Head Office",
    employmentType: "full_time",
    joiningDate: daysAgo(1200),
    shiftId: "shift-morning",
    shiftName: "Morning Shift",
    workingHoursPerWeek: 40,
    location: "Yangon",
    status: "active",
  },
  {
    id: "emp-4",
    employeeCode: "EMP-0004",
    name: "Zaw Myint",
    gender: "male",
    dateOfBirth: "1982-06-30",
    phone: "+95 9 444 555 66",
    email: "zaw.myint@fashionerp.example",
    address: "3 Kabar Aye Rd, Yangon",
    departmentId: "dept-finance",
    departmentName: "Finance Department",
    designation: "Finance Manager",
    branchId: "org-head-office",
    branchName: "Head Office",
    employmentType: "full_time",
    joiningDate: daysAgo(1500),
    shiftId: "shift-morning",
    shiftName: "Morning Shift",
    workingHoursPerWeek: 40,
    location: "Yangon",
    status: "active",
  },
  {
    id: "emp-5",
    employeeCode: "EMP-0005",
    name: "Min Zaw",
    gender: "male",
    dateOfBirth: "1990-11-08",
    phone: "+95 9 555 666 77",
    email: "min.zaw@fashionerp.example",
    address: "26th Street, Mandalay",
    departmentId: "dept-warehouse",
    departmentName: "Warehouse Department",
    designation: "Warehouse Supervisor",
    branchId: "org-warehouse",
    branchName: "Central Warehouse",
    employmentType: "full_time",
    joiningDate: daysAgo(600),
    shiftId: "shift-evening",
    shiftName: "Evening Shift",
    workingHoursPerWeek: 44,
    location: "Mandalay",
    status: "active",
  },
  {
    id: "emp-6",
    employeeCode: "EMP-0006",
    name: "Ei Ei Phyo",
    gender: "female",
    dateOfBirth: "1998-02-14",
    phone: "+95 9 666 777 88",
    email: "eiei.phyo@fashionerp.example",
    address: "Sukhumvit Rd, Bangkok",
    departmentId: "dept-marketing",
    departmentName: "Marketing Department",
    designation: "Marketing Executive",
    branchId: "org-store-b",
    branchName: "Store B — Mandalay",
    employmentType: "contract",
    joiningDate: daysAgo(25),
    shiftId: "shift-morning",
    shiftName: "Morning Shift",
    workingHoursPerWeek: 40,
    location: "Mandalay",
    status: "active",
  },
  {
    id: "emp-7",
    employeeCode: "EMP-0007",
    name: "Kyaw Thura",
    gender: "male",
    dateOfBirth: "1993-07-19",
    phone: "+95 9 777 888 99",
    email: "kyaw.thura@fashionerp.example",
    address: "Nimman Rd, Chiang Mai",
    departmentId: "dept-warehouse",
    departmentName: "Warehouse Department",
    designation: "Warehouse Staff",
    branchId: "org-warehouse",
    branchName: "Central Warehouse",
    employmentType: "part_time",
    joiningDate: daysAgo(60),
    managerId: "emp-5",
    managerName: "Min Zaw",
    shiftId: "shift-night",
    shiftName: "Night Shift",
    workingHoursPerWeek: 30,
    location: "Chiang Mai",
    status: "on_leave",
  },
]

// --- Attendance ---

export const mockAttendanceRecords: AttendanceRecord[] = [
  { id: "att-1", employeeId: "emp-1", employeeName: "Aung Kyaw", date: daysAgo(0), checkIn: "08:02", checkOut: "17:10", workingHours: 8.1, status: "present" },
  { id: "att-2", employeeId: "emp-2", employeeName: "Su Myat Noe", date: daysAgo(0), checkIn: "08:25", checkOut: "17:05", workingHours: 7.7, status: "late" },
  { id: "att-3", employeeId: "emp-3", employeeName: "Thandar Oo", date: daysAgo(0), checkIn: "07:58", checkOut: "16:55", workingHours: 8, status: "present" },
  { id: "att-4", employeeId: "emp-4", employeeName: "Zaw Myint", date: daysAgo(0), status: "absent", workingHours: 0 },
  { id: "att-5", employeeId: "emp-5", employeeName: "Min Zaw", date: daysAgo(0), checkIn: "13:05", checkOut: "22:00", workingHours: 8.9, status: "present" },
  { id: "att-6", employeeId: "emp-6", employeeName: "Ei Ei Phyo", date: daysAgo(0), checkIn: "08:10", checkOut: "12:30", workingHours: 4.3, status: "half_day" },
  { id: "att-7", employeeId: "emp-7", employeeName: "Kyaw Thura", date: daysAgo(0), status: "leave", workingHours: 0 },
  { id: "att-8", employeeId: "emp-1", employeeName: "Aung Kyaw", date: daysAgo(1), checkIn: "08:00", checkOut: "17:00", workingHours: 8, status: "present" },
  { id: "att-9", employeeId: "emp-2", employeeName: "Su Myat Noe", date: daysAgo(1), checkIn: "08:05", checkOut: "17:00", workingHours: 7.9, status: "present" },
]

export const attendanceMetrics: AttendanceMetrics = {
  present: 790,
  absent: 35,
  late: 42,
  earlyLeave: 12,
  overtime: 18,
}

export const attendanceOverview: AttendanceOverviewPoint[] = [
  { period: "Mon", present: 780, absent: 40, late: 30 },
  { period: "Tue", present: 795, absent: 30, late: 25 },
  { period: "Wed", present: 802, absent: 28, late: 20 },
  { period: "Thu", present: 788, absent: 42, late: 20 },
  { period: "Fri", present: 790, absent: 35, late: 25 },
  { period: "Sat", present: 720, absent: 60, late: 70 },
]

// --- Leave ---

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "lv-1",
    reference: "LV-2026-0301",
    employeeId: "emp-7",
    employeeName: "Kyaw Thura",
    type: "sick",
    startDate: daysAgo(1),
    endDate: daysFromNow(1),
    days: 3,
    reason: "Fever and flu symptoms",
    status: "hr_approved",
    createdAt: daysAgo(2),
  },
  {
    id: "lv-2",
    reference: "LV-2026-0302",
    employeeId: "emp-2",
    employeeName: "Su Myat Noe",
    type: "annual",
    startDate: daysFromNow(10),
    endDate: daysFromNow(14),
    days: 5,
    reason: "Family trip to Bagan",
    status: "manager_approved",
    createdAt: daysAgo(3),
  },
  {
    id: "lv-3",
    reference: "LV-2026-0303",
    employeeId: "emp-6",
    employeeName: "Ei Ei Phyo",
    type: "emergency",
    startDate: daysAgo(0),
    endDate: daysAgo(0),
    days: 1,
    reason: "Family emergency",
    status: "requested",
    createdAt: daysAgo(0),
  },
  {
    id: "lv-4",
    reference: "LV-2026-0290",
    employeeId: "emp-5",
    employeeName: "Min Zaw",
    type: "unpaid",
    startDate: daysAgo(20),
    endDate: daysAgo(18),
    days: 3,
    reason: "Personal matters",
    status: "rejected",
    createdAt: daysAgo(22),
  },
]

export const mockLeaveBalances: LeaveBalance[] = [
  { employeeId: "emp-1", type: "annual", entitled: 14, used: 4, remaining: 10 },
  { employeeId: "emp-1", type: "sick", entitled: 10, used: 1, remaining: 9 },
  { employeeId: "emp-2", type: "annual", entitled: 14, used: 2, remaining: 12 },
  { employeeId: "emp-2", type: "sick", entitled: 10, used: 0, remaining: 10 },
]

export const leaveDashboardMetrics: LeaveDashboardMetrics = {
  totalRequests: 132,
  pending: 18,
  approved: 98,
  rejected: 16,
}

// --- Payroll ---

export const mockPayrollEntries: PayrollEntry[] = [
  { id: "pr-1", employeeId: "emp-1", employeeName: "Aung Kyaw", period: "2026-07", basicSalary: 1200, allowance: 150, bonus: 100, deduction: 20, tax: 96, netSalary: 1334, status: "paid" },
  { id: "pr-2", employeeId: "emp-2", employeeName: "Su Myat Noe", period: "2026-07", basicSalary: 650, allowance: 80, bonus: 0, deduction: 10, tax: 44, netSalary: 676, status: "finance_approved" },
  { id: "pr-3", employeeId: "emp-3", employeeName: "Thandar Oo", period: "2026-07", basicSalary: 1400, allowance: 150, bonus: 0, deduction: 0, tax: 124, netSalary: 1426, status: "hr_reviewed" },
  { id: "pr-4", employeeId: "emp-4", employeeName: "Zaw Myint", period: "2026-07", basicSalary: 1450, allowance: 150, bonus: 200, deduction: 0, tax: 160, netSalary: 1640, status: "draft" },
  { id: "pr-5", employeeId: "emp-5", employeeName: "Min Zaw", period: "2026-07", basicSalary: 850, allowance: 100, bonus: 50, deduction: 15, tax: 58, netSalary: 927, status: "paid" },
]

export const payrollDashboardMetrics: PayrollDashboardMetrics = {
  totalSalary: 185000,
  processedPayroll: 142000,
  pendingPayroll: 43000,
  taxDeduction: 15400,
}

// --- Performance ---

export const mockPerformanceReviews: PerformanceReview[] = [
  {
    id: "perf-1",
    employeeId: "emp-2",
    employeeName: "Su Myat Noe",
    period: "q2",
    goals: [
      { id: "g-1", title: "Achieve $15,000 monthly sales target", achieved: true },
      { id: "g-2", title: "Complete customer service training", achieved: true },
    ],
    score: 4.5,
    managerFeedback: "Consistently exceeds sales targets and shows strong customer rapport.",
    createdAt: daysAgo(20),
  },
  {
    id: "perf-2",
    employeeId: "emp-6",
    employeeName: "Ei Ei Phyo",
    period: "q2",
    goals: [{ id: "g-3", title: "Launch Summer Sale campaign", achieved: true }],
    score: 4.0,
    managerFeedback: "Great creative work on the summer campaign; needs to improve reporting cadence.",
    createdAt: daysAgo(18),
  },
]

// --- HR Dashboard ---

export const hrKpis: HrKpis = {
  totalEmployees: 850,
  activeEmployees: 812,
  presentToday: 790,
  attendanceRatePercent: 93,
  onLeaveToday: 25,
  newEmployeesThisMonth: 15,
}

export const departmentDistribution: DepartmentDistributionPoint[] = [
  { department: "Sales", count: 320 },
  { department: "Warehouse", count: 210 },
  { department: "Finance", count: 65 },
  { department: "HR", count: 28 },
  { department: "Marketing", count: 42 },
  { department: "Other", count: 185 },
]

export const upcomingEvents: UpcomingEvent[] = [
  { id: "evt-1", title: "Su Myat Noe's Birthday", date: daysFromNow(2), type: "birthday" },
  { id: "evt-2", title: "Public Holiday — Martyrs' Day", date: daysFromNow(5), type: "holiday" },
  { id: "evt-3", title: "Aung Kyaw's Work Anniversary (3 years)", date: daysFromNow(9), type: "anniversary" },
  { id: "evt-4", title: "Q3 Performance Reviews Due", date: daysFromNow(21), type: "review" },
]

// --- Documents ---

export const mockEmployeeDocuments: EmployeeDocument[] = [
  { id: "doc-1", employeeId: "emp-1", filename: "national-id.pdf", category: "Identification", uploadedAt: daysAgo(900) },
  { id: "doc-2", employeeId: "emp-1", filename: "employment-contract.pdf", category: "Contract", uploadedAt: daysAgo(900) },
  { id: "doc-3", employeeId: "emp-2", filename: "national-id.pdf", category: "Identification", uploadedAt: daysAgo(150) },
]

// --- Announcements ---

export const mockAnnouncements: Announcement[] = [
  { id: "ann-1", title: "Summer Sale Kickoff Meeting", body: "All store staff please join the briefing this Friday at 9 AM.", date: daysAgo(1) },
  { id: "ann-2", title: "New Health Insurance Benefits", body: "Updated health insurance coverage takes effect August 1st. Check your email for details.", date: daysAgo(4) },
  { id: "ann-3", title: "Public Holiday Notice", body: "The office will be closed for Martyrs' Day on the upcoming holiday.", date: daysAgo(6) },
]

// --- HR Analytics ---

export const headcountGrowth: HeadcountGrowthPoint[] = [
  { period: "Feb", headcount: 780 },
  { period: "Mar", headcount: 795 },
  { period: "Apr", headcount: 805 },
  { period: "May", headcount: 818 },
  { period: "Jun", headcount: 835 },
  { period: "Jul", headcount: 850 },
]

export const turnoverTrend: TurnoverPoint[] = [
  { period: "Feb", turnoverRatePercent: 2.1 },
  { period: "Mar", turnoverRatePercent: 1.8 },
  { period: "Apr", turnoverRatePercent: 2.4 },
  { period: "May", turnoverRatePercent: 1.5 },
  { period: "Jun", turnoverRatePercent: 1.9 },
  { period: "Jul", turnoverRatePercent: 1.6 },
]

export const lateTrend: LateTrendPoint[] = [
  { period: "Feb", lateCount: 58 },
  { period: "Mar", lateCount: 51 },
  { period: "Apr", lateCount: 60 },
  { period: "May", lateCount: 45 },
  { period: "Jun", lateCount: 48 },
  { period: "Jul", lateCount: 42 },
]

export const absenceTrend: AbsenceTrendPoint[] = [
  { period: "Feb", absentCount: 40 },
  { period: "Mar", absentCount: 38 },
  { period: "Apr", absentCount: 44 },
  { period: "May", absentCount: 36 },
  { period: "Jun", absentCount: 39 },
  { period: "Jul", absentCount: 35 },
]

export const salaryCostTrend: SalaryCostPoint[] = [
  { period: "Feb", amount: 172000 },
  { period: "Mar", amount: 175000 },
  { period: "Apr", amount: 178000 },
  { period: "May", amount: 180000 },
  { period: "Jun", amount: 182500 },
  { period: "Jul", amount: 185000 },
]

export const departmentCost: DepartmentCostPoint[] = [
  { department: "Sales", amount: 68000 },
  { department: "Warehouse", amount: 42000 },
  { department: "Finance", amount: 28000 },
  { department: "HR", amount: 15000 },
  { department: "Marketing", amount: 18000 },
  { department: "Other", amount: 14000 },
]

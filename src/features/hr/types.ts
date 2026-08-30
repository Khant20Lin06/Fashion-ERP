/** Core domain types for the HR & Employee Management module. */

export type Gender = "male" | "female" | "other"
export type EmploymentType = "full_time" | "part_time" | "contract" | "intern"
export type EmployeeStatus = "active" | "inactive" | "terminated"

export type Employee = {
  id: string
  userId?: string
  assignmentId?: string
  employeeCode: string
  name: string
  photoUrl?: string
  gender?: Gender
  dateOfBirth: string
  phone: string
  email: string
  address: string
  departmentId: string
  departmentName: string
  designationId?: string
  designation: string
  branchId: string
  branchName: string
  joiningDate: string
  employmentType?: EmploymentType
  managerId?: string
  managerName?: string
  shiftId?: string
  shiftName?: string
  workingHoursPerWeek?: number
  location?: string
  status: EmployeeStatus
}

export type BranchStatus = "active" | "inactive"

export type Branch = {
  id: string
  code: string
  name: string
  status: BranchStatus
}

export type DesignationStatus = "active" | "inactive"

export type Designation = {
  id: string
  code: string
  name: string
  status: DesignationStatus
}

// --- Organization / Departments ---

export type DepartmentStatus = "active" | "inactive"

// No manager relationship exists anywhere on the backend Department entity.
export type Department = {
  id: string
  name: string
  code: string
  employeeCount: number
  status: DepartmentStatus
}

export type OrgUnitType = "company" | "office" | "department" | "store" | "warehouse"

export type OrgUnit = {
  id: string
  name: string
  type: OrgUnitType
  parentId: string | null
}

// --- Attendance ---

export type AttendanceStatus = "present" | "absent" | "late" | "half_day" | "leave" | "holiday"

export type AttendanceRecord = {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn?: string
  checkOut?: string
  workingHours: number
  status: AttendanceStatus
}

// No backend calculation exists for early-leave or overtime — attendance
// status is a raw caller-supplied enum, never derived from check-in/out
// times — so those two figures are omitted rather than hardcoded to 0.
export type AttendanceMetrics = {
  present: number
  absent: number
  late: number
  summaryDate?: string | null
}

// --- Shifts ---

export type Shift = {
  id: string
  name: string
  startTime: string
  endTime: string
  breakMinutes: number
  workingDays: string[]
  gracePeriodMinutes: number
}

// --- Leave ---

export type LeaveType = string
// Backend LeaveRequestStatus (exact enum): PENDING | APPROVED | REJECTED |
// CANCELLED — a single approval step, no manager-then-HR distinction.
export type LeaveStatus = "requested" | "approved" | "rejected" | "cancelled"

export type LeaveRequest = {
  id: string
  reference: string
  employeeId: string
  employeeName: string
  type: LeaveType
  typeLabel?: string
  startDate: string
  endDate: string
  days: number
  reason: string
  attachmentFilename?: string
  status: LeaveStatus
  createdAt: string
}

export type LeaveBalance = {
  employeeId: string
  type: LeaveType
  typeLabel?: string
  entitled: number
  used: number
  remaining: number
}

export type LeaveDashboardMetrics = {
  totalRequests: number
  pending: number
  approved: number
  rejected: number
}

// --- Payroll ---

export type PayrollStatus = "draft" | "hr_reviewed" | "finance_approved" | "paid"

export type PayrollEntry = {
  id: string
  employeeId: string
  employeeName: string
  period: string
  basicSalary: number
  allowance: number
  bonus: number
  deduction: number
  tax: number
  netSalary: number
  status: PayrollStatus
}

export type PayrollDashboardMetrics = {
  totalSalary: number
  processedPayroll: number
  pendingPayroll: number
  taxDeduction: number
}

// --- Performance ---

export type ReviewPeriod = "q1" | "q2" | "q3" | "q4" | "annual"

export type PerformanceGoal = {
  id: string
  title: string
  achieved: boolean
}

export type PerformanceReview = {
  id: string
  employeeId: string
  employeeName: string
  period: ReviewPeriod
  goals: PerformanceGoal[]
  score: number
  managerFeedback: string
  comments?: string
  createdAt: string
}

// --- HR Dashboard ---

export type HrKpis = {
  totalEmployees: number
  activeEmployees: number
  presentToday: number
  attendanceRatePercent: number
  onLeaveToday: number
  newEmployeesThisMonth: number
}

export type AttendanceOverviewPoint = {
  period: string
  present: number
  absent: number
  late: number
}

export type DepartmentDistributionPoint = {
  department: string
  count: number
}

export type UpcomingEvent = {
  id: string
  title: string
  date: string
  type: "holiday" | "birthday" | "anniversary" | "review"
}

// --- Documents (Employee Profile tab) ---

export type EmployeeDocument = {
  id: string
  employeeId: string
  filename: string
  category: string
  uploadedAt: string
}

// --- Announcements (ESS) ---

export type Announcement = {
  id: string
  title: string
  body: string
  date: string
}

// --- HR Analytics ---

export type HeadcountGrowthPoint = {
  period: string
  headcount: number
}

export type TurnoverPoint = {
  period: string
  turnoverRatePercent: number
}

export type LateTrendPoint = {
  period: string
  lateCount: number
}

export type AbsenceTrendPoint = {
  period: string
  absentCount: number
}

export type SalaryCostPoint = {
  period: string
  amount: number
}

export type DepartmentCostPoint = {
  department: string
  amount: number
}

export type HrFilters = {
  department?: string
  status?: string
}

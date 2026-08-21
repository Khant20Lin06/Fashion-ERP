/** Core domain types for Payroll Management. Mirrors the real backend
 * contract exactly (erp-pos fashion api src/modules/payroll) — confirmed
 * via direct controller/DTO/entity reads during the Phase 22 audit.
 *
 * All money fields are decimal strings (never numbers) — the backend
 * transmits DECIMAL(14,2)/DECIMAL(7,4) columns as strings to avoid
 * precision loss, and the frontend must not convert them to JS numbers
 * for anything other than display formatting.
 */

export type PayFrequency = "MONTHLY"

export type EmployeeCompensation = {
  id: string
  companyId: string
  employeeId: string
  effectiveFrom: string
  effectiveTo: string | null
  baseSalary: string
  currency: string
  payFrequency: PayFrequency
  createdAt: string
  updatedAt: string
}

export type PayrollComponentType = "EARNING" | "DEDUCTION" | "EMPLOYER_CONTRIBUTION"
export type PayrollCalculationType = "FIXED_AMOUNT" | "PERCENTAGE_OF_BASE"

export type PayrollComponent = {
  id: string
  companyId: string
  name: string
  code: string
  type: PayrollComponentType
  calculationType: PayrollCalculationType
  fixedAmount: string | null
  percentage: string | null
  isTaxable: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type EmployeePayrollComponent = {
  id: string
  employeeId: string
  payrollComponentId: string
  amount: string | null
  percentage: string | null
  effectiveFrom: string
  effectiveTo: string | null
  createdAt: string
}

export type UnpaidLeaveCalculation = "NONE" | "DAILY_RATE"

export type PayrollConfiguration = {
  id: string
  companyId: string
  defaultCurrency: string
  unpaidLeaveCalculation: UnpaidLeaveCalculation
  workingDaysPerMonth: number | null
  createdAt: string
  updatedAt: string
}

export type PayrollPeriodStatus = "OPEN" | "PROCESSING" | "FINALIZED" | "CANCELLED"

export type PayrollPeriod = {
  id: string
  companyId: string
  periodNumber: string
  name: string
  startDate: string
  endDate: string
  payDate: string
  status: PayrollPeriodStatus
  createdAt: string
  updatedAt: string
}

export type PayrollRunStatus = "DRAFT" | "PROCESSING" | "CALCULATED" | "FINALIZED" | "CANCELLED"

export type PayrollRun = {
  id: string
  companyId: string
  payrollPeriodId: string
  runNumber: string
  status: PayrollRunStatus
  employeeCount: number
  totalGrossPay: string
  totalDeductions: string
  totalNetPay: string
  startedAt: string | null
  completedAt: string | null
  finalizedAt: string | null
  createdBy: string
  finalizedBy: string | null
  createdAt: string
  updatedAt: string
}

export type PayrollRunEmployeeStatus = "CALCULATED" | "FINALIZED"

export type PayrollRunEmployeeItem = {
  id: string
  payrollComponentId: string | null
  componentNameSnapshot: string
  componentCodeSnapshot: string
  type: PayrollComponentType
  calculationTypeSnapshot: PayrollCalculationType
  amount: string
}

export type PayrollRunEmployee = {
  id: string
  payrollRunId: string
  employeeId: string
  employeeCodeSnapshot: string
  employeeNameSnapshot: string
  departmentSnapshot: string | null
  designationSnapshot: string | null
  baseSalarySnapshot: string
  grossPay: string
  totalDeductions: string
  netPay: string
  status: PayrollRunEmployeeStatus
  items?: PayrollRunEmployeeItem[]
}

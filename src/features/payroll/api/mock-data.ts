import type {
  EmployeeCompensation,
  PayrollComponent,
  PayrollConfiguration,
  PayrollPeriod,
  PayrollRun,
  PayrollRunEmployee,
} from "../types"

const now = Date.now()
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString()
const dateAgo = (n: number) => new Date(now - n * 86400000).toISOString().slice(0, 10)
const dateFromNow = (n: number) => new Date(now + n * 86400000).toISOString().slice(0, 10)

export const mockCompensationByEmployee: Record<string, EmployeeCompensation[]> = {
  "emp-1": [
    {
      id: "comp-1",
      companyId: "company-mock",
      employeeId: "emp-1",
      effectiveFrom: dateAgo(180),
      effectiveTo: null,
      baseSalary: "1500.00",
      currency: "USD",
      payFrequency: "MONTHLY",
      createdAt: daysAgo(180),
      updatedAt: daysAgo(180),
    },
  ],
}

export const mockPayrollComponents: PayrollComponent[] = [
  {
    id: "plc-1",
    companyId: "company-mock",
    name: "Housing Allowance",
    code: "HOUSING",
    type: "EARNING",
    calculationType: "FIXED_AMOUNT",
    fixedAmount: "200.00",
    percentage: null,
    isTaxable: true,
    isActive: true,
    assignmentCount: 0,
    historyCount: 0,
    canDelete: true,
    createdAt: daysAgo(200),
    updatedAt: daysAgo(200),
  },
  {
    id: "plc-2",
    companyId: "company-mock",
    name: "Income Tax",
    code: "TAX",
    type: "DEDUCTION",
    calculationType: "PERCENTAGE_OF_BASE",
    fixedAmount: null,
    percentage: "10.0000",
    isTaxable: false,
    isActive: true,
    assignmentCount: 0,
    historyCount: 0,
    canDelete: true,
    createdAt: daysAgo(200),
    updatedAt: daysAgo(200),
  },
]

export const mockPayrollConfiguration: PayrollConfiguration = {
  id: "plcfg-1",
  companyId: "company-mock",
  defaultCurrency: "USD",
  unpaidLeaveCalculation: "DAILY_RATE",
  workingDaysPerMonth: 22,
  createdAt: daysAgo(200),
  updatedAt: daysAgo(30),
}

export const mockPayrollPeriods: PayrollPeriod[] = [
  {
    id: "plp-1",
    companyId: "company-mock",
    periodNumber: "PP-2026-001",
    name: "January 2026",
    startDate: dateAgo(51),
    endDate: dateAgo(21),
    payDate: dateAgo(18),
    status: "FINALIZED",
    createdAt: daysAgo(55),
    updatedAt: daysAgo(18),
  },
  {
    id: "plp-2",
    companyId: "company-mock",
    periodNumber: "PP-2026-002",
    name: "February 2026",
    startDate: dateAgo(20),
    endDate: dateFromNow(9),
    payDate: dateFromNow(12),
    status: "OPEN",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
]

export const mockPayrollRuns: PayrollRun[] = [
  {
    id: "plr-1",
    companyId: "company-mock",
    payrollPeriodId: "plp-1",
    runNumber: "PR-2026-001",
    status: "FINALIZED",
    employeeCount: 1,
    totalGrossPay: "1700.00",
    totalDeductions: "150.00",
    totalNetPay: "1550.00",
    startedAt: daysAgo(19),
    completedAt: daysAgo(19),
    finalizedAt: daysAgo(18),
    createdBy: "user-mock",
    finalizedBy: "user-mock",
    createdAt: daysAgo(19),
    updatedAt: daysAgo(18),
  },
]

export const mockPayrollRunEmployees: PayrollRunEmployee[] = [
  {
    id: "plre-1",
    payrollRunId: "plr-1",
    employeeId: "emp-1",
    employeeCodeSnapshot: "EMP-001",
    employeeNameSnapshot: "Aye Chan Moe",
    departmentSnapshot: "Sales",
    designationSnapshot: "Sales Associate",
    baseSalarySnapshot: "1500.00",
    grossPay: "1700.00",
    totalDeductions: "150.00",
    netPay: "1550.00",
    status: "FINALIZED",
    items: [
      {
        id: "plrei-1",
        payrollComponentId: "plc-1",
        componentNameSnapshot: "Housing Allowance",
        componentCodeSnapshot: "HOUSING",
        type: "EARNING",
        calculationTypeSnapshot: "FIXED_AMOUNT",
        amount: "200.00",
      },
      {
        id: "plrei-2",
        payrollComponentId: "plc-2",
        componentNameSnapshot: "Income Tax",
        componentCodeSnapshot: "TAX",
        type: "DEDUCTION",
        calculationTypeSnapshot: "PERCENTAGE_OF_BASE",
        amount: "150.00",
      },
    ],
  },
]

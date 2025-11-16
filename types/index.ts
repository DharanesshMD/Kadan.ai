export interface UserInput {
  college: string;
  major: string;
  state: string;
  isPrivateCollege: boolean;
  isInStateStudent: boolean;
  age: number;
  currentSavings: number;
  expectedLoanAmount: number;
}

export interface CalculationResult {
  graduationYear: number;
  collegeState: string;
  isInState: boolean;
  tuitionPerYear: number;
  totalLoanAmount: number;
  averageSalary: number;
  takeHomeMonthly: number;
  monthlyLoanPayment: number;
  totalAmountPaid: number;
  totalInterestPaid: number;
  payoffAge: number;
  loanTermYears: number;
  taxBreakdown: {
    federal: number;
    state: number;
    fica: number;
  };
  idrPlan?: {
    planName: string;
    monthlyPayment: number;
    totalAmountPaid: number;
    totalInterestPaid: number;
    payoffYears: number;
    payoffAge: number;
    forgivenessPeriod: number;
    balanceAtForgiveness: number;
  };
  metadata: {
    collegeName: string;
    major: string;
    confidence: "high" | "medium" | "low";
    assumptions: string;
  };
}
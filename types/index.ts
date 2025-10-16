export interface UserInput {
  college: string;
  major: string;
  state: string;
  isPrivateCollege: boolean;
  age: number;
  currentSavings: number;
  expectedLoanAmount: number;
  workDuringCollege: boolean;
  graduateSchool: boolean;
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
  metadata: {
    collegeName: string;
    major: string;
    confidence: "high" | "medium" | "low";
    assumptions: string;
  };
}
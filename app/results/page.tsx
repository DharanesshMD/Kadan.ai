'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAllColleges } from '@/data/colleges';

export default function ResultsPage() {
  const router = useRouter();
  const { userInput, results, isLoading } = useApp();

  const allColleges = getAllColleges();
  const selectedCollege = allColleges.find(c => c.name === userInput?.college);
  const isCollegePrivate = selectedCollege?.isPrivate || false;

  useEffect(() => {
    if (!userInput || !results) {
      router.push('/input');
    }
  }, [userInput, results, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Analyzing Your Future...</h2>
          <p className="text-gray-600">Our AI is crunching the numbers</p>
        </div>
      </div>
    );
  }

  if (!results || !userInput) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  // Generate financial outlook data for the graph
  const financialOutlookData = () => {
    const data = [];
    const collegeCostPerYear = results.tuitionPerYear;
    let cumulativeDebt = 0;
    let cumulativeSalary = 0;

    // College years (0-3)
    for (let i = 0; i < 4; i++) {
      cumulativeDebt += collegeCostPerYear;
      data.push({
        year: i,
        label: `Year ${i + 1}`,
        debt: cumulativeDebt,
        salary: 0,
        type: 'College'
      });
    }

    // Post-college years (payoff period)
    const monthlyPayment = results.monthlyLoanPayment;
    let remainingDebt = results.totalLoanAmount;
    for (let i = 4; i <= results.loanTermYears + 4; i++) {
      cumulativeSalary += results.averageSalary;
      remainingDebt = Math.max(0, remainingDebt - (monthlyPayment * 12));
      data.push({
        year: i,
        label: `Year ${i + 1}`,
        debt: remainingDebt,
        salary: cumulativeSalary,
        type: 'Payoff'
      });
    }

    return data;
  };

  const debtVsSalaryData = () => {
    const data = [];
    const collegeCostPerYear = results.tuitionPerYear;
    const annualSalary = results.averageSalary;
    const monthlyPayment = results.monthlyLoanPayment;

    let totalDebt = 0;
    let totalSalary = 0;
    let remainingDebt = results.totalLoanAmount;

    // College years
    for (let i = 0; i < 4; i++) {
      totalDebt += collegeCostPerYear;
      data.push({
        year: i + 1,
        'Total Debt': totalDebt,
        'Cumulative Salary': totalSalary
      });
    }

    // Payoff years
    for (let i = 4; i <= results.loanTermYears + 4; i++) {
      remainingDebt = Math.max(0, remainingDebt - (monthlyPayment * 12));
      totalSalary += annualSalary;
      data.push({
        year: i + 1,
        'Total Debt': remainingDebt,
        'Cumulative Salary': totalSalary
      });
    }

    return data;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Financial Projection</h1>
          <p className="text-gray-600">Based on {userInput.college} • {userInput.major} • {userInput.state}</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(results.tuitionPerYear * 4)}
            </div>
            <div className="text-gray-600 text-sm">Total College Cost</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(results.averageSalary)}
            </div>
            <div className="text-gray-600 text-sm">Starting Salary</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(results.totalLoanAmount)}
            </div>
            <div className="text-gray-600 text-sm">Total Loans</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {results.loanTermYears} years
            </div>
            <div className="text-gray-600 text-sm">Payoff Timeline</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* College Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎓 College Analysis</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Tuition:</span>
                <span className="font-bold text-orange-600 text-lg">{formatCurrency(results.tuitionPerYear)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">College State:</span>
                <span className="font-semibold text-indigo-600">{results.collegeState}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">In-State Student:</span>
                <span className={`font-semibold ${isCollegePrivate ? 'text-gray-500' : (results.isInState ? 'text-green-600' : 'text-red-600')}`}>
                  {isCollegePrivate ? 'N/A' : (results.isInState ? 'Yes' : 'No')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Graduation:</span>
                <span className="font-semibold text-purple-600">{results.graduationYear}</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-800">Total 4-Year Cost:</span>
                <span className="text-blue-600">{formatCurrency(results.tuitionPerYear * 4)}</span>
              </div>
            </div>
          </div>

          {/* Career Projections */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">💼 Career Outlook</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Starting Salary:</span>
                <span className="font-bold text-green-600 text-lg">{formatCurrency(results.averageSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Take-Home:</span>
                <span className="font-bold text-emerald-600 text-lg">{formatCurrency(results.takeHomeMonthly)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Major:</span>
                <span className="font-semibold text-blue-600">{results.metadata.major}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Confidence Level:</span>
                <span className={`font-semibold capitalize ${results.metadata.confidence === 'high' ? 'text-green-600' : results.metadata.confidence === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>{results.metadata.confidence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Payoff Age:</span>
                <span className="font-semibold text-purple-600">{results.payoffAge} years old</span>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">💰 Loan Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Loan Amount:</span>
                <span className="font-bold text-blue-600 text-lg">{formatCurrency(results.totalLoanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-bold text-orange-600 text-lg">5.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Term:</span>
                <span className="font-semibold text-purple-600">{results.loanTermYears} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Payment:</span>
                <span className="font-bold text-yellow-600 text-lg">{formatCurrency(results.monthlyLoanPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-bold text-red-500 text-lg">{formatCurrency(results.totalInterestPaid)}</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-800">Total Repayment:</span>
                <span className="text-red-600">{formatCurrency(results.totalAmountPaid)}</span>
              </div>
              
              {/* Monthly Income vs Loan Payment Pie Chart */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Monthly Income vs Payment</h3>
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={[
                          {
                            name: 'Monthly Take-Home',
                            value: results.takeHomeMonthly,
                            fill: '#10b981'
                          },
                          {
                            name: 'Monthly Loan Payment',
                            value: results.monthlyLoanPayment,
                            fill: '#ef4444'
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 text-center space-y-2 w-full text-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded"></div>
                        <span className="text-gray-600">Income:</span>
                      </div>
                      <span className="font-bold text-green-600">{formatCurrency(results.takeHomeMonthly)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded"></div>
                        <span className="text-gray-600">Payment:</span>
                      </div>
                      <span className="font-bold text-red-600">{formatCurrency(results.monthlyLoanPayment)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Income-Driven Repayment (IDR) Plan */}
          {results.idrPlan && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">💳 Income-Driven Repayment (IDR)</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 mb-1">Plan Type</p>
                    <p className="text-2xl font-bold text-blue-600">{results.idrPlan.planName}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600 mb-1">Monthly Payment (IDR)</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(results.idrPlan.monthlyPayment)}</p>
                    <p className="text-xs text-gray-500 mt-1">vs Standard: {formatCurrency(results.monthlyLoanPayment)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <p className="text-sm text-gray-600 mb-1">Payoff Timeline</p>
                    <p className="text-2xl font-bold text-green-600">{results.idrPlan.payoffYears} years</p>
                    <p className="text-xs text-gray-500 mt-1">Age {results.idrPlan.payoffAge} when paid off</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                    <p className="text-sm text-gray-600 mb-1">Total Amount Paid (IDR)</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(results.idrPlan.totalAmountPaid)}</p>
                    <p className="text-xs text-gray-500 mt-1">vs Standard: {formatCurrency(results.totalAmountPaid)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                    <p className="text-sm text-gray-600 mb-1">Total Interest (IDR)</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(results.idrPlan.totalInterestPaid)}</p>
                    <p className="text-xs text-gray-500 mt-1">vs Standard: {formatCurrency(results.totalInterestPaid)}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                    <p className="text-sm text-gray-600 mb-1">Loan Forgiveness After</p>
                    <p className="text-2xl font-bold text-indigo-600">{results.idrPlan.forgivenessPeriod} years</p>
                    <p className="text-xs text-gray-500 mt-1">Tax implications may apply</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm text-gray-700">
                  <strong>ℹ️ Income-Driven Repayment Plans:</strong> IDR plans base your monthly payment on your discretionary income, typically resulting in lower monthly payments but potentially higher total interest. After 20-25 years of qualifying payments, remaining balance is forgiven (may be taxable).
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Financial Outlook Graph */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📈 Financial Outlook</h2>
          <div className="space-y-8">
            {/* Debt vs Salary Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 relative z-100">Debt vs Cumulative Salary Over Time</h3>
              <ResponsiveContainer width="100%" height={400} className="mt-6">
                <LineChart data={debtVsSalaryData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year"
                  />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Total Debt" 
                    stroke="#ef4444" 
                    dot={{ fill: '#ef4444' }}
                    name="Total Debt"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Cumulative Salary" 
                    stroke="#10b981" 
                    dot={{ fill: '#10b981' }}
                    name="Cumulative Salary"
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-2">The green line shows your cumulative earnings, while the red line shows your remaining debt.</p>
            </div>

            {/* Annual Breakdown Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">College Cost vs Annual Salary</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  {
                    name: 'College',
                    'Annual Cost': results.tuitionPerYear,
                    'Annual Salary': 0
                  },
                  {
                    name: 'Post-Grad',
                    'Annual Cost': results.monthlyLoanPayment * 12,
                    'Annual Salary': results.averageSalary
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Bar dataKey="Annual Cost" fill="#f97316" />
                  <Bar dataKey="Annual Salary" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-2">Compare your college costs with your post-graduation salary.</p>
            </div>

            {/* Financial Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Total Investment</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(results.tuitionPerYear * 4)}</p>
                <p className="text-xs text-gray-500 mt-1">4-year college cost</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm text-gray-600 mb-1">ROI Breakeven</p>
                <p className="text-2xl font-bold text-green-600">{results.payoffAge}</p>
                <p className="text-xs text-gray-500 mt-1">Years old when debt-free</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 mb-1">Income Advantage</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency((results.averageSalary - 40000) * (65 - results.payoffAge))}</p>
                <p className="text-xs text-gray-500 mt-1">Lifetime earning advantage*</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📋 Key Assumptions</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">{results.metadata.assumptions}</span>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mt-8 text-white">
          <h2 className="text-2xl font-semibold mb-4">🚀 Recommended Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <span>Apply for scholarships and grants early</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <span>Consider in-state tuition options</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <span>Build an emergency fund while in college</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <span>Start building credit responsibly</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => router.push('/input')}
            className="bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            ← Try Different Scenario
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            Start Over
          </button>
        </div>

        {/* Disclaimer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            * This analysis is for educational purposes only and should not be considered financial advice. 
            Actual costs and outcomes may vary significantly.
          </p>
        </div>
      </div>
    </div>
  );
}
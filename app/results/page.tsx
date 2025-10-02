'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useEffect } from 'react';

export default function ResultsPage() {
  const router = useRouter();
  const { userInput, results, isLoading } = useApp();

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
                <span className={`font-semibold ${results.isInState ? 'text-green-600' : 'text-red-600'}`}>{results.isInState ? 'Yes' : 'No'}</span>
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
            </div>
          </div>

          {/* Tax Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 Tax Impact</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Federal Tax:</span>
                <span className="font-bold text-red-600 text-lg">{(results.taxBreakdown.federal * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">State Tax:</span>
                <span className="font-bold text-orange-600 text-lg">{(results.taxBreakdown.state * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">FICA Tax:</span>
                <span className="font-bold text-purple-600 text-lg">{(results.taxBreakdown.fica * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Annual Salary:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(results.averageSalary)}</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-800">Monthly Take-Home:</span>
                <span className="text-green-600">
                  {formatCurrency(results.takeHomeMonthly)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assumptions */}
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
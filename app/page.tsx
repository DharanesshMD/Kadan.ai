'use client';

import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center text-black">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-4 text-black">
            KADAN.AI
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Your AI-Powered Student Loan Calculator
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-gray-200 shadow-lg">
          <h2 className="text-3xl font-semibold mb-6 text-black">
            Plan Your Financial Future
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Get personalized insights into your college costs, expected salary, and loan payoff timeline. 
            Our AI analyzes your major, location, and financial situation to provide accurate projections.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl mb-2">🎓</div>
              <h3 className="font-semibold mb-2 text-black">College Analysis</h3>
              <p className="text-sm text-gray-600">Research tuition costs and graduation rates</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <h3 className="font-semibold mb-2 text-black">Salary Projections</h3>
              <p className="text-sm text-gray-600">AI-powered career and income forecasting</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold mb-2 text-black">Loan Timeline</h3>
              <p className="text-sm text-gray-600">Detailed payoff scenarios and strategies</p>
            </div>
          </div>
        </div>

        <Link 
          href="/input"
          className="inline-block bg-black text-white font-semibold py-4 px-8 rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Start Your Analysis →
        </Link>

        <div className="mt-8 text-sm text-gray-600">
          <p>Powered by Google Gemma AI • Free to use • No registration required</p>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserInput } from '@/types';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { COLLEGES_BY_STATE, getCollegesByState } from '@/data/colleges';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const MAJORS = [
  'Computer Science', 'Engineering', 'Business Administration', 'Psychology', 'Biology',
  'English', 'Mathematics', 'Economics', 'Political Science', 'History', 'Chemistry',
  'Physics', 'Nursing', 'Education', 'Art', 'Music', 'Philosophy', 'Sociology',
  'Communications', 'Criminal Justice', 'Marketing', 'Finance', 'Accounting',
  'Pre-Med', 'Pre-Law', 'Environmental Science', 'International Relations'
];

export default function InputPage() {
  const router = useRouter();
  const { setUserInput, setResults, setIsLoading, isLoading } = useApp();
  
  const [formData, setFormData] = useState<UserInput>({
    college: '',
    state: '',
    major: '',
    isPrivateCollege: false,
    isInStateStudent: false,
    age: 18,
    currentSavings: 0,
    expectedLoanAmount: 0
  });
  
  const [collegeSearchInput, setCollegeSearchInput] = useState('');
  
  // Get colleges for selected state, filtered by privacy if needed
  const filteredColleges = useMemo(() => {
    if (!formData.state) return [];
    
    const collegesInState = getCollegesByState(formData.state);
    
    // Filter by private/public status if checkbox is checked
    const privacyFiltered = formData.isPrivateCollege 
      ? collegesInState.filter(college => college.isPrivate)
      : collegesInState;
    
    if (!collegeSearchInput.trim()) {
      return privacyFiltered;
    }
    
    const searchTerm = collegeSearchInput.toLowerCase();
    return privacyFiltered.filter(college =>
      college.name.toLowerCase().includes(searchTerm)
    );
  }, [formData.state, formData.isPrivateCollege, collegeSearchInput]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleCollegeSelect = (collegeName: string) => {
    setFormData(prev => ({
      ...prev,
      college: collegeName
    }));
    setCollegeSearchInput('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.college.trim()) {
      newErrors.college = 'College name is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.major) {
      newErrors.major = 'Major is required';
    }
    if (formData.age < 16 || formData.age > 30) {
      newErrors.age = 'Age must be between 16 and 30';
    }
    if (formData.currentSavings < 0) {
      newErrors.currentSavings = 'Savings cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setUserInput(formData);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      setResults(results);
      setIsLoading(false);
      router.push('/results');
    } catch (error) {
      console.error('Calculation error:', error);
      setIsLoading(false);
      alert('Failed to calculate. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-2xl z-10">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              <p className="ml-4 text-blue-700 text-lg font-semibold">Calculating your future...</p>
            </div>
          )}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tell Us About Yourself</h1>
            <p className="text-gray-600">We'll analyze your situation and provide personalized insights</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <Select
                name="state"
                value={formData.state}
                onValueChange={(value) => handleInputChange({ target: { name: 'state', value, type: 'text' } } as any as React.ChangeEvent<HTMLSelectElement>)}
              >
                <SelectTrigger className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>

            {/* Private College Filter */}
            {formData.state && (
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="isPrivateCollege"
                  name="isPrivateCollege"
                  checked={formData.isPrivateCollege}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivateCollege" className="ml-2 block text-sm text-gray-700">
                  Show only private colleges/universities
                </label>
              </div>
            )}

            {/* College Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College/University Name *
              </label>
              <div className="relative">
                <Select
                  name="college"
                  value={formData.college}
                  onValueChange={handleCollegeSelect}
                  disabled={!formData.state}
                >
                  <SelectTrigger className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white ${
                    errors.college ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.state ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <SelectValue placeholder="Select a college" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {filteredColleges.length > 0 ? (
                      filteredColleges.map((college) => (
                        <SelectItem key={college.name} value={college.name}>
                          <span className="flex items-center gap-2">
                            {college.name}
                            {college.isPrivate && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Private</span>}
                          </span>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        No colleges found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {errors.college && <p className="text-red-500 text-sm mt-1">{errors.college}</p>}
            </div>

            {/* Major */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Major *
              </label>
              <Select
                name="major"
                value={formData.major}
                onValueChange={(value) => handleInputChange({ target: { name: 'major', value, type: 'text' } } as any as React.ChangeEvent<HTMLSelectElement>)}
              >
                <SelectTrigger className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white ${
                  errors.major ? 'border-red-500' : 'border-gray-300'
                }`}>
                  <SelectValue placeholder="Select your major" />
                </SelectTrigger>
                <SelectContent>
                  {MAJORS.map((major) => (
                    <SelectItem key={major} value={major}>
                      {major}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.major && <p className="text-red-500 text-sm mt-1">{errors.major}</p>}
            </div>

            {/* Current Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Age *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                  errors.age ? 'border-red-500' : 'border-gray-300'
                }`}
                min="16"
                max="30"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            {/* Current Savings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Savings for College ($)
              </label>
              <input
                type="number"
                name="currentSavings"
                value={formData.currentSavings}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                  errors.currentSavings ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="1000"
              />
              {errors.currentSavings && <p className="text-red-500 text-sm mt-1">{errors.currentSavings}</p>}
            </div>

            {/* Expected Loan Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Loan Amount ($) - Leave 0 for AI estimation
              </label>
              <input
                type="number"
                name="expectedLoanAmount"
                value={formData.expectedLoanAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                min="0"
                step="1000"
              />
            </div>

            {/* In-State Student */}
            <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <input
                type="checkbox"
                id="isInStateStudent"
                name="isInStateStudent"
                checked={formData.isInStateStudent}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="isInStateStudent" className="ml-2 block text-sm text-gray-700">
                I am an in-state student (same state as college/university)
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Calculate My Future 🚀
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
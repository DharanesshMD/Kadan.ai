import { NextRequest, NextResponse } from 'next/server';
import { UserInput, CalculationResult } from '@/types';
import { getMasterPrompt } from '@/lib/prompts';

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY!;

const calculateWithGemini = async (input: UserInput): Promise<CalculationResult> => {
  const currentYear = new Date().getFullYear();
  const prompt = getMasterPrompt(input, currentYear);
  
  const headers = {
    "Authorization": `Bearer ${NVIDIA_API_KEY}`,
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  const payload = {
    "model": "google/gemma-3-27b-it",
    "messages": [
      {
        "role": "user",
        "content": prompt
      }
    ],
    "max_tokens": 2048,
    "temperature": 0.20,
    "top_p": 0.70,
    "stream": false
  };

  try {
    console.log("Making request to NVIDIA API...");
    console.log("API Key exists:", !!NVIDIA_API_KEY);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NVIDIA API Error Response:", errorText);
      throw new Error(`NVIDIA API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("NVIDIA API Response:", JSON.stringify(data, null, 2));
    
    // Extract the content from NVIDIA API response
    const content = data.choices[0].message.content;
    console.log("Extracted content:", content);
    
    // Remove markdown code blocks if present and extract JSON
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.replace(/```json\s*/, '').replace(/\s*```[\s\S]*$/, '');
    } else if (content.includes('```')) {
      jsonContent = content.replace(/```\s*/, '').replace(/\s*```[\s\S]*$/, '');
    }
    
    // Try to find JSON object boundaries
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
    }
    
    console.log("Cleaned JSON content:", jsonContent);
    
    // Parse JSON response
    const result: CalculationResult = JSON.parse(jsonContent);
    console.log("Parsed result:", result);
    
    return result;
  } catch (error) {
    console.error("NVIDIA API Error:", error);
    console.error("Error stack:", (error as Error).stack);
    throw new Error("Failed to calculate. Please try again.");
  }
};

export async function POST(req: NextRequest) {
  try {
    const userInput = await req.json();
    const results = await calculateWithGemini(userInput);
    return NextResponse.json(results);
  } catch (error) {
    console.error('API route calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate' }, { status: 500 });
  }
}
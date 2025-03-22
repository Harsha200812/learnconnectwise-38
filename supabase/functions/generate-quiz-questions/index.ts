
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const { subject, count = 5 } = await req.json()
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Initialize OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY') || ''
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is required')
    }
    
    const configuration = new Configuration({ apiKey: openAiKey })
    const openai = new OpenAIApi(configuration)
    
    // Generate quiz questions using OpenAI
    const promptText = `Create ${count} quiz questions about ${subject}. For each question, provide:
1. A clear question
2. Four possible answers (make sure exactly one is correct)
3. The correct answer
4. A brief explanation of why the answer is correct

Format the response as a JSON array of objects with these keys: question, options (array of strings), correctAnswer (one of the options), explanation.`

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: promptText,
      max_tokens: 1500,
      temperature: 0.7,
    })
    
    let questions = []
    
    try {
      // Try to parse the OpenAI response
      const responseText = response.data.choices[0].text?.trim() || ''
      
      // Look for JSON in the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        // Fallback to template questions if JSON parsing fails
        throw new Error('Failed to parse OpenAI response')
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      
      // Generate fallback questions
      questions = generateFallbackQuestions(subject, count)
    }
    
    // Add IDs to questions
    questions = questions.map((q, i) => ({
      id: `ai-${subject}-${Date.now()}-${i}`,
      ...q
    }))
    
    return new Response(
      JSON.stringify({ 
        success: true,
        questions 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        questions: generateFallbackQuestions('general', 3)
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    )
  }
})

// Fallback function to generate basic questions if AI fails
function generateFallbackQuestions(subject: string, count: number) {
  const templates = [
    { 
      question: `What is the main principle of ${subject}?`, 
      options: ['The scientific method', 'Empirical observation', 'Theoretical modeling', 'Historical analysis'],
      correctAnswer: 'The scientific method',
      explanation: `The scientific method is a fundamental principle in ${subject} that involves making observations, forming hypotheses, and testing them through experiments.`
    },
    {
      question: `Who is considered the founder of modern ${subject}?`, 
      options: ['Albert Einstein', 'Isaac Newton', 'Marie Curie', 'Charles Darwin'],
      correctAnswer: 'Isaac Newton',
      explanation: `Isaac Newton made groundbreaking contributions to ${subject} through his laws of motion and universal gravitation.`
    },
    {
      question: `Which of these is NOT related to ${subject}?`, 
      options: ['Quantum theory', 'Cellular division', 'Polynomial equations', 'Renaissance art'],
      correctAnswer: 'Renaissance art',
      explanation: `Renaissance art is primarily associated with the humanities and art history, not ${subject}.`
    },
    {
      question: `In ${subject}, what does the term "paradigm shift" refer to?`, 
      options: ['A fundamental change in approach', 'A mathematical formula', 'A laboratory technique', 'A historical period'],
      correctAnswer: 'A fundamental change in approach',
      explanation: `A paradigm shift in ${subject} represents a fundamental change in the basic concepts and practices of a discipline.`
    },
    {
      question: `Which field is most closely related to ${subject}?`, 
      options: ['Statistics', 'Philosophy', 'Engineering', 'Literature'],
      correctAnswer: 'Statistics',
      explanation: `Statistics is often closely related to ${subject} as it provides methods for analyzing and interpreting data.`
    }
  ]
  
  return templates.slice(0, count)
}

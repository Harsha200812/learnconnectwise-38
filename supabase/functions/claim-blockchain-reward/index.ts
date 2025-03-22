
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { resultId } = await req.json()
    
    if (!resultId) {
      throw new Error('resultId is required')
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get the quiz result
    const { data: result, error: resultError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .single()
      
    if (resultError) {
      throw new Error(`Failed to get quiz result: ${resultError.message}`)
    }
    
    if (!result) {
      throw new Error('Quiz result not found')
    }
    
    if (result.reward_claimed) {
      throw new Error('Reward has already been claimed')
    }
    
    if (result.score < 70) {
      throw new Error('Score is too low to claim reward (minimum 70%)')
    }
    
    // In a real implementation, this would interact with a blockchain
    // For now, we'll simulate success and update the database
    
    // Simulate blockchain transaction with a delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mark the reward as claimed
    const { error: updateError } = await supabase
      .from('quiz_results')
      .update({ reward_claimed: true })
      .eq('id', resultId)
      
    if (updateError) {
      throw new Error(`Failed to update quiz result: ${updateError.message}`)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Blockchain reward claimed successfully',
        transaction: {
          id: `tx-${Date.now()}`,
          amount: Math.round(result.score / 10), // Token amount based on score
          timestamp: new Date().toISOString()
        }
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
        message: error.message,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})

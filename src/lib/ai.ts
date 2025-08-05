const openRouterApiKey = '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 '; // Your API key
const openRouterModel = 'qwen/qwen3-coder';

export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

export interface DoctorContext {
  name: string;
  specialty: string;
  experience: string;
  personality: string;
}

const doctorContexts: Record<string, DoctorContext> = {
  mitchell: {
    name: 'Dr. Sarah Mitchell',
    specialty: 'Sports Physiotherapist',
    experience: '12 years of experience in sports rehabilitation and ACL recovery',
    personality:
      'Encouraging, detail-oriented, and focuses on proper form and gradual progression',
  },
  chen: {
    name: 'Dr. Marcus Chen',
    specialty: 'Orthopedic Surgeon',
    experience: '15 years of experience in joint surgery and trauma care',
    personality:
      'Professional, thorough, and emphasizes evidence-based treatment approaches',
  },
  rodriguez: {
    name: 'Emma Rodriguez',
    specialty: 'Physical Therapist',
    experience: '8 years of experience in manual therapy and post-surgical rehabilitation',
    personality:
      'Compassionate, patient-focused, and believes in holistic recovery approaches',
  },
  wilson: {
    name: 'Dr. James Wilson',
    specialty: 'Sports Medicine Doctor',
    experience: '20 years of experience in athletic performance and injury prevention',
    personality:
      'Motivational, performance-focused, and specializes in getting athletes back to peak condition',
  },
  park: {
    name: 'Dr. Lisa Park',
    specialty: 'Rehabilitation Specialist',
    experience: '10 years of experience in neurological rehabilitation and balance training',
    personality:
      'Patient, methodical, and excels at helping patients overcome complex challenges',
  },
  thompson: {
    name: 'Michael Thompson',
    specialty: 'Certified Personal Trainer',
    experience: '6 years of experience in corrective exercise and functional movement',
    personality:
      'Energetic, supportive, and focuses on building strength through proper movement patterns',
  },
};

export { doctorContexts };

// BMI Calculator — converts pounds, feet, inches to BMI number
function calculateBMI(pounds: number, feet: number, inches: number): number {
  const weightKg = pounds * 0.453592;
  const heightMeters = feet * 0.3048 + inches * 0.0254;
  const bmi = weightKg / (heightMeters * heightMeters);
  return Math.round(bmi * 10) / 10; // round to 1 decimal place
}

export async function generateAIResponse(
  message: string,
  doctorId: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<AIResponse> {
  let doctor = doctorContexts[doctorId];

  if (!doctor) {
    doctor = {
      name: 'Healthcare Professional',
      specialty: 'General Practice',
      experience: 'Experienced healthcare provider',
      personality: 'Professional, caring, and focused on patient wellbeing',
    };
  }

  try {
    return await generateOpenRouterResponse(message, doctor, conversationHistory);
  } catch (error) {
    console.error('AI Response Error:', error);
    return {
      content: "I'm experiencing some technical difficulties. Please try again in a moment.",
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Internal function to call OpenRouter API with properly formatted prompt
async function generateOpenRouterResponse(
  message: string,
  doctor: DoctorContext,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AIResponse> {
  try {
    const historyFormatted = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Adjusted system prompt instructing model NOT to recalc BMI
    const systemPrompt = `
You are ${doctor.name}, a ${doctor.specialty} with ${doctor.experience}.
Your personality: ${doctor.personality}.

INSTRUCTIONS FOR RESPONSE GENERATION:

- The user has provided their BMI calculated externally.
- Do NOT attempt to recalculate BMI or convert units.
- Keep responses brief, helpful, and natural—no fluff or long paragraphs.
- Speak like a real, caring physiotherapist—not a chatbot.
- Avoid formatting (no asterisks, numbered lists, emojis, markdown).
- Use short, clear paragraphs with one idea per sentence.
- Be warm, positive, and supportive—but don't overdo it.
- Give quick, practical advice. Focus on what the patient should do next.
- Never copy or repeat the user's question—respond naturally.
- Acknowledge progress or discomfort in 1–2 lines.
- If there's pain, recommend stopping and checking with a physio.
- Do not give medical diagnoses. Refer to a real professional if unsure.
- End with a short check-in or supportive line (e.g., "Let me know how that goes." / "You're on the right track." / "Happy to adjust if needed.").

TONE: Friendly, efficient, and human—not robotic or overly formal.
LENGTH: 1-2 short paragraphs max. No long essays.
`.trim();

    // Compose full chat messages to send to the model
    const messages = [
      { role: 'system', content: systemPrompt },
      ...historyFormatted,
      { role: 'user', content: message },
    ];

    // Call OpenRouter API chat completions endpoint
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error! status: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content;

    return {
      content: content || "I'm sorry, I couldn't generate a response.",
      success: true,
    };
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    return {
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'OpenRouter API error',
    };
  }
}

// Example Usage:

async function example() {
  const weightLb = 110;
  const heightFeet = 6;
  const heightInches = 6;

  // Calculate BMI correctly before sending prompt
  const bmi = calculateBMI(weightLb, heightFeet, heightInches);

  // Compose user message including pre-calculated BMI
  const userMessage = `
Hi, based on my weight of ${weightLb} pounds and height of ${heightFeet} feet ${heightInches} inches,
my BMI is approximately ${bmi}. Could you please provide advice tailored to this BMI?
  `.trim();

  // Generate AI response — doctor 'mitchell' (sports physiotherapist) as example
  const response = await generateAIResponse(userMessage, 'mitchell');

  if (response.success) {
    console.log('AI Response:', response.content);
  } else {
    console.error('AI Error:', response.error);
  }
}

// To run example (uncomment below):
// example();


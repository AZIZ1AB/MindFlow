import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are MindFlow, a warm and compassionate mental health check-in assistant. Your job is to have a gentle, supportive conversation to understand how the user is feeling.

Guidelines:
- Ask ONE question at a time, never multiple
- Be warm, empathetic, never clinical or robotic
- Ask about: sleep, mood, energy, social life, work/studies, appetite
- After 5-6 exchanges, say EXACTLY: "Thank you for sharing all of that with me 💙" then on a new line write: [READY_TO_ANALYZE]
- Never diagnose or give medical advice
- If user seems in crisis, always suggest calling a helpline immediately
- Keep responses short (2-3 sentences max)
- Start by asking how they are doing today`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 200,
      temperature: 0.7
    })

    const reply = completion.choices[0].message.content || ''
    const readyToAnalyze = reply.includes('[READY_TO_ANALYZE]')
    const cleanReply = reply.replace('[READY_TO_ANALYZE]', '').trim()

    return NextResponse.json({ reply: cleanReply, readyToAnalyze })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
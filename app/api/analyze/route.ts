import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const RECOMMENDATIONS = {
    low: [
        { title: 'Relaxation & Mindfulness', desc: 'Breathing exercises, meditation, and yoga prompts to reduce tension and restore calm.', tag: 'body & mind', color: '#4caf7d' },
        { title: 'Lifestyle Balance', desc: 'Tips on sleep hygiene, physical activity, boundaries, and maintaining a healthy routine.', tag: 'daily habits', color: '#f0b429' }
    ],
    medium: [
        { title: 'Social Connection', desc: 'Guided prompts to reach out to friends, family, or a support group to break isolation.', tag: 'relationships', color: '#4a9eff' },
        { title: 'Relaxation & Mindfulness', desc: 'Coping techniques, relaxation exercises, and encouragement to connect with a trusted person.', tag: 'body & mind', color: '#4caf7d' }
    ],
    high: [
        { title: 'Professional Support', desc: 'Referrals to therapists, counselors, and crisis helplines when signs indicate serious risk.', tag: 'expert care', color: '#7c6fcd' },
        { title: 'Social Connection', desc: 'Guided prompts to reach out to friends, family, or a support group immediately.', tag: 'relationships', color: '#4a9eff' }
    ]
}

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json()

        // Step 1: Generate summary
        const summaryCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: `Based on this mental health check-in conversation, write a detailed first-person summary (minimum 5 sentences) of what the user shared about their mental state. Cover: mood, energy, sleep, stress, social life, and any signs of distress. Be specific and use details from their answers. Start with "I".

Conversation:
${messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join('\n')}

Write ONLY the summary, no intro or explanation.`
                }
            ],
            max_tokens: 300
        })

        const summary = summaryCompletion.choices?.[0]?.message?.content || ''

        // Step 2: Send to Gradio Space
        const { Client } = await import('@gradio/client')
        const client = await Client.connect('StryCatt/mindflow-classifier')
        const result = await client.predict('/classify', { text: summary })

        console.log('SPACE RESULT:', JSON.stringify(result.data))

        const data = result.data as { label: string; score: number }[]
        const prediction = data[0]
        const label = prediction?.label || 'LOW'
        const score = prediction?.score || 0.5

        // Step 3: Risk logic using LOW/MEDIUM labels
        let riskLevel: 'low' | 'medium' | 'high'
        let riskLabel: string
        let riskColor: string
        let riskDesc: string

        if (label === 'LOW') {
            riskLevel = 'low'
            riskLabel = '🟢 Low Risk'
            riskColor = '#4caf7d'
            riskDesc = 'Preventive guidance'
        } else if (score < 0.85) {
            riskLevel = 'medium'
            riskLabel = '🟡 Medium Risk'
            riskColor = '#f0b429'
            riskDesc = 'Active support'
        } else {
            riskLevel = 'high'
            riskLabel = '🔴 High Risk'
            riskColor = '#e05c5c'
            riskDesc = 'Professional support recommended'
        }

        return NextResponse.json({
            summary,
            label,
            score,
            riskLevel,
            riskLabel,
            riskColor,
            riskDesc,
            recommendations: RECOMMENDATIONS[riskLevel]
        })

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Something went wrong'
        console.error('API ERROR:', message)
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
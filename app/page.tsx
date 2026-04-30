'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Recommendation {
  title: string
  desc: string
  tag: string
  color: string
}

interface Analysis {
  summary: string
  riskLabel: string
  riskColor: string
  riskDesc: string
  score: number
  recommendations: Recommendation[]
  error?: string
}

export default function MindFlow() {
  const [page, setPage] = useState<'landing' | 'chat'>('landing')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, analysis])

  async function startChat() {
    setPage('chat')
    setLoading(true)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] })
    })
    const data = await res.json()
    setMessages([{ role: 'assistant', content: data.reply }])
    setLoading(false)
  }

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages })
    })
    const data = await res.json()
    const assistantMsg: Message = { role: 'assistant', content: data.reply }
    const updatedMessages = [...newMessages, assistantMsg]
    setMessages(updatedMessages)
    setLoading(false)

    if (data.readyToAnalyze) {
      setAnalyzing(true)
      const analysisRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      })
      const analysisData = await analysisRes.json()
      setAnalysis(analysisData)
      setAnalyzing(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function reset() {
    setMessages([])
    setInput('')
    setAnalysis(null)
    setLoading(false)
    setAnalyzing(false)
    setPage('landing')
  }

  if (page === 'chat') return (
    <div style={{ minHeight: '100vh', background: '#f7f5f2', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #e8e4de', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600 }}>
          <span style={{ fontSize: 22 }}>🧠</span> MindFlow
        </div>
        <button onClick={reset} style={{ fontSize: 13, color: '#888', border: '1px solid #e8e4de', background: 'transparent', padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>
          ← Back
        </button>
      </nav>

      <div style={{ flex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '0 1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'slideIn 0.3s ease' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e8f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 10, flexShrink: 0, marginTop: 4 }}>🧠</div>
              )}
              <div style={{
                maxWidth: '75%', padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? '#1a1a2e' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#1a1a2e',
                fontSize: 14, lineHeight: 1.65,
                border: msg.role === 'assistant' ? '1px solid #e8e4de' : 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e8f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🧠</div>
              <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '18px 18px 18px 4px', padding: '12px 18px', display: 'flex', gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#ccc', animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {analyzing && (
            <div style={{ textAlign: 'center', padding: '1.5rem', background: '#fff', borderRadius: 16, border: '1px solid #e8e4de' }}>
              <div style={{ width: 32, height: 32, border: '2px solid #e8e4de', borderTop: '2px solid #7c6fcd', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 500, fontFamily: 'Fraunces, serif' }}>Analyzing your responses...</p>
              <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Running mental health assessment</p>
            </div>
          )}

          {analysis && !analysis.error && (
            <div style={{ animation: 'fadeUp 0.5s ease', marginTop: 8 }}>
              <div style={{ background: '#fff', border: `2px solid ${analysis.riskColor}40`, borderRadius: 16, padding: '1.4rem', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Assessment Result</div>
                <div style={{ fontSize: 24, fontFamily: 'Fraunces, serif', fontWeight: 600, color: analysis.riskColor, marginBottom: 4 }}>{analysis.riskLabel}</div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>{analysis.riskDesc}</div>
                <div style={{ fontSize: 13, color: '#666', background: '#f7f5f2', padding: '10px 14px', borderRadius: 10, lineHeight: 1.7, fontStyle: 'italic' }}>
                  "{analysis.summary}"
                </div>
              </div>

              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>📋 Recommended for you</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {(analysis.recommendations ?? []).map((rec, i) => (
                  <div key={i} style={{ background: '#fff', border: `1px solid ${rec.color}30`, borderRadius: 14, padding: '1rem' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{rec.title}</h3>
                    <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 8 }}>{rec.desc}</p>
                    <span style={{ fontSize: 11, color: rec.color, fontWeight: 500 }}>[{rec.tag}]</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', padding: '1rem', background: '#fff', borderRadius: 12, border: '1px solid #e8e4de' }}>
                <p style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6, marginBottom: 12 }}>⚠️ This is not a medical diagnosis. Please consult a professional if you are struggling.</p>
                <button onClick={reset} style={{ padding: '10px 24px', fontSize: 14, background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                  Start a new check-in
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {!analysis && (
          <div style={{ padding: '1rem 0 1.5rem', borderTop: '1px solid #e8e4de', display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your response..."
              disabled={loading || analyzing}
              style={{ flex: 1, padding: '12px 16px', fontSize: 14, background: '#fff', border: '1px solid #e8e4de', borderRadius: 12, color: '#1a1a2e', outline: 'none' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading || analyzing}
              style={{ padding: '12px 20px', fontSize: 18, background: input.trim() ? '#1a1a2e' : '#e8e4de', color: '#fff', border: 'none', borderRadius: 12, cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
            >→</button>
          </div>
        )}
      </div>
    </div>
  )

  // LANDING PAGE
  return (
    <div style={{ minHeight: '100vh', background: '#0c0c10', color: '#f0ede8', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)} }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.6s 0.1s ease forwards; opacity:0; }
        .fade-up-3 { animation: fadeUp 0.6s 0.2s ease forwards; opacity:0; }
        .fade-up-4 { animation: fadeUp 0.6s 0.3s ease forwards; opacity:0; }
        .card-hover { transition: all 0.2s ease; }
        .card-hover:hover { transform: translateY(-4px); border-color: #4a9eff40 !important; }
        .btn-main:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-main { transition: all 0.2s ease; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2rem', borderBottom: '1px solid #ffffff0f', position: 'sticky', top: 0, background: '#0c0c10ee', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🧠</span> MindFlow
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="#how" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>How it works</a>
          <a href="#features" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>Features</a>
          <button onClick={startChat} className="btn-main" style={{ fontSize: 13, fontWeight: 500, background: '#4a9eff', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer' }}>
            Start check-in
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '6rem 2rem 4rem', textAlign: 'center' }}>
        <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666', border: '1px solid #ffffff15', padding: '5px 16px', borderRadius: 20, marginBottom: '2rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4caf7d', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          AI-powered early depression risk detection
        </div>

        <h1 className="fade-up-2" style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: -2.5, marginBottom: '1.5rem' }}>
          Your mental health,<br />
          <span style={{ color: '#4a9eff', fontStyle: 'italic' }}>understood</span> by AI
        </h1>

        <p className="fade-up-3" style={{ fontSize: 18, color: '#666', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 520, margin: '0 auto 2.5rem' }}>
          MindFlow has a gentle conversation with you, then uses a trained AI classifier to detect early signs of depression and recommend personalized support.
        </p>

        <div className="fade-up-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={startChat} className="btn-main" style={{ padding: '14px 32px', fontSize: 16, fontWeight: 500, background: '#4a9eff', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
            Begin check-in →
          </button>
          <a href="#how" style={{ padding: '14px 32px', fontSize: 16, color: '#666', border: '1px solid #ffffff15', borderRadius: 12, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s' }}>
            Learn more
          </a>
        </div>

        {/* STATS */}
        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #ffffff08', flexWrap: 'wrap' }}>
          {[['5 mins', 'Check-in time'], ['2 risk levels', 'LOW & MEDIUM'], ['Free', 'Always'], ['Private', 'No data stored']].map(([val, label]) => (
            <div key={val} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: '#4a9eff' }}>{val}</div>
              <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" style={{ maxWidth: 900, margin: '0 auto', padding: '5rem 2rem' }}>
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#444', textAlign: 'center', marginBottom: 12 }}>How it works</p>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, textAlign: 'center', letterSpacing: -1, marginBottom: '3rem' }}>
          Three simple steps
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { step: '01', icon: '💬', title: 'Have a conversation', desc: 'MindFlow asks you 5 gentle questions about your mood, sleep, energy, and social life.' },
            { step: '02', icon: '🧠', title: 'AI analyzes responses', desc: 'Your answers are summarized and passed through our trained DistilBert classifier.' },
            { step: '03', icon: '📋', title: 'Get personalized guidance', desc: 'Receive your risk assessment and tailored recommendations based on your results.' }
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="card-hover" style={{ background: '#13131a', border: '1px solid #ffffff0f', borderRadius: 16, padding: '1.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{icon}</span>
                <span style={{ fontSize: 11, color: '#333', fontWeight: 500 }}>{step}</span>
              </div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem 5rem' }}>
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#444', textAlign: 'center', marginBottom: 12 }}>Features</p>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, textAlign: 'center', letterSpacing: -1, marginBottom: '3rem' }}>
          Built for early detection
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: '🤖', title: 'Trained classifier', desc: 'Fine-tuned DistilBert model trained on real mental health data', color: '#4a9eff' },
            { icon: '💬', title: 'Natural conversation', desc: 'Powered by Llama 3.3 70B for warm, empathetic dialogue', color: '#4caf7d' },
            { icon: '🟢', title: 'Risk levels', desc: 'LOW and MEDIUM risk categories with tailored recommendations', color: '#f0b429' },
            { icon: '🔒', title: 'Private by design', desc: 'No accounts, no data stored, no tracking', color: '#7c6fcd' },
            { icon: '📋', title: '4 recommendation types', desc: 'Mindfulness, lifestyle, social connection, professional support', color: '#e05c5c' },
            { icon: '⚡', title: 'Instant results', desc: 'Full assessment completed in under 5 minutes', color: '#4a9eff' },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className="card-hover" style={{ background: '#13131a', border: '1px solid #ffffff0f', borderRadius: 14, padding: '1.4rem' }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, color }}>{title}</h3>
              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem 6rem', textAlign: 'center' }}>
        <div style={{ background: '#13131a', border: '1px solid #ffffff0f', borderRadius: 24, padding: '4rem 2rem' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, letterSpacing: -1, marginBottom: '1rem' }}>
            Ready to check in?
          </h2>
          <p style={{ fontSize: 15, color: '#555', marginBottom: '2rem', lineHeight: 1.7 }}>
            Takes 5 minutes. Free. Private. No account needed.
          </p>
          <button onClick={startChat} className="btn-main" style={{ padding: '14px 36px', fontSize: 16, fontWeight: 500, background: '#4a9eff', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
            Begin your check-in →
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #ffffff08', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          🧠 MindFlow
        </div>
        <p style={{ fontSize: 12, color: '#333', lineHeight: 1.7 }}>
          ⚠️ MindFlow is not a substitute for professional mental health care.<br />
          If you are in crisis, please contact a helpline immediately.
        </p>
      </footer>
    </div>
  )
}
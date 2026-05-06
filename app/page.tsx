'use client'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }
interface Recommendation { title: string; desc: string; tag: string; color: string }
interface Analysis {
  summary: string; riskLabel: string; riskColor: string; riskDesc: string
  score: number; recommendations: Recommendation[]; error?: string
}

/* ─── shared style tokens ─────────────────────────── */
const GRAD = 'linear-gradient(135deg,#4A9EBF,#6CC5A0)'
const BLUE = '#4A9EBF'
const TEAL = '#6CC5A0'
const BG   = '#080d10'
const BG2  = '#0d1418'
const BG3  = '#111a20'
const BORDER = '#1e3040'
const TEXT  = '#e8f4f8'
const MUTED = '#7fa8be'
const DIM   = '#3d6070'

export default function MindFlow() {
  const [page, setPage]         = useState<'landing'|'chat'>('landing')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis|null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, analysis])

  async function startChat() {
    setPage('chat'); setLoading(true)
    const res  = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({messages:[]}) })
    const data = await res.json()
    setMessages([{ role:'assistant', content:data.reply }])
    setLoading(false)
  }

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role:'user', content:input }
    const next = [...messages, userMsg]
    setMessages(next); setInput(''); setLoading(true)
    const res  = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({messages:next}) })
    const data = await res.json()
    const updated = [...next, { role:'assistant' as const, content:data.reply }]
    setMessages(updated); setLoading(false)
    if (data.readyToAnalyze) {
      setAnalyzing(true)
      const ar   = await fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({messages:updated}) })
      const ad   = await ar.json()
      setAnalysis(ad); setAnalyzing(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) { if (e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMessage() } }
  function reset() { setMessages([]); setInput(''); setAnalysis(null); setLoading(false); setAnalyzing(false); setPage('landing') }

  /* ═══════════════════════════════════════════════════
     CHAT PAGE
  ════════════════════════════════════════════════════ */
  if (page === 'chat') return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', flexDirection:'column', color:TEXT }}>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 2rem',
        background:`${BG2}dd`, backdropFilter:'blur(16px)', borderBottom:`1px solid ${BORDER}`, position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Fraunces,serif', fontSize:20, fontWeight:600 }}>
          <Image src="/logo.png" alt="MindFlow logo" width={32} height={32} style={{ borderRadius:'50%' }} />
          <span style={{ background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>MindFlow</span>
        </div>
        <button onClick={reset} style={{ fontSize:13, color:MUTED, border:`1px solid ${BORDER}`, background:'transparent',
          padding:'7px 16px', borderRadius:8, cursor:'pointer', transition:'all 0.2s' }}
          onMouseEnter={e=>(e.currentTarget.style.borderColor=BLUE)}
          onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
          ← Back
        </button>
      </nav>

      {/* Messages */}
      <div style={{ flex:1, maxWidth:700, width:'100%', margin:'0 auto', padding:'0 1rem', display:'flex', flexDirection:'column' }}>
        <div style={{ flex:1, padding:'2rem 0', display:'flex', flexDirection:'column', gap:16 }}>
          {messages.map((msg,i) => (
            <div key={i} style={{ display:'flex', justifyContent:msg.role==='user'?'flex-end':'flex-start', animation:'slideIn 0.3s ease' }}>
              {msg.role==='assistant' && (
                <div style={{ width:36, height:36, borderRadius:'50%', background:`${BLUE}20`, border:`1px solid ${BORDER}`,
                  display:'flex', alignItems:'center', justifyContent:'center', marginRight:10, flexShrink:0, marginTop:4, overflow:'hidden' }}>
                  <Image src="/logo.png" alt="AI" width={36} height={36} style={{ borderRadius:'50%' }} />
                </div>
              )}
              <div style={{
                maxWidth:'75%', padding:'12px 16px',
                borderRadius: msg.role==='user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role==='user' ? GRAD : BG3,
                color: msg.role==='user' ? '#fff' : TEXT,
                fontSize:14, lineHeight:1.7,
                border: msg.role==='assistant' ? `1px solid ${BORDER}` : 'none',
                boxShadow: msg.role==='user' ? `0 4px 16px ${BLUE}30` : '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', overflow:'hidden', border:`1px solid ${BORDER}` }}>
                <Image src="/logo.png" alt="AI" width={36} height={36} />
              </div>
              <div style={{ background:BG3, border:`1px solid ${BORDER}`, borderRadius:'18px 18px 18px 4px', padding:'13px 18px', display:'flex', gap:6 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:BLUE, animation:`pulse 1.2s ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {analyzing && (
            <div style={{ textAlign:'center', padding:'2rem', background:BG3, borderRadius:16, border:`1px solid ${BORDER}` }}>
              <div style={{ width:36, height:36, border:`2px solid ${BORDER}`, borderTop:`2px solid ${BLUE}`,
                borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto 14px' }} />
              <p style={{ fontSize:14, fontWeight:500, fontFamily:'Fraunces,serif', color:TEXT }}>Analyzing your responses…</p>
              <p style={{ fontSize:12, color:MUTED, marginTop:4 }}>Running mental health assessment</p>
            </div>
          )}

          {analysis && !analysis.error && (
            <div style={{ animation:'fadeUp 0.5s ease', marginTop:8 }}>
              {/* Risk card */}
              <div style={{ background:BG3, border:`1px solid ${BORDER}`, borderRadius:18, padding:'1.5rem', marginBottom:12,
                boxShadow:`0 0 30px ${BLUE}15` }}>
                <div style={{ fontSize:11, color:MUTED, textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>Assessment Result</div>
                <div style={{ fontSize:26, fontFamily:'Fraunces,serif', fontWeight:600, color:analysis.riskColor, marginBottom:4 }}>{analysis.riskLabel}</div>
                <div style={{ fontSize:13, color:MUTED, marginBottom:14 }}>{analysis.riskDesc}</div>
                <div style={{ fontSize:13, color:MUTED, background:BG2, padding:'12px 16px', borderRadius:10, lineHeight:1.75,
                  fontStyle:'italic', borderLeft:`3px solid ${BLUE}` }}>
                  "{analysis.summary}"
                </div>
              </div>

              <p style={{ fontSize:11, fontWeight:500, color:MUTED, textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>📋 Recommended for you</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                {(analysis.recommendations??[]).map((rec,i) => (
                  <div key={i} style={{ background:BG3, border:`1px solid ${BORDER}`, borderRadius:14, padding:'1rem',
                    transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=`${rec.color}60`}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER}}>
                    <h3 style={{ fontSize:13, fontWeight:500, marginBottom:6, color:TEXT }}>{rec.title}</h3>
                    <p style={{ fontSize:12, color:MUTED, lineHeight:1.6, marginBottom:8 }}>{rec.desc}</p>
                    <span style={{ fontSize:11, color:rec.color, fontWeight:500 }}>[{rec.tag}]</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign:'center', padding:'1.2rem', background:BG3, borderRadius:12, border:`1px solid ${BORDER}` }}>
                <p style={{ fontSize:11, color:DIM, lineHeight:1.7, marginBottom:12 }}>⚠️ This is not a medical diagnosis. Please consult a professional if you are struggling.</p>
                <button onClick={reset} style={{ padding:'10px 26px', fontSize:14, background:GRAD, color:'#fff', border:'none',
                  borderRadius:8, cursor:'pointer', fontWeight:500 }}>
                  Start a new check-in
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {!analysis && (
          <div style={{ padding:'1rem 0 1.5rem', borderTop:`1px solid ${BORDER}`, display:'flex', gap:10 }}>
            <input
              type="text"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your response…"
              disabled={loading||analyzing}
              style={{ flex:1, padding:'13px 18px', fontSize:14, background:BG3, border:`1px solid ${BORDER}`,
                borderRadius:12, color:TEXT, outline:'none', transition:'border-color 0.2s' }}
              onFocus={e=>(e.currentTarget.style.borderColor=BLUE)}
              onBlur={e=>(e.currentTarget.style.borderColor=BORDER)}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()||loading||analyzing}
              style={{ padding:'13px 22px', fontSize:18, background:input.trim()?GRAD:`${BORDER}`, color:'#fff',
                border:'none', borderRadius:12, cursor:input.trim()?'pointer':'not-allowed', transition:'all 0.2s',
                boxShadow:input.trim()?`0 4px 16px ${BLUE}40`:'none' }}>
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )

  /* ═══════════════════════════════════════════════════
     LANDING PAGE
  ════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight:'100vh', background:BG, color:TEXT, fontFamily:'DM Sans,sans-serif' }}>

      {/* Ambient glow blobs */}
      <div style={{ position:'fixed', top:'-20%', left:'-10%', width:'50vw', height:'50vw',
        background:`radial-gradient(circle, ${BLUE}12, transparent 70%)`, pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-15%', right:'-5%', width:'40vw', height:'40vw',
        background:`radial-gradient(circle, ${TEAL}10, transparent 70%)`, pointerEvents:'none', zIndex:0 }} />

      {/* ── NAV ─────────────────────────────────────── */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.1rem 2.5rem',
        borderBottom:`1px solid ${BORDER}`, position:'sticky', top:0, background:`${BG}ee`,
        backdropFilter:'blur(18px)', zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Fraunces,serif', fontSize:21, fontWeight:600 }}>
          <Image src="/logo.png" alt="MindFlow" width={34} height={34} style={{ borderRadius:'50%' }} />
          <span style={{ background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>MindFlow</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <a href="#how"      style={{ fontSize:13, color:MUTED, textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget.style.color=TEAL)} onMouseLeave={e=>(e.currentTarget.style.color=MUTED)}>How it works</a>
          <a href="#features" style={{ fontSize:13, color:MUTED, textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget.style.color=TEAL)} onMouseLeave={e=>(e.currentTarget.style.color=MUTED)}>Features</a>
          <button onClick={startChat} style={{ fontSize:13, fontWeight:500, background:GRAD, color:'#fff', border:'none',
            padding:'9px 20px', borderRadius:9, cursor:'pointer', boxShadow:`0 4px 16px ${BLUE}40`, transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 6px 22px ${BLUE}60`}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 4px 16px ${BLUE}40`}}>
            Start check-in
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <div style={{ maxWidth:920, margin:'0 auto', padding:'7rem 2rem 4rem', textAlign:'center', position:'relative', zIndex:1 }}>

        {/* Badge */}
        <div className="fade-up" style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12, color:MUTED,
          border:`1px solid ${BORDER}`, padding:'6px 18px', borderRadius:20, marginBottom:'2.2rem',
          background:`${BG3}aa`, backdropFilter:'blur(8px)' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:TEAL, display:'inline-block', animation:'pulse 2s infinite' }} />
          AI-powered early depression risk detection
        </div>

        {/* Logo mark */}
        <div className="fade-up-2" style={{ display:'flex', justifyContent:'center', marginBottom:'2rem' }}>
          <div style={{ width:100, height:100, borderRadius:'50%', background:`${BG3}`, border:`1px solid ${BORDER}`,
            display:'flex', alignItems:'center', justifyContent:'center', animation:'float 4s ease-in-out infinite',
            boxShadow:`0 0 40px ${BLUE}25, 0 0 80px ${TEAL}10` }}>
            <Image src="/logo.png" alt="MindFlow" width={90} height={90} style={{ borderRadius:'50%' }} />
          </div>
        </div>

        <h1 className="fade-up-3" style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(42px,7vw,76px)', fontWeight:600,
          lineHeight:1.04, letterSpacing:-2.5, marginBottom:'1.5rem' }}>
          Your mental health,<br />
          <span style={{ background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontStyle:'italic' }}>
            understood
          </span>{' '}by AI
        </h1>

        <p className="fade-up-4" style={{ fontSize:18, color:MUTED, lineHeight:1.85, marginBottom:'2.8rem',
          maxWidth:530, margin:'0 auto 2.8rem' }}>
          MindFlow has a gentle conversation with you, then uses a trained AI classifier to detect early signs of depression and recommend personalized support.
        </p>

        <div className="fade-up-5" style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={startChat} style={{ padding:'15px 36px', fontSize:16, fontWeight:500, background:GRAD, color:'#fff',
            border:'none', borderRadius:12, cursor:'pointer', boxShadow:`0 6px 24px ${BLUE}45`, transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 10px 32px ${BLUE}60`}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 6px 24px ${BLUE}45`}}>
            Begin check-in →
          </button>
          <a href="#how" style={{ padding:'15px 36px', fontSize:16, color:MUTED, border:`1px solid ${BORDER}`,
            borderRadius:12, cursor:'pointer', textDecoration:'none', transition:'all 0.2s', background:`${BG3}80` }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=BLUE; e.currentTarget.style.color=TEXT}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.color=MUTED}}>
            Learn more
          </a>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:'3rem', justifyContent:'center', marginTop:'5rem', paddingTop:'3rem',
          borderTop:`1px solid ${BORDER}`, flexWrap:'wrap' }}>
          {[['5 mins','Check-in time'],['2 risk levels','LOW & MEDIUM'],['Free','Always'],['Private','No data stored']].map(([val,label]) => (
            <div key={val} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:600, background:GRAD,
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{val}</div>
              <div style={{ fontSize:12, color:DIM, marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────── */}
      <div id="how" style={{ maxWidth:920, margin:'0 auto', padding:'6rem 2rem', position:'relative', zIndex:1 }}>
        <p style={{ fontSize:12, textTransform:'uppercase', letterSpacing:1.2, color:MUTED, textAlign:'center', marginBottom:12 }}>How it works</p>
        <h2 style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(28px,4vw,42px)', fontWeight:500, textAlign:'center',
          letterSpacing:-1, marginBottom:'3.5rem' }}>Three simple steps</h2>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:18 }}>
          {[
            { step:'01', icon:'💬', title:'Have a conversation', desc:'MindFlow asks you 5 gentle questions about your mood, sleep, energy, and social life.', color:BLUE },
            { step:'02', icon:'🧠', title:'AI analyzes responses', desc:'Your answers are summarized and passed through our trained DistilBert classifier.', color:TEAL },
            { step:'03', icon:'📋', title:'Get personalized guidance', desc:'Receive your risk assessment and tailored recommendations based on your results.', color:'#8b80d0' },
          ].map(({ step, icon, title, desc, color }) => (
            <div key={step} style={{ background:BG3, border:`1px solid ${BORDER}`, borderRadius:18, padding:'2rem',
              transition:'all 0.25s', cursor:'default' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor=`${color}50`; e.currentTarget.style.boxShadow=`0 12px 32px ${color}20`}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.boxShadow='none'}}>
              <div style={{ width:52, height:52, borderRadius:14, background:`${color}15`, border:`1px solid ${color}30`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:18 }}>
                {icon}
              </div>
              <div style={{ fontSize:11, color:DIM, fontWeight:500, marginBottom:8 }}>STEP {step}</div>
              <h3 style={{ fontFamily:'Fraunces,serif', fontSize:19, fontWeight:500, marginBottom:10, color:TEXT }}>{title}</h3>
              <p style={{ fontSize:13, color:MUTED, lineHeight:1.75 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ────────────────────────────────── */}
      <div id="features" style={{ maxWidth:920, margin:'0 auto', padding:'3rem 2rem 6rem', position:'relative', zIndex:1 }}>
        <p style={{ fontSize:12, textTransform:'uppercase', letterSpacing:1.2, color:MUTED, textAlign:'center', marginBottom:12 }}>Features</p>
        <h2 style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(28px,4vw,42px)', fontWeight:500, textAlign:'center',
          letterSpacing:-1, marginBottom:'3.5rem' }}>Built for early detection</h2>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
          {[
            { icon:'🤖', title:'Trained classifier', desc:'Fine-tuned DistilBert model trained on real mental health data', color:BLUE },
            { icon:'💬', title:'Natural conversation', desc:'Powered by Llama 3.3 70B for warm, empathetic dialogue', color:TEAL },
            { icon:'🟢', title:'Risk levels', desc:'LOW and MEDIUM risk categories with tailored recommendations', color:'#f0c87a' },
            { icon:'🔒', title:'Private by design', desc:'No accounts, no data stored, no tracking', color:'#8b80d0' },
            { icon:'📋', title:'4 recommendation types', desc:'Mindfulness, lifestyle, social connection, professional support', color:'#e07070' },
            { icon:'⚡', title:'Instant results', desc:'Full assessment completed in under 5 minutes', color:BLUE },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} style={{ background:BG3, border:`1px solid ${BORDER}`, borderRadius:15, padding:'1.5rem',
              transition:'all 0.25s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor=`${color}40`}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=BORDER}}>
              <div style={{ fontSize:26, marginBottom:12 }}>{icon}</div>
              <h3 style={{ fontSize:14, fontWeight:500, marginBottom:7, color }}>{title}</h3>
              <p style={{ fontSize:12, color:MUTED, lineHeight:1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────── */}
      <div style={{ maxWidth:920, margin:'0 auto', padding:'3rem 2rem 7rem', position:'relative', zIndex:1 }}>
        <div style={{ background:BG3, border:`1px solid ${BORDER}`, borderRadius:26, padding:'5rem 2rem', textAlign:'center',
          boxShadow:`0 0 60px ${BLUE}12, inset 0 0 60px ${TEAL}06` }}>
          <div style={{ width:72, height:72, borderRadius:'50%', margin:'0 auto 2rem', overflow:'hidden',
            boxShadow:`0 0 30px ${BLUE}35` }}>
            <Image src="/logo.png" alt="MindFlow" width={72} height={72} />
          </div>
          <h2 style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(30px,4vw,46px)', fontWeight:600,
            letterSpacing:-1, marginBottom:'1rem' }}>Ready to check in?</h2>
          <p style={{ fontSize:15, color:MUTED, marginBottom:'2.5rem', lineHeight:1.75 }}>
            Takes 5 minutes. Free. Private. No account needed.
          </p>
          <button onClick={startChat} style={{ padding:'16px 42px', fontSize:16, fontWeight:500, background:GRAD, color:'#fff',
            border:'none', borderRadius:12, cursor:'pointer', boxShadow:`0 6px 28px ${BLUE}50`, transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 10px 36px ${BLUE}65`}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 6px 28px ${BLUE}50`}}>
            Begin your check-in →
          </button>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{ borderTop:`1px solid ${BORDER}`, padding:'2.5rem 2rem', textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontFamily:'Fraunces,serif',
          fontSize:17, fontWeight:600, marginBottom:12 }}>
          <Image src="/logo.png" alt="MindFlow" width={26} height={26} style={{ borderRadius:'50%' }} />
          <span style={{ background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>MindFlow</span>
        </div>
        <p style={{ fontSize:12, color:DIM, lineHeight:1.8 }}>
          ⚠️ MindFlow is not a substitute for professional mental health care.<br />
          If you are in crisis, please contact a helpline immediately.
        </p>
      </footer>
    </div>
  )
}
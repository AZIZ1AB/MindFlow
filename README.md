# 🧠 MindFlow — Early Depression Risk Detection

MindFlow is an AI-powered mental health check-in web application that detects early signs of depression through natural conversation and a trained machine learning classifier.

---

## 🎯 Project Overview

MindFlow conducts a gentle 5-question conversation with the user, generates a first-person summary of their mental state, and passes it through a fine-tuned DistilBert binary classifier to predict depression risk level (LOW or MEDIUM). Based on the result, personalized recommendations are provided.

---

## 🏗️ System Architecture
User → Conversational AI (Groq / Llama 3.3 70B)
↓
Conversation Summary (Groq)
↓
Binary Classifier (DistilBert) → LOW / MEDIUM
↓
Personalized Recommendations
---

## 🤖 Models Used

| Model | Role | Source |
|---|---|---|
| Llama 3.3 70B (Groq) | Conversation + Summary generation | Groq API (free) |
| DistilBert fine-tuned | Depression risk classification | HuggingFace |

### Classifier
- **Model:** `amaranceur/mentalhhealthclassifier`
- **Architecture:** DistilBertForSequenceClassification
- **Labels:** `LABEL_0` → LOW risk, `LABEL_1` → MEDIUM risk
- **Input:** First-person summary of conversation (min 5 sentences)
- **Hosted on:** HuggingFace Space `StryCatt/mindflow-classifier`

---

## 📁 Project Structure

```text
mindflow/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts        # Groq conversation API
│   │   └── analyze/
│   │       └── route.ts        # Summary + HF classifier API
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # App layout
│   └── page.tsx               # Landing page + Chat UI
├── public/                    # Static assets
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ How It Works

### Step 1 — Conversation
Groq's Llama 3.3 70B model conducts a 5-question mental health check-in asking about:
- Mood and emotional state
- Sleep quality
- Energy levels
- Social life
- Daily routine and concentration

### Step 2 — Summary Generation
After 5 exchanges, Groq generates a detailed first-person summary (minimum 5 sentences) covering all aspects of the user's mental state.

### Step 3 — Classification
The summary is sent to the fine-tuned DistilBert classifier hosted on HuggingFace Spaces. It returns:
- `LOW` — Preventive guidance recommended
- `MEDIUM` — Active support recommended

### Step 4 — Recommendations
Based on the risk level, the app displays personalized recommendations from 4 categories:
- 🟢 **Relaxation & Mindfulness** — Breathing, meditation, yoga
- 🟡 **Lifestyle Balance** — Sleep hygiene, physical activity
- 🔵 **Social Connection** — Reaching out to friends and family
- 🟣 **Professional Support** — Therapists, counselors, crisis helplines

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, CSS |
| Backend | Next.js API Routes |
| Conversation AI | Groq API (Llama 3.3 70B) |
| Classifier | HuggingFace Inference (DistilBert) |
| Deployment | Vercel |
| Model Hosting | HuggingFace Spaces (Gradio) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Groq API key (free at console.groq.com)
- HuggingFace token (free at huggingface.co)

### Installation

```bash
git clone https://github.com/AZIZ1AB/MindFlow.git
cd mindflow
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key
HF_TOKEN=your_huggingface_token
HF_MODEL=amaranceur/mentalhhealthclassifier
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔗 Links

- **Live App:** 
- **Classifier Model:** https://huggingface.co/amaranceur/mentalhhealthclassifier
- **HuggingFace Space:** https://huggingface.co/spaces/StryCatt/mindflow-classifier

---

## 👥 Team

| Name | GitHub | Role |
|---|---|---|
|  |  |  |
|  |  |  |
|  |  |  |

---

## ⚠️ Disclaimer

MindFlow is an academic project and is **not a substitute for professional mental health care**. If you or someone you know is in crisis, please contact a mental health professional or crisis helpline immediately.

---

## 📄 License

MIT License — Academic use only

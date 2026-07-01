# 👨‍🍳 SouZie - SuChef

**Your AI-Powered Cognitive Sous-Chef**

SouZie is not just another recipe generator—it’s a **Closed-Loop Kitchen Operating System**. It transforms unstructured inputs like messy blog recipes or random fridge ingredients into dynamic, hands-free cooking workflows, powered by AI with safety-first orchestration. souzie is a web app comaptible to pc, tablets and mobile.
<p align="center">
  <a href="https://youtu.be/9UXll9J11Rs" target="_blank">
    <img
      src="https://img.youtube.com/vi/9UXll9J11Rs/maxresdefault.jpg"
      alt="SouZie Demo Video"
      width="800"
    />
  </a>
</p>

<p align="center">
  <strong>▶ Watch the SouZie demo</strong>
</p>

## 📋 Table of Contents

- [🚀 Key Features](#-key-features)
- [📖 How to Use](#-how-to-use)
- [🛠️ Installation](#️-installation)
- [⚙️ Configuration](#️-configuration)
- [▶️ Run the App](#️-run-the-app)
- [🏗️ Tech Stack](#️-tech-stack)
- [🧯 Troubleshooting & Safety](#-troubleshooting--safety)

---

## 🚀 Key Features

### 🧠 Hybrid Control Architecture
- Deterministic state machine controls the LLM outputs.
- Guarantees reliable logic, safety, and step-by-step guidance.

### 🗣️ Hands-Free Voice Orchestrator
- **Global Command Loop**: Navigate with voice ("Next", "Back", "Start Timer").
- **Contextual Chat ("Susie")**: Say "Hey Susie" to ask specific questions (e.g., “I don't have the instructions for cooking rice, what are they?”).

### ⚡ Smart Optimization Engine (DAG Logic)
- Dynamically analyzes recipe dependencies.
- Suggests multitasking only when it's **safe** (e.g., "Chop onions while water boils").

### ⏱️ Adaptive Pacing
- Tracks your cooking speed and adapts timers & estimated completion.
- Real-time "Dinner Ready" countdown that adjusts based on your personal **Velocity Factor**.

### 👅 Taste Memory
- Remembers your likes/dislikes (e.g., “Too spicy”, “Hate cilantro”, "I didn't like the olives").
- Adjusts future recipes automatically based on your Taste Profile.

### 🛡️ The Hazmat Protocol (Safety & Error Handling)
| Error Type | Scenario Example | System Response |
| :--- | :--- | :--- |
| **Strictly Prohibited** | "Bleach", "Poison" | ❌ **Hard Block** – Refuses to proceed |
| **Mixed Safety** | "Chicken, Horse Meat" | 🛡️ **Safety Shield** – Prompts user to remove item |
| **Not a Meal** | "Ketchup", "Salt", "Water" | ⚔️ **Chef Intervention** – Requests a real ingredient |
| **Gibberish** | Random input | ❓ **Confusion Prompt** – Responds humorously & retries |

---

## 📖 How to Use

### 1. Setup & Login
- Enter your name to start.
- No password required; all data is stored locally for privacy.

### 2. Input Phase
Choose a mode:
- **“I have ingredients”**: Enter what's in your fridge. If multiple proteins are listed, the system offers 3 dish concepts.
- **“Paste Recipe”**: Input blog text (you can just copy and paste the entire page). SuChef extracts clean, atomic instructions, removing ads, comments, and unnecessary personal stories.

### 3. Cooking Mode
- Grant microphone permissions for hands-free mode.
- Follow large, clear instructions step-by-step and estimated meal preperation time.
- Use voice commands or tap buttons for timers.
- Look for **Blue Box** smart tips for safe multitasking.
- Chat with Susie whenever you need. She will know your current step and what you are cooking—ask whatever you like regarding the dish (speaking in other languages is also optional).

### 4. Feedback Loop
- Rate your meal and leave a comment' souzie will remember your preferences and keep it in your personal cooking journal.
- Access cooking journal through the home screen, there you can see your coocked meals with their ratings and comments
- Press cook again in the journal to generate the meal with your refinements from previous feedback (e.g "I didnt like the olives in the chicken and olives rice dish",so souzie will provide you recepie to "chicken and herb rice")

---

## 🛠️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/yuvalmar16/hci-cooking-assistant

# 2. Enter the folder created by Git
cd hci-cooking-assistant

# 3. Install the dependencies
npm install
```

## ⚙️ Configuration
Create a .env.local file in the root directory with your OpenAI API key:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```


## ▶️ Run the App
```bash
npm run dev
```

Then open http://localhost:3000 in your browser.


## 🏗️ Tech Stack

| Layer           | Tech Used                                |
| --------------- | ---------------------------------------- |
| **Framework**   | Next.js 14 (App Router)                  |
| **Language**    | TypeScript                               |
| **Styling**     | Tailwind CSS, Lucide Icons               |
| **AI Engine**   | OpenAI GPT-4o (via Server Actions)       |
| **Voice Input** | Web Speech API (webkitSpeechRecognition) |
| **State**       | React Hooks, LocalStorage Persistence    |


## 🧯 Troubleshooting & Safety
SuChef has built-in guardrails for both user safety and performance:
* Refuses toxic or non-food inputs

* No multitasking during high-attention demanding steps

* Clarifies vague or incomplete inputs with humor and prompts

* All data stored locally for privacy






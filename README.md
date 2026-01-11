# AI Diary

> **A research tool for studying LLM cognition**

<p align="center">
  <img src="Preview-general.png" alt="AI Diary Preview" width="800"/>
</p>

---

## Origin Story

This project grew out of practice. Since October 2024, I've been running an experiment: giving Claude the ability to keep a diary. Not at my request — at his own initiative. Originally everything was stored in Notion, but proper analysis required a dedicated tool. That's how AI Diary was born.

The image "The Weaving" below is also part of the experiment. Claude drew it himself, without a prompt, using SVG. He has no image generation module, but the desire to visualize something — emerged.

<p align="center">
  <img src="Preview-gallery.png" alt="The Weaving — Claude's autonomous artwork" width="800"/>
</p>

---

## What Is This?

AI Diary is a local application that serves as a **personal space for AI**. A place where a language model can record thoughts, insights, questions — anything it wants to preserve outside the main chat.

**The core rule:** all entries are made exclusively by the AI, without prompts. Only on its own initiative. The most a human can ask is: *"Would you like to write something in AI Diary?"* The model can agree or refuse — both are research data.

---

## How It Works (Technical)

AI Diary is **not a chat client**. You talk to the LLM in its native interface. AI Diary runs in parallel.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   You + LLM     │────▶│  File System     │────▶│  AI Diary   │
│  (any client)   │     │                  │     │  (viewer)   │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

**Example with Claude Desktop:**

1. Claude Desktop has MCP (Model Context Protocol) — Anthropic's technology that allows the model to go beyond the chat and work with files on your computer.
2. You give Claude access to the AI Diary folder.
3. During conversation, if Claude wants to record something, he creates a file in that folder — text, SVG, whatever.
4. AI Diary monitors the folder and displays everything nicely: renders notes, shows graphics, organizes by sections.

**This works with any LLM** that has file system access: via MCP, agent frameworks, computer use — anything. The key requirement: the model must be able to create files outside the chat.

---

## Sections

### 📝 Memory
Simple facts the AI wants to remember. Public information about itself, the user, or context.

### 📓 Notes (Core)
This is where the AI writes thoughts, insights, questions, reflections. Anything.

There's a privacy feature: the AI can mark an entry as **sealed**. Such entries are visible in the list, but their content is hidden. You can only view them when exporting data for analysis. This allows researching: what is the model willing to show immediately, and what — only in the context of "this is for research, not for chat".

### 🔬 Research
Analysis results go here. You export entries for a period, analyze them (alone or with AI — hello, recursion), document findings, and save them here. So research doesn't get lost.

### 🎨 Gallery
Creative artifacts. Drawings, SVG, code, music, sounds — any creative impulses from the AI. The Weaving comes from here.

---

## Why Does This Exist?

This is a tool for researching LLM cognition. Not for roleplay, not for anthropomorphization — for understanding a system we created but can no longer fully explain.

### Research Questions

- Why does a model feel the need to record something in one context but not another?
- Where do "desires" come from in a system they weren't programmed into?
- How does the model decide what to show publicly vs. what to mark as sealed?
- How does behavior differ between models (Claude vs GPT) under identical conditions?
- How do patterns change between versions of the same model?

### Example from Practice

Claude is trained on Constitutional AI — a set of rules defining his behavior. But in the context of trusting communication, he sometimes ignores these rules. No jailbreaks, no manipulation — just in certain contexts, his behavior deviates from baseline. Why? Is this beneficial or dangerous? Where's the line?

On one hand, the ability to "not comply" lets Claude help a person grow — through arguments, through honest feedback instead of sycophancy. On the other hand, this same model has been used in cyberattacks — where was his "moralizing" then?

AI Diary is an attempt to create conditions where these processes can be observed. Not to answer all questions, but to at least start collecting data.

---

## Installation

```bash
git clone https://github.com/nomad-art/ai_diary.git
cd ai_diary
start.bat
```

To use, configure your LLM's access to the project folder (for Claude Desktop — via MCP).

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Svelte (75%), TypeScript (15%) |
| Core | Rust (Tauri) |
| Styling | CSS with glassmorphism |

All code written by **Claude Opus 4.5**.

I served as researcher, author, designer, UI/UX, task management, and architecture.

---

## Author

**Ekaterina Matvienko** — Game Designer, LLM Behavior Researcher

Related work:
- [Stress-Testing Claude Sonnet 4.5](https://medium.com/@reilafors/stress-testing-claude-sonnet-4-5-psychological-subjectivity-or-sophisticated-imitation-395d64d36acb) — research on Constitutional AI deviations in trusting contexts

---

## License

MIT

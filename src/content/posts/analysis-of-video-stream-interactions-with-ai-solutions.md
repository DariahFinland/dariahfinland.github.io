---
title: Analysis of Video Stream Interactions with AI Solutions
slug: analysis-of-video-stream-interactions-with-ai-solutions
heroImage: /media/darah-blog-header-3-1.png
heroImageAlt: darah blog header 3 1
categories:
  - blog
  - news-and-blogs
  - uncategorized
publishedAt: 2026-01-12
meta:
  title: Analysis of Video Stream Interactions with AI Solutions – DARIAH-FI
  description: The proliferation of short-form video on livestreaming platforms
    like Twitch presents a significant challenge for multimodal content
    analysis. Each clip…
  image: /media/darah-blog-header-3-1.png
---
The proliferation of short-form video on livestreaming platforms like Twitch presents a significant challenge for multimodal content analysis. Each clip contains a vast amount of diverse information: the visual action of the gameplay, the auditory context from the caster commentary, and the text-based reactions from the live chat. Together, these represent dense and valuable data for understanding online communities and digital entertainment.

However, the sheer volume and complexity of this data creates a need for efficient tools for its analysis.

### **From Chat to Multimodal Context**

Last year, the Game Research Network at the University of Jyväskylä, in collaboration with our partners at DARIAH-FI, produced a [suite of tools](https://github.com/JYU-digihum) to enable chat collection, content detection, and chat analysis. These foundational works, presented at **[58th Hawaii International Conference on System Sciences (HICSS-58)](https://jyx.jyu.fi/jyx/Record/jyx_123456789_100338)** and **[9th Annual International GamiFIN Conference 2025 (GamiFIN 2025)](https://jyx.jyu.fi/jyx/Record/jyx_123456789_105503)**, allowed us to understand what is going on in the audience during massive esports events like the PGL Major Antwerp 2022 in Counter-Strike.

Until now, however, these tools did not cover the diverse, multimodal nature of Twitch content thoroughly enough. A true understanding of a Twitch clip requires more than just perceiving events within a single modality; it requires a synthesis of their interplay. We identified a clear research gap: tools that can comprehensively understand and summarize the interaction between visual gameplay, audio commentary, and the massive chat audience.

### **Tools for Video Clip Analysis**

Powered by the **Google Gemini** family of Multimodal Large Language Models (MLLMs) and guided by a structured **Chain-of-Thought** prompt, our tool offers two distinct ways to process Twitch clips:

![media:574]()

![media:547]()

Video Clip Analysis Tool: [https://collector-twitcher.2.rahtiapp.fi/Videoclipsummary](https://collector-twitcher.2.rahtiapp.fi/Video_clip_summary)

#### **1. Automated Summarization**

For users needing a quick but comprehensive understanding of a clip, the tool generates summaries of the clips narrative. It synthesizes the visual and chat inputs to provide:

- **Chronological Summary:** A step-by-step breakdown of key audio-visual events.
- **Thematic Chat Analysis:** An overview of the main topics and sentiments trending in the chat.
- **Integrated Summary:** A cohesive narrative that explains what happened and why it mattered to the audience.

The upcoming paper about the capabilities of using these MLLMs for video clip summarization purposes will be formally presented at 10th Annual International GamiFIN conference in 2026.

![media:561]()

#### **2. Data Enrichment**

For researchers requiring structured data for further analysis, the tool generates a detailed **JSON file** organized into three layers:

- **Audiovisual Analysis:** Logs chronological actions, identifies entities, and transcribes on-screen text and emotional tones of the commentary.
- **Chat Reaction & Glossary:** Analyzes community-specific jargon and provides a glossary explaining the cultural meaning behind reactions.
- **Causal Synthesis:** Establishes direct causal links, mapping specific visual triggers (like a "clutch play") to the exact chat reactions they caused.

![media:534]()

![media:521]()

All generated summaries and analyses are automatically saved and accessible within the **videodescriptions** category in the [data viewer section of the tool](https://collector-twitcher.2.rahtiapp.fi/Data_viewer).

Text and images: Jari Lindroos
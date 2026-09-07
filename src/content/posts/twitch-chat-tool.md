---
title: Twitch Chat Tool - DARIAH-FI workshop winner
heroImage: /media/twitch.png
heroImageAlt: twitch
relatedPosts: []
categories:
  - src/content/categories/news-and-blogs.md
authors: []
publishedAt: '2023-05-23'
meta:
  title: Twitch Chat Tool - DARIAH-FI workshop winner – DARIAH-FI
  description: >-
    The April DARIAH-FI workshop winning tool, the Twitch Chat Tool, lets you collect data from
    livestreaming chat for large-scale projects.
  image: /media/twitch.png
slug: twitch-chat-tool
---


The DARIAH-FI workshop this past month brought with it many fresh ideas into the space of the digital humanities infrastructure. It was the perfect way to do a check-up on several projects of DARIAH-FI's researchers, how they are unfolding and progressing, as well as interact socially with peers and strengthen connections. Led by National Coordinator of DARIAH-FI, Risto Turunen, the event was spread across two days, April 25 and 26, and introduced several worthwhile projects that deliver on the promise of being helpful tools for researchers in the digital humanities field. While a more detailed blog post regarding the workshop is coming from Risto himself, I would like to write about the demo that was deemed the best from the workshop, which is the Twitch Chat Tool built by Raine Koskimaa's Work Package from the University of Jyväskylä.

### Tool introduction

The Twitch Chat Tool revolves around data collection and data analysis of content from the interactive live streaming service called Twitch. It comprises two separate tools: the Collector Tool and the Analysis Tool. The former is, as the name implies, meant to collect data from the website, and it provides the user with the possibility to gather three different types of data - chats from a live channel, recorded videos of past streams by category/game, language and period of time or recorded videos of past streams from one specific account. The collected data is saved in a CSC (IT Center for Science in Finland) repository, can also be saved to a Huggingface (a machine learning community designed to help each other with AI, ML and more) repo, as well as viewed and downloaded on the website itself in the 'Data viewer' section. With the data downloaded, you can then use the Analysis tool by uploading your file and either using the Visualisation tool or the Unique tagging tool. Both of the tools are still a work in progress with developments and improvements constantly underway, and the Analysis/Visualisation tool has not been presented yet, so we will be skipping it.

Before diving into a demonstration of how the tool can be used, you might be wondering *why* anyone would need a tool like this. Oftentimes society as a whole thinks of livestreaming on the Internet as something naive or unworthy of scholarly attention, deemed popular culture that's not worth researching. This is, however, far from the truth. Popular culture and social media gives people a glimpse into the world of interactions between humans on a scale that has not been previously achievable through any means. It is also a different kind of interaction than real life ones - it reveals different things about people, their character, values and so on. Researching social media and live streaming websites' data can be incredibly enriching to the state of art of social sciences on an enormous scale. Its impact should not be understated, especially in times when it is one of the leading ways of human contact with each other.

### The Twitch Chat Collector Tool in action

![media:677]()

*Main webpage interface of the Collector tool (https://collector-twitcher.rahtiapp.fi/)*

With that, one can go into the demonstration of the tool, to see just how useful it may be to not just researchers, but students or simply enthusiasts. First I would like to collect some data using the Collector tool, and evaluate how easy that is. I believe this should give me a nice overview of whether I am able to work more with the data afterwards.

![media:678]()

*Screenshot of the system running and collecting the data, then giving the option to download as ZIP (https://collector-twitcher.rahtiapp.fi/Collect\_VoDs\_by\_channel)*

While the Collector tool gives three options of different data to collect, I would like to focus on the third one in the interface, 'Collect VoDs by channel'. There is no specific reason for this, other than the fact that the first account I thought of just simply is not live right now, so I can't use the other option of collecting live chat, and I want to focus on one channel only. For this experiment's purposes, I chose the channel of SmallAnt, a gaming streamer, and I am curious to see how his public engages with his videos and content at random, by simply getting one recorded video's chat. This choice is purely a personal preference, I happen to like him as a content creator. The collecting part is incredibly easy - all one has to do is enter the Twitch channel name, enter the amount of recorded streams to be downloaded, and hit the 'start collecting' button. Depending on the amount of streams and their length, this process can take a while, but when it's done, you get to download them as a ZIP file with a button. Our download is then also logged into the page with all the data ever collected by the tool, available here [https://a3s.fi/twitcher-data/index.html](https://a3s.fi/twitcher-data/index.html). The UI is simple, but responsive and performs very well, very straight to the point. The one issue I do think could be addressed is that when you hit 'start collecting', the only visual indicator of the process is a small 'running' icon in the top right corner of the page. To me, this isn't very visible or obvious, and I think it could be implemented in a more accessible way.

![media:679]()

*Analysis/Visualisation tool demo screenshots*

As mentioned, I will not be talking about the Visualisation tool, as it has not been presented before and likely is not meant to be used yet, but because it is linked to on the Collector tool webpage, here's a demo screenshot of what it could look like.

### Conclusions

Overall, this tool has incredible potential - it can be used in many different instances of social media analysis, sentiment analysis and more. While I have had some issues, they were mostly technical and can be chalked up to the early stages that the project is still in, but in a practical way, it works very well and does what it claims to be able to. As someone who is very interested in the social media realm of research, I believe I would be able to use this tool for my future master's work or beyond that. It is a great opportunity to study livestreaming culture on a massive scale quantitatively rather than qualitatively as it has been done before.

Elias M., Research Assistant @ DARIAH-FI 

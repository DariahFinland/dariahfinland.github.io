---
title: FIN-CLARIAH day - Consotium brainstorms AI implementation
heroImage: /media/PXL_20240610_090656021-scaled-e1718743427367.jpg
heroImageAlt: PXL 20240610 090656021 scaled e1718743427367
relatedPosts: []
categories:
  - news-and-blogs
authors: []
publishedAt: 2024-06-18
meta:
  title: FIN-CLARIAH day - Consotium brainstorms AI implementation – DARIAH-FI
  description: >-
    On the first FIN-CLARIAH plenary this season the whole infrastructure reflected on how SSH
    research will be affected by AI and introduced what they will…
  image: /media/PXL_20240610_090656021-scaled-e1718743427367.jpg
slug: fin-clariah-day-ai-implementation
---

**On the first FIN-CLARIAH plenary this season the whole infrastructure reflected on how SSH research will be affected by AI and introduced what they will deliver by the end of 2025.**

The partners of DARIAH-FI and FIN-CLARIN (The language bank of Finland) consortium met for the first time this season on June 10 at the FIN-CLARIAH day in Helsinki. The event was an opportunity to meet the different teams, introduce plans and new participants. The workshop had an underlying theme "transformer technology". We asked the group to reflect how the latest developments on large language models and computer vision affect the development of research infrastructures and what is happening in Finland.

To get the conversation started Jaakko Lehtnien from Aalto university and NVIDIA research offered a state of the art in computer vision and generative image models (GenAI). In simplified form, image generative models work similarly as LLM's predictive formula, which has become fairly commonplace in its most popular application, ChatGTP: 

 *p* (next word | preceding text)

Instead of text, computers "see" images by extracting similarities and differences from a given set of images, establishing rules for the structure of an image (computer vision) and producing recipes to create an image that could fit in the training dataset but is not (generativeAI).This is a revolution that has developed rapidly since 2014, when diffusion models (CLIP) and adversarial networks (GANs) appeared in applications such as Dall.e, Midjourney and Stable diffusion. While this is a revolution in art and creative fields, when it comes to humanities and social sciences, I have to say that the reverse transformer technology of image-to-text has much more room for applicability. However, there are uncertainties regarding its future and opacity as to how it works, at least for an average humanities researcher which were reflected upon by our participants. Also the text descriptions in training sets require a level of detail and have been produced by crowdsourcing methods that raise ethical concerns<sup data-fn="0a390436-a8b7-4ba6-8dc3-e79140601231" class="fn">[1](#0a390436-a8b7-4ba6-8dc3-e79140601231)</sup>.

![media:407]()

Jaakko Lehtinen concludes with challenges for implementing GenAI (Photo: Inés Matres/DARIAH-FI)

Lehtinen emphasised two challenges: 1) Creating a generative model from scratch requires extremely large computing power (such that is not accessible for academic purposes), the good news is that it is possible to re-use or re-train an existing model on new data. Here is challenge number 2) there is no way to ensure accurate results, as this is a technology based on random generations, which sometimes hallucinates. Also, re-use of existing models can be challenging when applied to historical imagery such as 18th century book engravings or art that is aesthetically too different to the type of photo stock images with which the models have been created. 

These challenges have been tackled by several projects, for example to develop textual descriptions for the iconic Finnish Wartime Photograph Archive<sup data-fn="49aec92a-706f-492d-9a10-111ac07e8608" class="fn">[2](#49aec92a-706f-492d-9a10-111ac07e8608)</sup>. This theme guided discussion groups where participants brainstormed ways AI could be implemented at national level in infrastructures to support SSH researchers interested in textual, visual or audiovisual data. 

So many people had signed up for a group discussion on textual data that we had to divide into two groups: cultural heritage and web data. Both groups highlighted that the capabilities of transformer models are not yet clearly understood by SSH researchers. In addition, the field of language models has developed so rapidly in recent years that it is difficult to predict the state of the field in two or five years. Based on our discussions, transformer models are currently used, for example, for identifying and correcting OCR/HTR errors, for coding, for replacing manual annotations in tasks like text classification, and for proofreading academic texts. What many scholars find lacking are LLMs that understand the contextual variation typical for SSH research. Most LLMs are based on modern data and reflect modern views, yet researchers often work with historical and noisy texts. Other challenges mentioned include sustainability (LLMs can be overkill for many research problems), transparency (currently, the best LLMs are closed source), truthfulness (LLMs can generate false information), and the conflict between open science and private profit (companies using valuable datasets for their own benefit). The ideal future would involve open models designed for SSH research, perhaps built within our infrastructure and then fine-tuned by individual research teams according to their needs in the CSC environment.

Two groups brainstormed ideas for visual and audiovisual material. Audiovisual material refers to data that contains sequential visual and audio information. For research data such as research interviews, infrastructures were discussed concerning transcription and annotation of what is being said, but other genres of audiovisual data are more difficult to describe and "understand", tiktok and game streams can be considered a "complex item". This group brainstormed ideas around support for researchers to acquire or generate information such as video summarizations, but also regarding new formats agreement or a survey-based system to describe items.

The group discussing still images reviewed scenarios and support cases for researchers interested in cultural heritage images in FINNA or social media. Here the main bottleneck continues being discoverability, access and processing large amounts of research data. Therefore solutions for enriching metadata, or browsing visually (e.g. by motives recognised by AI or grouping similar groups of images) in addition to conditioning based on metadata would be welcomed among historical visual researchers. Here there are still uncertainties as to the viability of text labels produced for historical images. Digital methods for analysing visual material are also considered lacking or only accessible to certain skills which are rare in historians and humanities scholars. However, there exist open-source software that can alleviate annotation by e.g. clustering similar images (Bigsplot, Orange). Methodological guidelines should be produced by projects that work with large-amount of images. This group considers that any AI should be implemented keeping the human in the loop, for validation and long-term crowdsourcing for correction.

The event was closed by a poster slam, where participants shared their immediate plans gaining an overview of the many projects developing RIs this season 2024/25. [All posters are available in the fin-clariah pages](http://fin-clariah.fi/fin-clariah-2024-06-10-posters/).

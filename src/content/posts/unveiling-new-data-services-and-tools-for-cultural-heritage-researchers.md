---
title: Unveiling new data services and tools for cultural heritage researchers
slug: unveiling-new-data-services-and-tools-for-cultural-heritage-researchers
heroImage: /media/Viking-luettelo-1.jpg
heroImageAlt: darah blog header 6
categories:
  - src/content/categories/news-and-blogs.md
  - src/content/categories/uncategorized.md
publishedAt: '2026-02-10'
meta:
  title: Unveiling new data services and tools for cultural heritage researchers – DARIAH-FI
  description: >-
    In this blog, we bring news about new infrastructure developed in the past two years by the
    DARIAH-FI network for acquiring and processing large-scale,…
  image: /media/darah-blog-header-6.png
---

In this blog, we bring news about new infrastructure developed in the past two years by the DARIAH-FI network for acquiring and processing large-scale, visual and multimodal historical documents. 

These infrastructures were unveiled during a full-day workshop on January 22nd with 70 participants. The tools have been developed based on what humanities researchers need when working with archival materials and visual cultural heritage, enabling the acquisition and making the most of large-scale data in the [ASTIA](https://astia.narc.fi/) services, or [FINNA.fi](http://finna.fi/) portal. The sessions offered things for everybody, both for researchers not familiar with computational methods and for advanced digital humanities research.

For this report, we invited a participant to give her impressions of selected parts of the workshop, and give access to the resources presented to start trying them out yourself.

An image acquisition-preparation-organisation workflow for visual cultural heritage researchers was presented by Joona Manner and Julia Huovinen of the National Library of Finland and Inés Matres of the University of Helsinki. The newly developed [Finna Image and Metadata Download Tool](https://github.com/NatLibFi/Finna-API-image-file-downloader/releases) allows for easy batch acquisition of images provided by Finnish cultural heritage institutions to Finna. Using the tool does not require any computational experience, though a basic knowledge of terminal commands is recommended. Because the current version does not have a graphical user interface, those proficient in Python or R may find accessing the Finna API with a couple of lines of code more efficient. As was shown, the tool can in one go download a collection of 1200 WWII drawings from the Finnish Military Museum. In this workflow ([slides](https://drive.google.com/file/d/1YdLgS-4mmsnjiYSuJ32aKeM8g6CygMa1/view?usp=drive_link)), it was emphasized the importance of contacting the data provider for informed consent: not only for legal and ethical reasons, but also because data providers are continuously updating information to FINNA. However, this raises a question whether the communication with data providers should be conducted by Finna as a mediator to reduce an additional burden on the researcher side. Another complication is that image metadata on [Finna.fi](http://finna.fi/) is quite often fragmentary and is not represented in a unified format. Therefore, before transitioning to actual analysis, metadata needs manual enrichment and structuring. This process can be simplified by [Tropy](https://tropy.org/) – a desktop solution for annotation and organisation of image collections via a user-friendly interface.

![media:495]()

Image acquisition with the Download Tool begins with creating a search on the Finna webpage

For visual researchers specialising in fine art, the issue of lacking metadata is solved by [ArtSampo – Finnish Art on the Semantic Web](https://seco.cs.aalto.fi/projects/taidesampo/en/) project, which was demonstrated by Annastiina Ahola (Aalto University). The project connects 83,000 art objects from the Finnish National Gallery to linked data enriched with AI-generated keywords and textual descriptions. GenAI creates annotations based on the existing metadata and visual contents of an image, producing more detailed and less subjective (compared to human annotators) keywords. Another useful application of the resulting keyword lists is their use in the calculation of similarity scores between images, which allows users to look for works semantically close to a given one. In the near future, the dataset (expanded with additional institutional data sources and more information, such as artwork material) will be made publicly available along with a [web portal](https://github.com/SemanticComputing/artsampo-web-app), through which researchers and curators will be able to view, search and filter artworks and analyse the collections with integrated data visualisation tools.

![media:442]()

Keyword search of art objects with the ArtSampo interface: human vs AI annotation

The workshop was concluded by an extensive tutorial on how to access Finnish cultural heritage metadata directly from your code in the R programming language via a compact, syntactically concise package, without the need to construct complex API queries. Participants of the workshop, guided by Leo Lahti, Akewak Jeba and Julia Matveeva (University of Turku), had the opportunity to test the capabilities of the *finna* R package by completing [exercises](https://fennicahub.github.io/DARIAH-FI-workshop/workshop.html#/title-slide), which integrate cultural data into computational research. It was shown how to programmatically access Fennica (national bibliography) and Viola (national discography) subsets, and then use them as a basis for:

- data visualisation (e.g. illustrating publication year distribution);
- data enrichment from external sources (e.g. providing additional information on book authors from the KANTO database);
- testing statistical hypotheses and forming predictions using ML (e.g. modelling the probabilities of books' genres based on authors' gender).

Using R for cultural analysis operates on a much larger scale than manual browsing, allowing for distant viewing of cultural heritage collections, uncovering high-level patterns innate in them. Moreover, it ensures the reproducibility of the research workflow. Hopefully, the researchers who use other programming languages will soon also be able to access the same functionality. For instance, a similar Python library would for sure be in high demand.

The workshop programme also included an introduction to MessyDesk ([slides](https://drive.google.com/file/d/14tgxs4dXiC4nkrxIp0Zc4FCXb7X517Ot/view?usp=drive_link)), a virtual desktop to organise, transcribe and extract readable information from heterogeneous archive material, from old Swedish manuscript data to tabular data. MessyDesk is still under development by the DARIAH-node at the University of Jyväskylä ([contact](https://www.dariah.fi/local-offices/local-office-detail-jyvaskyla/)). Further, a brief introduction on new services from the National archives, such as an AI-powered content search ([demo](https://sisaltohaku.demo.kansallisarkisto.fi/)), a [search tool for Judgement Books](https://tuomiokirjat.kansallisarkisto.fi/), and a [Text Recognition Tool for handwritten material](https://huggingface.co/spaces/Kansallisarkisto/Multicentury-HTR-Demo). Finally, [LetterSampo](https://kirjesampo.fi/en/) a portal providing exploratory tools to examine correspondence networks among artists, politicians and influential people relating to the period of the Grand Duchy of Finland (1809–1917).

Text: Inés Matres, Iuliia Nesterenko. Images: Header – Viking luettelo, 1944. Kansalliskirjaston digitaaliset aineistot. Figure 2 – Ahola, A., Peura, L., Leal, R., Rantala, H., and Hyvönen, E. Using generative AI and LLMs to enrich art collection metadata for searching, browsing, and studying art history in Digital Humanities. *Humanising Technology, Volume III - Artificial Intelligence and the Humanities*, Peter Lang Verlag, March, 2026. In press.
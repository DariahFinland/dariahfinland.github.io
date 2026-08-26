---
title: >-
  We don’t want to leave this at the hands of computer scientists... an interview with Mikko
  Laitinen
heroImage: /media/The-Turk.png
heroImageAlt: The Turk
relatedPosts: []
categories:
  - news-and-blogs
authors: []
publishedAt: 2024-02-09
meta:
  title: >-
    We don’t want to leave this at the hands of computer scientists... an interview with Mikko
    Laitinen – DARIAH-FI
  description: >-
    In this interview we uncover what research-based infrastructure development means and dive deep
    into social media research, what questions can be posed to…
  image: /media/The-Turk.png
slug: we-dont-want-to-leave-this-at-the-hands-of-computer-scientists-an-interview-with-mikko-laitinen
---

Recently I had a very interesting conversation with Mikko Laitinen, Professor of sociolinguistics at the University of Eastern Finland and a partner in DARIAH-FI. He is leading the DARIAH FI working group that will improve [analytical frameworks for computational humanities and social sciences](https://www.dariah.fi/analytical-support/). His own research group at UEF is making accessible Twitter data collected for research purposes from the last decade. The closing of the API due to the recent changes in management of the former Twitter (now X), makes this corpus particularly interesting. In this interview we uncover what research-based infrastructure development means and dive deep into social media research, what questions can be posed to Twitter/X data, its limits, and dip our toes into future challenges and ethical aspects of social media research.

Inés Matres: *What are your research interests?*

Mikko Laitinen: I am a sociolinguist by training. That means that we are interested in how language varies depending on the social context where it is used, the speaker and the listener related factors, that is, the entire social setting in any communicative situation. I'm particularly interested in the use of English as a lingua franca in the Nordic region, specifically on social media. In the past, the Nordic *Englishes* have been mainly approached from the perspective of learner language, that is, how learners reach (or do not reach) the target variety, typically British or American English. Our perspective is to look at the other side of the coin, asking a simple question, what do we do, those of us who live in the Nordic region, what do we do to English? Do we shape and mold it according to our needs? The cultural adaptation of English. That's my broad background.

*Why Twitter?*

I think it's really important to look beyond one application and instead think how very large-scale data from social media in general could be better utilized in sociolinguistics. We use it for a very concrete reason. As you know, Twitter texts might be problematic because they are very short. But the crucial bit is that in Twitter we can see who communicates with whom. And who is connected to whom, so the entire dataset forms a directed-graph network. People in network sciences use for instance very large telephone datasets that enable a research to see who's connected to whom through calls, but they do not have access to what was discussed in the calls and what kinds of language was used. In our datasets, we have both the language use and the network information, and that is what makes the data super-interesting. Various other social media platforms provide richer textual content but they are poorer in terms of interaction. If we go back to the sociolinguistics, that is, how social context influences language use, with Twitter we can include the social networks in which we live, how do they influence our language use, because the networks are what we are able to see.

*Could you briefly say what is that you collected and what is important for you?*

We had a goal to collect the Nordic Twittersphere as a whole, but of course we know that it has limitations. Through the API which is now closed, it's been possible to access only a small amount of the entire data but it's still a rather massive dataset of almost one million accounts from the Nordic region. We store a lot of network-related information. We take into account the number of times that each node communicates within the network, so we're able to see who is connected to whom and visualize everybody who's involved in the network. That information then can be subjected to quantitative analysis, for instance what is the distance between all the nodes in the network. And then, as I mentioned earlier, we also see the text tweeted by the user. It includes all the hashtags, all the mentions, replies, URLs and things like that. We don't go deeper into this and we don't actually access the URLs to store what's in them. There's also one downside of Twitter; actually, in all societal big data: we don't have that much information about the account holders. This is what we aim at doing in the next phase to enrich the data by using machine learning to predict some background information, like for instance age groups of the account holders.

*Now that you mention the closing of the API, there is no place to get Twitter/X data?* 

Yeah, this made a change in the whole, it actually did, but we have been expecting this from day one. That's why we've had from the beginning the idea that this is such a rich cultural heritage that we cannot leave it at the mercy of you know whoever billionaires. The National Library has selected, if I remember correctly, a few hundred prominent Finns, as they call them, public figures. But as far as I know they haven't stored, you know, a large cross-section of the Finnish Twittersphere as a whole.

*And what would you say are the main technical difficulties when approaching Twitter data?*

Handling the material requires quite a lot of technical knowledge because it's high volume so collecting, preprocessing, storing and analyzing this material requires some degree of technical expertise. If I simplify and say that processing billions of words on my laptop slows the computer down substantially and it means that my research slows downs, so we need better and easy-to-use technical tools to manage very large dataset from social media. That is why we are in DARIAH FI and work with CSC, to make this data available and make it possible for students and researchers to process the data and work with large datasets.

Regarding the technical expertise, we have an inside joke, that I am only the project owner with very limited technical competences; but that is also part of the digital humanities in the sense that the tasks are so complex that we need to find the best expert for each task, and simply working alone is not sufficient. So, in this project, we have one technical expert in charge of data collection and processing, and he is a computer scientist. And then we have another person in charge of ensuring that we store the material at CSC and find ways to distribute it. That person is designing the user interface specifically with the idea that it would be easy for researchers in social sciences and humanities to use it. The idea is that anyone could access large amounts of data and that would require minimum technical knowledge. Using the interface, a student in SSH areas can access the material and do what we call a "quick and dirty analysis". That is, you just type in your search word and you get the tweets and statistics about the amount of material that contains your search item, and if you want to, you can also subset it by specific locations, or in specific languages only. For more advanced users, our download function enables downloading the output for more advanced analysis.

*What about enrichment of data and the limitations to this type of data you mentioned earlier?*

It is clear that simply having data available is just the first step. We do part-of-speech tagging for English, because we have a really good POS-tagger that's been trained using this type of heterogeneous social media data. So, in this text-level enrichment we identify nouns, verbs and so on. When it comes to user-level data enrichment, we make use of an algorithmic tool that we developed recently. It makes use of the network information of each account holder. We run the data through a computational model that looks into each individual and their networks and adds a value that indicates how loosely or strongly connected the person is. The outcome is simply a value that ranges between zero (loose-knit networks) and one (close-knit networks). As mentioned, we're right now charting ways to predict other background parameters.

*What is your trust in AI, how do you introduce verification at this scale, and ensure ethical treatment for example, if you reproduce content or if you go to images that give away personal and identity information?* 

First of all, everything that we do concerns fundamental research, so we are not interested in individuals, but rather on large-scale quantitative patterns that can be observed in the data. Secondly, considering the legal framework, the main legislation that is relevant for us is the European Union digital single market directive from 2019 which enables text and data mining. It enables storing and analyzing any born-digital data for research purposes. On the Nordic level, and in Finland, the legislation was adapted to the EU legislation in the spring of 2023. Lastly, this is also why to make this dataset available we are considering authentication, such as HAKA for Finnish universities, to ensure that it is researchers who access it.

All in all, we want to operate in ethically sustainable ways, and this is something where universities and basic research have lot to offer. Like in our case, using human-centered-AI for enriching data is done to solve some of the most fundamental questions in research - it's not done for selfish purposes. We have some really bad examples of data enrichment done for commercial or political purposes, for instance in the Cambridge Analytica scandal a few years ago (i.e. Facebook data were scraped and linked with survey data that included rich social information of users, and this was used to target political messages). Overall, we need to influence political decisions makers on the importance of ensuring that large social media data are available for researchers also in the future. Now, there is a strong tendency to close the APIs and prevent researchers from using societal big data. It's clear that DARIAH as a European-level infrastructure is the right entity to put pressure on our politicians to ensure that data are free for research and that data are used in ethically sustainable ways.

Another important aspect of this is the technical side, engineers and computer scientists, I think, can solve most of problems related to data enrichment. But we don't want to leave this at the hands of computer scientists, adding things like somebody's gender identification. I am very hesitant about this category, not just because gender is a highly debated category, but also because it is potentially extremely powerful to subset extremely large numbers of real people on the basis of these social background information, unless it is absolutely clear that the information will be used in ethically sustainable ways. All this data enrichment requires a profound understanding of any social construct that you approach. This is a prime example of D&H, digital and humanities, it's not one without the other.

*Thank you Mikko for this interesting conversation!*

Photo: Illustration known as The Turk, in Joseph Friedrich Racknitz's 1789 Über den Schachspieler des Herrn von Kempelen und dessen Nachbildung (Page 65). Source: [Humboldt University digital library](https://nbn-resolving.org/urn:nbn:de:kobv:11-707756). *<br />*

Upcoming training on the use of the Nordic Tweet Stream ([March, check our events](https://www.dariah.fi/events/)), below some readings,

- Laitinen, Mikko, and Masoud Fatemi. 'Data-Intensive Sociolinguistics Using Social Media'. Annales Academiae Scientiarum Fennicae 2023 (2): 38–61. [https://doi.org/10.57048/aasf.136177](https://doi.org/10.57048/aasf.136177).
- Wilkinson, M. D. et al. 2016. The FAIR Guiding Principles for scientific data management and stewardship. Scientific Data 3, 160018. [https://doi:10.1038/sdata.2016.18](https://doi:10.1038/sdata.2016.18)
- Ess, Charles Melvin. 2020. 'Internet Research Ethics and Social Media'. In Handbook of Research Ethics and Scientific Integrity, edited by Ron Iphofen, 283–303. Cham: Springer International Publishing. [https://doi.org/10.1007/978-3-030-16759-2\_12](https://doi.org/10.1007/978-3-030-16759-2_12)

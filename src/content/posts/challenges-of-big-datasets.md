---
title: Challenges of Big Datasets
heroImage: /media/Figure-2-DARIAH-FI-Workshop-scaled-1.jpg
heroImageAlt: Figure 2 DARIAH FI Workshop scaled 1
relatedPosts: []
categories:
  - src/content/categories/news-and-blogs.md
authors: []
publishedAt: '2023-09-12'
meta:
  title: Challenges of Big Datasets – DARIAH-FI
  description: >-
    DARIAH-FI project's Work Package 3.1 "Increasingly Automated Ingestion of Material" is creating
    data pipeline from the National Library of Finland to CSC.
  image: /media/Figure-2-DARIAH-FI-Workshop-scaled-1.jpg
slug: challenges-of-big-datasets
---


DARIAH-FI project's Work Package 3.1 "Increasingly Automated Ingestion of Material" is creating data pipeline from the National Library of Finland (NLF) to CSC (IT Center for Science). In this blogpost we talked with two people involved in this work package, Tuula Pääkkönen from NLF and Martin Matthiesen from CSC, to learn more how researchers will benefit from this pipeline and about unforeseen challenges when working with very large datasets.

![media:393]()

This is what AI ([https://openai.com/dall-e-2](https://openai.com/dall-e-2)) dreamed when I asked it to make a painting of a pipeline between the National Library of Finland and CSC.

**Conversation with Tuula Pääkkönen from NLF**

**Harri Haralds Matulis: My first question is – what is it that you are actually building?**

**Tuula Pääkkönen:** We, as the National Library of Finland, we provide the data for the researchers. We are the content providers, and in this case, it is mainly digitized newspapers and books, which is copyright free material so that it could be utilized by the researchers. And in this work package our goal is to deliver data to the CSC environment where everyone else can then access it.

**HHM: So is it mainly texts, or also images and audio files?**

**TP**: It is texts, it is also XML files of the newspapers and page images also. So it's up to the users if they want to use the digitized images of the newspaper image pages or the OCR version that we have provided.

**HHM: You mentioned the users. Who will be the users of this NLF-CSC data pipeline, who will benefit most of it?**

**TP**: I would hope that it is as widely as Finnish researchers, at least. So that those who are researching history or doing digital humanities style research could benefit.

**HHM: What expertise of digital humanities or computational skills would be needed for researchers to use this pipeline?**

**TP**: Well, some basic or intermediate level programming skills would be helpful, because if people want to utilize the pipeline that CSC has made, it would require some knowledge of the containers and manipulating files in a directory or within some tools.

**HHM: You already mentioned CSC, could you describe a bit more what are the roles of NLF and CSC in this cooperation and data handling?**

**TP**: Yes, this is a very interesting cooperation. Library has been kind of the database or the data location, and then we provided the interface to interact with the data. And then CSC is utilizing our interface to download the material from our standard environment.

**HHM: So from the end-user perspective, they will still go to Library homepage, and behind the scenes, it will somehow connect to CSC?**

**TP**: No, the end users would go to the CSC environment directly and get the material there. So, the end user would not necessarily even know anything that is happening in the download process from Library to the CSC side. And we have had some deep discussions about how we are updating the materials in the future, because we digitize new material all the time, and so this has to be transparent for researchers, what version of data they are using at any given moment in CSC environment.

**HHM: Could you tell more about updating of data and about versions, why is it important? Is it mainly about adding new material, or also somehow fixing or updating the existing data?**

**TP**: It is both. And, this is something that we already from the beginning of the project have been thinking about, how to provide the material in versions, so researchers know exactly with what kind of data they are working.

**HHM: How big is the dataset we are talking about?**

**TP**: For the access in DARIAH-FI project, it will be XML files and image files, so it's around 11 terabytes. And in pages, it is about 10 million pages. So it is quite an extensive dataset we have. And it has proved to be a kind of a challenge. Because it takes some time to download that material, and then you have to figure out how to even store it correctly, and then, how to access and work with that data in a meaningful way. And metadata are also important, because it might be comparatively easy to copy 10,000 images files somewhere. But then, if you don't know which newspaper they are from, which date they are from, they're going to cause a lot of hassle later. So, keeping metadata besides the content is very important.

**HHM: What are the main lessons from building this pipeline?**

**TP**: I think the lesson is that it's good to use standards. In the Library interface we use an old standard (OAI-PMH), but it works, and so we have extended it a bit in this project. And it's a standard that all libraries can offer. So this pipeline we create, it's not just for this project, but it's something generic that could be used somewhere else as well.

**Conversation with Martin Matthiesen from CSC<br><br>**

**HHM: What is the pipeline you are building? How would you describe it in simple terms?**

**Martin Matthiesen**: I would say, it's the attempt to stage data from the National Library to the CSC environments to be used in supercomputing. We are not enriching anything at this point. So it's essentially a copy operation. And this copy operation is complicated. Because of the amount of data and the number of files and the limitations that supercomputing environments have, especially towards number of files. And so we had to come up, and we did come up with one relatively innovative way of packaging the downloaded data into disk images. I don't know how far we want to go into the technical details, but you can really think, from a very high level, it's a synchronization operation, where the master data is at the National Library of Finland. And we, CSC, create copies of the master data.

**HHM: Why is it necessary to even transfer anything from library to CSC? What is the benefit of creating a pipeline? Why can't data stay at NLF and be accessed by researchers there?**

**MM**: That's relatively easy to answer. NLF, to my knowledge, in total has around 300 terabytes of data. And of course, there's always coming more data. And for this project we're talking about some 50 terabytes of data, which is not copyrighted anymore. Library provides this data at least in three different forms, as large pictures in TIFF format, which are not yet available for download, then they have JPEGs, which are basically compressed versions of the TIFFs and then they have OCR text files. And the reason to do all this is, for example, if you want to do large language models or you want to improve OCR algorithms, then downloading this data on demand is just too slow. It doesn't make sense. It's a huge burden on the internet, it's a huge burden on the API of the National Library. And, and it also takes time. So, that's the main rationale that the data in its latest version are available easily for heavy computation in CSC.

The next reason why we're doing this sort of centrally, is also, if you have multiple research groups in the future working on this data, you don't want each research group downloading large datasets for themselves, that are essentially anyway, read-only because they are copies of the National Library data.

So we want to also make it possible that we provide the dataset as a service, if you will. And then the researchers can access this dataset. And there's a defined procedure, how the dataset is updated, for example. Of course, when we update datasets centrally, we need to have a mechanism that users don't start on the old datasets with their computation, and then overnight to dataset changes to a new version. And then they have computed partly on the old and partly on the new.

**HHM: What was the hardest thing during building this pipeline? What did you discover or what was a bit of surprise?**

**MM:** Well, first, how technical can I get here?

**HHM: So that people can understand.**

**MM:** Yeah, okay, well. That's a challenge now. Okay, I need to formulate this first in the most technical way, and then let's try to boil it down to simpler abstraction. So our first approach was simply downloading the data. Everybody has copied data. So copying data as such, is not difficult, but copying data in a reproducible way, that's another story. And also, if something happens, while you copy the data, if there is an error, or if there is any sort of problem, how to deal with it.

So our first approach was to download the data simply to the supercomputing storage. And then we quickly ran into a 10 million file limit. And when we tried to convince our admins to increase this limit, they said no. And the reason why they say no is because if you have too many files, and if you do operations on too many files at the same time, you are overloading the system for all users. And that's why the number of files on the shared file systems is limited. So our problem was not that we didn't have enough terabytes, we have 50 terabytes. Space is not the problem. But the number of files is the problem.

The devil is so much in the detail that I almost don't want to go into the details! Let's say, your local laptop could deal with more than 10 million files, but probably not with 50 terabytes easily. And so that's when you need to have a supercomputing environment. So you benefit from the supercomputing environment, even if you don't do super heavy computation, just to keep the data stored.

To make sure that everything worked as it was supposed to work, we decided to use a technology that we had no prior experience with, called Apache Airflow. This Apache Airflow is a tool that can be used to periodically do jobs. And when we understood the technology, we realized that the technology was not really fit for purpose of downloading such a huge amount of files…

By Harri Haralds Matulis (June 27, 2023)

Header image : Anni Järvenpää and Helmiina Hotti presenting the data pipeline from the CSC to NLF in the DARIAH-FI Workshop, April 25, 2023. Photo by Tuula Pääkkönen

–––––———

**Update on September 8, 2023**: Good news, the first version of the download is now complete! Risto Turunen, National Coordinator for DARIAH-FI

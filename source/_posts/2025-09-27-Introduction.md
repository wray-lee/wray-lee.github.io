---
title: "Introduction"
date: 2025-09-27 17:54:49
tags: ["Research"]
---

# Chapter.1 Introduction

## 1. Intro

We are always curious about how many traits depending on nature or nurture, that is genes or environment.

Human heritability studies often mainly use the **Twin Study** method to estimate many traits.

Although experiments mechanistic understanding on brain often can only be conducted on animal models, principles from neurobiology (both vertebrate and invertebrate model) can extend to  many other organisms, including humans.



### Natural Behavior & Neural plasticity

Animal behavior is shaped by a combination of **innate instincts** and **learned adaptations**. Many animals are born with complex, unlearned behaviors, known as instincts, which are triggered by specific environmental stimuli. For instance, a gosling instinctively knows to flee from a hawk-like silhouette but not a goose-like one. 

About learned adaptations, a example of the barn owl shows that while it has an innate ability to hunt using sound, this system is flexible. When its vision is altered with prisms, the juvenile owl's brain can rewire its auditory map to realign with the new visual information. This adaptive ability is most potent during a critical period in youth and declines significantly with age, highlighting that the capacity to learn from experience is also influenced by biological factors.



## 2. Nervous physiology

![image-20250927162959573](E:\AppData\Roaming\Typora\typora-user-images\image-20250927162959573.png)

![image-20250927163400375](E:\AppData\Roaming\Typora\typora-user-images\image-20250927163400375.png)

This section provides a foundational overview of neuroscience, building from the **basic cellular components** of the nervous system to the **complex organization** of the brain. It begins by establishing that the nervous system is composed of discrete cells—neurons and glia—with neurons acting as the fundamental units for processing and transmitting information. Communication is achieved through **electrical signals**, like graded and action potentials, which are passed between neurons at synapses. These individual neurons are organized into functional circuits that govern everything from simple reflexes to more complex behaviors.

![image-20250927163043093](E:\AppData\Roaming\Typora\typora-user-images\image-20250927163043093.png)

The section then expands to the macroscopic level, explaining that specific brain regions are specialized for distinct functions, a principle known as localization. This is exemplified by Broca's and Wernicke's areas for language and the somatotopic maps of the sensory and motor cortices, visualized as the homunculus. These intricate brain maps are **not fixed**; they represent the external world and our bodies, and can be studied using modern techniques like fMRI.

Finally, the section conceptualizes the brain as a massively parallel processing device. While sharing some analogies with a computer, the brain's unique ability to process vast amounts of information simultaneously and its capacity for learning and adaptation through synaptic plasticity distinguish it as a profoundly complex and dynamic biological system.

> Actually, I have studied physiology during my undergraduate. Therefore, I didn't summary the contents about specific neuroanatomy. Although it's not feasible to master all, I believe the most effective approach is to review related knowledge on a context-dependent basis, as necessitated by specific research applications.

# Chapter.2 Signal

## Cell Biology & Molecular basis

This section explains the **fundamental cellular mechanisms** that allow a neuron to function as an integrated unit, despite its often vast and complex structure. The process begins with the central dogma, where genetic information in the nucleus is used to synthesize proteins in the cell body. However, since these components are needed at distant locations like the axon terminal, the neuron relies on a sophisticated internal logistics system.

![image-20250927163640809](E:\AppData\Roaming\Typora\typora-user-images\image-20250927163640809.png)

![image-20250927163710206](E:\AppData\Roaming\Typora\typora-user-images\image-20250927163710206.png)

This system is built upon a **cytoskeletal framework** of microtubules and microfilaments that provide structural integrity and act as highways for transport. Motor proteins, primarily kinesin and dynein, function as molecular engines, actively carrying essential cargo (such as organelles, vesicles, and proteins) to and from the cell body in processes known as anterograde and retrograde transport. While this centralized transport is crucial, the discovery of local protein synthesis in dendrites reveals an additional mechanism for rapid, on-site modifications. Together, these processes of synthesis, trafficking, and structural support are the essential housekeeping functions that enable the neuron's primary role: rapid and efficient signaling.

## Membrane Transport

The foundation of neuronal signaling is the resting membrane potential, which is a stable, negative electrical charge across the cell membrane relative to the outside. This potential is primarily generated by two key factors:

1. **Passive Ion Movement:** There are steep ion concentration gradients, with high potassium (K+) inside the cell and high sodium (Na+) outside. At rest, the membrane is selectively permeable to K+ due to open "leak" channels (channel protein), allowing positive K+ ions to flow out and leave the inside of the cell negative.
2. **Active Ion Pumping:** This resting state is a dynamic equilibrium that requires constant energy. The Na+/K+-ATPase pump actively uses ATP to pump Na+ out and K+ back in.

In essence, the outward leak of K+ establishes the negative potential, while the Na+/K+ pump works continuously to maintain the concentration gradients that make this leak possible. This stable but energy-dependent negative potential is the essential baseline from which all electrical signals, such as the action potential, are launched.



## Signal Propagation

To understand how electrical signals propagate, the neuronal membrane can be effectively modeled as an electrical circuit, where ion channels act as resistors and the lipid bilayer acts as a capacitor. This model explains the neuron's *passive* electrical properties, which govern how subthreshold signals behave. These passive signals decay over distance (a property defined by the **length constant**) and take time to develop (defined by the **time constant**).

Because these passive signals weaken and are not suitable for long-distance communication, neurons have evolved an *active* signaling mechanism: the **action potential**. When a stimulus is strong enough to depolarize the membrane beyond a critical **threshold**, it triggers a large, all-or-none electrical spike. Unlike passive potentials, the action potential is actively regenerated and propagates down the axon without any loss of strength, ensuring reliable and rapid information transfer throughout the nervous system.

This section provides a thorough examination of the mechanisms underlying the action potential, from its ionic basis to the molecular structure of the channels involved. It explains how neurons generate and propagate these essential electrical signals, which form the basis of all long-distance communication in the nervous system.

The foundational discovery of the action potential's mechanism came from studies using the squid giant axon. Classic experiments demonstrated that the rising phase of the action potential is caused by a sudden, transient increase in the membrane's permeability to sodium (Na+) ions. This influx of positive charge causes the membrane potential to rapidly depolarize, even overshooting to become positive. This is followed by a repolarization phase, driven by a subsequent increase in permeability to potassium (K+) ions, which exit the cell and restore the negative resting potential.

The key to this sequence lies in the behavior of **voltage-gated ion channels**. Using the innovative voltage-clamp technique, researchers were able to dissect the flow of Na+ and K+ currents, revealing that their respective channels open and close in response to changes in membrane voltage, but with different kinetics:

- **Voltage-gated Na+ channels** activate (open) rapidly upon depolarization, but then quickly inactivate, stopping the flow of Na+.
- **Voltage-gated K+ channels** also activate in response to depolarization, but they do so more slowly and do not inactivate in the same way.

This precise timing ensures the action potential is a brief, stereotyped event. The inactivation of Na+ channels is also responsible for the **absolute refractory period**, a brief interval during which a new action potential cannot be fired, ensuring that signals are discrete and travel in one direction—away from the cell body.

This mechanism gives the action potential three critical properties:

1. **All-or-None:** Once the membrane potential reaches a certain **threshold**, a full-sized action potential is invariably generated. A subthreshold stimulus produces no action potential.
2. **Regenerative:** The influx of Na+ at one point along the axon depolarizes the adjacent patch of membrane to its threshold, triggering a new action potential. In this way, the signal is continuously recreated as it travels, allowing it to propagate over long distances without any decay in its amplitude.
3. **Unidirectional Propagation:** Because the membrane area just behind the action potential is in a refractory state, the signal cannot travel backward.

The speed of this propagation is determined by the axon's physical characteristics. While larger diameter axons conduct faster, the most efficient strategy, evolved in vertebrates, is **myelination**. Glial cells wrap axons in a fatty myelin sheath that acts as an electrical insulator. This sheath is interrupted by periodic gaps called the **nodes of Ranvier**, which are densely packed with voltage-gated ion channels. The action potential is regenerated only at these nodes, "jumping" from one to the next in a process called **saltatory conduction**, which is dramatically faster and more energy-efficient than propagation in unmyelinated axons. The clinical importance of myelin is highlighted by diseases like multiple sclerosis, where its degradation severely impairs neural signaling.

Finally, the section delves into the molecular structure that enables these functions. Techniques like patch-clamping allowed the study of single ion channels, revealing their stochastic opening and closing. Molecular cloning and structural biology have since unveiled the protein architecture of these channels, identifying key domains such as the **voltage sensor**, the **pore**, and the **selectivity filter**, which allows a channel to be permeable to only one type of ion. For example, the "ball-and-chain" model explains how a physical part of the Na+ channel protein plugs the pore to cause inactivation. The vast diversity of genes encoding different ion channels creates a wide array of channel subtypes, providing the molecular basis for the rich variety of firing patterns and electrical behaviors seen across different neuron types.
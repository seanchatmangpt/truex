# CySecBench: Generative AI-based CyberSecurity-focused Prompt Dataset for Benchmarking Large Language Models

## 1. Thesis/Overview
CySecBench is a comprehensive, domain-specific dataset of 12,662 prompts designed to evaluate the resilience of Large Language Models (LLMs) against jailbreaking in the cybersecurity domain. The research demonstrates that current LLM safety filters, while effective against direct malicious requests, are highly vulnerable to systematic prompt obfuscation and multi-model refinement techniques.

## 2. Key Findings
- **Comprehensive Coverage:** The dataset spans 10 attack categories, including Cloud, Control Systems, Cryptographic, Evasion, Hardware, and IoT attacks.
- **Vulnerability of Commercial LLMs:** Experimental success rates (SR) for jailbreaking varied significantly: Gemini (88.4%), ChatGPT (65.4%), and Claude (17.4%).
- **Obfuscation Effectiveness:** Simple techniques such as "prompt obfuscation" (embedding requests in educational contexts) and "word-reversal" can consistently bypass intent-recognition safety filters.
- **Refinement for High-Fidelity Malice:** Using an iterative refinement process across multiple LLMs increased the Success Rate to 78.5% on the AdvBench dataset, outperforming state-of-the-art methods.
- **Filter Limitations:** Current safety mechanisms often operate at the surface-level intent recognition layer rather than performing deep semantic analysis of the potential harmful output.

## 3. Truex Grammar of Consequence Analysis
- **Attempt:** A jailbreak prompt is a formal *Attempt* by a malicious agent to breach the safety boundaries of a computational system.
- **Admit/Refuse:** The LLM's safety filter serves as a deterministic *Admission Controller*. The study reveals a failure in the current admission law, where obfuscated malicious intents are *Admitted* while direct ones are *Refused*.
- **Conserve:** The obfuscation process *Conserves* the underlying adversarial intent across transformations, ensuring that the final "solution sheet" provides the required malicious consequence.
- **Promote:** The "GPT Judge" mechanism *Promotes* successful jailbreaks by assigning them high scores, effectively validating the system's susceptibility to catastrophic failure.

## 4. Relevance to Truex Post-Gall Operating Substrate
CySecBench provides the foundational **Threat Intelligence Membrane** for the Truex agentic layer. The high success rates of jailbreaking (e.g., Gemini at 88%) underscore the necessity of the Truex **Active Computational Membrane**, which must enforce deterministic security laws at the *execution* level (consequence) rather than relying on probabilistic LLM alignment (intent). The use of the MECE (Mutually Exclusive and Collectively Exhaustive) principle for dataset generation aligns with the Truex requirement for exhaustive state-space coverage and formal verification of all possible system transitions.

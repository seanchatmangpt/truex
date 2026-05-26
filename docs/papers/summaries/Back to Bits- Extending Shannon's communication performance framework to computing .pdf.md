# Summary: Back to Bits- Extending Shannon's communication performance framework to computing

## Main Thesis
This paper proposes a radical shift in measuring computing performance by grounding it in **Shannon's Information Theory**. The authors argue that traditional metrics like floating-point operations (FLOPs) are increasingly inadequate for modern, heterogeneous architectures (quantum, analog, low-precision). Instead, they frame computation as an information-processing channel and define performance as the **mutual information** (measured in bits) shared between a system's inputs and outputs.

## Key Findings
- **The Failure of FLOPs:** Traditional flop-counting conflates format with function and fails to account for the energy, area, and information-theoretic differences between varying bit widths, precisions, and hardware paradigms.
- **Computation as a Channel:** Models the computing process as an **Encoding → Operation → Decoding** pipeline. Computational work is quantified by the amount of meaningful information encoded, manipulated, and retained.
- **Compute-Channel Capacity:** A novel, application-agnostic unit of performance that quantifies the upper limit of information processed by a hardware pipeline. This is calculated by maximizing mutual information over all possible input distributions.
- **Sparsity and Entropy:** Sparsity is treated through the lens of entropy. A known zero (e.g., in structured sparsity) carries zero entropy and thus represents zero information gain, providing a first-principles basis for not "crediting" skipped sparse operations.
- **Unification of Communication and Computation:** Under this framework, communication is simply an identity transformation (transferring data without alteration). Both are evaluated using the same metric: **bits per second (bit/s)**, enabling a unified, dimensionally consistent roofline model.
- **Information Efficiency:** Introduces a factor representing the ratio of operational mutual information to compute-channel capacity, capturing how effectively a specific kernel utilizes the underlying hardware's information-processing potential.

## Relevance to Truex Post-Gall Operating Substrate
The information-theoretic approach is foundational to the Truex architectural vision:
1. **The Physical Law of Value:** By grounding the substrate in **bits of mutual information** rather than arbitrary operation counts, Truex establishes a universal, hardware-agnostic "Physical Law" for evaluating the value of agentic work and state transitions.
2. **Mechanical Enforcement of Efficiency:** The framework's treatment of sparsity as "zero entropy" aligns with the Truex mandate for **low-entropy execution**. The substrate can mechanically refuse or de-prioritize "no-op" or redundant computations that do not contribute to information gain.
3. **Substrate Roofline Modeling:** Unifying communication and computation under a single bit-based metric allows the substrate's **Active Computational Membrane** to optimize for global information throughput, treating memory hierarchies and interconnects as stages in a composite information channel.
4. **Deterministic Resource Allocation:** Provides a principled, first-principles reasoning for "Export-Control-grade" performance accounting within the substrate economy, ensuring that resource costs are proportional to the intrinsic computational work performed across heterogeneous capabilities.

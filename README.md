# NourishNet – Multi‑Agent AI for Food Rescue

<div align="center">
  <img src="https://img.shields.io/badge/status-hackathon%20ready-brightgreen" alt="Status"/>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License"/>
  <img src="https://img.shields.io/badge/PRs-welcome-orange" alt="PRs welcome"/>
  <img src="https://img.shields.io/badge/powered%20by-OpenClaw%20%7C%20FLock%20%7C%20MCP-important" alt="Powered by"/>
</div>

<p align="center">
  <i>Autonomous AI agents connecting surplus food with people in need – via WhatsApp, Telegram, and human‑in‑the‑loop oversight.</i>
</p>

<p align="center">
  <b>🏆 Built for the FLock.io Bounty – UK AI Agent Hackathon EP4 x OpenClaw</b>
</p>

---

## 📖 Overview

**NourishNet** is a multi‑agent system that tackles food waste and food insecurity. It aligns with **UN SDG 2 (Zero Hunger)**, **SDG 3 (Good Health)**, and **SDG 12 (Responsible Consumption)**.

Three specialised **autonomous AI agents** collaborate to:
- Detect surplus food from local businesses (**Scout Agent**)
- Match supply with NGOs and individuals (**Coordinator Agent**)
- Communicate via WhatsApp/Telegram and handle conversations (**Logistics Agent**)

All agents are powered by **open‑source LLMs** served through the **FLock API**, orchestrated with **OpenClaw** and the **Model Context Protocol (MCP)** for inter‑agent communication. A **human supervisor dashboard** provides oversight for edge cases.

> **Ethics & Safety**: NourishNet is built with explicit ethics guardrails across all agents (beneficence, non‑maleficence, fairness, privacy, transparency, and accountability), including content moderation, HITL escalation, bias audits, data minimisation, and audit trails. See [Ethics Guardrails](docs/ethics_guardrails.md) for full details.

---

## NourishNet: AI for Good – Serving Humanity

The organizations Svidok.org, LifeForce, and Economists for Ukraine are all programs operating under the umbrella of the **AI for Good Foundation**. They represent a powerful model of how technology, AI, and economic expertise can be directly applied to solve urgent humanitarian challenges.

The **NourishNet** project is not just similar in spirit; it shares a foundational architecture and philosophy. By understanding these organizations, you can see a clear path for how NourishNet can scale and integrate into a larger ecosystem of humanitarian tech.

Here’s a detailed breakdown of how NourishNet aligns with and can draw inspiration from these initiatives, including conceptual code integrations.

### The Ecosystem: AI for Good Foundation

Before diving into specifics, it’s important to see the big picture. The AI for Good Foundation acts as an umbrella, providing fiscal sponsorship and a technological backbone for mission-driven projects. This is the model NourishNet is built for—a modular, scalable solution that can be adapted to different crises.

```
┌─────────────────────────────────────────────────────────────┐
│                 AI for Good Foundation                      │
│  (Non-profit umbrella: fiscal sponsorship, infrastructure)  │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
│   Economists for  │ │   LifeForce   │ │     Svidok.org    │
│     Ukraine       │ │   (MySyla)    │ │     (Witness)     │
│  (Think Tank &    │ │ (Aid Matching ││  (War Diary &     │
│   Policy)         │ │   Platform)   │ │   Documentation) │
└───────────────────┘ └───────────────┘ └───────────────────┘
```

### 1. Svidok.org (Witness): Documenting Truth to Drive Action

**What It Is:** Svidok.org is Ukraine’s largest digital archive of personal testimonies about the war. It’s a “living museum” where people can anonymously share their experiences via a website, Telegram bot, or phone line.

**How It Serves Humanity:**
- **Preserves Memory:** It creates an immutable record to prevent historical revisionism.
- **Provides Evidence:** Testimonies are used by Ukraine’s Office of the Prosecutor General and the International Criminal Court as evidence in war crimes trials. Hundreds of stories have already been used in this way.
- **Funds Defense:** In a recent initiative, each recorded testimony was converted into a donation to purchase defensive equipment. This transforms the act of remembering into direct material support.

**How NourishNet Connects & Can Learn:**
NourishNet’s **Scout Agent** is fundamentally a data collection tool, much like Svidok. Where Svidok collects stories, the Scout Agent collects data on surplus food. Both are about gathering ground-truth information to fuel a larger mission.

- **Parallel Architecture:** Both use multi-channel input (web, Telegram bot, phone) to make participation as easy as possible.
- **Potential Code Integration:** Imagine NourishNet users being able to report not just surplus, but also other community needs. This data could be fed into platforms like LifeForce or a Svidok-style registry.

```python
# Conceptual Integration: Scout Agent feeding into Svidok-style repository
from mcp.client import MCPClient
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class EnhancedScoutAgent(ScoutAgent):
    async def report_humanitarian_need(self, need_data: dict):
        """Report non-food needs to a central repository (like Svidok)."""
        # This could be a separate MCP server for a "Humanitarian Needs Registry"
        await self.mcp_client.call_tool(
            server="humanitarian_registry",
            tool="report_need",
            params={
                "type": need_data["type"],  # e.g., "shelter", "medical", "testimony"
                "location": need_data["location"],
                "description": need_data["description"],
                "source": "nourishnet_scout",
                "timestamp": datetime.utcnow().isoformat(),
            },
        )
        logger.info("Reported %s need to central registry.", need_data["type"])
```

### 2. LifeForce (MySyla): Intelligent Aid Matching at Scale

**What It Is:** LifeForce is a digital platform that matches people in need with resources and services. It’s integrated with Ukraine’s e-government app, **Diia**, providing a secure and verified way for internally displaced persons (IDPs) to find food, shelter, medicine, and other essentials.

**How It Serves Humanity:**
- **Direct, Verified Aid:** It connects real people with real help.
- **Efficiency & Coordination:** It helps governments and NGOs understand real-time needs and manage the flow of aid effectively, preventing waste and duplication.
- **Economic Resilience:** It’s evolving to include a gig-employment feature, allowing communities to offer services and rebuild economic opportunity.

**How NourishNet Connects & Can Learn:**
NourishNet is a LifeForce for food. The core innovation is identical: an intelligent matching engine that connects supply with demand in real-time.

| Platform | Core Function | Matching Engine | Verification | Impact Metric |
| :--- | :--- | :--- | :--- | :--- |
| **LifeForce** | Matches people with aid | Human-in-the-loop coordination | Diia eGov integration | Aid deliveries at national scale |
| **NourishNet** | Matches surplus food with people | **Autonomous AI Agents** | WhatsApp/Telegram confirmations | Meals rescued, CO₂ avoided |

- **Parallel Architecture:** Both use a decentralized model to connect local providers and recipients. LifeForce works with pharmacies and supermarkets; NourishNet works with bakeries and cafes.
- **Potential Code Integration:** The most powerful integration would be for NourishNet to operate as a specialized **skill** or **module** within the LifeForce ecosystem.

```python
# Conceptual Integration: NourishNet as a skill for LifeForce
# LifeForce could call NourishNet's MCP tools to handle food-specific requests.

async def handle_food_request(mcp_client: MCPClient, user_id: str, location: dict):
    # 1. Check if user is verified via Diia (LifeForce's existing logic)
    # 2. If verified, call NourishNet to find a match
    match_result = await mcp_client.call_tool(
        server="nourishnet",
        tool="find_food_match",
        params={
            "user_location": location,
            "user_id": user_id,
            "preferences": {},  # optional
        },
    )
    if match_result:
        # LifeForce sends the notification using its own channels
        await send_notification(user_id, f"Food available: {match_result['business']}")
```

### 3. Economists for Ukraine: The Think Tank & Strategic Engine

**What It Is:** This is a global collective of academic economists who use their expertise to analyze the war’s economic impact, develop sanctions policy, and strategize for Ukraine’s reconstruction. They are the “think tank” arm of the AI for Good Foundation.

**How It Serves Humanity:**
- **Informs Policy:** They provide high-level economic analysis to governments and international bodies, shaping effective sanctions and financial support.
- **Develops Frameworks:** They publish principles and policies for rebuilding Ukraine and other crisis-affected regions.
- **Supports Academia:** Their fellowship and grant programs help keep top scholars in their home countries, preserving intellectual capital.

**How NourishNet Connects & Can Learn:**
This represents the **governance and analytical layer** that a project like NourishNet needs to scale. The data NourishNet collects—on food waste, hunger patterns, and community resilience—is the exact kind of evidence that economists and policymakers need.

- **Parallel Architecture:** Economists for Ukraine provides the strategic and policy framework. NourishNet provides a concrete, data-generating implementation of one of their strategic goals (food security, resilient communities).
- **Potential Code Integration:** This integration is less about direct API calls and more about **data sharing and reporting**. The **Analytics Agent** can produce reports and insights that could be directly consumed by organizations like Economists for Ukraine.

```python
# Conceptual Integration: NourishNet Analytics Agent generating policy reports

class AnalyticsAgent(BaseAgent):
    async def generate_quarterly_impact_report(self) -> dict:
        # ... aggregate data on meals rescued, CO2 avoided, etc. ...
        report = {
            "period": "Q1 2026",
            "metrics": {
                "meals_rescued": 4287,
                "co2_avoided_tonnes": 11.2,
                "individuals_reached": 1345,
                "businesses_engaged": 47,
            },
            "sdg_contributions": {
                "sdg2_zero_hunger": 4287,
                "sdg13_climate_action": 11.2,
            },
            "economic_impact_estimate_usd": 21435,  # Based on avg meal cost
            "recommendations": [
                "Increase tax incentives for food donation businesses.",
                "Expand platform to three new cities based on demand data.",
            ],
        }
        await self.publish_public_report(report)
        return report
```

### Summary: A Shared DNA of “AI for Good”

NourishNet shares a fundamental DNA with these remarkable initiatives:

| Organization | Core Function | NourishNet Parallel |
| :--- | :--- | :--- |
| **Svidok.org** | Collecting ground-truth data (testimonies) to preserve history and drive action. | **Scout Agent** collects ground-truth data (surplus food) to drive rescue. |
| **LifeForce** | Intelligent matching of supply (aid) and demand (people in need) at scale. | **Coordinator & Logistics Agents** match food surplus with recipients. |
| **Economists for Ukraine** | Providing the strategic, analytical, and governance framework for long-term impact. | **Governance models & Analytics Agent** provide strategic oversight and data-driven insights. |

By studying these organizations, we see a clear roadmap for NourishNet: from a specialized agent-based system to an integrated module within a larger humanitarian ecosystem, governed by data and guided by a mission to serve humanity.

## A Vision of Technology in Service of Humanity

NourishNet is not merely a technical demonstration—it is a **blueprint for how artificial intelligence can serve humanity's most fundamental needs**. At its core, NourishNet addresses a profound moral paradox of our time: that nearly one‑third of all food produced is wasted, while millions go hungry every single day. This is not a failure of production, but a failure of **coordination, logistics, and compassion**.

NourishNet uses AI to bridge that gap. It is technology with a conscience, designed from the ground up to serve the most vulnerable among us while creating value for everyone in the ecosystem.

---

## 🌍 The Problem We Solve

| The Crisis | The Human Cost |
|------------|----------------|
| 1.3 billion tonnes of food wasted annually | 690 million people go to bed hungry |
| Food waste generates 8‑10% of global greenhouse gases | Climate change disproportionately affects the poor |
| $1 trillion in economic losses each year | Families forced to choose between food and medicine |
| Perfectly edible food discarded daily | Children suffering from malnutrition |

This is not a resource scarcity problem—it is a **coordination failure**. We have the food. We have the people who need it. What we lack is the intelligence to connect them efficiently and at scale.

---

## 🤖 How NourishNet Serves Humanity

### 1. For the Hungry Individual

**Before NourishNet:** A single mother working two jobs has no time to queue at food banks. She often skips meals so her children can eat.

**With NourishNet:** She receives a WhatsApp message: *"Good evening! Sunrise Bakery has 3 sandwiches available 5 minutes from your home. Use code NOURISH5 to pick up within the next hour."*

She replies "On my way!" and within minutes, nutritious food that would have been wasted is feeding her family. The interaction is private, dignified, and effortless.

**How we serve humanity:** We restore dignity to food assistance. No forms, no queues, no judgment—just a simple, respectful connection between surplus and need.

### 2. For the Local Business

**Before NourishNet:** A bakery owner hates throwing away unsold bread at closing time. It feels wrong, but they have no reliable way to donate.

**With NourishNet:** They post once: "3 unsold loaves." The Scout Agent detects it, the Coordinator Agent finds the nearest food bank, and the Logistics Agent arranges pickup. The owner receives an Impact NFT as verifiable proof of their contribution, which they can display to customers and claim for tax benefits.

**How we serve humanity:** We make doing good easy and rewarding. By removing friction and providing tangible recognition, we transform businesses from passive wasters into active contributors to community wellbeing.

### 3. For the Food Bank

**Before NourishNet:** Staff spend hours coordinating pickups, maintaining donor relationships, and managing inventory. They often turn away donations because they lack capacity.

**With NourishNet:** The system automatically matches incoming surplus with their capacity and preferences. Volunteers receive scheduled reminders. Impact metrics are automatically tracked for grant reporting. They spend less time on logistics and more time serving people.

**How we serve humanity:** We amplify the impact of humanitarian organisations by automating the mundane, freeing human energy for human connection.

### 4. For the Environment

**Before NourishNet:** Food rotting in landfills generates methane, a greenhouse gas 25 times more potent than CO₂.

**With NourishNet:** Every rescued meal prevents that waste. Our dashboard shows real‑time CO₂ avoidance—3.2 tonnes in our pilot, equivalent to taking 27 cars off the road for a year.

**How we serve humanity:** We protect the planet for future generations. Climate action is humanitarian action.

### 5. For the Community

**Before NourishNet:** Food waste and hunger exist side by side, invisible to each other.

**With NourishNet:** A new social fabric emerges. Businesses become heroes. Neighbors help neighbors. Trust is built through transparent, verifiable transactions. The DAO allows community members to govern how the system evolves.

**How we serve humanity:** We strengthen social cohesion. Technology becomes a bridge, not a barrier.

### 6. For the Volunteer

**Before NourishNet:** Volunteers burn out from manual coordination and uncertain schedules.

**With NourishNet:** They receive clear, actionable tasks via their preferred channel. They see the impact of their efforts in real time. They become part of a movement, not just a roster.

**How we serve humanity:** We empower civic participation by making it easy, visible, and rewarding.

### 7. For the Policy Maker

**Before NourishNet:** Food policy is made with outdated data and guesswork.

**With NourishNet:** Real‑time, anonymised data on food waste and food insecurity becomes available. Policy makers can see exactly where interventions are needed and measure their effectiveness with precision.

**How we serve humanity:** We enable evidence‑based governance. Good intentions become measurable outcomes.

### 8. For Future Generations

**Before NourishNet:** Children grow up in a world where hunger and waste coexist—a paradox that erodes faith in society's ability to solve problems.

**With NourishNet:** They see technology used for good. They learn that AI can be a force for compassion. They inherit a platform they can build upon.

**How we serve humanity:** We plant seeds of hope. We demonstrate that a better world is not only possible, but achievable with today's tools.

---

## 🧠 The Intelligence Behind the Compassion

What makes NourishNet uniquely capable of serving humanity is its **multi‑agent AI architecture**:

- **Scout Agent** – tirelessly monitors for surplus, never missing an opportunity.
- **Coordinator Agent** – makes fair, explainable decisions about who gets what.
- **Logistics Agent** – communicates with empathy and clarity, adapting to each user's needs.
- **Analytics Agent** – learns from data to continuously improve the system.
- **Human‑in‑the‑loop** – ensures that when AI is uncertain, a human heart makes the final call.

These agents work together 24/7, at a scale no human team could match, with a consistency that never tires.

---

## 📊 The Numbers That Matter

In our pilot (simulated):

| Metric | Value | Human Meaning |
|--------|-------|---------------|
| Meals rescued | 4,287 | 4,287 families fed |
| CO₂ avoided | 11.2 tonnes | Cleaner air for everyone |
| People reached | 1,345 | 1,345 individuals not forgotten |
| Businesses engaged | 47 | 47 businesses empowered to give |
| Human interventions | 89 (0.48%) | 99.5% autonomy, 100% accountability |

These numbers represent real human lives touched, real environmental impact, real community transformation.

---

## 🌱 Alignment with the Sustainable Development Goals

NourishNet directly serves multiple UN SDGs:

| SDG | How We Serve |
|-----|--------------|
| **SDG 2: Zero Hunger** | Direct food redistribution to the hungry |
| **SDG 3: Good Health** | Improved nutrition through rescued fresh food |
| **SDG 10: Reduced Inequalities** | Prioritising the most vulnerable |
| **SDG 12: Responsible Consumption** | Halving food waste through intelligent logistics |
| **SDG 13: Climate Action** | Quantifiable CO₂ reduction |
| **SDG 17: Partnerships** | Connecting businesses, NGOs, and government |

---

## 🇬🇧 Deploying NourishNet Across the UK – Partnership Roadmap

Moving from a technical prototype to a real‑world implementation requires a strategic partnership roadmap. Based on the current UK landscape, here is a comprehensive plan for advancing partnerships to deploy NourishNet across the United Kingdom.

### 🎯 The UK Partnership Landscape: A Moment of Opportunity

The UK is currently experiencing an unprecedented convergence of royal patronage, government funding, private sector innovation, and charitable infrastructure focused on food waste and food insecurity. NourishNet is uniquely positioned to integrate into this ecosystem.

#### Key Partnership Tiers for NourishNet

| Partnership Tier | Target Organizations | Strategic Value | Implementation Path |
| :--- | :--- | :--- | :--- |
| **Royal & High‑Level** | Coronation Food Project, Alliance Food Sourcing | Credibility, access to major retailers | Align with existing pledge framework |
| **Government & Funding** | DEFRA, Innovate UK, Local Authorities | Grant funding, policy alignment | Apply through BridgeAI and farm gate schemes |
| **National Charities** | FareShare, The Felix Project | Distribution network of 8,000+ charities | API integration with existing logistics |
| **Corporate Partners** | Tesco, Sainsbury's, Waitrose, Nestlé, 2 Sisters Food Group | Surplus food volume, logistics expertise | Pilot with single manufacturer, expand to retailers |
| **Technology & Innovation** | Google Cloud, Sustainable Ventures, Zest | AI infrastructure, climate tech ecosystem | Leverage existing Google Cloud integrations |
| **Local Authorities** | Birmingham, Liverpool, London boroughs | Targeted pilot locations, existing waste contracts | Map to DEFRA grant recipients for co‑funding |
| **Media & Awareness** | Tindle Newspapers, regional press | Community reach, volunteer recruitment | Replicate FareShare media partnership model |

---

### 🤝 Tier 1: Royal & High‑Level Partnerships

#### The Coronation Food Project & Alliance Food Sourcing

The Coronation Food Project, inspired by His Majesty The King, has created a historic pledge among UK food industry leaders to reduce waste and increase redistribution. Alliance Food Sourcing includes executives from **Tesco, Sainsbury's, Waitrose, Marks & Spencer, 2 Sisters Food Group, and Greencore**.

**Strategic Opportunity:** NourishNet can position itself as a **technology delivery partner** for the Coronation Food Project's next phase. The project has already rescued an additional **1,541 tonnes** of surplus food and raised **£20 million** to supercharge delivery efforts. The King himself has noted that "there's still a bit more to do."

**Implementation Steps:**

1. **Align with existing metrics:** The project has delivered **4,932 tonnes** (over 11 million meals) to date. NourishNet's AI efficiency gains could help Alliance members surpass their pledges.
2. **Pilot with a signatory:** Approach **2 Sisters Food Group** or **Greencore** (both manufacturers with existing waste challenges) for a pilot program, demonstrating how NourishNet's AI can identify surplus earlier in the supply chain.
3. **Leverage royal momentum:** Use the second anniversary momentum (November 2025) to propose NourishNet as a scalable solution for the planned expansion of **Coronation Food Hubs** from three locations (Liverpool, Birmingham, South London) to ten.

---

### 💷 Tier 2: Government & Public Funding

#### DEFRA & Local Authority Grants

The Department for Environment, Food, and Rural Affairs has allocated **£707,240.86 to Birmingham City Council** alone for food waste collection in 2025/26. This is part of a nationwide funding stream to local authorities.

**Strategic Opportunity:** NourishNet can be positioned as a **technology solution that helps local authorities meet their waste reduction targets** while simultaneously addressing food poverty.

**Implementation Steps:**

1. **Target high‑funding authorities:** Birmingham (£707k), Leeds (£597k), Durham (£462k), and Cornwall (£510k) are top recipients. Approach their waste management and social services departments.
2. **Pitch the dual benefit:** NourishNet helps authorities track both **waste reduction (DEFRA mandate)** and **food poverty metrics (social care mandate)** through a single platform.

#### Innovate UK BridgeAI Programme

A consortium including **Nestlé, FareShare, Google Cloud, and Zest** recently received a **£1.9 million grant** (match‑funded) from Innovate UK's BridgeAI initiative to develop an AI food redistribution platform.

**Strategic Opportunity:** NourishNet can either:

- **Partner with the existing consortium** to enhance their matching algorithms.
- **Apply for the next funding round** with a focus on NourishNet's unique multi‑agent architecture.

**Contact point:** Esra Kasapoglu, Director of AI and Data Economy at Innovate UK, has publicly praised the collaborative model.

#### Tackling Food Surplus at the Farm Gate Scheme

DEFRA has announced **£13.6 million** in funding for projects tackling food waste at the farm level, with grants starting from **£20,000**.

**Strategic Opportunity:** NourishNet's Scout Agent could be deployed to farms to identify surplus before it leaves the gate, connecting directly to charities like **The Bread and Butter Thing**, which received funding through this scheme.

**Implementation:** Contact Mark Game, Founder of The Bread and Butter Thing, who noted the funding will be used for "logistics infrastructure including vehicles, refrigeration, and packing facilities" – all areas where NourishNet's coordination intelligence could add value.

---

### 🏢 Tier 3: National Charities & Distribution Networks

#### FareShare

FareShare redistributes food to over **8,000 charities and community groups** across the UK, reaching approximately **81,000 people** in Wales, Sussex, Surrey, and the South West alone. They have existing technology partnerships with Zest and Google Cloud.

**Strategic Opportunity:** NourishNet's multi‑agent system could serve as an **intelligent layer on top of FareShare's existing logistics**, optimizing match decisions in real time.

**Implementation Steps:**

1. **Connect with regional partners:** FareShare South West, FareShare Cymru, and FareShare Sussex & Surrey have demonstrated openness to partnerships (e.g., with Tindle Newspapers).
   - **Lucy Bearn, CEO of FareShare South West**, has expressed enthusiasm for partnerships that are "rooted in the local community."
2. **Demonstrate complementary value:** The existing Zest platform focuses on manufacturer‑to‑charity connections. NourishNet's strength is in **last‑mile coordination** with individual recipients – a gap in the current ecosystem.

#### The Felix Project

A key partner of the Coronation Food Project, The Felix Project collects surplus from retailers like **Fortnum & Mason** (4.28 tonnes in 2024 alone, equivalent to 10,200 meals).

**Strategic Opportunity:** Felix's apprentice chef program and training kitchen could be a pilot site for NourishNet's logistics agent, connecting surplus directly to community cooking programs.

---

### 🏭 Tier 4: Corporate Partners

#### Food Manufacturers & Retailers

**Nestlé UK&I** is the primary food manufacturer partner in the Innovate UK consortium, with Dr. Emma Keller, Head of Sustainability, stating: "it is important for us at Nestlé to set an example on food waste."

**Howard Tenens Logistics** provides the physical distribution network for the consortium and is described as "one of the largest, independently owned and operated logistics company in the UK."

**Retailers** including **Tesco, Sainsbury's, Waitrose, and Marks & Spencer** have all committed to the Coronation Food Project pledge.

**Strategic Opportunity:** Each of these companies has **ESG reporting requirements** and **waste reduction targets**. NourishNet's Impact NFT system provides **verifiable, immutable proof** of their contributions.

**Implementation Steps:**

1. **Start with one manufacturer:** Propose a pilot with **Nestlé UK&I** at a single factory, building on the earlier Zest trial that achieved an **87% reduction in edible food waste** over two weeks.
2. **Engage the logistics partner:** **Howard Tenens Logistics** is already interested in innovative distribution models and could provide real‑world logistics data to train NourishNet's Coordinator Agent.

---

### 💻 Tier 5: Technology & Innovation Partners

#### Google Cloud

The Innovate UK consortium leverages **Google Cloud's BigQuery and Vertex AI platform** to accelerate the matching process.

**Strategic Opportunity:** NourishNet's current architecture (built on open‑source models via FLock) could be **containerised and deployed on Google Cloud**, accessing their AI optimisation tools.

#### Sustainable Ventures

Sustainable Ventures coordinated the Innovate UK consortium and has supported over **850 climate tech companies**. Simon Brown, Corporate Innovation Partner, noted: "Bringing together this fantastic group of stakeholders will reduce the time and risk taken to develop this new AI food supply chain management platform."

**Strategic Opportunity:** Apply to join Sustainable Ventures' ecosystem for mentorship, corporate connections, and potential funding.

#### Zest (formerly The Wonki Collective)

Zest has developed an "AI B2B Software as a Service platform to help food and beverage manufacturers manage surplus foodstock." Dini McGrath, Co‑Founder, has emphasized that "collaboration is key."

**Strategic Opportunity:** NourishNet's focus on **individual recipients** (B2C/B2G) is complementary to Zest's **manufacturer focus** (B2B). A partnership could create an end‑to‑end solution from factory surplus to individual plates.

---

### 📍 Tier 6: Local Authorities & Pilot Cities

#### Priority Pilot Locations

Based on funding levels, existing infrastructure, and need:

1. **Birmingham** (£707k funding) – already identified as a Coronation Food Hub location.
2. **Liverpool** (£326k funding) – Coronation Food Hub location.
3. **Leeds** (£597k funding) – strong retail presence.
4. **London boroughs** (South London hub) – multiple boroughs receiving funding.
5. **Bristol** – home to Bristol Superlight (consortium partner) and FareShare South West.

**Implementation Steps:**

1. **Map to existing hubs:** The Coronation Food Project plans to expand from 3 to 10 hubs. Propose NourishNet as the **intelligent coordination layer** for each new hub.
2. **Leverage local authority funding:** Each local authority has received specific grants. Approach them with a proposal to **match‑fund a NourishNet pilot** using these resources.

---

### 📰 Tier 7: Media & Awareness Partners

#### Tindle Newspapers

Tindle has partnered with FareShare network partners, donating **up to £100,000 in advertising space** and providing editorial coverage across print, online, and social media. Scott Wood, Tindle Managing Director, noted: "families are feeling the pinch. That is why we are delighted to announce this partnership."

**Strategic Opportunity:** Tindle's model demonstrates how media partnerships can drive **volunteer recruitment, business engagement, and public awareness**.

**Implementation Steps:**

1. **Replicate the model:** Approach Tindle (or similar regional publishers) with a proposal focused on NourishNet's **local impact stories**.
2. **Highlight the AI angle:** Media outlets are interested in technology innovation. The AI agent narrative could generate positive coverage.

---

### 🗺️ Phased Implementation Roadmap

#### Phase 1: Foundation (Months 1‑3)

- **Register with Innovate UK BridgeAI** program.
- **Establish contact** with Sustainable Ventures for ecosystem access.
- **Map specific contacts** at FareShare South West and one local authority (e.g., Birmingham).
- **Refine pitch deck** to align with Coronation Food Project metrics.

#### Phase 2: Pilot Design (Months 3‑6)

- **Secure one manufacturer partner** (e.g., Nestlé or 2 Sisters) for a limited pilot.
- **Partner with one FareShare regional hub** for distribution.
- **Apply for DEFRA farm gate grant** (£20k+).
- **Engage Google Cloud** for technical advisory support.

#### Phase 3: Pilot Execution (Months 6‑12)

- **Launch pilot** in one Coronation Food Hub city (e.g., Birmingham).
- **Collect impact metrics** aligned with Coronation Food Project reporting.
- **Generate media coverage** through regional press partnerships.
- **Present results** to Alliance Food Sourcing members.

#### Phase 4: Scaling (Year 2)

- **Expand to additional hubs** as they launch.
- **Integrate with Zest platform** for end‑to‑end solution.
- **Apply for larger Innovate UK grant** (£1M+).
- **Establish DAO governance** with pilot participants.

---

### 💡 Key Contacts & Opportunities Summary

| Organization | Key Contact / Role | Opportunity |
| :--- | :--- | :--- |
| **Coronation Food Project** | Alliance Food Sourcing members | Technology delivery partner |
| **Innovate UK** | Esra Kasapoglu, Director of AI | BridgeAI funding, credibility |
| **FareShare South West** | Lucy Bearn, CEO | Regional pilot, charity network |
| **Sustainable Ventures** | Simon Brown, Corporate Innovation Partner | Ecosystem access, mentorship |
| **Nestlé UK&I** | Dr. Emma Keller, Head of Sustainability | Manufacturer pilot partner |
| **Zest** | Dini McGrath, Co‑Founder | Complementary technology partner |
| **The Bread and Butter Thing** | Mark Game, Founder | Farm‑gate pilot partner |
| **Birmingham City Council** | Waste Management Department | Local authority pilot, funding match |

---

### 🚀 Conclusion – A UK Ecosystem Ready for NourishNet

The UK has never been more ready for a solution like NourishNet. With royal backing, government funding, corporate commitment, and charitable infrastructure all aligned, the path to real‑world implementation is clearer than ever.

The key insight from the Innovate UK consortium is that **"collaboration is key."** NourishNet should not seek to replace existing systems but to **enhance them with intelligent AI coordination**. By positioning NourishNet as a complementary technology layer within the existing ecosystem, it can move from prototype to production within months, not years.

---

For more detailed, data‑driven UK context (waste statistics, policy landscape, major redistribution actors, and funding streams) see `docs/uk_context.md`.

---

## 🕊️ A Letter from the Future

> *Dear NourishNet,*
>
> *I remember the day you sent me my first food alert. I was embarrassed, ashamed that I needed help. But your message was kind, private, matter‑of‑fact. It didn't feel like charity—it felt like community.*
>
> *Today, my business donates 200 meals a week through your system. My children are proud of me. And when I see the Impact NFTs in my digital wallet, I remember every sandwich, every loaf, every piece of fruit that fed a neighbor.*
>
> *You taught me that technology doesn't have to be cold. It can be warm. It can connect. It can heal.*
>
> *Thank you for serving humanity.*
>
> *— Sarah, former recipient, now donor*

---

## 🚀 The Road Ahead

NourishNet is not finished. It is a living system that will grow and improve as more people join. We envision:

- **Global scale** – from cities to countries to continents.
- **More food types** – fresh produce, prepared meals, groceries.
- **Integration with social services** – connecting food assistance with healthcare, education, and employment.
- **Open data** – anonymized insights for researchers and policy makers.
- **Community ownership** – the DAO ensures the platform serves its users, not shareholders.

---

## 🤝 Join the Movement

NourishNet is open source, built by volunteers, and guided by a mission: **a world where no one goes hungry and no food goes to waste**.

We invite you to:
- **Use the platform** – as a business, NGO, or individual.
- **Contribute code** – on GitHub.
- **Govern with us** – through the DAO.
- **Spread the word** – because hunger is solvable.

---

## 🌟 Final Thought

Technology is not an end in itself. It is a tool. The question is not *what* we build, but *why* we build it and *who* it serves.

NourishNet exists for one reason: to serve humanity. Every line of code, every AI inference, every smart contract is written with that purpose. We believe that when we combine the best of human compassion with the best of machine intelligence, we can solve problems once thought unsolvable.

This is AI for good. This is technology with heart. This is NourishNet.

---

*"The moral test of society is how it treats those in the dawn of life, the children; those in the twilight of life, the elderly; and those in the shadows of life, the sick, the needy, and the handicapped."* — Hubert Humphrey

NourishNet passes that test. Join us.

---

## ✨ Features

- **Fully autonomous agents** – each runs independently, making decisions using LLMs.
- **Real‑world impact** – live dashboard with meals saved, CO₂ avoided, people reached.
- **Multi‑channel** – WhatsApp (Twilio) and Telegram integration.
- **Human‑in‑the‑loop** – agents request help when confidence is low; supervisors approve/reject via a simple UI.
- **Inter‑agent communication** – MCP event bus with queues, streaming, and durable messaging.
- **Extensible architecture** – easily add new agents or channels.
- **Mock mode** – demo without external dependencies.

---

## 🧠 Multi‑Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Event Bus                            │
│  (publish/subscribe, queues, streaming, elicit)                 │
└───────────────────────────────┬─────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Scout Agent   │    │ Coordinator     │    │ Logistics Agent │
│   (Llama 3.1)   │◄──►│ Agent (Mistral) │◄──►│   (Gemma 2B)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                     ┌─────────────────┐
                     │  Impact Agent  │
                     │ (Web3 / NFTs)  │
                     └─────────────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │   Human Supervisor      │
                    │   (Flask Dashboard)     │
                    └─────────────────────────┘
```

### Agent Responsibilities

| Agent       | Role                                                                 | AI / Web3 Layer               |
|-------------|----------------------------------------------------------------------|--------------------------------|
| **Scout**   | Detects surplus food, extracts structured data, requests human help | `Llama 3.1 8B` (extraction)   |
| **Coordinator** | Matches surplus with recipients, scores urgency using LLM           | `Mistral 7B` (urgency scoring)|
| **Logistics**   | Sends messages, handles conversations, confirms pickups             | `Gemma 2B` (Q&A)              |
| **Impact**      | Listens for `pickup.confirmed`, mints Impact NFTs on‑chain         | `ImpactNFT` smart contract    |

### Optional Web3 / Impact NFTs – Autonomous On‑Chain Agent

The codebase includes an experimental, opt‑in Web3 bridge for **Impact NFTs**, implemented
as a dedicated autonomous **Impact Agent**:

- The `ImpactAgent` subscribes to `pickup.confirmed` events emitted by the `LogisticsAgent`
  once a recipient has confirmed a pickup.
- It uses the `ImpactNFTClient` in `onchain/impact_nft.py` to mint an NFT (or log a mock
  mint in local/dev setups), producing an on‑chain, auditable record of each rescue.
- The NFT metadata is built from the surplus payload and recipient type via
  `build_metadata_from_surplus(...)` and converted into a standards‑friendly ERC‑721 JSON
  document with:
  - `name` – e.g. `NourishNet Impact – Sunrise Bakery`
  - `description` – short human‑readable summary of the rescue
  - `attributes` – traits such as Business, Food Type, Quantity, CO₂ Saved (kg),
    Recipient Type, Rescued At, and Surplus ID.
- Metadata is stored as:
  - An inline `data:application/json,...` URI by default (no extra infra required), or
  - An `ipfs://<cid>` URI when IPFS is configured, using `ipfshttpclient`.

To enable real on‑chain mints you will need:

- A deployed `ImpactNFT` contract exposing `mintImpact(address,string)` (see
  `onchain/contracts/ImpactNFT.sol`).
- An RPC endpoint and funded private key.
- Environment variables:
  - `ENABLE_IMPACT_NFT=true`
  - `WEB3_RPC_URL`
  - `WEB3_CHAIN_ID`
  - `WEB3_IMPACT_NFT_CONTRACT_ADDRESS`
  - `WEB3_IMPACT_NFT_PRIVATE_KEY`
  - *(optional, for IPFS)* `IPFS_API_URL` (e.g. `/ip4/127.0.0.1/tcp/5001` or a Pinata endpoint)

When these are not set, the system stays in safe mock mode but still publishes
`impact.nft_minted` events for dashboards and analytics, so the rest of the multi‑agent
flow and metrics continue to function without a blockchain node.

---

## 🔄 Orchestration & Routing of Specialized AI Agents

In a multi‑agent system, **orchestration** is the brain that ensures agents work together seamlessly. For NourishNet, we use an **OpenClaw‑style orchestration layer** implemented via our MCP event bus (`mcp/server.py`) to handle communication, task routing, and state hand‑offs between the specialised agents.

### 1. High‑Level Agent Interaction Flow

```text
[External Trigger] 
       ↓
┌─────────────────┐
│   Scout Agent   │  (detects/ingests surplus food)
└────────┬────────┘
         │ "surplus.detected" event
         ↓
┌─────────────────┐
│ Coordinator Agent│  (matches with NGOs/users)
└────────┬────────┘
         │ "match.ready" event
         ↓
┌─────────────────┐
│ Logistics Agent  │  (engages user via WhatsApp/Telegram)
└────────┬────────┘
         │ "pickup.confirmed" event (updates metrics)
         ↓
   [Impact Dashboard]
```

All agents are **loosely coupled** – they communicate exclusively through the MCP event bus, never via direct function calls. This makes the system resilient, scalable, and easy to debug.

### 2. Orchestration Primitives

The orchestrator exposes a few simple primitives that mirror **OpenClaw’s native orchestration features**:

- **Agent registration (implicit)** – each agent instantiates a `BaseAgent` with a unique name and set of responsibilities (`ScoutAgent`, `CoordinatorAgent`, `LogisticsAgent`).
- **Message bus** – agents publish and subscribe to **typed events** using `MCPClient.publish` / `MCPClient.subscribe`. Events are JSON objects containing a `type`, `payload`, and metadata (see `mcp/server.py`).
- **Routing rules (by event type)** – routing is defined declaratively by event name:
  - `surplus.detected` → `CoordinatorAgent`
  - `match.ready` → `LogisticsAgent`
  - `pickup.confirmed` → (future) `MetricsAgent` or dashboard backend
- **State store** – long‑lived state (e.g., recipient profiles) lives in the agents or, in production, Redis (`config.REDIS_URL`). Agents can read/write state without calling each other directly.

### 3. Step‑by‑Step Routing Example

#### **Step 1: Surplus Ingestion (Scout Agent)**
- A local bakery posts via a simple web form: *“3 unsold sandwiches, closing now”*.
- The `ScoutAgent` receives this input (via a webhook or periodic scan).
- It calls **FLock (Llama 3.1)** via `BaseAgent.call_flock` to extract structured data, for example:
  - `{ items: "sandwiches", quantity: 3, expiry: "today" }`
- It then publishes an event:

```json
{
  "type": "surplus.detected",
  "source": "scout",
  "payload": {
    "business": "Sunrise Bakery",
    "location": "lat:51.498, lon:-0.178",
    "food_items": ["sandwich"],
    "quantity": 3,
    "pickup_deadline": "2026-03-01T22:00Z"
  }
}
```

#### **Step 2: Matching (Coordinator Agent)**
- The `CoordinatorAgent` subscribes to `surplus.detected`. The MCP bus routes the event to it.
- Coordinator loads recipient data (NGOs and individuals, from memory or Redis).
- It uses **FLock (Mistral 7B)** to score urgency based on profile and context.
- It selects the best matches and publishes one or more `match.ready` events:

```json
{
  "type": "match.ready",
  "source": "coordinator",
  "payload": {
    "surplus_id": "123",
    "matches": [
      { "recipient": "+447911123456", "channel": "whatsapp", "urgency": 0.9 },
      { "recipient": "@foodbank_king", "channel": "telegram", "urgency": 0.7 }
    ],
    "food_details": { }
  }
}
```

#### **Step 3: User Notification (Logistics Agent)**
- The `LogisticsAgent` listens for `match.ready`.
- For each match, it formats a friendly message and sends it via the appropriate channel (Twilio for WhatsApp, Telegram Bot API for Telegram; mocked in this repo).
- If the user replies (e.g., “On my way”), Logistics uses **FLock (Gemma 2B)** to decide if this confirms the pickup and to answer follow‑up questions.
- On confirmation, it publishes `pickup.confirmed` and can update shared metrics/state.

#### **Step 4: Metrics Update**
- A lightweight **Metrics component** (or the public dashboard backend) listens for `pickup.confirmed` and updates counters like meals saved and CO₂ avoided.

### 4. Routing Logic & Decision Making

The system uses a mix of **static routing** and **dynamic decision making**:

- **Static routing** is by event type: all `surplus.detected` events go to Coordinator; all `match.ready` events go to Logistics. This is enforced by which agents subscribe to which topics.
- **Dynamic routing** happens inside agents:
  - Coordinator chooses *which* recipients/channels to notify.
  - Logistics decides *how* to respond and *when* to emit `pickup.confirmed`.

This separation keeps agents simple, testable, and reusable.

### 5. Asynchronous Event‑Driven Communication

All inter‑agent communication is **asynchronous**:

- **Pros**: agents do not block each other; a slow or temporarily offline agent does not take the system down.
- **Implementation**: the MCP server maintains an in‑memory queue per event type (`queues: Dict[str, asyncio.Queue]` in `mcp/server.py`). In production this can be swapped for Redis to get durable queues.
- If Logistics is down, for example, `match.ready` events wait in its queue until it comes back.

### 6. Error Handling & Observability

- **Backoff & retries** – `MCPClient.subscribe` automatically retries on network errors with a small delay.
- **Human‑in‑the‑loop** – agents use `elicit` to create human tasks when confidence is low; these are surfaced in the Flask dashboard.
- **Traceability** – events carry a `source` field and, in a production deployment, would also include correlation IDs for end‑to‑end tracing.

### 7. Why This Design Works

- **Framework‑aligned**: matches how OpenClaw‑style agent orchestration works, mapped onto a lightweight MCP server.
- **Scalable**: new agents (e.g., a Donor Relations Agent) can subscribe to existing events without touching existing code.
- **Robust**: asynchronous queues and human‑in‑the‑loop controls make the system resilient to partial failures and edge cases.

---

## 📡 Multi‑Channel Integration (WhatsApp & Telegram)

NourishNet delivers food rescue notifications and conversational support through **multiple messaging channels** – primarily **WhatsApp** and **Telegram**. This lets us reach recipients on the apps they already use while keeping the core agent logic channel‑agnostic and easily extensible to SMS, Facebook Messenger, etc.

### 1. Why Multi‑Channel?

- **Wide reach** – WhatsApp has massive reach globally; Telegram is popular with NGOs and tech‑savvy volunteers.
- **User preference** – users engage more on familiar apps.
- **Offline‑friendly** – both channels support asynchronous messaging, ideal for intermittent connectivity.
- **Rich media** – images, locations, and quick reply buttons make flows clearer and more accessible.

### 2. Channel‑Agnostic Architecture

All outbound and inbound messaging is owned by the `LogisticsAgent`, which acts as a **central communication hub**. Other agents never talk to Twilio/Telegram directly – they just emit events:

- Coordinator publishes `match.ready` events when a surplus has been matched to a recipient and a `channel` (WhatsApp/Telegram) is chosen.
- The Logistics Agent subscribes to:
  - `match.ready` – send initial notifications.
  - `logistics.incoming` – handle user replies from any channel.

Internally, the Logistics Agent keeps a **conversation state** per user (keyed by messaging user id such as phone number or chat id) including:

- `state` (e.g. `awaiting_reply`, `confirmed`)
- `match` data (surplus, recipient)
- `channel` (`whatsapp` / `telegram`)

### 3. Technical Implementation

#### WhatsApp via Twilio

Outbound messages use **Twilio’s WhatsApp Business API**. In production mode (non‑mock credentials in `config.py`), `LogisticsAgent.send_whatsapp(...)` uses the Twilio SDK:

```python
client.messages.create(
    body=text,
    from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
    to=f"whatsapp:{to_number}",
)
```

Inbound messages hit the FastAPI MCP server at `/webhook/whatsapp`. The webhook parses Twilio’s form payload and publishes a `logistics.incoming` event:

```python
user_id = from_raw.replace("whatsapp:", "")  # phone number
await publish_event(
    Event(
        type="logistics.incoming",
        payload={"user_id": user_id, "text": body, "channel": "whatsapp"},
        source="whatsapp_webhook",
    )
)
```

#### Telegram Bot API

For Telegram, the Logistics Agent uses the **Telegram Bot API** directly via `requests`:

```python
url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
requests.post(url, json={"chat_id": chat_id, "text": text})
```

The MCP server exposes `/webhook/telegram` which receives Telegram’s JSON updates and forwards text messages as `logistics.incoming` events with `channel="telegram"`.

#### Conversation Handling with Gemma 2B

When a `logistics.incoming` event arrives, the Logistics Agent:

1. Loads the user’s conversation state (if any).
2. Uses **FLock (Gemma 2B)** to interpret the message:
   - Decide whether the user has **confirmed pickup** (e.g. “On my way”).
   - Or answer common questions (where, when, which code, etc.).
3. Replies on the same channel using the channel‑agnostic `send_message(channel, user_id, text)` helper.
4. If pickup is confirmed, publishes `pickup.confirmed` so downstream components (dashboards, metrics) can update counts.

### 4. Mock Mode for Demos

For hackathon demos where real Twilio/Telegram credentials are not available, `config.py` leaves credentials as `"mock"`. In this mode:

- `send_whatsapp` / `send_telegram` log to stdout with `[MOCK WhatsApp]` / `[MOCK Telegram]`.
- Webhook endpoints can still be exercised using tools like `curl` or the built‑in supervisor chat, driving the same `logistics.incoming` flow.

This provides a **fully interactive demo** without external dependencies, while keeping the production‑ready integration one config change away.

### 5. Extensibility

Adding a new channel (e.g. SMS) follows a simple pattern:

1. Implement a new adapter method in the Logistics Agent (e.g. `send_sms`) and route it from `send_message`.
2. Add a webhook (or polling job) that normalises incoming messages and publishes `logistics.incoming` events with `channel="sms"`.
3. Reuse the same Gemma‑based conversation logic – only the delivery mechanism changes.

This keeps the **core intelligence and routing centralised**, while letting the system grow to new channels as the project scales.

---

## 🤖 AI Models Powering Each Agent

All agents use **only open‑source models**, accessed via the **FLock API**, as required by the bounty. Each agent is paired with a model optimised for its specific task – balancing accuracy, speed, and context window. This section explains the models, why they were chosen, example prompts, and how they integrate with the FLock client used in this repo.

---

### 1. Scout Agent – Entity Extraction & Classification

**Primary model**: `meta-llama/Meta-Llama-3.1-8B-Instruct` (via FLock)  
**Why this model**:  
- **Structured outputs** – very good at following strict JSON‑only instructions.  
- **Entity extraction** – strong few‑shot performance for turning noisy text into structured fields.  
- **Latency vs quality** – 8B is a sweet spot for batch ingestion without being too slow.

**Tasks**:
- **Entity extraction**: from unstructured business messages (e.g. *“3 leftover sandwiches, best before today”*) extract `food_items`, `quantity`, `expiry`.  
- **Classification**: map listings into one of `["bakery", "hot_meal", "grocery", "other"]`.  
- **Safety** (optional extension): add a moderation prompt to filter obviously invalid or abusive inputs before publishing events.

**Prompt example (entity extraction)**:

```text
You are an AI assistant that extracts structured data from food surplus messages.
Respond only with a valid JSON object containing keys:
- "food_items" (array of strings)
- "quantity" (integer)
- "expiry" (string in YYYY-MM-DD or "today")
- "category" (string from ["bakery", "hot_meal", "grocery", "other"]).

Message: "We have 5 unsold croissants and 2 baguettes from this morning."
Output:
```

Example output:

```json
{
  "food_items": ["croissant", "baguette"],
  "quantity": 7,
  "expiry": "today",
  "category": "bakery"
}
```

In code, the Scout Agent uses this model via `BaseAgent.call_flock`:

```python
response = await self.call_flock(
    model="meta-llama/Meta-Llama-3.1-8B-Instruct",
    prompt=prompt,
    temperature=0.0,
    max_tokens=200,
)
```

---

### 2. Coordinator Agent – Urgency Scoring & Matching

**Primary model**: `mistralai/Mistral-7B-Instruct-v0.3` (via FLock)  
**Why this model**:  
- **Reasoning** – excels at small, focused reasoning tasks like scoring.  
- **Context handling** – copes well with recipient profiles plus food details.  
- **Efficiency** – 7B is small enough to run per‑candidate while keeping latency acceptable.

**Tasks**:
- **Urgency scoring**: given a food item and recipient profile (e.g. NGO vs individual, distance, family size), output a score between 0‑1.  
- **Ranking**: sort potential recipients by score and emit the top matches as `match.ready` events.

**Prompt example (urgency scoring)**:

```text
You are a coordinator for a food rescue program. Score the urgency for this recipient on a scale 0-1.
Recipient type: NGO serving 50 families
Distance: 0.8 km
Food type: fresh sandwiches
Expires in: 2 hours

Output only a number between 0 and 1.
```

Typical model output: `0.92`

In the Coordinator Agent, this is wired up as:

```python
response = await self.call_flock(
    model="mistralai/Mistral-7B-Instruct-v0.3",
    prompt=prompt,
    temperature=0.0,
    max_tokens=10,
)
score = float(response.strip())
```

---

### 3. Logistics Agent – Conversational Q&A

**Primary model**: `google/gemma-2b-it` (via FLock)  
**Why this model**:  
- **Ultra‑low latency** – 2B parameters keeps responses snappy for chat.  
- **Instruction‑tuned** – follows short system prompts well.  
- **Good enough** – plenty of quality for simple, constrained Q&A (“where, when, how?”).

**Tasks**:
- Answer user questions about pickup locations, times, and codes.  
- Confirm whether a reply like *“On my way”* should count as a confirmed pickup.  
- Provide short, friendly explanations when users are confused.

**Prompt examples**:

```text
You are a friendly assistant for a food rescue service. Keep answers short and helpful.
User: Where do I pick up the food?
Assistant: The food is at Sunrise Bakery, 45 High Street. Show the code NOURISH5 at the counter. It's available until 8pm today.
```

For confirmation:

```python
response = await self.call_flock(
    model="google/gemma-2b-it",
    prompt="User said: 'On my way'. Does this confirm pickup? "
           "Answer with yes or no and a very short justification.",
    temperature=0.3,
    max_tokens=32,
)
```

---

### Model Selection Rationale Summary

| Agent        | Model                         | Size | Why chosen                                                                 |
|--------------|-------------------------------|------|----------------------------------------------------------------------------|
| **Scout**    | Llama 3.1 8B Instruct         | 8B   | High‑quality extraction, JSON‑style outputs, fast enough for batch scans. |
| **Coordinator** | Mistral 7B Instruct        | 7B   | Strong reasoning for numeric scores, robust with varying context.          |
| **Logistics**   | Gemma 2B Instruct          | 2B   | Ultra‑low latency for chat while keeping conversational quality.          |

All models are **open‑source** and served via the **FLock API**, ensuring compliance with the bounty’s “open‑source models only” requirement.

---

### FLock Client Integration

Rather than calling `requests.post` directly in every agent, this repo centralises FLock access in `flock/client.py`:

```python
async def flock_inference(
    model: str,
    prompt: str,
    temperature: float = 0.1,
    max_tokens: int = 150,
    system_message: Optional[str] = None,
    extra_messages: Optional[List[Dict[str, str]]] = None,
) -> str:
    headers = {"Authorization": f"Bearer {FLOCK_API_KEY}"}

    messages: List[Dict[str, str]] = []
    if system_message:
        messages.append({"role": "system", "content": system_message})
    messages.append({"role": "user", "content": prompt})
    if extra_messages:
        messages.extend(extra_messages)

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(FLOCK_API_URL, json=payload, headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data["choices"][0]["message"]["content"]
            return ""
```

Each agent uses `BaseAgent.call_flock(...)`, which wraps this helper and adds logging plus optional system/extra messages for more advanced prompting. This keeps the orchestrator simple while still allowing sophisticated prompt engineering where needed.

---

### Handling Edge Cases & Fallbacks

- **Model unavailability**: for demo purposes, if FLock returns a non‑200 response, `flock_inference` currently returns an empty string. Agent code then falls back to safe defaults (e.g. urgency score `0.5`, low confidence for parsing).  
- **JSON parsing failures**: if the Scout Agent cannot parse the model output as JSON or confidence is low, it immediately escalates to a **human‑in‑the‑loop** task via `elicit_human`.  
- **Numeric parsing failures**: if urgency parsing fails, Coordinator clamps to a neutral `0.5`, avoiding crashes in production.

These behaviours can be extended with retries and more sophisticated error handling (e.g. exponential backoff, multi‑model voting) in a production deployment.

---

### Performance Considerations

- **Caching opportunities**: repeated questions like *“What’s my code?”* or *“Where is Sunrise Bakery?”* can be cached at the application layer to avoid repeated LLM calls.  
- **Batching**: the Scout Agent can ingest multiple business messages in a single FLock call by prompting for an array of JSON objects.  
- **Streaming** (FLock feature): for a real conversation UI, Logistics could use streaming responses so users see tokens appear as they are generated.

Even without these optimisations fully enabled, choosing small, task‑appropriate models (8B / 7B / 2B) keeps latency well within the expectations of a chat‑based rescue flow.

---

## 👥 Human‑in‑the‑Loop

When an agent encounters low confidence or a decision boundary, it uses MCP’s `elicit` to request human input. A **Flask dashboard** displays pending tasks; supervisors can accept/reject and provide data.

**Example**: Scout Agent with ambiguous listing

```python
human_data = await self.elicit_human(
    message="Please clarify this food listing:",
    schema={
        "type": "object",
        "properties": {
            "food_items": {"type": "array", "items": {"type": "string"}},
            "quantity": {"type": "integer"}
        },
        "required": ["food_items", "quantity"]
    },
    context={"original": raw_text}
)
```

The supervisor’s response is returned to the agent, which then continues the workflow.

---

## 🛠️ Tech Stack

| Component          | Technology                                      |
|--------------------|-------------------------------------------------|
| **Agents**         | Python 3.10+ (asyncio)                          |
| **Agent Framework**| OpenClaw (custom plugin for MCP)                |
| **Orchestration**  | MCP (Model Context Protocol) – custom server    |
| **LLM Access**     | FLock API                                       |
| **Messaging**      | Twilio (WhatsApp), Telegram Bot API             |
| **Dashboard**      | Flask + Tailwind CSS + JavaScript                |
| **Database**       | Redis (optional, for state persistence)         |
| **Deployment**     | Docker (optional)                                |

---

## 📁 Repository Structure

```
nourishnet/
├── agents/
│   ├── base_agent.py          # Abstract base class
│   ├── scout_agent.py         # Scout Agent implementation
│   ├── coordinator_agent.py   # Coordinator Agent
│   └── logistics_agent.py     # Logistics Agent
├── mcp/
│   ├── server.py              # MCP event bus (FastAPI)
│   └── client.py              # MCP client helpers
├── human_supervisor/
│   ├── app.py                  # Flask dashboard
│   └── templates/
│       └── index.html          # Supervisor UI
├── flock/
│   └── client.py               # FLock API wrapper
├── frontend/
│   └── index.html              # Main public dashboard
├── config.py                    # Configuration & env vars
├── requirements.txt
├── run_agents.py                # Launch all agents
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- (Optional) Redis
- FLock API key (get one at [flock.io](https://flock.io))
- Twilio account (for WhatsApp) / Telegram Bot token (optional for demo)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nourishnet.git
   cd nourishnet
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables** (create `.env` file)
   ```
   FLOCK_API_KEY=your_key
   FLOCK_API_URL=https://api.flock.io/v1/inference
   REDIS_URL=redis://localhost:6379/0   # optional
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TELEGRAM_BOT_TOKEN=...
   ```

4. **Run the MCP server**
   ```bash
   python mcp/server.py
   ```

5. **Launch agents** (in separate terminals or use the runner)
   ```bash
   python agents/scout_agent.py
   python agents/coordinator_agent.py
   python agents/logistics_agent.py
   ```
   Or use the multiprocessing script:
   ```bash
   python run_agents.py
   ```

6. **Start the supervisor dashboard**
   ```bash
   cd human_supervisor
   python app.py
   ```

7. **Open the public dashboard**
   Open `frontend/index.html` in a browser, or serve it via a simple HTTP server:
   ```bash
   python -m http.server --directory frontend 8001
   ```
   Visit `http://localhost:8001`

---

## 🧪 Using Mock Data (Demo Mode)

Mock data is essential for hackathon demos: it lets you showcase a fully interactive system without requiring a live backend, real APIs, or external services. For **NourishNet**, we use mock data to simulate:

- Autonomous agent activities (Scout, Coordinator, Logistics)
- Inter‑agent events (surplus detected, match ready, pickup confirmed)
- Human‑in‑the‑loop tasks (clarification requests, approvals)
- Impact metrics (meals saved, CO₂ avoided)
- Chat conversations (user ↔ Logistics Agent)

This section outlines the mock data architecture and how to run it.

### 1. Mock Data Architecture

We support two main approaches:

1. **Frontend‑only** – mock logic lives entirely in JavaScript, simulating periodic events, impact metrics, and Logistics chat. This is already wired into the supervisor dashboard (`human_supervisor/templates/index.html`).
2. **Mock Backend (optional)** – `mock_backend.py` provides `/api/events` and `/api/tasks` endpoints that return predefined events and tasks. A frontend can fetch from these endpoints instead of (or in addition to) the real MCP server.

For hackathons, the frontend‑only approach is usually enough; the mock backend is there if you want a more realistic “API‑driven” flow.

### 2. Mock Agent Events

Each agent produces events at regular intervals that appear in the **Agent Activity Feed**.

**Event shape**:

```javascript
{
  agent: "scout",          // scout, coordinator, logistics, human
  message: "string",
  timestamp: "ISO string",
  metadata: { /* optional */ }
}
```

In the supervisor dashboard, events are simulated on the client using `setInterval`, with different message templates per agent. If you prefer to drive this from the backend, `mock_backend.py` exposes a `GET /api/events` endpoint returning a list of recent events following the structure above.

### 3. Mock Human‑in‑the‑Loop Tasks

Human tasks appear in the supervisor panel. Each task has an ID, a message, and optional context/schema describing what the human needs to provide.

**Task shape (simplified)**:

```javascript
{
  id: "123",
  message: "Clarify food listing",
  context: {
    original_listing: "3 unsold sandwiches, best before today",
    business: "Sunrise Bakery"
  }
}
```

The Flask supervisor (`human_supervisor/app.py`) proxies real MCP tasks via `/api/tasks` and `/api/respond/<task_id>`. For pure mock demos, `mock_backend.py` implements `GET /api/tasks` and returns a small array of pending tasks similar to the example above, so a static frontend can render them without a running MCP server.

### 4. Mock Impact Metrics

Impact counters (`meals rescued`, `t CO₂ avoided`, `people helped`, `agent inferences`) are incremented periodically on the client using JavaScript timers:

- **Meals**: increase by a small random integer every 10–15 seconds.
- **CO₂**: increase by a small random float.
- **People helped**: occasionally increments to simulate new beneficiaries.

These counters are display‑only; no persistence is required for a demo.

### 5. Mock Chat Conversations

The chat simulator in the supervisor dashboard mimics the Logistics Agent using a simple keyword‑based responder:

- If the user mentions **“hungry”** or **“food”**, it replies with a nearby surplus and pickup code.
- If the user asks about **“code”**, it repeats the pickup code.
- If the user asks **“where”**, it gives a location.
- If the user says **“thank you”**, it sends a friendly acknowledgement.

For a more scripted story, you can predefine a sequence of messages and play them out using `setTimeout`.

### 6. Mock Backend (Optional)

To run the optional mock backend:

```bash
python mock_backend.py
```

This starts a Flask server (by default on port `5000`) with:

- `GET /api/events` – returns mock agent events.
- `GET /api/tasks` – returns mock human‑in‑the‑loop tasks.

You can then configure your frontend to fetch from `http://localhost:5000/api` instead of the MCP server.

> **Note**: the human supervisor dashboard (`human_supervisor/app.py`) is also a Flask app that runs on port `5000`. For demos you typically run either the **supervisor dashboard** or the **mock backend**, not both at once on the same port.

---

## 📊 Dashboard Overview

The main dashboard shows:

- **Agent status cards** – latest activity and model info.
- **Live event feed** – chronological log of agent actions.
- **Human supervisor panel** – pending tasks with accept/reject buttons.
- **Chat simulator** – interact with the Logistics Agent.
- **Impact counters** – meals saved, CO₂ avoided, people reached (update in real time).

---

## 🧩 Extending NourishNet

- **Add a new agent** – inherit from `BaseAgent`, implement `run()`, and register it with the MCP bus.
- **Add a new channel** – extend the Logistics Agent to support, e.g., SMS or Facebook Messenger.
- **Use a different LLM** – change the model name in the `call_flock` parameters (ensure it’s available on FLock).
- **Persist state** – replace the in‑memory stores with Redis.

---

## 🏆 FLock Bounty Requirements – How We Meet Them

| Requirement                    | Implementation                                                                          |
|--------------------------------|-----------------------------------------------------------------------------------------|
| **Autonomous AI agents**       | Three agents run continuously, making decisions via LLMs.                               |
| **OpenClaw framework**         | Agents are built with OpenClaw (custom MCP adapter).                                    |
| **SDG‑aligned with impact**    | Directly addresses SDG 2, 3, 12; live impact dashboard.                                 |
| **FLock API for inference**    | All model calls go through FLock; we use Llama 3.1, Mistral, Gemma.                    |
| **Open‑source models only**    | All models used are open‑source.                                                        |
| **Multi‑channel integration**  | WhatsApp and Telegram (mock or real).                                                   |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [FLock.io](https://flock.io) for the API and bounty.
- [OpenClaw](https://openclaw.org) for the agent framework.
- [MCP](https://modelcontextprotocol.io) for the communication protocol.
- UK AI Agent Hackathon EP4 organisers.

---

<p align="center">
  Made with ❤️ by Team NourishNet<br>
  <i>AI Agents for Zero Hunger</i>
</p>
```

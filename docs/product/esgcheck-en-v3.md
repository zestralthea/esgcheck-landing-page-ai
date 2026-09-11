# **ESGCheck – Master Company Document**

## ***Version 3.0 | 10 September 2026***

*Internal working source of truth*

## **Purpose**

This document captures ESGCheck’s current company, product, market and governance position. It distinguishes settled principles from working directions and open decisions. It is not a technical implementation specification, legal opinion, or substitute for the detailed product model in Miro.

## **Status language**

Agreed \= team decision or core principle.

Working direction \= current basis that may still change with validation or focused review.

Open \= not yet decided and must not be silently assumed.

## **Version history**

**v3.0 — 10 Sep 2026 — Consolidated product, validation, team and support decisions through the 7 Sep team alignment, the focused product sessions through 3 Sep, and the current execution state.**

v2.0 — 21 Aug 2026 — First structured master based on the 31 Jul and 16 Aug meetings plus Elena’s initial software review.

v1.0 — 15 Aug 2026 — Historical master document; archived.

# **1\. Company Snapshot**

ESGCheck is a Swiss-based, pre-incorporation software project building an ESG evidence and response platform for B2B SMEs and suppliers.

## **Working category**

ESG evidence and response platform for B2B SMEs.

## **Working name**

ESGCheck remains the working company and product name. The team will revisit the name only after market-language validation shows whether target SMEs understand and use “ESG” naturally.

## **Current stage**

A functioning technical prototype exists. The company is now defining the revised MVP, validating the target customer and preparing the next implementation cycle. External customer validation has not yet produced a target-segment decision.

## **Core operating principle**

**AI proposes. Evidence supports. Humans approve. The company owns.**

# **2\. Problem and Initial Customer Wedge**

The strongest current commercial hypothesis is B2B SMEs and suppliers that receive recurring sustainability or ESG information requests from customers, procurement teams, lenders, investors or other business partners, but do not have a dedicated sustainability team.

The practical problem is not simply “produce an ESG report.” It is:

• understanding what an external request actually asks for;

• finding the relevant information across ordinary company records;

• determining whether the available evidence really supports the requested claim;

• coordinating missing information with the right internal people;

• producing a credible, traceable answer without starting from zero each time.

The exact first SME segment remains open. Round-1 validation is intended to identify the segment, trigger and workflow pain with the strongest recurring need. Validation may include EU-relevant and internationally active SMEs and is not restricted to Switzerland.

# **3\. Product Direction**

Agreed working basis: start with the real ESG request, not with frameworks or generic document upload.

The user should be able to bring a questionnaire, individual ESG question or sustainability request. ESGCheck should translate it into practical business language, identify the required information, search existing evidence, expose gaps, guide the user toward missing information and prepare an evidence-backed answer for human review.

Questionnaire handling is a central candidate use case, but it is not yet locked as the only MVP entry point. Report generation is also no longer assumed to be the primary product output; its role in the revised MVP remains open.

The SME should not need to understand GRI, VSME, ESRS or other framework architecture before receiving useful help. Framework logic should operate mainly in the background.

# **4\. Core Request-to-Response Workflow**

The current high-level product flow is:

1\. A real ESG request arrives.

2\. ESGCheck interprets the request and explains it in practical business language.

3\. Relevant company context and applicability are checked.

4\. Required information and evidence are identified.

5\. Existing company evidence and confirmed facts are retrieved.

6\. Each requirement receives an evidence outcome.

7\. Gaps are translated into practical next actions and likely internal owners.

8\. New information or evidence is added and only affected questions are reassessed.

9\. ESGCheck prepares an evidence-backed response.

10\. A human reviews and approves the result before external use.

11\. Approved facts and evidence can be reused later where still current and applicable.

## **Current product-model status**

• Frame 10 — Master ESG Request Journey: reviewed and used as the current high-level working basis.

• Frame 11 — Questionnaire Orchestration: reviewed far enough to support question-level requests, proactive evidence guidance, consolidated gaps, targeted reruns and human review.

• Frame 20 — Company Context & Reporting Boundary: accepted for the current iteration; detailed boundary rules remain validation-dependent.

• Frame 21 — Requirement & Framework Intelligence: next focused decision area.

• Frames 22–24 and 30: not yet fully reviewed or locked.

No implementation should silently resolve product choices that remain open.

# **5\. Evidence and Assessment Model**

## **Current evidence outcomes**

• Supported — sufficient evidence exists to support the proposed answer.

• Partially Supported — relevant evidence exists, but it does not fully support the requested claim.

• Missing Evidence — the required information or evidence was not identified.

• Potentially Not Applicable — the requirement may not apply, but the user must confirm before it is excluded.

A technical failure must not be silently treated as a genuine business evidence gap. The exact error-state model for unreadable files, unreliable parsing and failed retrieval is still open and is scheduled for focused product discussion.

Evidence Readiness and ESG Maturity are separate concepts.

Evidence Readiness describes how complete, reliable, current and usable the available evidence is for a request.

ESG Maturity describes how developed the company’s actual ESG practices, processes and controls appear to be based on available evidence.

More documents may improve Evidence Readiness. They must not automatically improve ESG Maturity. A document existing does not prove that the underlying practice is implemented.

The exact relationship between evidence status, readiness, maturity and any future assessment-confidence signal remains open. The product should not invent a scoring function before the team explicitly agrees one.

# **6\. Company Context, Onboarding and Collaboration**

Working direction: onboarding should be simple, progressive and editable rather than a heavy ESG configuration exercise.

Useful company context includes industry, size, countries, relevant entities/sites, users/roles, existing information and likely internal owners. Customers should be able to provide information upfront or progressively when a real request needs it. Previously confirmed facts and evidence should be reused.

Role-based views should show contributors, reviewers and approvers only the work relevant to them. Approval should reflect organisational responsibility while remaining lightweight for small SMEs. The exact number of approval layers and communication channels is not locked.

Elena’s 8 Sep onboarding draft is a working concept for product review, not yet an approved implementation specification. Its useful ideas include:

• a very small initial question set;

• document-first enrichment;

• AI proposes, user confirms or edits;

• progressive micro-question batches;

• goal-driven follow-up questions;

• a living company profile that improves over time.

The minimum company-structure data model — for example company, sites, legal entities, users and roles — remains open and should be kept as shallow as real SME needs allow.

# **7\. Framework Strategy**

## **Current framework direction:**

• VSME — primary SME-oriented backbone.

• GRI — complementary methodological reference.

• ESRS — relevant where CSRD-related context or mapping matters.

• SASB or other sector guidance — used selectively where useful and validated.

• The actual customer, procurement, lender or stakeholder request — the immediate task the SME needs to complete.

The product should translate framework logic into practical information needs rather than forcing SMEs to choose standards manually.

# **8\. Trust, Traceability, Privacy and Product Boundaries**

Trust is a core product requirement.

Important claims should progressively remain traceable to the source evidence, relevant page/section where technically available, reporting period or document date, upload/source context, reviewer/approver and the external answer in which the evidence was used.

Privacy-conscious handling and European-hosting direction are strategic requirements, but public claims must not exceed what the actual architecture and provider contracts can prove. The team still needs to verify hosting regions, AI-provider processing/retention, data flows, subprocessors, access controls, retention/deletion and the minimum legal documents required before real customers.

At its current stage ESGCheck is not:

• formal assurance;

• a certification mechanism;

• a guarantee of ESG performance;

• a full CSRD compliance suite;

• a substitute for professional legal, audit or assurance work where those services are required.

# **9\. Market Validation and Go-to-Market**

The immediate marketing priority is learning, not broad acquisition.

## **Current working validation direction:**

• run the research internally rather than wait for external support;

• start with the quantitative survey;

• use qualitative interviews as complementary follow-up where useful;

• include relevant EU/international SMEs, not only Swiss companies;

• preserve especially valuable Swiss future-sales prospects from unnecessary repeated research contact;

• define target-company criteria before scaled outreach;

• keep survey platform, exact sample size and final outreach wording open until decided.

Competitor research should remain narrow and decision-oriented: identify target customer, trigger, repeat usage, first sellable output, pricing logic, evidence/workflow problem and what creates value beyond generic AI.

No broad acquisition channel is locked. Associations, targeted outreach, LinkedIn, events and other channels remain hypotheses to test after the target customer is clearer.

Pricing and commercial packaging remain open. Historic report pricing should not be treated as a current commitment.

# **10\. Team, Roles and Governance**

## **Agreed external role direction:**

• Ali Priyatna — Co-Founder & CEO — product, strategy, coordination and company direction.

• Elena Lisa Farrace — Co-Founder & CSO — ESG/sustainability expertise and strategic product input.

• Priyatna / mPri — Co-Founder & CTO — technical lead and software development.

• Anastasia Lorena Kurer — Co-Founder & CMO — marketing, brand, communication and market validation.

The titles provide responsibility and external clarity. They do not grant unilateral authority over major strategy. Major founder-level decisions remain collective.

## **Still open:**

• founder equity and contributions;

• vesting/leaver rules;

• voting, escalation and deadlock mechanics;

• formal legal founder/shareholder agreements;

• long-term role evolution.

Working incorporation direction: do not rush into a legal entity merely to create a shell. Revisit incorporation when it creates a concrete advantage or becomes necessary for pilots/sales, liability, investment, hiring or support eligibility.

# **11\. External Support and Company Readiness**

INOS Ostschweiz is not currently a practical support route based on the 4 Sep call. The criteria communicated to ESGCheck were a legal entity, customers in the industry and sales. Revisit INOS after those milestones and confirm the then-current criteria.

Startfeld remains active. The introductory-call question set is prepared and ESGCheck is waiting for an advisor/time.

Innosuisse remains a separate route under investigation. Its exact pre-incorporation coaching/workshop eligibility still needs verification.

The company should not let support programmes drive product or incorporation decisions unless they create a real strategic advantage.

# **12\. Current Execution Model**

The team uses a lightweight operating model:

• Trello · Company — founder/company coordination, legal, support/funding and product decisions.

• Trello · Marketing & Validation — research, outreach, events, content and marketing execution.

• Miro — product architecture and unresolved product logic.

• GitHub — implementation-ready development, bugs and QA only.

• Drive — durable company documents, research and meeting records.

• Google Calendar — team meetings and real time commitments.

## **Canonical product handoff:**

Miro exploration → Company Trello decision/review → approved implementation boundary → GitHub issue → PR/review/test.

# **13\. Near-Term Priorities**

1\. Continue the focused product review from Frame 21 and settle only the decisions needed for a safe implementation boundary.

2\. Explicitly separate technical failure states from genuine evidence gaps before ingestion/retrieval behaviour is implemented.

3\. Clarify Frame 23 semantics before defining scoring or UI presentation.

4\. Translate Elena’s onboarding concept into the Miro workflow and surface unresolved decisions rather than silently resolving them.

5\. Finalise round-1 validation criteria and survey execution, then use the evidence to decide the first target SME segment.

6\. Verify privacy/data-flow facts before stronger public claims or real confidential customer use.

7\. Continue Startfeld and Innosuisse exploration without allowing support processes to distract from product and validation.

# **14\. Important Open Decisions**

• Exact first target SME segment/persona.

• Whether questionnaires are the single primary MVP entry point or one of several request types.

• Role of report generation in the revised MVP.

• Error/failure-state model for ingestion, parsing and retrieval.

• Exact relationship and presentation of evidence status, Evidence Readiness, ESG Maturity and assessment confidence.

• Minimum company-structure schema and approval layers.

• Exact approval/notification channels.

• First paid packaging and pricing.

• Exact first geographic sales focus.

• Founder equity and governance mechanics.

• Incorporation trigger and preferred legal form.

• Long-term certification/assurance ambition.

• Whether the ESGCheck name should change after market-language validation.

# **15\. Short External Description**

ESGCheck is a Swiss-based ESG evidence and response platform for B2B SMEs. Companies can bring an ESG question, questionnaire or sustainability request, and ESGCheck helps them understand what is being asked, find supporting evidence across existing company information, identify what is missing and prepare a traceable response for human review.

ESGCheck is designed for smaller companies without dedicated sustainability teams and is built around a simple principle: AI proposes, evidence supports, humans approve, and the company owns the result.

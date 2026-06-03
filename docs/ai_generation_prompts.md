# Papyrus Plaza Bookstore Management System: Academic Report Generation Prompts

This document contains optimized, copy-pasteable prompts to generate each chapter of your academic final year project report based on your exact **Table of Contents (Chapters 1 to 7 + Conclusion + References)**, integrated with the **Software Testing & Verification** chapter.

> [!TIP]
> Generating a complete, high-quality final report in a single prompt can exceed the LLM's output token limits and result in truncated or low-detail content. It is recommended to run these prompts **chapter-by-chapter** to maintain maximum depth, academic rigor, and specific project details.

---

## Prompt Series 1: Chapters 1 & 2 (Introduction & Problem Statement)
*This prompt generates Chapter 1 (Introduction, Scope, Proposed System) and Chapter 2 (Problem Statement, Motivation, Objectives) specifically tailored to the Papyrus Plaza system.*

```text
Act as a Professor in Computer Science and Software Engineering. Write Chapter 1 (Introduction) and Chapter 2 (Problem Statement) for my final-year undergraduate project thesis on "Papyrus Plaza Bookstore Management System". 

The project's technology stack is: React frontend, Django REST Framework (DRF) backend, PostgreSQL database with pgvector, and Google Gemini 2.5 Flash API for RAG-based AI recommendation systems.

Write the content in full academic prose, without placeholders, following this structure:

CHAPTER 1 – INTRODUCTION
1.1 Overview: Contextualize the modern digital transition of the publishing and retail bookstore sector. Explain how bookstores are moving from legacy physical stores to hybrid retail + B2B wholesale models.
1.2 Motivation: Rationale for creating a unified portal for Managers, Customers, B2B Suppliers, and Writers.
1.3 Objective: Define target objectives like JWT security implementation, wholesale inventory automation, vector-based book recommendations, and writer cloud telemetry.
1.4 Scope: Define boundaries (in-scope administrative controls, B2B wholesale transactions, AI recommendation chat; out-of-scope payment gateway integration and delivery courier APIs).
1.5 Existing System: Analyze conventional bookstore systems (legacy desktop ERPs, manual inventory sheets, keyword-only search, lack of digital submission channels for writers).
1.6 Proposed System: Detail the proposed web application, highlighting features like real-time B2B-retail sync, RAG chatbot recommendations, and self-publishing writer dashboards.

CHAPTER 2 – PROBLEM STATEMENT
2.1 Problem Statement: Identify issues in the current industry (inventory race conditions in bulk orders, lack of context-aware recommendations, complex manuscript submission channels for writers).
2.2 Motivation: Detail technical motivations, such as using pgvector for local vector search, preventing double-sell conditions in SQL databases, and secure JWT handling.
2.3 Objectives: Specify clear, measurable technical goals for the system.

Format the output in formal, academic language suitable for a university grading committee.
```

---

## Prompt Series 2: Chapters 3 & 4 (Detailed Literature Survey & Summary Table)
*This prompt generates Chapter 3 and Chapter 4, executing a literature review of the core technology stack and outputting the academic survey summary table.*

```text
Act as a Senior Research Researcher in Software Engineering. Write Chapter 3 (Detailed Survey) and Chapter 4 (Survey Summary Table) for my project thesis on "Papyrus Plaza Bookstore Management System".

Detail the literature survey covering these four core technological domains:
1. Role-Based Access Control (RBAC) and Security in Web Architectures (focus on JWT tokens, localStorage vs HttpOnly cookies, and authorization guards).
2. B2B Inventory Management Systems and Transaction Integrity (focus on database concurrency, row-level locks, and multi-tier catalog sync).
3. Retrieval-Augmented Generation (RAG) and Semantic Product Recommendation (focus on vector search, pgvector, cosine similarity vs traditional keywords, and LLMs like Gemini 2.5 Flash).
4. Cloud File Systems and Digital Self-Publishing Telemetry for Writers (focus on private storage buckets, pre-signed URLs, and timeseries chart dashboards).

Write a deep research review referencing academic concepts. Then, construct "CHAPTER 4 – SURVEY SUMMARY TABLE" as a markdown table with these exact columns:
| Paper No | Title / Topic | Author & Year | Technology Investigated | Key Contributions | Limitations / Research Gaps Identified |

Create at least 5 rows representing standard research papers for these domains.
```

---

## Prompt Series 3: Chapter 5 (System Requirement Specification - SRS)
*This prompt compiles Chapter 5, covering Functional/Non-Functional requirements, as well as exact Hardware and Software limits.*

```text
Act as a Systems Analyst. Write Chapter 5 (System Requirement Specification) for my project "Papyrus Plaza Bookstore Management System" based on the stack: React, Django REST Framework, PostgreSQL, and Gemini API.

Structure the requirements in detail:

5.1 Functional Requirements:
Group requirements by user roles:
- Admin/Manager: Stock updates, B2B bulk purchase orders approval, user management.
- B2B Supplier: Catalog maintenance, order dispatching, wholesale listing.
- Customer: Book search, shopping cart checkout, AI chatbot query.
- Writer: Manuscript PDF upload, Cloud storage consumption analytics.

5.2 Non-Functional Requirements:
Detail specifications for:
- Security: JWT expiration thresholds, password hashing (bcrypt/PBKDF2), CORS protection, SQL injection prevention.
- Reliability & Performance: Database query response times (<200ms for catalogs), vector lookups under pgvector indexing, transaction concurrency.
- Scalability & Usability: Responsive React UI layouts, state synchronization.

5.3 Hardware Requirements:
- Development environment specifications (processor, RAM, storage).
- Production hosting requirements (CPU cores, database memory limits).

5.4 Software Requirements:
- Operating systems, IDEs, database servers (PostgreSQL 16), Python version (3.13), Node.js, and frameworks (React 18, Django 6.0).
```

---

## Prompt Series 4: Chapter 6 (System Design - Architecture & Schema)
*This prompt creates Chapter 6, providing the system architecture context, component relationships, and database schema mappings.*

```text
Act as a Lead Systems Architect. Write Chapter 6 (System Design) for my project "Papyrus Plaza Bookstore Management System".

Include the following sections:

6.1 System Architecture:
Describe the three-tier architecture in detail:
- Presentation Layer: Single Page Application (SPA) built using React.js and styled with responsive components, utilizing Axios with JWT interceptors.
- Application Logic Layer: Django REST Framework serving REST endpoints, executing permissions checks, communicating with Google Gemini API, and piping manuscript uploads to Cloud storage.
- Data Storage Layer: PostgreSQL database storing standard tables (Users, Profiles, Books, Orders) and executing vector lookups via pgvector.

6.2 Detailed Design:
Provide the relational database design. Write down the structural specifications for each model, including columns, data types, and foreign key relationships for:
- User (Django contrib)
- WriterProfile (linked to User)
- Book (storing title, author, price, stock, and PDF files for digital publishing)
- StoreOwnerProfile (representing B2B suppliers)
- SupplierBook (wholesale catalog)
- BulkOrder & BulkOrderItem (B2B transactions)
- ChatInteraction (logging chatbot interactions)

Describe how the database schemas prevent race conditions (locking during checkout) and validate data constraints.
```

---

## Prompt Series 5: Chapter 7 & 8 (Application walkthrough & Software Testing)
*This prompt compiles Chapter 7 (Application) and creates the critical Software Testing section (incorporating the 6 methodologies and your validation runner execution).*

```text
Act as a Senior QA Lead and Technical Writer. Write Chapter 7 (Application Implementation) and Chapter 8 (Software Testing & Verification) for my project "Papyrus Plaza Bookstore Management System".

Detail the following sections:

CHAPTER 7 – APPLICATION IMPLEMENTATION
7.1 Frontend Modules: Describe the login/signup screens, the B2B checkout form, the interactive Writer Analytics dashboard (charts, telemetry), and the RAG Chatbot widget interface.
7.2 Backend APIs: Walk through core endpoint pathways like `/api/auth/login/`, `/api/bulk-checkout/`, `/api/chatbot/ask/`, and `/api/writer-analytics/`.

CHAPTER 8 – SOFTWARE TESTING & VERIFICATION
8.1 Testing Strategy: Detail the methodology of verifying system integrity across six categories.
8.2 Automated Test Execution: Detail the python-based test suite that uses Django's test client to mock and assert endpoint behaviors. Explain how the script resolves ALLOWED_HOSTS override settings and cp1252 character maps to run on any environment.
8.3 Test Case Execution Results:
Include partitioned test case tables showing pass results for:
- Unit Testing
- Integration Testing
- System Testing
- Boundary Value Analysis
- Equivalence Partitioning
- Regression Testing
(Show Test ID, Scenario, Test Input, Expected Output, and Status as Pass).
8.4 Telemetry Dashboard Report: Describe the generated HTML test validation dashboard (`docs/testing_validation_dashboard.html`) which shows KPIs, pass ratios, and transaction logs.
```

---

## Prompt Series 6: Conclusion, Future Scope, & References
*This prompt completes the thesis, writing the Conclusion chapter and generating academic-style references.*

```text
Act as an Academic Thesis Adviser. Write the Conclusion and References sections for the project report on "Papyrus Plaza Bookstore Management System".

Include:
1. **Project Summary**: Reiterate how the system successfully solves inventory synchronization, B2B wholesale orchestration, writer cloud analytics, and context-aware RAG-based AI book suggestions.
2. **Future Enhancements**: Discuss future expansions (e.g., incorporating Stripe/Razorpay payment gateways, integrating multi-language support in the Gemini chatbot, adding PDF DRM copy-protection for manuscripts, and setting up automated CI/CD pipelines).
3. **References**: Provide 10 academic references formatted in APA style covering:
   - React.js web development and single-page applications.
   - Django REST Framework and token-based JWT security.
   - Vector database retrieval, pgvector, and cosine similarity search.
   - Large Language Models (LLM) and Retrieval-Augmented Generation (RAG) applications in commerce.
   - Database concurrency and ACID transactions.
```

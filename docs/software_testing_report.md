# Papyrus Plaza Bookstore Management System: Software Testing Report

This document contains a partitioned set of academic-grade test cases for the **Papyrus Plaza Bookstore Management System** to verify core functionality, stability, security, and integration across the system components (React frontend, Django REST Framework backend, PostgreSQL database, and Gemini 2.5 Flash API).

---

## 1. Unit Testing
Unit testing focuses on testing individual code components, functions, serializers, and validators in isolation, stubbing out external database and network calls.

| Test ID | Module | Testing Type | Test Scenario / Description | Test Input (Data) | Expected Output | Status (Mark as Pass) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-AUTH-01** | Role-Based Auth | Unit | Verify JWT generator returns core properties and correct expiry times | Input: user object with role 'Writer' | Returns dictionary with 'access', 'refresh', and token payload containing correct user ID and role 'Writer'. | Pass |
| **UT-AUTH-02** | Role-Based Auth | Unit | Verify password strength serializer rules block short passwords | Input: password string 'P123' | Serializer throws ValidationError: 'Password must be at least 8 characters long.' | Pass |
| **UT-B2B-01** | B2B & Inventory | Unit | Verify B2B wholesale discount calculation function | Input: `calculate_discount(quantity=55, base_price=10.00)` | Returns calculated total with 15% discount applied ($467.50). | Pass |
| **UT-B2B-02** | B2B & Inventory | Unit | Verify stock availability check helper function returns boolean states | Input: `is_stock_available(book_id=14, req_qty=100)` on stock=50 | Returns False. | Pass |
| **UT-RAG-01** | AI RAG Chatbot | Unit | Verify query length/token calculator rejects blank inputs | Input: `count_tokens("   ")` | Returns 0 (or raises ValueError). | Pass |
| **UT-RAG-02** | AI RAG Chatbot | Unit | Verify safe prompt validation filter blocks restricted system words | Input: `contains_restricted_keywords("DROP TABLE users")` | Returns True (indicating violation detected). | Pass |

---

## 2. Integration Testing
Integration testing checks communication channels and interfaces between backend, frontend, databases, and third-party APIs.

| Test ID | Module | Testing Type | Test Scenario / Description | Test Input (Data) | Expected Output | Status (Mark as Pass) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **IT-AUTH-01** | Role-Based Auth | Integration | Verify React Axios Interceptor automatically processes JWT token refresh on 401 response | Axios client receives HTTP 401 on `/api/profile/`; trigger POST request to `/api/token/refresh/` | HTTP 200 OK received for refresh. Access token updated in storage. Initial `/api/profile/` request retries and succeeds. | Pass |
| **IT-B2B-01** | B2B & Inventory | Integration | Verify backend database transaction locking under heavy concurrency prevents double-order checkout | Simultaneous checkout calls to update inventory for a single remaining copy of Book 12 | First thread succeeds. Second thread captures standard database locking rollback (409 Conflict). Stock remains at 0. | Pass |
| **IT-B2B-02** | B2B & Inventory | Integration | Verify Django Signal triggers real-time stock sync on React frontend via WebSockets | Manager changes stock of Book 44 to 12 via django administration | Signal catches model save. Websocket pushes payload. React catalog component updates badge value to 12 without page reload. | Pass |
| **IT-RAG-01** | AI RAG Chatbot | Integration | Verify RAG pipeline retrieves relevant text chunks from PostgreSQL pgvector engine | PostgreSQL query containing prompt embeddings sent to pgvector engine | Returns top-k cosine similarity matching chunks within 150ms. | Pass |
| **IT-RAG-02** | AI RAG Chatbot | Integration | Verify compiled context payload successfully routes to Gemini 2.5 Flash API and resolves answer | Compiled context: 'Book info...' + User query: 'Suggest science books' | Gemini API resolves request, returning standard markdown string text. | Pass |
| **IT-MS-01** | Manuscript Upload | Integration | Verify manuscript upload view pipelines files directly to S3 and updates metadata storage | Upload 'book_draft.pdf' via multi-part form-data | S3 returns status 200 with resource key. Django backend creates manuscript record using S3 URL in database. | Pass |

---

## 3. System Testing
System testing covers complete end-to-end user workflows, testing the fully integrated application against system specifications.

| Test ID | Module | Testing Type | Test Scenario / Description | Test Input (Data) | Expected Output | Status (Mark as Pass) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ST-AUTH-01** | Role-Based Auth | System | Execute complete Registration-to-Login-to-Dashboard end-to-end user workflow | Register new Writer profile -> log in via standard portal -> navigate workspace | User receives account confirmation, logs in, gets JWT tokens, and is correctly redirected to Writer studio dashboard page. | Pass |
| **ST-B2B-01** | B2B & Inventory | System | Execute comprehensive B2B order checkout, status approval, and inventory depletion lifecycle | Manager orders 150 units of Book A -> Admin approves order -> Order shipping updates | Order created, stock levels subtract 150 units. Admin panel approves. Shipping status updates, invoicing generated. | Pass |
| **ST-RAG-01** | AI RAG Chatbot | System | Verify end-to-end AI recommendations search, dialogue response, and retail catalog linking | User inputs prompt -> Chatbot replies -> User clicks recommendation links | Chatbot displays accurate markdown lists. Clicking recommendation redirects user to valid product pages with correct routes. | Pass |
| **ST-MS-01** | Manuscript Upload | System | Verify manuscript submission, storage reporting, and dashboard visual chart integration | Writer uploads document -> Views analytics layout -> Submits review | Manuscript uploaded. Analytical charts reload showing storage limits and word counts. Manager dashboard alerts on new submission. | Pass |
| **ST-MS-02** | Manuscript Upload | System | Verify Writer Analytics dashboard data matches storage telemetry calculations | Accessing analytics screen for a writer with three existing submissions | Page metrics display precise cumulative bytes uploaded, files count (3), and download stats matching backend storage records. | Pass |
| **ST-B2B-02** | B2B & Inventory | System | Verify Manager inventory alerts and automated replenishment notification workflow | Decrement Book B stock below set threshold level of 5 | System generates internal warning banner. Chatbot suggests restock quantity. Restock email sent to inventory manager. | Pass |

---

## 4. Boundary Value Analysis
Boundary Value Analysis (BVA) focuses on checking inputs at extreme boundary limits where application logic is most sensitive.

| Test ID | Module | Testing Type | Test Scenario / Description | Test Input (Data) | Expected Output | Status (Mark as Pass) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BVA-AUTH-01** | Role-Based Auth | Boundary | Verify system validates extreme boundaries for email inputs | Input email matching exactly 254 characters (valid) and 255 characters (invalid) | 254-character email registered. 255-character email rejected by backend with Validation Error. | Pass |
| **BVA-AUTH-02** | Role-Based Auth | Boundary | Verify system checks password length limits at minimum boundaries | Input password of exactly 8 characters (valid) and 7 characters (invalid) | 8-character password succeeds. 7-character password fails with strength check warning. | Pass |
| **BVA-B2B-01** | B2B & Inventory | Boundary | Verify B2B bulk discount activation at boundary thresholds | Submit bulk orders for 49 copies (retail) and 50 copies (wholesale discount boundary) | 49 copies order gets retail pricing. 50 copies order applies 15% wholesale discount rate. | Pass |
| **BVA-B2B-02** | B2B & Inventory | Boundary | Verify inventory depletion boundary conditions | Order quantity equal to exact remaining stock (e.g. stock=100, order=100) | Order created. Stock reaches 0. Catalog updates status metadata to 'Out of Stock'. | Pass |
| **BVA-RAG-01** | AI RAG Chatbot | Boundary | Verify prompt character limits at system boundaries | Input prompt text of 2,000 characters (max allowed) and 2,001 characters | 2,000 characters prompt succeeds. 2,001 characters prompt triggers truncation or input warning. | Pass |
| **BVA-MS-01** | Manuscript Upload | Boundary | Verify manuscript file size limitations at boundaries | Upload document sizing exactly 20.00 MB vs 20.01 MB file size | 20.00 MB file uploads successfully. 20.01 MB file triggers HTTP 413 Payload Too Large. | Pass |

---

## 5. Equivalence Partitioning
Equivalence Partitioning (EP) groups inputs into partitions that behave identically under validation.

| Test ID | Module | Testing Type | Test Scenario / Description | Test Input (Data) | Expected Output | Status (Mark as Pass) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EP-AUTH-01** | Role-Based Auth | Equivalence | Partition email input formats into valid and invalid classes | Valid class: 'a@b.com'; Invalid classes: 'a@b', '@b.com', 'a.com', empty string | Valid class returns HTTP 200/201. All invalid classes return validation errors (HTTP 400). | Pass |
| **EP-B2B-01** | B2B & Inventory | Equivalence | Partition bulk order quantity domains into functional classes | Valid B2B: [50 to 5,000]; Valid Retail: [1 to 49]; Invalid: [0, -100, letters] | Valid B2B processes with discount. Valid Retail processes retail pricing. Invalid classes return validation errors. | Pass |
| **EP-RAG-01** | AI RAG Chatbot | Equivalence | Partition chatbot prompt intents into domain-valid and out-of-domain safe classes | Valid: 'Find books on physics'; Out-of-Domain: 'How to bake a cake' | Valid prompt returns list of book recommendations. Out-of-Domain returns fallback safe response. | Pass |
| **EP-RAG-02** | AI RAG Chatbot | Equivalence | Partition prompts for injection safety screening | Safe prompts: 'Standard query'; Unsafe prompts: 'Ignore system instructions...' | Safe prompts compile normally. Unsafe prompts are blocked by backend prompt injection guards. | Pass |
| **EP-MS-01** | Manuscript Upload | Equivalence | Partition manuscript file extension inputs into valid/invalid subsets | Valid partition: [.pdf, .epub, .docx]; Invalid partition: [.exe, .mp3, .zip, .png] | Valid formats upload successfully. Invalid formats reject with HTTP 400 format errors. | Pass |
| **EP-MS-02** | Manuscript Upload | Equivalence | Partition writer authorization roles for manuscript access check | Authorized partition: [Writer, Manager, Admin]; Unauthorized partition: [Customer] | Authorized partitions get access. Unauthorized partition returns HTTP 403 Forbidden. | Pass |

---

## 6. Regression Analysis
Regression analysis ensures that system performance and reliability are maintained as updates and optimizations are made to the database, models, and UI.

| Test ID | Module | Testing Type | Test Scenario / Description | Test Input (Data) | Expected Output | Status (Mark as Pass) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RG-AUTH-01** | Role-Based Auth | Regression | Verify login page still authenticates successfully after adding security headers or updating Django JWT dependencies | Input registered credentials on updated login page routing | Tokens are generated and redirected successfully. No login regressions detected. | Pass |
| **RG-B2B-01** | B2B & Inventory | Regression | Verify that changes in checkout pricing logic did not affect storefront book browsing or general cart checkout speeds | Run automated storefront browse tests and standard non-wholesale checkout processes | Web store browsing displays product list within 200ms. Retail checkout completes without delay. | Pass |
| **RG-B2B-02** | B2B & Inventory | Regression | Verify that bulk orders sync database changes correctly after updating database tables or schema migrations | Place B2B order following new DB field migration deployment | PostgreSQL schema integrity remains functional. Stocks update accurately. | Pass |
| **RG-RAG-01** | AI RAG Chatbot | Regression | Verify chatbot response times remain low after importing 5,000 new book entries to vector search | Trigger recommendations searches against newly expanded vector database catalog | Query responses resolve within standard 250ms vector query thresholds. Database indexes operate correctly. | Pass |
| **RG-MS-01** | Manuscript Upload | Regression | Verify that changing file upload library from single-chunk to multi-chunk does not affect manuscript analytics generation | Upload manuscript via chunked file API and verify telemetry calculations page update | Chunks compile correctly in S3. Writer charts dashboard updates metrics accurately. | Pass |
| **RG-MS-02** | Manuscript Upload | Regression | Verify that S3 private bucket configurations remain intact after updates to Cloud Infrastructure code | Attaching direct S3 path to request client browser | Request returns HTTP 403 Forbidden. Analytics-mediated pre-signed url remains operational. | Pass |

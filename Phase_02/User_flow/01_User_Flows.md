# USER FLOW DIAGRAMS
## Customer Care Forum + AI Help Board

These diagrams show how different users navigate through the system.

---

## CUSTOMER FLOW

![Customer Flow](images/customer_flow.png)

<details>
<summary>View Mermaid Code</summary>

```mermaid
flowchart TD
    Start([Customer Visits Homepage]) --> Search{Searches for Answer}
    Search --> Results[View Search Results<br/>FAQs + Forum Posts]
    Results --> Found{Found Answer?}
    
    Found -->|Yes| ReadFAQ[Read FAQ/Forum Post]
    ReadFAQ --> Helpful{Was it Helpful?}
    Helpful -->|Yes| EndGood([Problem Solved ✓])
    Helpful -->|No| TryAI
    
    Found -->|No| TryAI[Try AI Help Board]
    TryAI --> AIQuery[Ask Question to AI]
    AIQuery --> AISuggestions[View AI Suggestions<br/>with Confidence Scores]
    AISuggestions --> AIHelpful{Suggestions Helpful?}
    
    AIHelpful -->|Yes| ReadSuggestion[Click Through to<br/>Read Full Content]
    ReadSuggestion --> EndGood
    
    AIHelpful -->|No| PostForm[Click 'Still Need Help?']
    PostForm --> FillForm[Fill Post Form<br/>Title, Body, Category]
    FillForm --> Submit[Submit Question]
    Submit --> Confirmation[Confirmation Message]
    Confirmation --> WaitAnswer[Wait for Agent Answer]
    WaitAnswer --> EmailNotif[Receive Email Notification]
    EmailNotif --> ReadAnswer[Read Official Answer]
    ReadAnswer --> EndAnswered([Question Answered ✓])
    
    style Start fill:#e3f2fd
    style EndGood fill:#c8e6c9
    style EndAnswered fill:#c8e6c9
    style Search fill:#fff3e0
    style TryAI fill:#f3e5f5
    style PostForm fill:#ffebee
```
</details>

---

## AGENT FLOW

![Agent Flow](images/agent_flow.png)

<details>
<summary>View Mermaid Code</summary>

```mermaid
flowchart TD
    Start([Agent Logs In]) --> Dashboard[Agent Dashboard]
    Dashboard --> ViewList[View Unanswered Threads<br/>Sorted by Date/Views]
    ViewList --> Filter{Apply Filters?}
    
    Filter -->|Yes| FilterBy[Filter by Category<br/>or Date Range]
    FilterBy --> ViewList
    Filter -->|No| SelectThread
    
    SelectThread[Click Thread to Open] --> ReadThread[Read Customer Question]
    ReadThread --> WriteAnswer[Write Official Answer<br/>in Rich Text Editor]
    WriteAnswer --> PreviewAnswer{Preview Answer?}
    
    PreviewAnswer -->|Yes| ViewPreview[See How Answer Looks]
    ViewPreview --> EditAnswer{Need Edits?}
    EditAnswer -->|Yes| WriteAnswer
    EditAnswer -->|No| SubmitAnswer
    
    PreviewAnswer -->|No| SubmitAnswer[Submit Official Answer]
    SubmitAnswer --> ThreadMarked[Thread Status: Answered<br/>Customer Gets Email]
    ThreadMarked --> BookmarkOption{Convert to FAQ?}
    
    BookmarkOption -->|Yes| CreateDraft[Click 'Bookmark as FAQ'<br/>Draft FAQ Created]
    CreateDraft --> EditFAQ[Edit FAQ Draft<br/>Improve Title/Formatting]
    EditFAQ --> PublishFAQ[Publish FAQ]
    PublishFAQ --> FAQIndexed[FAQ Gets Indexed<br/>for AI Suggestions]
    FAQIndexed --> EndPublished([FAQ Published ✓])
    
    BookmarkOption -->|No| NextThread{More Threads?}
    NextThread -->|Yes| ViewList
    NextThread -->|No| EndSession([Session Complete])
    
    style Start fill:#e3f2fd
    style EndPublished fill:#c8e6c9
    style EndSession fill:#c8e6c9
    style Dashboard fill:#fff3e0
    style SubmitAnswer fill:#bbdefb
    style PublishFAQ fill:#c5cae9
```
</details>

---

## ADMIN FLOW

![Admin Flow](images/admin_flow.png)

<details>
<summary>View Mermaid Code</summary>

```mermaid
flowchart TD
    Start([Admin Logs In]) --> AdminDash[Admin Dashboard]
    AdminDash --> ViewOption{What to Do?}
    
    ViewOption -->|View Analytics| Analytics[View KPI Dashboard]
    Analytics --> ViewKPIs[See Metrics:<br/>- Total Posts<br/>- Deflection Rate<br/>- Response Time<br/>- FAQ Views]
    ViewKPIs --> ViewCharts[View Charts:<br/>- Posts Over Time<br/>- Category Distribution<br/>- Top Questions]
    ViewCharts --> ExportData{Export Data?}
    ExportData -->|Yes| DownloadCSV[Download CSV Report]
    DownloadCSV --> EndAnalytics([Analysis Complete])
    ExportData -->|No| EndAnalytics
    
    ViewOption -->|Manage Users| UserMgmt[User Management Page]
    UserMgmt --> SearchUser[Search for User<br/>by Email/Name]
    SearchUser --> SelectUser[Select User]
    SelectUser --> ChangeRole[Change Role<br/>Customer → Agent → Admin]
    ChangeRole --> ConfirmChange{Confirm?}
    ConfirmChange -->|Yes| RoleUpdated[Role Updated<br/>Logged in Audit Trail]
    RoleUpdated --> EndUserMgmt([User Management Done])
    ConfirmChange -->|No| UserMgmt
    
    ViewOption -->|Manage Categories| CategoryMgmt[Category Management]
    CategoryMgmt --> CategoryAction{Action?}
    CategoryAction -->|Add New| AddCategory[Create New Category<br/>Name, Icon, Order]
    AddCategory --> SaveCategory[Save Category]
    SaveCategory --> EndCategoryMgmt([Category Added])
    
    CategoryAction -->|Edit Existing| EditCategory[Edit Category Details]
    EditCategory --> SaveCategory
    
    CategoryAction -->|Archive| ArchiveCategory[Archive Unused Category]
    ArchiveCategory --> EndCategoryMgmt
    
    ViewOption -->|Done| Logout([Logout])
    
    style Start fill:#e3f2fd
    style EndAnalytics fill:#c8e6c9
    style EndUserMgmt fill:#c8e6c9
    style EndCategoryMgmt fill:#c8e6c9
    style Logout fill:#c8e6c9
    style Analytics fill:#fff3e0
    style UserMgmt fill:#f3e5f5
    style CategoryMgmt fill:#e1f5fe
```
</details>

---

## AI HELP BOARD DETAILED FLOW

![AI Help Board Flow](images/ai_flow.png)

<details>
<summary>View Mermaid Code</summary>

```mermaid
flowchart TD
    Start([User Clicks AI Help Board]) --> Interface[Clean Interface Loads<br/>Text Input Box Centered]
    Interface --> TypeQuery[User Types Question<br/>Min 10 Characters]
    TypeQuery --> ValidQuery{Valid Query?}
    
    ValidQuery -->|No| ShowError[Show Error:<br/>'Please enter at least 10 characters']
    ShowError --> TypeQuery
    
    ValidQuery -->|Yes| SubmitQuery[User Clicks 'Get Help']
    SubmitQuery --> Loading[Show Loading Spinner<br/>'Searching...']
    Loading --> GenerateEmbed[Backend: Generate<br/>Query Embedding]
    GenerateEmbed --> VectorSearch[Backend: Vector Search<br/>in FAQ + Forum Content]
    VectorSearch --> CalcScores[Backend: Calculate<br/>Similarity Scores]
    CalcScores --> CheckScores{Any Score > 60%?}
    
    CheckScores -->|Yes| ShowResults[Display Top 3-5 Results<br/>with Scores]
    ShowResults --> ResultCards[Each Result Shows:<br/>- Title<br/>- Snippet<br/>- Score Stars<br/>- Source Badge]
    ResultCards --> UserReviews{User Clicks Result?}
    
    UserReviews -->|Yes| ViewFull[Open Full FAQ/Forum Post]
    ViewFull --> LogSuccess[Backend: Log Query<br/>Escalated = False]
    LogSuccess --> EndSuccess([Problem Solved ✓])
    
    UserReviews -->|No| ClickHelp[User Clicks<br/>'Still Need Help?']
    ClickHelp --> PrefillForm[Redirect to Post Form<br/>Query Pre-filled]
    PrefillForm --> CustomerPosts[Customer Completes<br/>& Submits Post]
    CustomerPosts --> LogEscalation[Backend: Log Query<br/>Escalated = True]
    LogEscalation --> EndEscalated([Escalated to Forum])
    
    CheckScores -->|No| NoResults[Show Message:<br/>'No good matches found']
    NoResults --> SuggestForum[Show Button:<br/>'Post Your Question']
    SuggestForum --> PrefillForm
    
    style Start fill:#e3f2fd
    style EndSuccess fill:#c8e6c9
    style EndEscalated fill:#fff9c4
    style Loading fill:#f3e5f5
    style ShowResults fill:#e1f5fe
    style NoResults fill:#ffebee
```
</details>


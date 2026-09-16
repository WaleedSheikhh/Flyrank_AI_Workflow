# Visual AI Workflow Builder
 
## What it does, and for whom
 
A visual tool for building AI decision workflows without writing code for the logic itself. You draw a flowchart of yes/no questions — each node is a question an AI model answers — and connect them so the answer decides which path the workflow takes next. Built for anyone who needs to route or classify something (support requests, form submissions, anything with a decision tree shape) without hand-coding the branching logic every time.
 
## Setup a stranger could follow
 
1. Clone the repo:
```
   git clone https://github.com/WaleedSheikhh/Flyrank_AI_Workflow.git
   cd Flyrank_AI_Workflow
```
2. Install dependencies:
```
   npm install
```
3. Get a free Groq API key at [console.groq.com](https://console.groq.com) (no credit card required).
4. Create `.env.local` in the project root:
```
   GROQ_API_KEY=your_key_here
   GROQ_BASE_URL=https://api.groq.com/openai/v1
   GROQ_MODEL=openai/gpt-oss-20b
   INNGEST_DEV=1
```
5. Start the app:
```
   npm run dev
```
6. In a second terminal, start the Inngest dev server:
```
   npx inngest-cli@latest dev
```
7. Open `http://localhost:3000` for the app, `http://localhost:8288` for the Inngest dashboard.
## Usage example
 
1. Click **+ Add Node** to create a decision node.
2. Type a yes/no question directly into the node (e.g. "Is this a support request?").
3. Drag from the **green** handle (bottom-left of a node) to another node to create a YES path. Drag from the **red** handle for a NO path.
4. Type a real test input into the input box at the top.
5. Click **▶ Run**. Watch the active node highlight in blue while it's being evaluated, then show its result (YES/NO) directly on the node.
6. The execution log panel (top-left) shows every step, in order, with the model's answer for each.
## Architecture sketch
 
```
Browser (React Flow canvas)
      │
      │ POST /api/run  →  creates a job, returns immediately (202-style pattern)
      ▼
Inngest event sent  →  Inngest dev server picks it up
      │
      ▼
runWorkflow function (Inngest)
      │
      ├─ step.run: evaluate node 1  →  Groq API  →  YES/NO
      ├─ follow matching edge (YES or NO handle)
      ├─ step.run: evaluate node 2  →  Groq API  →  YES/NO
      └─ ... continues until a node has no next edge
      │
      ▼
Result written to a shared store (runId → status + execution order)
      │
      ▼
Browser polls GET /api/run-status?runId=...  every second, updates the canvas live
```
 
Each node's evaluation is a separate Inngest **step** — individually tracked, retryable, and visible in the Inngest dashboard. The frontend never talks to Groq directly; it only starts a run and polls for status, so the actual AI work happens in the background, not blocking the UI.
 
## Eval results (v2)
 
Tested across two connected nodes ("Is this a support request?" → "Is this urgent?") with a real test input ("my payment failed"). Both nodes correctly evaluated to YES in sequence, confirming dynamic multi-node traversal — the workflow genuinely follows the graph based on live model answers, not a hardcoded path. A forced-failure test (invalid model name) confirmed errors are caught cleanly: the run stops, the specific failing node is marked, and the error message is shown rather than the app hanging or crashing.
 
## Limitations
 
- **No persistence yet.** Refreshing the page loses the current graph — there's no save/load for workflows. A real next step would be JSON export/import.
- **Single-branch execution only.** Each node currently has exactly two outgoing paths (YES/NO) and the engine follows exactly one at a time — it can't fan out to multiple parallel branches.
- **In-memory job store.** Run results are held in a simple in-memory map, not a database — restarting the server loses in-progress run history. Fine for local development and demos, not production-ready as-is.
- **No authentication.** Anyone who can reach the app can run workflows and spend API quota. Would need auth before any real deployment.
## Built with AI
 
Built with Claude as a build partner throughout — Claude wrote the initial scaffolding for each phase (React Flow setup, the Inngest function, the API routes) based on my direction on what each phase needed to do. I debugged and fixed every real issue myself as they came up: an Inngest v4 API breaking change that required a code fix, several file-path and import mismatches, a circular-import problem that required restructuring shared logic into its own module, and confirming the actual execution behavior (idempotency, error handling, multi-node traversal) through real, live tests rather than assuming the code worked. I directed every architectural decision — what the job pattern should look like, what counted as a genuine test of dynamic traversal — and verified every claim in this README against an actual running instance before writing it down.

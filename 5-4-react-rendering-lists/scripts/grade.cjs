#!/usr/bin/env node

/**
 * Lab Autograder — React Task Tracker (State + Event Handling)
 *
 * Repo layout (per your screenshot):
 * - Workflow runs at repo root (cwd = repo root)
 * - Project folder: 5-4-react-rendering-lists/
 * - Grader file:   5-4-react-rendering-lists/scripts/grade.cjs
 * - Student code:  5-4-react-rendering-lists/src/(components|...)...
 *
 * Marking:
 * - 80 marks for TODOs (React checks) => 4 tasks
 * - 20 marks for submission timing (deadline-based)
 *   - On/before deadline => 20/20
 *   - After deadline     => 10/20
 *
 * Deadline: 25 Feb 2026 11:59 PM (Asia/Riyadh, UTC+03:00)
 *
 * Notes:
 * - Ignores JS/JSX comments (so examples inside comments do NOT count).
 * - Lenient checks only: looks for top-level implementation and key constructs.
 * - Accepts common equivalents and flexible naming.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ARTIFACTS_DIR = "artifacts";
const FEEDBACK_DIR = path.join(ARTIFACTS_DIR, "feedback");
fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

/* -----------------------------
   Deadline (Asia/Riyadh)
   25 Feb 2026, 08:59 PM
-------------------------------- */
const DEADLINE_RIYADH_ISO = "2026-02-25T20:59:00+03:00";
const DEADLINE_MS = Date.parse(DEADLINE_RIYADH_ISO);

// Submission marks policy
const SUBMISSION_MAX = 20;
const SUBMISSION_LATE = 10;

/* -----------------------------
   TODO marks (out of 80)
--------------------------------
   Task 1: 20
   Task 2: 25
   Task 3: 20
   Task 4: 15
   Total: 80
*/
const tasks = [
  { id: "t1", name: "Task 1: Capture Input (controlled input + display text)", marks: 20 },
  { id: "t2", name: "Task 2: Submit + Props + Display List (tasks state + map + render text)", marks: 25 },
  { id: "t3", name: "Task 3: Delete Task (prop drilling + filter by id)", marks: 20 },
  { id: "t4", name: "Task 4: Clear All + Placeholder (reset tasks + show placeholder)", marks: 15 },
];

const STEPS_MAX = tasks.reduce((sum, t) => sum + t.marks, 0); // 80
const TOTAL_MAX = STEPS_MAX + SUBMISSION_MAX; // 100

/* -----------------------------
   Helpers
-------------------------------- */
function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function mdEscape(s) {
  return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function splitMarks(stepMarks, missingCount, totalChecks) {
  if (missingCount <= 0) return stepMarks;
  const perItem = stepMarks / totalChecks;
  const deducted = perItem * missingCount;
  return Math.max(0, round2(stepMarks - deducted));
}

/**
 * Strip JS/JSX comments while trying to preserve strings/templates.
 * Not a full parser, but robust enough for beginner labs and avoids
 * counting commented-out code.
 */
function stripJsComments(code) {
  if (!code) return code;

  let out = "";
  let i = 0;

  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    // Handle string/template boundaries (with escapes)
    if (!inDouble && !inTemplate && ch === "'" && !inSingle) {
      inSingle = true;
      out += ch;
      i++;
      continue;
    }
    if (inSingle && ch === "'") {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inSingle = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inTemplate && ch === '"' && !inDouble) {
      inDouble = true;
      out += ch;
      i++;
      continue;
    }
    if (inDouble && ch === '"') {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inDouble = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inDouble && ch === "`" && !inTemplate) {
      inTemplate = true;
      out += ch;
      i++;
      continue;
    }
    if (inTemplate && ch === "`") {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inTemplate = false;
      out += ch;
      i++;
      continue;
    }

    // If not inside a string/template, strip comments
    if (!inSingle && !inDouble && !inTemplate) {
      // line comment
      if (ch === "/" && next === "/") {
        i += 2;
        while (i < code.length && code[i] !== "\n") i++;
        continue;
      }
      // block comment
      if (ch === "/" && next === "*") {
        i += 2;
        while (i < code.length) {
          if (code[i] === "*" && code[i + 1] === "/") {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      }
    }

    out += ch;
    i++;
  }

  return out;
}

function existsFile(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function listAllFiles(rootDir) {
  const ignoreDirs = new Set([
    "node_modules",
    ".git",
    ARTIFACTS_DIR,
    "dist",
    "build",
    ".next",
    ".cache",
  ]);

  const stack = [rootDir];
  const out = [];

  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!ignoreDirs.has(e.name)) stack.push(full);
      } else if (e.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

/* -----------------------------
   IMPORTANT: paths for your repo layout
   - workflow runs at repo root (cwd = repo root)
   - project is in: 5-4-react-rendering-lists
-------------------------------- */
const REPO_ROOT = process.cwd();

// If we are already inside the Vite project folder (has src/ and package.json),
// use cwd as PROJECT_ROOT. Otherwise, use the nested folder.
function isProjectFolder(p) {
  try {
    return (
      fs.existsSync(path.join(p, "package.json")) &&
      fs.existsSync(path.join(p, "src")) &&
      fs.statSync(path.join(p, "src")).isDirectory()
    );
  } catch {
    return false;
  }
}

const PROJECT_ROOT = isProjectFolder(REPO_ROOT)
  ? REPO_ROOT
  : path.join(REPO_ROOT, "5-4-react-rendering-lists");

/* -----------------------------
   Find files (inside PROJECT_ROOT)
-------------------------------- */
function findFileByBasename(names) {
  // common student locations
  const preferred = names
    .flatMap((n) => [
      path.join(PROJECT_ROOT, "src", "components", n),
      path.join(PROJECT_ROOT, "src", n),
    ])
    .filter((p) => existsFile(p));

  if (preferred.length) return preferred[0];

  const all = listAllFiles(PROJECT_ROOT);
  const lowerSet = new Set(names.map((x) => x.toLowerCase()));
  return all.find((p) => lowerSet.has(path.basename(p).toLowerCase())) || null;
}

// Components used by this lab (common names)
const taskAppFile = findFileByBasename(["TaskApp.jsx", "TaskApp.js"]);
const taskListFile = findFileByBasename(["TaskList.jsx", "TaskList.js"]);
const taskItemFile = findFileByBasename(["TaskItem.jsx", "TaskItem.js"]);

/* -----------------------------
   Determine submission time
-------------------------------- */
let lastCommitISO = null;
let lastCommitMS = null;

try {
  lastCommitISO = execSync("git log -1 --format=%cI", { encoding: "utf8" }).trim();
  lastCommitMS = Date.parse(lastCommitISO);
} catch {
  // fallback (still grades, but treat as "now")
  lastCommitISO = new Date().toISOString();
  lastCommitMS = Date.now();
}

/* -----------------------------
   Submission marks
-------------------------------- */
const isLate = Number.isFinite(lastCommitMS) ? lastCommitMS > DEADLINE_MS : true;
const submissionScore = isLate ? SUBMISSION_LATE : SUBMISSION_MAX;

/* -----------------------------
   Load student files
-------------------------------- */
const taskAppRaw = taskAppFile ? safeRead(taskAppFile) : null;
const taskListRaw = taskListFile ? safeRead(taskListFile) : null;
const taskItemRaw = taskItemFile ? safeRead(taskItemFile) : null;

const taskApp = taskAppRaw ? stripJsComments(taskAppRaw) : null;
const taskList = taskListRaw ? stripJsComments(taskListRaw) : null;
const taskItem = taskItemRaw ? stripJsComments(taskItemRaw) : null;

const results = []; // { id, name, max, score, checklist[], deductions[] }

/* -----------------------------
   Result helpers
-------------------------------- */
function addResult(task, required) {
  const missing = required.filter((r) => !r.ok);
  const score = splitMarks(task.marks, missing.length, required.length);

  results.push({
    id: task.id,
    name: task.name,
    max: task.marks,
    score,
    checklist: required.map((r) => `${r.ok ? "✅" : "❌"} ${r.label}`),
    deductions: missing.length ? missing.map((m) => `Missing: ${m.label}`) : [],
  });
}

function failTask(task, reason) {
  results.push({
    id: task.id,
    name: task.name,
    max: task.marks,
    score: 0,
    checklist: [],
    deductions: [reason],
  });
}

/* -----------------------------
   Light detection helpers
-------------------------------- */
function mkHas(code) {
  return (re) => re.test(code);
}

function anyOf(has, res) {
  return res.some((r) => has(r));
}

/* -----------------------------
   Grade TODOs (top-level only)
-------------------------------- */

// Task 1: Controlled input + display typed text
{
  if (!taskApp) {
    failTask(
      tasks[0],
      taskAppFile
        ? `Could not read component file at: ${taskAppFile}`
        : "TaskApp component file not found (expected something like src/components/TaskApp.jsx)."
    );
  } else {
    const has = mkHas(taskApp);

    const required = [
      {
        label: 'Creates text state with useState("") (or equivalent)',
        ok: anyOf(has, [
          /\bconst\s*\[\s*text\s*,\s*setText\s*\]\s*=\s*useState\s*\(\s*["'`]\s*["'`]\s*\)/i,
          /\buseState\s*\(\s*["'`]\s*["'`]\s*\)/i,
        ]),
      },
      {
        label: "Input is controlled with value={text}",
        ok: anyOf(has, [/\bvalue\s*=\s*\{\s*text\s*\}/i]),
      },
      {
        label: "Input updates text via onChange -> setText(e.target.value) (directly or via handler)",
        ok: anyOf(has, [
          /\bonChange\s*=\s*\{\s*\(\s*\w+\s*\)\s*=>\s*setText\s*\(\s*\w+\s*\.target\.value\s*\)\s*\}/i,
          /\bonChange\s*=\s*\{\s*\w+\s*\}/i, // handler name (very lenient)
          /\bsetText\s*\(\s*\w+\s*\.target\.value\s*\)/i,
        ]),
      },
      {
        label: "Displays current text in JSX (e.g., {text})",
        ok: anyOf(has, [/\{\s*text\s*\}/i]),
      },
    ];

    addResult(tasks[0], required);
  }
}

// Task 2: tasks state + submit adds {id,text} + clears + pass props + map + render text
{
  if (!taskApp || !taskList || !taskItem) {
    const missingFiles = [];
    if (!taskApp) missingFiles.push("TaskApp.jsx");
    if (!taskList) missingFiles.push("TaskList.jsx");
    if (!taskItem) missingFiles.push("TaskItem.jsx");
    failTask(tasks[1], `Missing key React files: ${missingFiles.join(", ")}.`);
  } else {
    const hasA = mkHas(taskApp);
    const hasL = mkHas(taskList);
    const hasI = mkHas(taskItem);

    const required = [
      {
        label: "Creates tasks state with useState([])",
        ok: anyOf(hasA, [/\bconst\s*\[\s*tasks\s*,\s*setTasks\s*\]\s*=\s*useState\s*\(\s*\[\s*\]\s*\)/i]),
      },
      {
        label: "Submit click adds a new task immutably (setTasks([...prev, ...]) or functional update)",
        ok: anyOf(hasA, [
          /\bsetTasks\s*\(\s*\(\s*prev\s*\)\s*=>\s*\[\s*\.\.\.\s*prev\s*,/i,
          /\bsetTasks\s*\(\s*prev\s*=>\s*\[\s*\.\.\.\s*prev\s*,/i,
          /\bsetTasks\s*\(\s*\[\s*\.\.\.\s*tasks\s*,/i, // common beginner approach
        ]),
      },
      {
        label: "New task object includes id and text (Date.now or equivalent)",
        ok: anyOf(hasA, [
          /\{\s*id\s*:\s*Date\.now\s*\(\s*\)\s*,\s*text\s*:\s*text/i,
          /\{\s*id\s*:\s*\w+\s*,\s*text\s*:\s*text/i,
          /\bid\s*:\s*Date\.now/i,
        ]),
      },
      {
        label: "Clears input after submit (setText('') / setText(\"\"))",
        ok: anyOf(hasA, [/\bsetText\s*\(\s*["'`]\s*["'`]\s*\)/i]),
      },
      {
        label: "Passes tasks to TaskList as props (tasks={tasks})",
        ok: anyOf(hasA, [/<\s*TaskList[^>]*\btasks\s*=\s*\{\s*tasks\s*\}/i]),
      },
      {
        label: "TaskList maps tasks to TaskItem (tasks.map(...))",
        ok: anyOf(hasL, [/\btasks\s*\.\s*map\s*\(/i, /\.map\s*\(\s*\(\s*\w+\s*\)\s*=>/i]),
      },
      {
        label: "TaskItem displays task text (task.text)",
        ok: anyOf(hasI, [/\btask\s*\.\s*text\b/i, /\{\s*\w+\.text\s*\}/i]),
      },
    ];

    addResult(tasks[1], required);
  }
}

// Task 3: Delete by id via filter + pass onDelete + TaskItem button calls onDelete(...)
{
  if (!taskApp || !taskList || !taskItem) {
    const missingFiles = [];
    if (!taskApp) missingFiles.push("TaskApp.jsx");
    if (!taskList) missingFiles.push("TaskList.jsx");
    if (!taskItem) missingFiles.push("TaskItem.jsx");
    failTask(tasks[2], `Missing key React files: ${missingFiles.join(", ")}.`);
  } else {
    const hasA = mkHas(taskApp);
    const hasL = mkHas(taskList);
    const hasI = mkHas(taskItem);

    const required = [
      {
        label: "Delete handler removes task using filter (setTasks(prev => prev.filter(...)))",
        ok: anyOf(hasA, [
          /\bsetTasks\s*\(\s*\(\s*prev\s*\)\s*=>\s*prev\s*\.\s*filter\s*\(/i,
          /\bsetTasks\s*\(\s*prev\s*=>\s*prev\s*\.\s*filter\s*\(/i,
          /\bfilter\s*\(\s*\w+\s*=>\s*\w+\.id\s*!==\s*\w+\s*\)/i,
        ]),
      },
      {
        label: "Passes delete callback to TaskList (onDelete={...})",
        ok: anyOf(hasA, [/<\s*TaskList[^>]*\bonDelete\s*=\s*\{\s*\w+\s*\}/i]),
      },
      {
        label: "TaskList passes onDelete down to TaskItem",
        ok: anyOf(hasL, [/<\s*TaskItem[^>]*\bonDelete\s*=\s*\{\s*\w+\s*\}/i]),
      },
      {
        label: "TaskItem delete button calls onDelete(task.id) (or onDelete(id))",
        ok: anyOf(hasI, [
          /\bonClick\s*=\s*\{\s*\(\s*\)\s*=>\s*onDelete\s*\(\s*task\s*\.\s*id\s*\)\s*\}/i,
          /\bonClick\s*=\s*\{\s*\(\s*\)\s*=>\s*onDelete\s*\(\s*\w+\s*\)\s*\}/i, // lenient
        ]),
      },
    ];

    addResult(tasks[2], required);
  }
}

// Task 4: Clear all + placeholder when no tasks
{
  if (!taskApp || !taskList) {
    const missingFiles = [];
    if (!taskApp) missingFiles.push("TaskApp.jsx");
    if (!taskList) missingFiles.push("TaskList.jsx");
    failTask(tasks[3], `Missing key React files: ${missingFiles.join(", ")}.`);
  } else {
    const hasA = mkHas(taskApp);
    const hasL = mkHas(taskList);

    const required = [
      {
        label: "Clear All resets tasks to empty array (setTasks([]))",
        ok: anyOf(hasA, [/\bsetTasks\s*\(\s*\[\s*\]\s*\)/i]),
      },
      {
        label: "Clear All button wired (onClick={handleClearAll} or similar)",
        ok: anyOf(hasA, [/\bonClick\s*=\s*\{\s*\w+\s*\}/i]),
      },
      {
        label: "TaskList shows placeholder when tasks is empty (tasks.length === 0, !tasks.length, or similar)",
        ok: anyOf(hasL, [
          /\btasks\s*\.\s*length\s*===\s*0/i,
          /!\s*tasks\s*\.\s*length/i,
          /\btasks\s*\.\s*length\s*>\s*0\s*\?/i, // ternary style
          /\bNo\s+tasks\b/i,
          /\bempty\b/i,
          /\bplaceholder\b/i,
        ]),
      },
    ];

    addResult(tasks[3], required);
  }
}

/* -----------------------------
   Final scoring
-------------------------------- */
const stepsScore = results.reduce((sum, r) => sum + r.score, 0);
const totalScore = round2(stepsScore + submissionScore);

/* -----------------------------
   Build summary + feedback (same style)
-------------------------------- */
const LAB_NAME = "5-4-react-rendering-lists-main";

const submissionLine = `- **Lab:** ${LAB_NAME}
- **Deadline (Riyadh / UTC+03:00):** ${DEADLINE_RIYADH_ISO}
- **Last commit time (from git log):** ${lastCommitISO}
- **Submission marks:** **${submissionScore}/${SUBMISSION_MAX}** ${isLate ? "(Late submission)" : "(On time)"}
`;

let summary = `# ${LAB_NAME} — Autograding Summary

## Submission

${submissionLine}

## Files Checked

- Repo root: ${REPO_ROOT}
- Project root: ${PROJECT_ROOT}
- TaskApp: ${taskAppFile ? `✅ ${taskAppFile}` : "❌ TaskApp.jsx not found"}
- TaskList: ${taskListFile ? `✅ ${taskListFile}` : "❌ TaskList.jsx not found"}
- TaskItem: ${taskItemFile ? `✅ ${taskItemFile}` : "❌ TaskItem.jsx not found"}

## Marks Breakdown

| Component | Marks |
|---|---:|
`;

for (const r of results) summary += `| ${r.name} | ${r.score}/${r.max} |\n`;
summary += `| Submission (timing) | ${submissionScore}/${SUBMISSION_MAX} |\n`;

summary += `
## Total Marks

**${totalScore} / ${TOTAL_MAX}**

## Detailed Checks (What you did / missed)
`;

for (const r of results) {
  const done = (r.checklist || []).filter((x) => x.startsWith("✅"));
  const missed = (r.checklist || []).filter((x) => x.startsWith("❌"));

  summary += `
<details>
  <summary><strong>${mdEscape(r.name)}</strong> — ${r.score}/${r.max}</summary>

  <br/>

  <strong>✅ Found</strong>
  ${done.length ? "\n" + done.map((x) => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing detected)"}

  <br/><br/>

  <strong>❌ Missing</strong>
  ${missed.length ? "\n" + missed.map((x) => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing missing)"}

  <br/><br/>

  <strong>❗ Deductions / Notes</strong>
  ${
    r.deductions && r.deductions.length
      ? "\n" + r.deductions.map((d) => `- ${mdEscape(d)}`).join("\n")
      : "\n- No deductions."
  }

</details>
`;
}

summary += `
> Full feedback is also available in: \`artifacts/feedback/README.md\`
`;

let feedback = `# ${LAB_NAME} — Feedback

## Submission

${submissionLine}

## Files Checked

- Repo root: ${REPO_ROOT}
- Project root: ${PROJECT_ROOT}
- TaskApp: ${taskAppFile ? `✅ ${taskAppFile}` : "❌ TaskApp.jsx not found"}
- TaskList: ${taskListFile ? `✅ ${taskListFile}` : "❌ TaskList.jsx not found"}
- TaskItem: ${taskItemFile ? `✅ ${taskItemFile}` : "❌ TaskItem.jsx not found"}

---

## TODO-by-TODO Feedback
`;

for (const r of results) {
  feedback += `
### ${r.name} — **${r.score}/${r.max}**

**Checklist**
${r.checklist.length ? r.checklist.map((x) => `- ${x}`).join("\n") : "- (No checks available)"}

**Deductions / Notes**
${r.deductions.length ? r.deductions.map((d) => `- ❗ ${d}`).join("\n") : "- ✅ No deductions. Good job!"}
`;
}

feedback += `
---

## How marks were deducted (rules)

- JS/JSX comments are ignored (so examples in comments do NOT count).
- Checks are intentionally light: they look for key constructs and basic structure.
- Code can be in ANY order; repeated code is allowed.
- Common equivalents are accepted, and naming is flexible.
- Missing required items reduce marks proportionally within that TODO.
`;

/* -----------------------------
   Write outputs
-------------------------------- */
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);

const csv = `student,score,max_score
all_students,${totalScore},${TOTAL_MAX}
`;

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.writeFileSync(path.join(ARTIFACTS_DIR, "grade.csv"), csv);
fs.writeFileSync(path.join(FEEDBACK_DIR, "README.md"), feedback);

console.log(
  `✔ Lab graded: ${totalScore}/${TOTAL_MAX} (Submission: ${submissionScore}/${SUBMISSION_MAX}, TODOs: ${stepsScore}/${STEPS_MAX}).`
);
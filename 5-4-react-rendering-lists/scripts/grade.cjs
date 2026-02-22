#!/usr/bin/env node

/**
 * Lab Autograder — Study Buddy (5-4 React Rendering Lists)
 *
 * Grades ONLY based on the TODOs you provided (top-level / lenient):
 *  - TASK 1 (App.jsx): Render courses with courses.map -> <CourseCard ... />
 *  - TASK 2 (CourseCard.jsx): Render tasks with course.tasks.map -> <TaskItem ... />
 *  - TASK 3 (CourseCard.jsx, TaskItem.jsx, DueBadge.jsx): Conditional rendering (ONLY && in other files)
 *  - TASK 4 (CourseCard.jsx, TaskItem.jsx): Interactivity (Toggle + Delete ONLY)
 *
 * Marking:
 * - 80 marks for TODOs (lenient, top-level checks only)
 * - 20 marks for submission timing (deadline-based)
 *   - On/before deadline => 20/20
 *   - After deadline     => 10/20
 *
 * Deadline: 25 Feb 2026 20:59 (Asia/Riyadh, UTC+03:00)
 *
 * Repo layout (per your screenshot):
 * - repo root contains .github/workflows/grade.yml
 * - project folder: 5-4-react-rendering-lists/
 * - grader file:   5-4-react-rendering-lists/scripts/grade.cjs
 * - student files: 5-4-react-rendering-lists/src/...
 *
 * Notes:
 * - Ignores JS/JSX comments (so starter TODO comments do NOT count).
 * - Very lenient checks: looks for key constructs, not exact code.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ARTIFACTS_DIR = "artifacts";
const FEEDBACK_DIR = path.join(ARTIFACTS_DIR, "feedback");
fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

/* -----------------------------
   Deadline (Asia/Riyadh)
   25 Feb 2026, 20:59
-------------------------------- */
const DEADLINE_RIYADH_ISO = "2026-02-25T20:59:00+03:00";
const DEADLINE_MS = Date.parse(DEADLINE_RIYADH_ISO);

// Submission marks policy
const SUBMISSION_MAX = 20;
const SUBMISSION_LATE = 10;

/* -----------------------------
   TODO marks (out of 80)
   (simple, even distribution)
-------------------------------- */
const tasks = [
  { id: "t1", name: "Task 1: Render Courses (App.jsx map + CourseCard props)", marks: 20 },
  { id: "t2", name: "Task 2: Render Tasks (CourseCard.jsx map + TaskItem props)", marks: 20 },
  { id: "t3", name: "Task 3: Conditional Rendering (&& + DueBadge label logic)", marks: 20 },
  { id: "t4", name: "Task 4: Interactivity (Toggle + Delete ONLY)", marks: 20 },
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
   Project root detection (robust)
-------------------------------- */
const REPO_ROOT = process.cwd();

function isViteReactProjectFolder(p) {
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

function pickProjectRoot(cwd) {
  // If action runs inside the project folder already
  if (isViteReactProjectFolder(cwd)) return cwd;

  // Prefer the known lab folder name
  const preferred = path.join(cwd, "5-4-react-rendering-lists");
  if (isViteReactProjectFolder(preferred)) return preferred;

  // Otherwise pick any subfolder that looks like a Vite React project
  let subs = [];
  try {
    subs = fs.readdirSync(cwd, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    subs = [];
  }
  for (const name of subs) {
    const p = path.join(cwd, name);
    if (isViteReactProjectFolder(p)) return p;
  }

  // fallback
  return cwd;
}

const PROJECT_ROOT = pickProjectRoot(REPO_ROOT);

/* -----------------------------
   Find files
-------------------------------- */
function findFileByBasename(names) {
  // Common locations first
  const preferred = names
    .flatMap((n) => [
      path.join(PROJECT_ROOT, "src", "components", n),
      path.join(PROJECT_ROOT, "src", n),
    ])
    .filter((p) => existsFile(p));
  if (preferred.length) return preferred[0];

  // Search entire project
  const all = listAllFiles(PROJECT_ROOT);
  const lowerSet = new Set(names.map((x) => x.toLowerCase()));
  const found = all.find((p) => lowerSet.has(path.basename(p).toLowerCase()));
  return found || null;
}

const appFile = findFileByBasename(["App.jsx", "App.js"]);
const courseCardFile = findFileByBasename(["CourseCard.jsx", "CourseCard.js"]);
const taskItemFile = findFileByBasename(["TaskItem.jsx", "TaskItem.js"]);
const dueBadgeFile = findFileByBasename(["DueBadge.jsx", "DueBadge.js"]);

/* -----------------------------
   Determine submission time
-------------------------------- */
let lastCommitISO = null;
let lastCommitMS = null;

try {
  lastCommitISO = execSync("git log -1 --format=%cI", { encoding: "utf8" }).trim();
  lastCommitMS = Date.parse(lastCommitISO);
} catch {
  lastCommitISO = new Date().toISOString();
  lastCommitMS = Date.now();
}

/* -----------------------------
   Submission marks
-------------------------------- */
const isLate = Number.isFinite(lastCommitMS) ? lastCommitMS > DEADLINE_MS : true;
const submissionScore = isLate ? SUBMISSION_LATE : SUBMISSION_MAX;

/* -----------------------------
   Load & strip student files
-------------------------------- */
const appRaw = appFile ? safeRead(appFile) : null;
const courseCardRaw = courseCardFile ? safeRead(courseCardFile) : null;
const taskItemRaw = taskItemFile ? safeRead(taskItemFile) : null;
const dueBadgeRaw = dueBadgeFile ? safeRead(dueBadgeFile) : null;

const app = appRaw ? stripJsComments(appRaw) : null;
const courseCard = courseCardRaw ? stripJsComments(courseCardRaw) : null;
const taskItem = taskItemRaw ? stripJsComments(taskItemRaw) : null;
const dueBadge = dueBadgeRaw ? stripJsComments(dueBadgeRaw) : null;

const results = [];

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

function mkHas(code) {
  return (re) => re.test(code);
}
function anyOf(has, res) {
  return res.some((r) => has(r));
}

/* -----------------------------
   Grade TODOs
-------------------------------- */

// TASK 1 — App.jsx: courses.map -> CourseCard with props
{
  if (!app) {
    failTask(
      tasks[0],
      appFile ? `Could not read App file at: ${appFile}` : "App.jsx not found under src/."
    );
  } else {
    const has = mkHas(app);

    const required = [
      {
        label: "Uses courses.map(...) to render courses",
        ok: anyOf(has, [/\bcourses\s*\.\s*map\s*\(/i]),
      },
      {
        label: "Renders <CourseCard ... /> in the map",
        ok: anyOf(has, [/<\s*CourseCard\b/i]),
      },
      {
        label: "Passes key prop (key={course.id} or similar)",
        ok: anyOf(has, [
          /<\s*CourseCard[^>]*\bkey\s*=\s*\{\s*\w+\.id\s*\}/i,
          /\bkey\s*=\s*\{\s*\w+\.id\s*\}/i,
        ]),
      },
      {
        label: "Passes course prop (course={course} or similar)",
        ok: anyOf(has, [/<\s*CourseCard[^>]*\bcourse\s*=\s*\{\s*\w+\s*\}/i]),
      },
      {
        label: "Passes index prop (index={idx} or similar)",
        ok: anyOf(has, [/<\s*CourseCard[^>]*\bindex\s*=\s*\{\s*\w+\s*\}/i]),
      },
      {
        label: "Passes onMutateCourse prop (onMutateCourse={...})",
        ok: anyOf(has, [/<\s*CourseCard[^>]*\bonMutateCourse\s*=\s*\{\s*\w+\s*\}/i]),
      },
    ];

    addResult(tasks[0], required);
  }
}

// TASK 2 — CourseCard.jsx: course.tasks.map -> TaskItem with props
{
  if (!courseCard || !taskItem) {
    const missingFiles = [];
    if (!courseCard) missingFiles.push("CourseCard.jsx");
    if (!taskItem) missingFiles.push("TaskItem.jsx");
    failTask(tasks[1], `Missing key files: ${missingFiles.join(", ")}.`);
  } else {
    const hasC = mkHas(courseCard);

    const required = [
      {
        label: "Uses course.tasks.map(...)",
        ok: anyOf(hasC, [/\bcourse\s*\.\s*tasks\s*\.\s*map\s*\(/i]),
      },
      {
        label: "Renders <TaskItem ... /> inside the map",
        ok: anyOf(hasC, [/<\s*TaskItem\b/i]),
      },
      {
        label: "Passes key={task.id} (or similar)",
        ok: anyOf(hasC, [
          /<\s*TaskItem[^>]*\bkey\s*=\s*\{\s*\w+\.id\s*\}/i,
          /\bkey\s*=\s*\{\s*\w+\.id\s*\}/i,
        ]),
      },
      {
        label: "Passes task prop (task={task})",
        ok: anyOf(hasC, [/<\s*TaskItem[^>]*\btask\s*=\s*\{\s*\w+\s*\}/i]),
      },
      {
        label: "Passes onToggle + onDelete props",
        ok: anyOf(hasC, [
          /<\s*TaskItem[^>]*\bonToggle\s*=\s*\{\s*\w+\s*\}[^>]*\bonDelete\s*=\s*\{\s*\w+\s*\}/i,
          /<\s*TaskItem[^>]*\bonDelete\s*=\s*\{\s*\w+\s*\}[^>]*\bonToggle\s*=\s*\{\s*\w+\s*\}/i,
        ]),
      },
    ];

    addResult(tasks[1], required);
  }
}

// TASK 3 — Conditional rendering & DueBadge label logic
{
  if (!courseCard || !taskItem || !dueBadge) {
    const missingFiles = [];
    if (!courseCard) missingFiles.push("CourseCard.jsx");
    if (!taskItem) missingFiles.push("TaskItem.jsx");
    if (!dueBadge) missingFiles.push("DueBadge.jsx");
    failTask(tasks[2], `Missing key files: ${missingFiles.join(", ")}.`);
  } else {
    const hasC = mkHas(courseCard);
    const hasI = mkHas(taskItem);
    const hasD = mkHas(dueBadge);

    const required = [
      // CourseCard: "All caught up" shown only when has tasks AND all done (we just check && and phrase)
      {
        label: 'CourseCard shows "All caught up" using logical && (top-level check)',
        ok: anyOf(hasC, [
          /All\s*caught\s*up/i,
          /caught\s*up/i,
        ]) && anyOf(hasC, [/\&\&/]),
      },
      // CourseCard: "No tasks yet" when course.tasks.length === 0 && ...
      {
        label: 'CourseCard shows "No tasks" message when no tasks (&& + length check or similar)',
        ok: anyOf(hasC, [
          /\bcourse\s*\.\s*tasks\s*\.\s*length\s*===\s*0\s*\&\&/i,
          /\bcourse\s*\.\s*tasks\s*\.\s*length\s*==\s*0\s*\&\&/i,
          /\bcourse\s*\.\s*tasks\s*\.\s*length\s*\)\s*===\s*0/i,
          /No\s+tasks/i,
        ]) && anyOf(hasC, [/\&\&/]),
      },
      // TaskItem: {!task.isDone && <DueBadge dueDate={task.dueDate} />}
      {
        label: "TaskItem shows <DueBadge /> only when task is NOT done (&&)",
        ok: anyOf(hasI, [
          /!\s*task\s*\.\s*isDone\s*\&\&\s*<\s*DueBadge/i,
          /\{\s*!\s*task\s*\.\s*isDone\s*\&\&\s*<\s*DueBadge/i,
        ]),
      },
      // DueBadge: label logic strings exist + daysUntil used
      {
        label: 'DueBadge implements label logic (uses daysUntil + "Overdue"/"Due today"/"Due in")',
        ok: anyOf(hasD, [
          /\bdaysUntil\s*\(\s*dueDate\s*\)/i,
          /\bdaysUntil\s*\(\s*\w+\s*\)/i,
        ]) &&
          anyOf(hasD, [/Overdue/i]) &&
          anyOf(hasD, [/Due\s*today/i]) &&
          anyOf(hasD, [/Due\s*in/i]),
      },
      // DueBadge: returns span using a variable label (not the starter "Label here")
      {
        label: "DueBadge returns the computed label (not placeholder text)",
        ok: !anyOf(hasD, [/Label\s+here/i]) && anyOf(hasD, [/<\s*span[^>]*className\s*=\s*["']badge["'][^>]*>/i]),
      },
    ];

    addResult(tasks[2], required);
  }
}

// TASK 4 — Toggle + Delete (CourseCard) and handlers wiring (TaskItem)
{
  if (!courseCard || !taskItem) {
    const missingFiles = [];
    if (!courseCard) missingFiles.push("CourseCard.jsx");
    if (!taskItem) missingFiles.push("TaskItem.jsx");
    failTask(tasks[3], `Missing key files: ${missingFiles.join(", ")}.`);
  } else {
    const hasC = mkHas(courseCard);
    const hasI = mkHas(taskItem);

    const required = [
      // CourseCard toggleTask uses onMutateCourse + map + isDone flip
      {
        label: "CourseCard toggleTask implemented using onMutateCourse + .map() + toggles isDone",
        ok: anyOf(hasC, [/\bfunction\s+toggleTask\s*\(/i]) &&
          anyOf(hasC, [/\bonMutateCourse\s*\(/i]) &&
          anyOf(hasC, [/\.\s*map\s*\(/i]) &&
          anyOf(hasC, [/\bisDone\b/i]) &&
          anyOf(hasC, [/!\s*\w*\.?\s*isDone/i, /\bisDone\s*:\s*!\s*\w*\.?\s*isDone/i]),
      },
      // CourseCard deleteTask uses onMutateCourse + filter by id
      {
        label: "CourseCard deleteTask implemented using onMutateCourse + .filter() by id",
        ok: anyOf(hasC, [/\bfunction\s+deleteTask\s*\(/i]) &&
          anyOf(hasC, [/\bonMutateCourse\s*\(/i]) &&
          anyOf(hasC, [/\.\s*filter\s*\(/i]) &&
          anyOf(hasC, [/\b\.id\b/i]) &&
          anyOf(hasC, [/!==\s*\w+/i, /!=\s*\w+/i]),
      },
      // TaskItem checkbox checked + onChange calls onToggle(task.id)
      {
        label: "TaskItem checkbox is controlled (checked={task.isDone}) and calls onToggle(task.id) onChange",
        ok: anyOf(hasI, [
          /<\s*input[^>]*type\s*=\s*["']checkbox["'][^>]*checked\s*=\s*\{\s*task\s*\.\s*isDone\s*\}[^>]*>/i,
          /checked\s*=\s*\{\s*task\s*\.\s*isDone\s*\}/i,
        ]) &&
          anyOf(hasI, [
            /onChange\s*=\s*\{\s*\(\s*\)\s*=>\s*onToggle\s*\(\s*task\s*\.\s*id\s*\)\s*\}/i,
            /onChange\s*=\s*\{\s*\w+\s*=>\s*onToggle\s*\(\s*\w+\.id\s*\)\s*\}/i,
            /onChange\s*=\s*\{\s*\(\s*\w+\s*\)\s*=>\s*onToggle\s*\(\s*task\s*\.\s*id\s*\)\s*\}/i,
          ]),
      },
      // TaskItem delete button calls onDelete(task.id)
      {
        label: "TaskItem delete button calls onDelete(task.id) onClick",
        ok: anyOf(hasI, [
          /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*onDelete\s*\(\s*task\s*\.\s*id\s*\)\s*\}/i,
          /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*onDelete\s*\(\s*\w+\s*\)\s*\}/i,
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

- Repo root (cwd): ${REPO_ROOT}
- Detected project root: ${PROJECT_ROOT}
- App: ${appFile ? `✅ ${appFile}` : "❌ App.jsx not found"}
- CourseCard: ${courseCardFile ? `✅ ${courseCardFile}` : "❌ CourseCard.jsx not found"}
- TaskItem: ${taskItemFile ? `✅ ${taskItemFile}` : "❌ TaskItem.jsx not found"}
- DueBadge: ${dueBadgeFile ? `✅ ${dueBadgeFile}` : "❌ DueBadge.jsx not found"}

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

- Repo root (cwd): ${REPO_ROOT}
- Detected project root: ${PROJECT_ROOT}
- App: ${appFile ? `✅ ${appFile}` : "❌ App.jsx not found"}
- CourseCard: ${courseCardFile ? `✅ ${courseCardFile}` : "❌ CourseCard.jsx not found"}
- TaskItem: ${taskItemFile ? `✅ ${taskItemFile}` : "❌ TaskItem.jsx not found"}
- DueBadge: ${dueBadgeFile ? `✅ ${dueBadgeFile}` : "❌ DueBadge.jsx not found"}

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

- JS/JSX comments are ignored (so starter TODO comments do NOT count).
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
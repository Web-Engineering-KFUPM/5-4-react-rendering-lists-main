/* =========================================================
   STUDY BUDDY LAB — MASTER TODO ROADMAP
   =========================================================

   SETUP INSTRUCTIONS
   ---------------------------------------------------------
   1️ Open your VS Code terminal.
   2️ Navigate into the lab directory:
         cd 5-4-react-rendering-lists
   3️ Install dependencies:
         npm i
         (or)
         npm install
   4️ Start the development server:
         npm run dev

   ⚠️ If you get an error like “running scripts is disabled” or
      the system blocks npm commands, run this first:
         Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
      Then re-run your npm commands.

   =========================================================
   TASK 1 — Render Course Components (STUDENTS DO THIS)
   File: src/App.jsx
   ---------------------------------------------------------
   GOAL:
   Display all courses dynamically using .map() and <CourseCard />.

   STEPS:
   1️ Use the `courses` state variable (array of course objects).
   2️ Inside <section className="grid">, use:
         courses.map((course, idx) => ...)
   3️ For each course, render:
         <CourseCard ... />
   4️ Pass these props:
         - key={course.id}
         - course={course}
         - index={idx}
         - onMutateCourse={mutateCourseByIndex}

   LINE REFERENCE:
   → Go to the <section className="grid"> block near the bottom of App.jsx.
     Replace the TODO comment with your .map() code.

   =========================================================
   TASK 2 — Render Tasks for Each Course
   File: src/components/CourseCard.jsx
   ---------------------------------------------------------
   GOAL:
   Inside each course card, display all its tasks using .map().

   STEPS:
   1️ Open CourseCard.jsx.
   2️ Find:
         <ul className="tasks">
         → Write your code inside this list.
   3️ Use course.tasks.map(...) and render <TaskItem /> for each task.
   4️ Pass props:
         - key={task.id}
         - task={task}
         - onToggle={toggleTask}
         - onDelete={deleteTask}

  =========================================================
   TASK 3 — Simple Conditional Rendering (ONLY &&)
   Files: CourseCard.jsx, TaskItem.jsx, DueBadge.jsx
   ---------------------------------------------------------
   GOAL:
   Practice logical && rendering.

   CourseCard.jsx
   1️ Show “All caught up” badge ONLY when:
        - the course has tasks AND
        - all tasks are done

   2️ Show “No tasks yet.” ONLY when the course has NO tasks:
        {course.tasks.length === 0 && <p className="muted">No tasks yet.</p>}

   TaskItem.jsx
   3️ Show <DueBadge /> ONLY when task is NOT done:
        {!task.isDone && <DueBadge dueDate={task.dueDate} />}

   DueBadge.jsx
   4️ Show one label:
        - "Overdue"       (if past)
        - "Due today"     (if today)
        - "Due in X days" (if future)

   =========================================================
   TASK 4 — Interactivity (Toggle + Delete ONLY)
   Files: CourseCard.jsx, TaskItem.jsx
   ---------------------------------------------------------
   GOAL:
   Toggle and delete tasks using state updates.

   CourseCard.jsx
   1️ Implement toggleTask(id) using onMutateCourse + .map()
   2️ Implement deleteTask(id) using onMutateCourse + .filter()

   TaskItem.jsx
   3️ Checkbox calls onToggle(task.id) on change
   4️ Delete button calls onDelete(task.id) on click

   =========================================================
   FINISH LINE
   ---------------------------------------------------------
   - Courses render
   - Tasks render
   - Toggle works
   - Delete works 
   - All caught up badge works 
   - Due badge hides when done 
   =========================================================
*/

import { useState } from "react";
import { sampleCourses } from "./data";
import CourseCard from "./components/CourseCard";
import "./index.css";

export default function App() {
  const [courses, setCourses] = useState(sampleCourses);

  // Helper function (no need to edit this)
  function mutateCourseByIndex(index, updater) {
    setCourses((cs) =>
      cs.map((c, i) => (i === index ? { ...c, tasks: updater(c.tasks) } : c))
    );
  }

  return (
    <main className="wrap">
      <header className="appHeader">
        <h1>
          Study Buddy <span className="blink">▍</span>
        </h1>
        <p className="subtitle">Lists • Keys • Conditional Rendering</p>
      </header>

      <section className="grid">
        {/* TODO (TASK 1): Render all courses using courses.map(...)
      For each course render <CourseCard /> and pass:
        - key={course.id}
        - course={course}
        - index={idx}
        - onMutateCourse={mutateCourseByIndex}
  */}
      </section>
    </main>
  );
}

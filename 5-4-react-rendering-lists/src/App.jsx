
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

   Once the app runs successfully, open it in the browser
   and start implementing the tasks below.

   ⚠️ To get good marks in the lab, follow the instructions strictly, otherwise you may lose the marks.

   =========================================================
   TASK 1 — Render Course Components
   File: src/App.jsx  (YOU ARE HERE)
   ---------------------------------------------------------
   GOAL:
   Display all courses dynamically using .map() and <CourseCard />.

   STEPS:
   1️ Use the `courses` state variable which stores all course objects.
   2️ Use `.map()` to loop through the `courses` array.
   3️ For each `course`, render a <CourseCard /> component.
   4️ Pass these props:
        - course={course}
        - index={idx}
        - onMutateCourse={mutateCourseByIndex}
   5️ Use `course.id` as the key prop.

  LINE REFERENCE:
   → Go to the <section className="grid"> block near the bottom of this file.
     Replace the existing JSX comment with the .map() implementation if missing.

   This task is already implemented for you,
      so you can *see the course cards on screen immediately*.
      Read and understand how `.map()` and `key` work.
      Then move on to Task 2 below.

   ---------------------------------------------------------
   TASK 2 — Render Tasks for Each Course
   File: src/components/CourseCard.jsx
   ---------------------------------------------------------
   GOAL:
   Inside each course card, display all its tasks using .map().

   STEPS:
   1️ Open **CourseCard.jsx**.
   2️ Find the comment:
         `<ul className="tasks">`
         → You’ll write your code right *inside this list*.
   3️ Use `course.tasks.map()` to loop through each task.
   4️ For each task, render a `<TaskItem />` component.
   5️ Pass these props:
         - key={task.id}
         - task={task}
         - onToggle={toggleTask}
         - onDelete={deleteTask}

   HINT:
   Each course already has a `tasks` array in `data.js`.
   You only need to map through it and render each task visually.

   ---------------------------------------------------------
   TASK 3 — Conditional Rendering
   Files: CourseCard.jsx, TaskItem.jsx, DueBadge.jsx
   ---------------------------------------------------------
   GOAL:
   Practice conditional rendering using if, ternary (? :), and logical &&.

   PART A — CourseCard.jsx
   ---------------------------------
   1️ Find the header section (`<header className="cardHeader">`).
       → Add a badge that says “All caught up” when **all tasks are done**.
         Use logical && rendering.
   2️ Find the block where the task list or message should appear.
       → If there are **no tasks**, show:
         “No tasks yet. Add your first one below.”
         Else, render the list (use a ternary operator).

   PART B — TaskItem.jsx
   ---------------------------------
   1️ Open **TaskItem.jsx**.
   2️ Find the `<DueBadge />` inside the <li>.
       → Only render it if the task is *not done*.
         Use logical &&:
         `{!task.isDone && <DueBadge dueDate={task.dueDate} />}`

   PART C — DueBadge.jsx
   ---------------------------------
   1️ Open **DueBadge.jsx**.
   2️ Inside the component:
       - Call the helper `daysUntil(dueDate)` and store it in variable `d`.
       - Use a **ternary chain** to display:
         - if d < 0 → "Overdue"
         - if d === 0 → "Due today"
         - if d === 1 → "1 day remaining"
         - else → `${d} days remaining`
       - Return a `<span className="badge">` element.
       - Add class `"danger"` if overdue, `"warn"` if due today.

  HINT:
   All required functions and HTML structure already exist.
   You only need to fill in the conditions.

   ---------------------------------------------------------
   TASK 4 — Make the App Interactive
   Files: CourseCard.jsx, TaskItem.jsx
   ---------------------------------------------------------
   GOAL:
   Implement add, toggle, and delete task functionality using React state.

   PART A — CourseCard.jsx
   ---------------------------------
   1️ Scroll to the functions near the top:
         - `toggleTask(id)`
         - `deleteTask(id)`
         - `addTask(e)`
       → Write code inside these functions.
   2️ Use `onMutateCourse(index, updater)` to modify tasks.
   3️ Use `.map()` for toggle and `.filter()` for delete.
   4️ In addTask(), create a new task object:
       `{ id, title, dueDate: date, isDone: false }`
   5️ Append it to the existing list and reset the input fields.

   HINT:
   The add form is already visible at the bottom of each card.
   You only need to connect the logic.

   PART B — TaskItem.jsx
   ---------------------------------
   1️ Find the `<input type="checkbox">` in the list item.
       → Call `onToggle(task.id)` when changed.
   2️ Find the Delete button.
       → Call `onDelete(task.id)` when clicked.

   ---------------------------------------------------------
   FINISH LINE
   ---------------------------------------------------------
   Once all tasks are complete:
   - You can add, toggle, and delete tasks per course.
   - “All caught up!” appears automatically when all are done.
   - “No tasks yet” appears when the list is empty.
   - You’ve practiced .map(), keys, conditional rendering, and React state!
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
    setCourses(cs =>
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
        {/* TASK 1 already implemented — for reference.
            Observe how .map() dynamically renders one <CourseCard /> per course. */}
        {courses.map((course, idx) => (
          <CourseCard
            key={course.id}
            course={course}
            index={idx}
            onMutateCourse={mutateCourseByIndex}
          />
        ))}
      </section>
    </main>
  );
}

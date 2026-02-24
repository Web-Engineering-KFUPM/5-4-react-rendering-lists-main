
# Study Buddy — React Lab

> **Note:**
> Please use App.jsx file to perform TODOs and follow the steps strictly to gain good marks in the assignment.  
>  
> **Due Date:** 25 Feb, 2026, **08:59 PM**
>
> Other component files (`CourseCard.jsx`, `TaskItem.jsx`, `DueBadge.jsx`) are intentionally left clean for you to    complete.

---

# Study Buddy Lab (Reduced)

## Overview of the Lab
In this lab, you will build a mini React app called **Study Buddy** — a simple task manager for courses.  
This lab focuses on key React fundamentals you’ve recently studied in ZyBooks.

You will:
- Render course and task lists using `.map()`
- Use **React keys** correctly (`course.id`, `task.id`)
- Practice **conditional rendering using logical `&&`**
- Use React state updates (via a provided helper) to **toggle and delete** tasks

The lab is divided into **four tasks**:
1. Render all courses dynamically (`App.jsx`)
2. Render all tasks inside each course (`CourseCard.jsx`)
3. Add conditional rendering for badges + empty states + due labels (`CourseCard.jsx`, `TaskItem.jsx`, `DueBadge.jsx`)
4. Make the app interactive with **toggle and delete** actions (`CourseCard.jsx`, `TaskItem.jsx`)

---

## Reading Assignment
Before starting, review the following ZyBooks sections:
- 5.10 Conditional Rendering  
- 5.11 Lists (React)

These sections explain the key concepts used in this lab.

---

## Concepts Used in This Lab

## 1) Conditional Rendering (Logical AND `&&`)
Conditional rendering means showing or hiding parts of the UI depending on certain conditions  
(e.g., whether a task is done, or whether a course has any tasks).

React lets you use JavaScript logic directly inside JSX to decide what gets displayed.

### Why it’s useful
- Shows dynamic UI (e.g., “No tasks yet” when a list is empty)
- Improves UX by reacting to data/state changes
- Avoids clutter

### Using Logical AND (`&&`)
```jsx
{tasks.length === 0 && <p>No tasks yet.</p>}
{allDone && <span className="badge">All caught up</span>}
{!task.isDone && <DueBadge dueDate={task.dueDate} />}
```

### Common Mistakes
- Writing conditions that don’t return valid JSX
- Forgetting parentheses when rendering multi-line JSX

---

## 2) Rendering Lists with `.map()`
The `.map()` method transforms arrays into a list of React components.  
This is the standard pattern for displaying collections of data (like courses and tasks).

### Example
```jsx
{courses.map((course) => (
  <CourseCard key={course.id} course={course} />
))}
```

### Common Mistakes
- Forgetting a unique `key` prop
- Returning nothing from the `.map()` callback

---

## 3) React Keys
Keys help React track which items changed, were added, or removed.  
In this lab:
- Use `course.id` as the key when mapping courses
- Use `task.id` as the key when mapping tasks

### Tip
Avoid using array index as a key when the list can change.

---

## 4) State Updates (Toggle + Delete)
This lab uses a helper in `App.jsx` that updates a course’s tasks safely:

```jsx
function mutateCourseByIndex(index, updater) {
  setCourses(cs =>
    cs.map((c, i) => (i === index ? { ...c, tasks: updater(c.tasks) } : c))
  );
}
```

Inside `CourseCard.jsx`, you will call:
```jsx
onMutateCourse(index, (tasks) => /* return a NEW tasks array */);
```

### Toggle (with `.map()`)
- Find the matching task by `id`
- Flip `isDone`

### Delete (with `.filter()`)
- Remove the matching task by `id`

### Common Mistakes
- Mutating arrays directly (e.g., `tasks.push`, `tasks.splice`)
- Forgetting to return a new array from the updater

---

## 5) Event Handling
Events let you respond to user actions like checking a checkbox or clicking delete.

### Examples used in this lab
```jsx
<input
  type="checkbox"
  checked={task.isDone}
  onChange={() => onToggle(task.id)}
/>

<button onClick={() => onDelete(task.id)}>✕</button>
```

---

## 6) Passing Props
Props pass data/functions from parent → child components.

Examples in this lab:
- `App.jsx` passes `course`, `index`, and `onMutateCourse` into `<CourseCard />`
- `CourseCard.jsx` passes `task`, `onToggle`, `onDelete` into `<TaskItem />`

---

## Task Roadmap (Reduced)

### TASK 1 — Render Course Components
**File:** `src/App.jsx`  
- Use `courses.map(...)` inside `<section className="grid">`
- Render `<CourseCard />` for each course
- Pass:
  - `key={course.id}`
  - `course={course}`
  - `index={idx}`
  - `onMutateCourse={mutateCourseByIndex}`

### TASK 2 — Render Tasks for Each Course
**File:** `src/components/CourseCard.jsx`  
- Inside `<ul className="tasks">`, use `course.tasks.map(...)`
- Render `<TaskItem />` for each task
- Pass:
  - `key={task.id}`
  - `task={task}`
  - `onToggle={toggleTask}`
  - `onDelete={deleteTask}`

### TASK 3 — Simple Conditional Rendering (ONLY `&&`)
**Files:** `CourseCard.jsx`, `TaskItem.jsx`, `DueBadge.jsx`

- **CourseCard.jsx**
  - Show “All caught up” badge only when the course has tasks and all are done
  - Show “No tasks yet.” only when a course has zero tasks

- **TaskItem.jsx**
  - Show `<DueBadge />` only when `!task.isDone`

- **DueBadge.jsx**
  - Display one label based on days remaining:
    - `"Overdue"` (past)
    - `"Due today"` (today)
    - `"Due in X days"` (future)

### TASK 4 — Interactivity (Toggle + Delete ONLY)
**Files:** `CourseCard.jsx`, `TaskItem.jsx`
- Implement `toggleTask(id)` using `onMutateCourse + .map()`
- Implement `deleteTask(id)` using `onMutateCourse + .filter()`
- Wire UI:
  - checkbox calls `onToggle(task.id)`
  - delete button calls `onDelete(task.id)`

---

## Submission Checklist
Before submitting, make sure:

- [ ] **Task 1:** Course cards render dynamically using `.map()` in `App.jsx`
- [ ] **Task 2:** Tasks render dynamically using `.map()` in `CourseCard.jsx`
- [ ] **Task 3:** Conditional rendering works:
  - [ ] “All caught up” appears when all tasks are done (and there is at least 1 task)
  - [ ] “No tasks yet.” appears when a course has zero tasks
  - [ ] Due badge shows only when a task is NOT done
- [ ] **Task 4:** Interactivity works:
  - [ ] Toggling tasks works correctly
  - [ ] Deleting tasks works correctly
- [ ] No console errors when running the app
- [ ] Code is readable (indentation + meaningful names)

---


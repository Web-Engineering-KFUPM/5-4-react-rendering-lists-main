
# Study Buddy — React Lab

## Note
Follow the **instructions and TODO roadmap in `App.jsx`** carefully.  
All task details, file names, and line references are explained **inside `App.jsx`**.  
Other component files (`CourseCard.jsx`, `TaskItem.jsx`, `DueBadge.jsx`) are intentionally left clean for you to complete.

---

## Overview of the Lab
In this lab, you will build a mini React app called **Study Buddy** — a simple task manager for courses.  
This lab focuses on key React fundamentals you’ve recently studied in ZyBooks.

You will:
- Render course and task lists using `.map()`
- Implement **conditional rendering** using `if`, ternary `? :`, and logical `&&`
- Use **React state (`useState`)** to add, toggle, and delete tasks dynamically

The lab is divided into **four tasks**:
1. Render all courses dynamically (`App.jsx`)
2. Render all tasks inside each course (`CourseCard.jsx`)
3. Add conditional rendering for badges and empty states (`CourseCard.jsx`, `TaskItem.jsx`, `DueBadge.jsx`)
4. Make the app interactive with add, toggle, and delete actions (`CourseCard.jsx`, `TaskItem.jsx`)

---

## Reading Assignment

Before starting, review the following ZyBooks sections:

- 5.10 Conditional Rendering  
- 5.11 Lists (React)

These sections explain the key concepts used in this lab.

---

## Concepts Used in This Lab

---

## 1. Conditional Rendering
Conditional rendering means showing or hiding parts of the UI depending on certain conditions (like whether a task is done, or if a list is empty).  
React lets you use **JavaScript logic** directly inside JSX to decide what gets displayed.

### Why it’s useful
- Helps you show dynamic content (e.g., "No tasks yet" when a list is empty).
- Improves user experience by reacting to data and state changes.
- Avoids unnecessary UI clutter.

### Common Approaches

**Using `if` Statements (outside JSX):**
```jsx
if (isLoggedIn) {
  return <Dashboard />;
} else {
  return <LoginPage />;
}
```

**Using the Ternary Operator (inline):**
```jsx
{isLoading ? <Spinner /> : <DataList />}
```

**Using Logical AND (`&&`):**
```jsx
{tasks.length === 0 && <p>No tasks yet. Add your first one!</p>}
```

### Common Mistakes
- Forgetting to return something from both branches of an `if`.
- Writing logic directly inside JSX curly braces that doesn’t produce valid elements.

---

## 2. Rendering Lists with `.map()`
The `.map()` method transforms arrays into a list of React components.  
This is one of the most common patterns in React for displaying collections of data (like lists of tasks or courses).

### Why it’s useful
- Lets you generate UI dynamically based on data.
- Keeps your code concise and declarative.
- Automatically re-renders when the array changes (e.g., adding or deleting tasks).

### Example
```jsx
{tasks.map((task, index) => (
  <TaskItem key={task.id} task={task} index={index} />
))}
```

### Common Mistakes
- Forgetting to include a **unique `key` prop** (React will warn you).
- Mutating the original array instead of creating a new one (which breaks reactivity).

---

## 3. React Keys
Keys are unique identifiers that help React keep track of which list items have changed, been added, or removed.  
They improve rendering performance and prevent UI glitches when React updates the DOM.

### Example
```jsx
{courses.map(course => (
  <CourseCard key={course.id} course={course} />
))}
```

### Tips
- Use a unique and consistent ID (like a database or UUID).
- Avoid using `index` as a key unless the list never changes order or items.

### Common Mistake
Using non-unique keys like array indexes can cause React to mismatch components and display incorrect data after updates.

---

## 4. React State (`useState`)
State is data that determines how your component looks and behaves.  
It can change over time — for example, when a user types in an input field or adds a new task.

### Basic Syntax
```jsx
import { useState } from "react";

const [count, setCount] = useState(0);
```

### Example in Context
```jsx
const [title, setTitle] = useState("");
const [tasks, setTasks] = useState([]);

function addTask() {
  setTasks([...tasks, { id: Date.now(), title, isDone: false }]);
  setTitle(""); // reset input
}
```

### Common Mistakes
- Trying to modify state directly (e.g., `tasks.push(...)`) — always create a new array or object.
- Forgetting to use the setter function (e.g., `setTasks`).

---

## 5. Event Handling
Events in React let you respond to user actions like clicking buttons, typing, or submitting forms.  
React’s event system is very similar to regular DOM events but uses camelCase names and functions instead of strings.

### Example
```jsx
function handleClick() {
  alert("Button clicked!");
}

<button onClick={handleClick}>Click Me</button>
```

### Handling Input Fields
```jsx
const [text, setText] = useState("");

<input
  value={text}
  onChange={e => setText(e.target.value)}
/>
```

### Common Mistakes
- Forgetting to wrap event handlers in curly braces (`onClick={}` instead of `onClick=""`).
- Using `onClick="functionName()"` (this is plain HTML syntax, not React).

---

## 6. Passing Props
Props (short for “properties”) let you pass data and functions from a parent component to a child component.  
They are **read-only**, meaning the child can use them but cannot modify them directly.

### Example
```jsx
function CourseCard({ course, onDelete }) {
  return (
    <div className="course">
      <h2>{course.title}</h2>
      <button onClick={() => onDelete(course.id)}>Delete</button>
    </div>
  );
}

<CourseCard course={myCourse} onDelete={handleDeleteCourse} />
```

### Why It’s Important
- Allows **reusability** — one component can behave differently depending on the data passed.
- Enables **communication** between parent and child components.
- Keeps code modular and maintainable.

### Common Mistakes
- Forgetting to pass required props.
- Trying to modify props inside the child (props are immutable).

---

## Summary

| Concept | Purpose | Example Use in This Lab |
|----------|----------|-------------------------|
| **Conditional Rendering** | Show/hide parts of UI dynamically | Show “All caught up” when all tasks are done |
| **`.map()`** | Render lists dynamically | Display all courses or tasks |
| **Keys** | Track unique list items | Use `course.id` or `task.id` |
| **State** | Manage changing data | Add/delete/toggle tasks |
| **Event Handling** | Respond to user actions | Button clicks, typing in inputs |
| **Props** | Pass data/functions to children | Parent sends `onMutateCourse` to `<CourseCard />` |

---

## Submission Checklist

Before submitting your lab, make sure you have completed and verified each step below:

- [ ] **Task 1:** Course cards are rendered dynamically using `.map()` in `App.jsx`
- [ ] **Task 2:** Tasks are rendered dynamically inside each course using `.map()` in `CourseCard.jsx`
- [ ] **Task 3:** Conditional rendering is working (badges, empty states, due dates)
- [ ] **Task 4:** Adding, toggling, and deleting tasks work correctly
- [ ] **Code style:** Proper indentation, meaningful variable names
- [ ] **No console errors** when running the app
- [ ] **Optional:** Add creative touches (colors, labels, emoji, etc.)

---


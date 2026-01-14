# Critical Issue Detection Rules

## Bug Detection

| ID | Rule | Severity |
|----|------|----------|
| R001 | useEffect dependency missing state that's updated inside | critical |
| R002 | useEffect missing cleanup for subscriptions/timers/listeners | critical |
| R003 | Async operation without error handling (try-catch or .catch) | critical |
| R004 | State update on unmounted component (missing cleanup) | critical |
| R005 | Conditional Hook call (inside if/loop/early return) | critical |
| R006 | Infinite loop: setState in useEffect without proper deps | critical |

## Security Issues

| ID | Rule | Severity |
|----|------|----------|
| S001 | dangerouslySetInnerHTML with unsanitized input | critical |
| S002 | eval() or new Function() with dynamic input | critical |
| S003 | Sensitive data in localStorage without encryption | high |
| S004 | API keys or secrets in client-side code | critical |

## Data Integrity

| ID | Rule | Severity |
|----|------|----------|
| D001 | Array index used as key for dynamic lists | high |
| D002 | Direct state mutation (push, splice on state array) | critical |
| D003 | Stale closure capturing outdated state | high |
| D004 | Race condition in sequential async operations | high |

## Detection Patterns

### R001: Missing Dependency

```tsx
// BAD
const [count, setCount] = useState(0);
useEffect(() => {
  console.log(count); // count used but not in deps
}, []); // Missing count

// GOOD
useEffect(() => {
  console.log(count);
}, [count]);
```

### R002: Missing Cleanup

```tsx
// BAD
useEffect(() => {
  const id = setInterval(() => tick(), 1000);
  // No cleanup!
}, []);

// GOOD
useEffect(() => {
  const id = setInterval(() => tick(), 1000);
  return () => clearInterval(id);
}, []);
```

### R006: Infinite Loop

```tsx
// BAD
useEffect(() => {
  setItems([...items, newItem]); // items changes -> effect runs -> loop
}, [items]);

// GOOD
useEffect(() => {
  setItems(prev => [...prev, newItem]);
}, []); // Or use proper condition
```

### D002: Direct Mutation

```tsx
// BAD
const addItem = () => {
  items.push(newItem); // Direct mutation
  setItems(items);
};

// GOOD
const addItem = () => {
  setItems([...items, newItem]);
};
```

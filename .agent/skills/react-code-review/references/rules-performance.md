# Performance Detection Rules

## Re-render Issues

| ID | Rule | Impact |
|----|------|--------|
| P001 | Inline function in JSX props (creates new ref each render) | medium |
| P002 | Inline object/array literal in props | medium |
| P003 | Missing useMemo for expensive computation | high |
| P004 | Excessive useMemo/useCallback (overhead > benefit) | low |
| P005 | Derived state stored in useState (should compute) | medium |
| P006 | Context value changes on every render | high |

## Component Issues

| ID | Rule | Impact |
|----|------|--------|
| P007 | Large list without virtualization (>100 items) | high |
| P008 | Heavy computation in render path | high |
| P009 | Unnecessary re-renders from parent state changes | medium |
| P010 | Image without lazy loading | medium |

## Detection Patterns

### P001: Inline Function

```tsx
// BAD - Creates new function every render
<Button onClick={() => handleClick(id)} />

// GOOD - Stable reference
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id]);
<Button onClick={handleButtonClick} />

// ALSO OK - If child doesn't memo
<Button onClick={() => handleClick(id)} /> // Fine if Button isn't memoized
```

### P002: Inline Object

```tsx
// BAD
<Component style={{ margin: 10 }} />
<Component data={{ id: 1 }} />

// GOOD
const style = useMemo(() => ({ margin: 10 }), []);
<Component style={style} />

// OR - Define outside component if static
const STYLE = { margin: 10 };
```

### P005: Derived State

```tsx
// BAD - Redundant state
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);

useEffect(() => {
  setFilteredItems(items.filter(i => i.active));
}, [items]);

// GOOD - Compute during render
const [items, setItems] = useState([]);
const filteredItems = useMemo(
  () => items.filter(i => i.active),
  [items]
);
```

### P006: Context Re-render

```tsx
// BAD - New object every render
function Provider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <Context.Provider value={{ user, setUser }}>
      {children}
    </Context.Provider>
  );
}

// GOOD - Memoize value
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
```

### P007: Large List

```tsx
// BAD - Renders all items
<div>
  {items.map(item => <Row key={item.id} {...item} />)}
</div>

// GOOD - Use virtualization for large lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={items.length}
  itemSize={35}
>
  {({ index, style }) => (
    <Row style={style} {...items[index]} />
  )}
</FixedSizeList>
```

## When NOT to Optimize

- Component renders < 10ms
- List has < 50 items
- useCallback/useMemo overhead exceeds benefit
- Premature optimization without profiling data

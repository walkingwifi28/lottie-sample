---
name: react-code-review
description: Perform comprehensive React code reviews with step-by-step analysis. Use when reviewing React/TypeScript codebases, analyzing component architecture, detecting bugs, identifying performance issues, or improving code quality. Supports both full project reviews and single-file analysis.
---

# React Code Review

Perform systematic, step-by-step React code reviews with structured output.

## Workflow Overview

Execute reviews in sequential steps. Wait for user confirmation between steps unless instructed to continue automatically.

1. **Analyze structure** → Understand project architecture
2. **Map dependencies** → Identify component relationships
3. **Detect critical issues** → Find bugs and security problems
4. **Analyze performance** → Identify optimization opportunities
5. **Review design** → Suggest maintainability improvements
6. **Create roadmap** → Prioritize fixes

## Step 1: Structure Analysis

Analyze the project and report:

```yaml
project_type: [spa|ssr|static]
framework: [next|remix|vite|cra|other]
state_management: [context|redux|zustand|jotai|none]
styling: [css_modules|styled_components|tailwind|emotion|other]
key_directories:
  - path: string
    purpose: string
entry_points:
  - file: string
    role: string
```

## Step 2: Dependency Mapping

Map component relationships:

```yaml
component_tree:
  - name: string
    children: [string]
    props_received: [string]
shared_components:
  - name: string
    used_by: [string]
context_usage:
  - context_name: string
    providers: [string]
    consumers: [string]
issues:
  - type: [prop_drilling|circular_dependency|orphan_component]
    location: string
    details: string
```

## Step 3: Critical Issues

Detect bugs and security problems. See [references/rules-critical.md](references/rules-critical.md) for detection rules.

Output format:

```yaml
issues:
  - rule_id: string
    severity: [critical|high]
    file: string
    line: number
    code_snippet: string
    explanation: string
    fix:
      before: string
      after: string
```

## Step 4: Performance Analysis

Identify optimization opportunities. See [references/rules-performance.md](references/rules-performance.md) for detection rules.

Output format:

```yaml
issues:
  - rule_id: string
    impact: [high|medium|low]
    file: string
    line: number
    current_behavior: string
    recommended_fix: string
    code_example: string
```

## Step 5: Design Review

Evaluate maintainability:

- Single responsibility violations
- Custom hook extraction opportunities
- Component split opportunities
- Naming improvements
- DRY violations
- Complex conditionals
- TypeScript improvements

Output format:

```yaml
suggestions:
  - category: [srp|custom_hook|component_split|naming|dry|complexity|typing]
    priority: [high|medium|low]
    target: string
    current_state: string
    proposed_change: string
    rationale: string
    effort: [small|medium|large]
```

## Step 6: Action Roadmap

Prioritize all findings:

```yaml
roadmap:
  immediate:  # Bugs, security
    - item: string
      estimated_hours: number
  short_term:  # Performance
    - item: string
      estimated_hours: number
  medium_term:  # Design improvements
    - item: string
      estimated_hours: number
  backlog:  # Nice to have
    - item: string
total_estimated_hours: number
recommended_order: [string]
```

## Commands

- `start` - Begin from Step 1
- `next` - Execute next step
- `step N` - Jump to specific step
- `skip` - Skip current step
- `summary` - Show findings so far
- `auto` - Run all steps without pausing

## Quick Review Mode

For single-file reviews, run all steps automatically with condensed output:

```
Review this component: [paste code]
```

Output a single consolidated report covering critical issues, performance, and key suggestions.

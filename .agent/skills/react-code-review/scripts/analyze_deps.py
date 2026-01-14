#!/usr/bin/env python3
"""
Analyze React component dependencies and build component tree.
Usage: python analyze_deps.py <project_path>
"""

import os
import sys
import json
import re
from pathlib import Path
from collections import defaultdict

def extract_imports(content: str) -> list[str]:
    """Extract imported component names from file content."""
    imports = []
    
    # Match: import X from './Component'
    # Match: import { X, Y } from './components'
    pattern = r"import\s+(?:{([^}]+)}|(\w+))\s+from\s+['\"]([^'\"]+)['\"]"
    
    for match in re.finditer(pattern, content):
        named = match.group(1)
        default = match.group(2)
        path = match.group(3)
        
        # Skip external packages
        if not path.startswith("."):
            continue
            
        if named:
            imports.extend([n.strip().split(" as ")[0] for n in named.split(",")])
        if default:
            imports.append(default)
    
    return imports

def extract_jsx_components(content: str) -> list[str]:
    """Extract JSX component usage from file content."""
    # Match <ComponentName or <Component.Sub
    pattern = r"<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)?)"
    matches = re.findall(pattern, content)
    return list(set(matches))

def extract_props(content: str, component_name: str) -> list[str]:
    """Extract props received by a component."""
    props = []
    
    # Match: function Component({ prop1, prop2 })
    pattern = rf"(?:function|const)\s+{component_name}\s*[=:]?\s*(?:\([^)]*\)\s*=>)?\s*\(?\s*\{{\s*([^}}]+)\s*\}}"
    match = re.search(pattern, content)
    
    if match:
        props_str = match.group(1)
        props = [p.strip().split("=")[0].split(":")[0].strip() 
                 for p in props_str.split(",") if p.strip()]
    
    return props

def analyze_file(file_path: Path, base_path: Path) -> dict | None:
    """Analyze a single React file."""
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except:
        return None
    
    # Check if it's a React component
    if not re.search(r"(function|const)\s+\w+.*?return\s*\(?\s*<", content, re.DOTALL):
        if not re.search(r"class\s+\w+\s+extends\s+(React\.)?Component", content):
            return None
    
    name = file_path.stem
    
    return {
        "name": name,
        "path": str(file_path.relative_to(base_path)),
        "imports": extract_imports(content),
        "jsx_children": extract_jsx_components(content),
        "props": extract_props(content, name)
    }

def build_dependency_graph(project_path: str) -> dict:
    """Build complete dependency graph for project."""
    path = Path(project_path)
    
    if not path.exists():
        return {"error": f"Path not found: {project_path}"}
    
    components = {}
    extensions = [".tsx", ".jsx"]
    
    for ext in extensions:
        for file in path.rglob(f"*{ext}"):
            if "node_modules" in str(file):
                continue
            
            analysis = analyze_file(file, path)
            if analysis:
                components[analysis["name"]] = analysis
    
    # Build usage map
    usage_map = defaultdict(list)
    for name, data in components.items():
        for child in data["jsx_children"]:
            if child in components:
                usage_map[child].append(name)
    
    # Detect issues
    issues = []
    
    # Prop drilling detection (component passes >3 props to child)
    for name, data in components.items():
        prop_count = len(data.get("props", []))
        if prop_count > 5:
            issues.append({
                "type": "prop_drilling",
                "location": data["path"],
                "details": f"{name} receives {prop_count} props - consider Context or composition"
            })
    
    # Orphan detection
    for name, data in components.items():
        if name not in usage_map and name not in ["App", "index", "main", "Root"]:
            issues.append({
                "type": "orphan_component",
                "location": data["path"],
                "details": f"{name} is not used by any other component"
            })
    
    result = {
        "component_count": len(components),
        "components": [
            {
                "name": name,
                "children": [c for c in data["jsx_children"] if c in components],
                "props_received": data["props"],
                "used_by": usage_map.get(name, [])
            }
            for name, data in list(components.items())[:30]
        ],
        "shared_components": [
            {"name": name, "used_by": users}
            for name, users in usage_map.items()
            if len(users) > 1
        ],
        "issues": issues
    }
    
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_deps.py <project_path>")
        sys.exit(1)
    
    result = build_dependency_graph(sys.argv[1])
    print(json.dumps(result, indent=2, ensure_ascii=False))

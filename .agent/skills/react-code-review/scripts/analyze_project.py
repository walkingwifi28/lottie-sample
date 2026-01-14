#!/usr/bin/env python3
"""
Analyze React project structure and generate summary.
Usage: python analyze_project.py <project_path>
"""

import os
import sys
import json
import re
from pathlib import Path
from collections import defaultdict

def find_package_json(path: Path) -> dict | None:
    pkg_path = path / "package.json"
    if pkg_path.exists():
        with open(pkg_path) as f:
            return json.load(f)
    return None

def detect_framework(pkg: dict) -> str:
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    if "next" in deps:
        return "next"
    if "@remix-run/react" in deps:
        return "remix"
    if "vite" in deps:
        return "vite"
    if "react-scripts" in deps:
        return "cra"
    return "other"

def detect_state_management(pkg: dict) -> str:
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    if "redux" in deps or "@reduxjs/toolkit" in deps:
        return "redux"
    if "zustand" in deps:
        return "zustand"
    if "jotai" in deps:
        return "jotai"
    if "recoil" in deps:
        return "recoil"
    if "mobx" in deps:
        return "mobx"
    return "context"

def detect_styling(pkg: dict) -> str:
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    if "tailwindcss" in deps:
        return "tailwind"
    if "styled-components" in deps:
        return "styled_components"
    if "@emotion/react" in deps:
        return "emotion"
    if "sass" in deps or "node-sass" in deps:
        return "sass"
    return "css_modules"

def find_components(path: Path) -> list[dict]:
    components = []
    extensions = [".tsx", ".jsx", ".ts", ".js"]
    
    for ext in extensions:
        for file in path.rglob(f"*{ext}"):
            if "node_modules" in str(file):
                continue
            if file.name.startswith("."):
                continue
                
            try:
                content = file.read_text(encoding="utf-8", errors="ignore")
            except:
                continue
                
            # Detect React components
            if re.search(r"(function|const)\s+\w+.*?return\s*\(?\s*<", content, re.DOTALL):
                components.append({
                    "name": file.stem,
                    "path": str(file.relative_to(path)),
                    "type": "functional"
                })
            elif re.search(r"class\s+\w+\s+extends\s+(React\.)?Component", content):
                components.append({
                    "name": file.stem,
                    "path": str(file.relative_to(path)),
                    "type": "class"
                })
    
    return components

def analyze_project(project_path: str) -> dict:
    path = Path(project_path)
    
    if not path.exists():
        return {"error": f"Path not found: {project_path}"}
    
    pkg = find_package_json(path)
    if not pkg:
        return {"error": "package.json not found"}
    
    components = find_components(path)
    
    # Determine project type
    project_type = "spa"
    framework = detect_framework(pkg)
    if framework in ["next", "remix"]:
        project_type = "ssr"
    
    result = {
        "project_type": project_type,
        "framework": framework,
        "state_management": detect_state_management(pkg),
        "styling": detect_styling(pkg),
        "component_count": len(components),
        "components": components[:20],  # Limit output
        "dependencies": list(pkg.get("dependencies", {}).keys())[:15]
    }
    
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_project.py <project_path>")
        sys.exit(1)
    
    result = analyze_project(sys.argv[1])
    print(json.dumps(result, indent=2, ensure_ascii=False))

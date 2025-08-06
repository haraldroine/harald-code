# Context Files Management

This directory contains modular context files that can be selectively loaded to provide the AI with specific guidance and instructions.

## Available Context Files

### Development Guidelines
- **`react-guidelines.md`** - React best practices, hooks, and optimization patterns
- **`typescript-guidelines.md`** - TypeScript conventions, type safety, and ES modules
- **`testing-guidelines.md`** - Vitest testing patterns and mocking strategies
- **`build-guidelines.md`** - Build process and project conventions

### Usage

#### Manual Loading
Use the `/memory` command to selectively load context:
```
> /memory add context/react-guidelines.md
> /memory add context/typescript-guidelines.md
```

#### Auto-Loading (Project-Specific)
Create a `QWEN.md` or `GEMINI.md` file in your project root that imports specific contexts:
```markdown
# Project Context

@import context/react-guidelines.md
@import context/typescript-guidelines.md

## Project-Specific Rules
- Use Material-UI components
- Follow atomic design principles
```

#### Settings-Based Loading
Configure in `~/.qwen/settings.json`:
```json
{
  "defaultContextFiles": [
    "context/react-guidelines.md",
    "context/typescript-guidelines.md"
  ]
}
```

## Benefits
- **Selective Loading**: Only load relevant context for your current task
- **Token Efficiency**: Avoid loading unnecessary guidelines
- **Modular**: Mix and match different contexts as needed
- **Project-Specific**: Different projects can have different default contexts
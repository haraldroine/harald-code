# Cerebras Code Project Context

This project is **Cerebras Code** - an AI-powered command-line workflow tool for developers, optimized for Cerebras's lightning-fast inference.

## Available Context Modules

You can selectively load specific development guidelines using the `/memory` command:

- **React Development**: `/memory add context/react-guidelines.md`
- **TypeScript Best Practices**: `/memory add context/typescript-guidelines.md`  
- **Testing Strategies**: `/memory add context/testing-guidelines.md`
- **Build Process**: `/memory add context/build-guidelines.md`

## Quick Context Loading

For React development:
```
/memory add context/react-guidelines.md
/memory add context/typescript-guidelines.md
```

For testing work:
```
/memory add context/testing-guidelines.md
/memory add context/typescript-guidelines.md
```

## Project-Specific Notes

- This is a fork of Qwen Code, optimized for Cerebras models
- Default model: `gpt-oss-120b`
- Repository: https://github.com/haraldroine/cerebras-code
- Uses Vitest for testing, React with Ink for CLI UI
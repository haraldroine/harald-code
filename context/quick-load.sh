#!/bin/bash

# Quick context loading script for Cerebras Code

echo "🧠 Cerebras Code Context Manager"
echo "================================"
echo ""

case "$1" in
  "react")
    echo "Loading React development context..."
    echo "You can run these commands in Cerebras Code:"
    echo ""
    echo "/memory add context/react-guidelines.md"
    echo "/memory add context/typescript-guidelines.md"
    ;;
  "testing")
    echo "Loading testing context..."
    echo "You can run these commands in Cerebras Code:"
    echo ""
    echo "/memory add context/testing-guidelines.md" 
    echo "/memory add context/typescript-guidelines.md"
    ;;
  "full")
    echo "Loading all development context..."
    echo "You can run these commands in Cerebras Code:"
    echo ""
    echo "/memory add context/react-guidelines.md"
    echo "/memory add context/typescript-guidelines.md"
    echo "/memory add context/testing-guidelines.md"
    echo "/memory add context/build-guidelines.md"
    ;;
  "list")
    echo "Available contexts:"
    echo "• react-guidelines.md - React best practices and optimization"
    echo "• typescript-guidelines.md - TypeScript conventions and type safety"
    echo "• testing-guidelines.md - Vitest testing patterns"
    echo "• build-guidelines.md - Build process and project conventions"
    ;;
  *)
    echo "Usage: $0 {react|testing|full|list}"
    echo ""
    echo "Examples:"
    echo "  $0 react   - Show commands to load React development context"
    echo "  $0 testing - Show commands to load testing context"
    echo "  $0 full    - Show commands to load all contexts"
    echo "  $0 list    - List available context files"
    ;;
esac
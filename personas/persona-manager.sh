#!/bin/bash

# Persona Management Script for Cerebras Code

PERSONAS_DIR="$(dirname "$0")"

echo "🎭 Cerebras Code Persona Manager"
echo "==============================="
echo ""

show_usage() {
    echo "Usage: $0 {list|show|help} [persona-name]"
    echo ""
    echo "Commands:"
    echo "  list                    - List all available personas"
    echo "  show <persona-name>     - Show details about a specific persona"
    echo "  help                    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 show senior-developer"
}

list_personas() {
    echo "Available personas:"
    echo ""
    
    echo "🔧 Development-Focused:"
    echo "  • senior-developer     - Experienced full-stack developer with architectural focus"
    echo "  • debugging-expert     - Systematic debugger with methodical problem-solving"
    echo ""
    
    echo "⚛️  Specialized Roles:"
    echo "  • react-specialist     - React expert with modern patterns and hooks expertise"
    echo ""
    
    echo "💬 Communication Styles:"
    echo "  • concise-helper       - Brief, direct responses with minimal explanation"
    echo "  • pair-programmer      - Collaborative partner for real-time development"
    echo ""
    
    echo "To use a persona in Cerebras Code:"
    echo "  > /memory clear"
    echo "  > /memory add personas/[persona-name].md"
    echo ""
    echo "Or combine with context files:"
    echo "  > /memory add personas/react-specialist.md"
    echo "  > /memory add context/react-guidelines.md"
}

show_persona() {
    local persona_name="$1"
    local persona_file="$PERSONAS_DIR/${persona_name}.md"
    
    if [[ ! -f "$persona_file" ]]; then
        echo "❌ Persona '$persona_name' not found."
        echo ""
        echo "Available personas:"
        find "$PERSONAS_DIR" -name "*.md" -not -name "README.md" -exec basename {} .md \; | sed 's/^/  • /'
        return 1
    fi
    
    echo "📋 Persona: $persona_name"
    echo "========================="
    echo ""
    
    # Extract key sections from the persona file
    awk '
        /^## Role & Identity/ { in_role=1; next }
        /^## Communication Style/ { in_role=0; in_comm=1; next }
        /^## Expertise Areas/ { in_comm=0; in_exp=1; next }
        /^## / { in_role=0; in_comm=0; in_exp=0 }
        in_role && /^[^#]/ { print "Role: " $0; in_role=0 }
        in_comm && /^- / { gsub(/^- \*\*/, "Style: "); gsub(/\*\*/, ""); print; in_comm=0 }
        in_exp && /^- / { gsub(/^- \*\*/, "Focus: "); gsub(/\*\*:/, " -"); print; if(++count>=2) in_exp=0 }
    ' "$persona_file"
    
    echo ""
    echo "To load this persona:"
    echo "  > /memory clear"
    echo "  > /memory add personas/${persona_name}.md"
}

case "$1" in
    "list"|"")
        list_personas
        ;;
    "show")
        if [[ -z "$2" ]]; then
            echo "❌ Please specify a persona name."
            echo "Usage: $0 show <persona-name>"
            exit 1
        fi
        show_persona "$2"
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
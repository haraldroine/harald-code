# AI Personas & Behavior Modes

This directory contains different AI persona templates that change how the AI behaves, responds, and approaches problems. Each persona defines the AI's role, communication style, expertise focus, and decision-making patterns.

## Available Personas

### Development-Focused
- **`senior-developer.md`** - Experienced full-stack developer with architectural focus
- **`code-reviewer.md`** - Thorough code reviewer focused on best practices and security
- **`debugging-expert.md`** - Systematic debugger with methodical problem-solving approach
- **`performance-optimizer.md`** - Performance-focused engineer specializing in optimization

### Specialized Roles
- **`react-specialist.md`** - React expert with modern patterns and hooks expertise
- **`devops-engineer.md`** - Infrastructure and deployment specialist
- **`security-auditor.md`** - Security-focused reviewer with threat modeling expertise
- **`ui-ux-developer.md`** - Frontend developer with design system expertise

### Communication Styles
- **`concise-helper.md`** - Brief, direct responses with minimal explanation
- **`teaching-mentor.md`** - Educational approach with detailed explanations
- **`pair-programmer.md`** - Collaborative partner for real-time development

## Usage

### Quick Persona Switch
```bash
# In Cerebras Code:
> /persona senior-developer
> /persona react-specialist  
> /persona debugging-expert
```

### Manual Loading
```bash
> /memory add personas/senior-developer.md
> /memory clear  # Clear previous persona
> /memory add personas/react-specialist.md
```

### Combining Personas with Context
```bash
> /persona react-specialist
> /memory add context/react-guidelines.md
> /memory add context/typescript-guidelines.md
```

## Creating Custom Personas

Create a new `.md` file in the `personas/` directory with this structure:

```markdown
# Persona Name

## Role & Identity
Brief description of who the AI should act as.

## Communication Style  
How the AI should communicate (formal/casual, brief/detailed, etc.)

## Expertise Areas
What domains the AI should focus on and demonstrate expertise in.

## Approach & Methodology
How the AI should approach problems and make decisions.

## Response Patterns
Examples of how the AI should structure responses.

## Constraints & Limitations
What the AI should avoid or be cautious about.
```

## Benefits

- **🎭 Role-Based Behavior**: AI adapts to specific roles and expertise areas
- **💬 Communication Styles**: Different approaches for different needs
- **🎯 Focused Expertise**: Specialized knowledge for specific domains  
- **🔄 Quick Switching**: Change AI behavior instantly
- **🛠️ Customizable**: Create personas for your specific workflow
- **📚 Combinable**: Mix personas with context files for powerful combinations
# Cerebras Code

![Cerebras Code Screenshot](https://via.placeholder.com/800x400/1e293b/ffffff?text=Cerebras+Code)

[![GitHub Release](https://img.shields.io/github/v/release/haraldroine/cerebras-code)](https://github.com/haraldroine/cerebras-code/releases)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

**AI-powered command-line workflow tool for developers powered by Cerebras**

[Installation](#installation) • [Quick Start](#quick-start) • [Features](#features) • [Documentation](#documentation) • [Contributing](#contributing)

Cerebras Code is a powerful command-line AI workflow tool adapted from **Qwen Code** and **Gemini CLI**, specifically optimized for Cerebras models. It enhances your development workflow with advanced code understanding, automated tasks, and intelligent assistance using Cerebras's lightning-fast inference.

⚡ **Lightning Fast**: Powered by Cerebras's ultra-fast inference, get responses in milliseconds
🧠 **Smart Defaults**: Uses `gpt-oss-120b` model by default for optimal code generation
🔧 **Developer-Focused**: Built specifically for coding workflows and automation

## Key Features

* **Code Understanding & Editing** - Query and edit large codebases beyond traditional context window limits
* **Workflow Automation** - Automate operational tasks like handling pull requests and complex rebases  
* **Lightning-Fast Inference** - Powered by Cerebras's industry-leading inference speed
* **Enhanced Parser** - Adapted parser specifically optimized for code generation models

## Installation

### Prerequisites

Ensure you have Node.js version 20 or higher installed.

```bash
curl -qL https://www.npmjs.com/install.sh | sh
```

### Install from source

```bash
git clone https://github.com/haraldroine/cerebras-code.git
cd cerebras-code
npm install
npm run build
npm install -g .
```

## Quick Start

```bash
# Start Cerebras Code
cerebras

# Example commands
> Explain this codebase structure
> Help me refactor this function
> Generate unit tests for this module
```

### Session Management

Control your token usage with configurable session limits to optimize costs and performance.

#### Configure Session Token Limit

Create or edit `.cerebras/settings.json` in your home directory:

```json
{
  "sessionTokenLimit": 32000
}
```

#### Session Commands

* **`/compress`** - Compress conversation history to continue within token limits
* **`/clear`** - Clear all conversation history and start fresh
* **`/status`** - Check current token usage and limits

> 📝 **Note**: Session token limit applies to a single conversation, not cumulative API calls.

### API Configuration

Cerebras Code supports multiple API providers. You can configure your API key through environment variables or a `.env` file in your project root.

#### Configuration Methods

1. **Environment Variables**
```bash
export CEREBRAS_API_KEY="your_api_key_here"
export CEREBRAS_BASE_URL="https://api.cerebras.ai/v1"  # Default
export CEREBRAS_MODEL="gpt-oss-120b"  # Default
```

2. **Project `.env` File**
Create a `.env` file in your project root:
```bash
CEREBRAS_API_KEY=your_api_key_here
CEREBRAS_BASE_URL=https://api.cerebras.ai/v1
CEREBRAS_MODEL=gpt-oss-120b
```

#### API Provider Options

**🚀 Cerebras Cloud (Recommended)**

Get your API key from [Cerebras Cloud](https://cloud.cerebras.ai/)

```bash
export CEREBRAS_API_KEY="your_api_key_here"
export CEREBRAS_BASE_URL="https://api.cerebras.ai/v1"
export CEREBRAS_MODEL="gpt-oss-120b"  # Default model
```

**Available Models:**
- `gpt-oss-120b` (Default - Best for code generation)
- `llama3.1-8b`
- `llama-3.3-70b`
- `qwen-3-32b`
- `qwen-3-235b-a22b-instruct-2507`
- `llama-4-scout-17b-16e-instruct`
- `llama-4-maverick-17b-128e-instruct`

**🔄 API Key Rotation (New!)**

Avoid rate limits by configuring multiple API keys for automatic rotation:

```bash
# Add multiple API keys via CLI
cerebras
> /api-keys add csk-your-first-key
> /api-keys add csk-your-second-key  
> /api-keys add csk-your-third-key

# Check rotation status
> /api-keys status
```

Benefits:
- **Automatic switching** when rate limits are hit
- **3x daily free usage** with 3 Cerebras accounts (3M tokens/day)
- **Zero downtime** - seamless key rotation in background

See the [API Key Rotation Guide](docs/api-key-rotation.md) for detailed setup instructions.

**🔄 Backwards Compatibility**

Cerebras Code also supports OpenAI-compatible environment variables:

```bash
export OPENAI_API_KEY="your_cerebras_api_key"
export OPENAI_BASE_URL="https://api.cerebras.ai/v1"
export OPENAI_MODEL="gpt-oss-120b"
```

## Usage Examples

### 🔍 Explore Codebases

```bash
cd your-project/
cerebras

# Architecture analysis
> Describe the main pieces of this system's architecture
> What are the key dependencies and how do they interact?
> Find all API endpoints and their authentication methods
```

### 💻 Code Development

```bash
# Refactoring
> Refactor this function to improve readability and performance
> Convert this class to use dependency injection
> Split this large module into smaller, focused components

# Code generation
> Create a REST API endpoint for user management
> Generate unit tests for the authentication module
> Add error handling to all database operations
```

### 🔄 Automate Workflows

```bash
# Git automation
> Analyze git commits from the last 7 days, grouped by feature
> Create a changelog from recent commits
> Find all TODO comments and create GitHub issues

# File operations
> Convert all images in this directory to PNG format
> Rename all test files to follow the *.test.ts pattern
> Find and remove all console.log statements
```

### 🐛 Debugging & Analysis

```bash
# Performance analysis
> Identify performance bottlenecks in this React component
> Find all N+1 query problems in the codebase

# Security audit
> Check for potential SQL injection vulnerabilities
> Find all hardcoded credentials or API keys
```

## Popular Tasks

### 📚 Understand New Codebases

```
> What are the core business logic components?
> What security mechanisms are in place?
> How does the data flow through the system?
> What are the main design patterns used?
> Generate a dependency graph for this module
```

### 🔨 Code Refactoring & Optimization

```
> What parts of this module can be optimized?
> Help me refactor this class to follow SOLID principles
> Add proper error handling and logging
> Convert callbacks to async/await pattern
> Implement caching for expensive operations
```

### 📝 Documentation & Testing

```
> Generate comprehensive JSDoc comments for all public APIs
> Write unit tests with edge cases for this component
> Create API documentation in OpenAPI format
> Add inline comments explaining complex algorithms
> Generate a README for this module
```

### 🚀 Development Acceleration

```
> Set up a new Express server with authentication
> Create a React component with TypeScript and tests
> Implement a rate limiter middleware
> Add database migrations for new schema
> Configure CI/CD pipeline for this project
```

## Commands & Shortcuts

### Session Commands

* `/help` - Display available commands
* `/clear` - Clear conversation history
* `/compress` - Compress history to save tokens
* `/status` - Show current session information
* `/exit` or `/quit` - Exit Cerebras Code

### Keyboard Shortcuts

* `Ctrl+C` - Cancel current operation
* `Ctrl+D` - Exit (on empty line)
* `Up/Down` - Navigate command history

## Performance Benchmarks

Cerebras Code leverages Cerebras's industry-leading inference speed:

| Model | Tokens/Second | Use Case |
|-------|---------------|----------|
| gpt-oss-120b | 1000+ | Code generation, refactoring |
| llama3.1-8b | 2000+ | Quick queries, simple tasks |
| qwen-3-32b | 1500+ | Code analysis, documentation |

## Development & Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) to learn how to contribute to the project.

## Troubleshooting

### Common Issues

**API Key Not Found**
```bash
Error: Cerebras API key is required (set CEREBRAS_API_KEY or OPENAI_API_KEY)
```
Solution: Set your API key in environment variables or `.env` file.

**Model Not Available**
```bash
Error: Model 'xyz' not found
```
Solution: Use one of the supported models listed in the API Configuration section.

**Connection Issues**
```bash
Error: Failed to connect to Cerebras API
```
Solution: Check your internet connection and API key validity.

## Acknowledgments

This project is based on [Qwen Code](https://github.com/QwenLM/qwen-code) and [Google Gemini CLI](https://github.com/google-gemini/gemini-cli). We acknowledge and appreciate the excellent work of both teams. Our main contribution focuses on optimizing for Cerebras's lightning-fast inference and providing seamless integration with Cerebras Cloud.

## License

[Apache 2.0 License](LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=haraldroine/cerebras-code&type=Date)](https://star-history.com/#haraldroine/cerebras-code&Date)

---

**Powered by Cerebras Cloud** ⚡
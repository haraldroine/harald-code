# Model Command

The `/model` command allows you to manage and switch between different Cerebras models within the Harald Code CLI.

## Usage

```bash
/model [subcommand] [arguments]
```

### Available Subcommands

#### `/model` or `/model current`
Shows the current model configuration and sources.

```bash
/model
# or
/model current
```

**Example output (with API key):**
```
Verifying model with Cerebras API...

Current Model Configuration

Active Model: gpt-oss-120b

Configuration Sources:
• Settings file: gpt-oss-120b
• Environment: not set
• Default: gpt-oss-120b

API Status: Connected
✓ Model verified via Cerebras API
Owner: Cerebras

Use '/model list' to see available models or '/model set <model>' to change.
```

**Example output (without API key):**
```
Current Model Configuration

Active Model: gpt-oss-120b

Configuration Sources:
• Settings file: gpt-oss-120b
• Environment: not set
• Default: gpt-oss-120b

API Status: No API key configured
✓ Model is in fallback list

Use '/model list' to see available models or '/model set <model>' to change.
```

#### `/model list`
Lists all available Cerebras models with descriptions.

```bash
/model list
```

**Example output (with API key configured):**
```
Loading models from Cerebras API...

Available Cerebras Models (via API)

● gpt-oss-120b (current)
    Owner: Cerebras

○ llama3.1-8b
    Owner: Meta

○ llama-3.3-70b
    Owner: Meta

○ qwen-3-32b
    Owner: Qwen

○ qwen-3-235b-a22b-instruct-2507
    Owner: Qwen

○ llama-4-scout-17b-16e-instruct
    Owner: Meta

○ llama-4-maverick-17b-128e-instruct
    Owner: Meta

Use '/model set <model>' to change the active model.
```

**Example output (without API key):**
```
Available Cerebras Models (fallback list)

● gpt-oss-120b (current)
    Default - Best for code generation (120B parameters)

○ llama3.1-8b
    Fast and efficient (8B parameters)

Use '/model set <model>' to change the active model.

💡 Tip: Set CEREBRAS_API_KEY to see the latest available models.
```

#### `/model set <model_name>`
Changes the active model to the specified model.

```bash
/model set llama3.1-8b
```

**Example output (with API key):**
```
Validating model with Cerebras API...
Getting model details...

✓ Model changed successfully!

New model: llama3.1-8b
Owner: Meta

Note: The model change is now active for new conversations.
```

**Example output (without API key):**
```
✓ Model changed successfully!

New model: llama3.1-8b
Fast and efficient (8B parameters)

Note: The model change is now active for new conversations.
```

## Available Models

### Dynamic Model Fetching

When you have a Cerebras API key configured (`CEREBRAS_API_KEY`), Harald Code automatically fetches the latest available models from the Cerebras API. This ensures you always have access to the newest models as they become available.

### Fallback Models

If no API key is configured or the API is unavailable, Harald Code uses a fallback list of known models:

| Model | Description | Parameters |
|-------|-------------|------------|
| `gpt-oss-120b` | Default - Best for code generation | 120B |
| `llama3.1-8b` | Fast and efficient | 8B |
| `llama-3.3-70b` | Large model with strong reasoning | 70B |
| `qwen-3-32b` | Qwen 3 model | 32B |
| `qwen-3-235b-a22b-instruct-2507` | Large Qwen 3 instruct model | 235B |
| `llama-4-scout-17b-16e-instruct` | Llama 4 Scout instruct model | 17B |
| `llama-4-maverick-17b-128e-instruct` | Llama 4 Maverick instruct model | 17B |

## Command Aliases

The `/model` command supports the following aliases:
- `/models`
- `/m`

## Examples

### Switching to a faster model for quick queries
```bash
/model set llama3.1-8b
```

### Switching to a more powerful model for complex tasks
```bash
/model set qwen-3-235b-a22b-instruct-2507
```

### Checking what model you're currently using
```bash
/model
```

### Seeing all available options
```bash
/model list
```

## Configuration Persistence

When you change the model using `/model set`, the setting is saved to your user settings file (`~/.qwen/settings.json` or `~/.harald/settings.json`) and will persist across CLI sessions.

The model can also be configured through:
1. **Environment variables**: `CEREBRAS_MODEL` or `OPENAI_MODEL`
2. **Command line arguments**: `--model` or `-m`
3. **Settings file**: `model` field in settings.json

The priority order is: Command line > Environment variables > Settings file > Default

## Error Handling

If you specify an invalid model name, the command will show an error with the list of available models (dynamically fetched from API if available):

```bash
/model set invalid-model
```

**Output:**
```
Unknown model: 'invalid-model'

Available models:
• gpt-oss-120b
• llama3.1-8b
• llama-3.3-70b
• qwen-3-32b
• qwen-3-235b-a22b-instruct-2507
• llama-4-scout-17b-16e-instruct
• llama-4-maverick-17b-128e-instruct

Use '/model list' to see detailed information.
```

## API Integration

The model command integrates with the Cerebras API to provide the most up-to-date information:

- **Model List**: Fetched dynamically from `https://api.cerebras.ai/v1/models`
- **Model Details**: Retrieved using `https://api.cerebras.ai/v1/models/{model}`
- **Fallback**: Uses hardcoded list if API is unavailable
- **Timeout**: API calls timeout after 5 seconds to prevent hanging

### Benefits of API Integration

1. **Always Current**: Get the latest models as soon as they're released
2. **Model Validation**: Verify models exist before setting them
3. **Rich Information**: See model owners and metadata
4. **Graceful Degradation**: Falls back to known models if API fails
5. **User Feedback**: Loading indicators show when API calls are in progress
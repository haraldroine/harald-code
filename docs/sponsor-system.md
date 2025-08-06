# Sponsor System

The CLI includes a simple sponsor display system that shows a sponsor application link under the input box.

## Overview

The sponsor system adds a static sponsor section that appears below the input prompt:

```
💎 Sponsor this CLI: /sponsor apply for details
```

This section is always visible when the input is active and provides an easy way for users to learn about sponsorship opportunities.

## Commands

### `/sponsor` or `/sponsor apply` - Show sponsor application information
Displays information about how to apply for sponsor placement, including contact details and benefits.

## Application Process

Interested sponsors can contact the development team at `harald@buroventures.com` with:
- Company name and website
- Sponsorship goals and budget

## Implementation Details

### Files Modified
- `packages/cli/src/ui/commands/sponsorCommand.ts` - Simple sponsor application command
- `packages/cli/src/ui/components/SponsorDisplay.tsx` - Static sponsor section component
- `packages/cli/src/services/BuiltinCommandLoader.ts` - Registered sponsor command
- `packages/cli/src/ui/App.tsx` - Added sponsor section under input prompt

### Design Philosophy
The sponsor system is intentionally simple:
- No configuration needed
- Always visible when input is active
- Single command for application information
- Non-intrusive but discoverable placement
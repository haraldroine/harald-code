# Build and Development Guidelines

## Building and Running

Before submitting any changes, it is crucial to validate them by running the full preflight check. This command will build the repository, run all tests, check for type errors, and lint the code.

To run the full suite of checks, execute the following command:

```bash
npm run preflight
```

This single command ensures that your changes meet all the quality gates of the project. While you can run the individual steps (`build`, `test`, `typecheck`, `lint`) separately, it is highly recommended to use `npm run preflight` to ensure a comprehensive validation.

## Git Repository

The main branch for this project is called "main".

## Comments Policy

Only write high-value comments if at all. Avoid talking to the user through comments.

## General Style Requirements

Use hyphens instead of underscores in flag names (e.g. `my-flag` instead of `my_flag`).
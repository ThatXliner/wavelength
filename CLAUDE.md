You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Lists the available documentation sections, with titles, use_cases, and paths.
When a task depends on Svelte 5 or SvelteKit APIs, call it to find the sections that cover them.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
Fetch every section whose use_cases match the task: Svelte 5 and current SvelteKit APIs differ from the older versions you may remember.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
Run it on Svelte code you write or change, and fix what it reports. Rerun it until it comes back clean; a suggestion you have a reason to decline can stay, as long as you tell the user which one and why.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
It is for standalone snippets only: when the code went into project files, don't offer one. For a standalone snippet, offer a link and call this tool only after the user says yes.

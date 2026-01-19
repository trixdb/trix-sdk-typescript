#!/bin/bash
# Post-tool-call hook for Claude Code
# Checks file size limits after Edit/Write operations on TypeScript files

# Exit codes:
# 0 = success (with optional warnings)
# 1 = error (blocks the operation)

# Read hook input from stdin
INPUT=$(cat)

# Extract tool name and file path from JSON input
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check Edit and Write tool calls
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
    exit 0
fi

# Only check .ts and .tsx files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
    exit 0
fi

# Check if file exists
if [[ ! -f "$FILE_PATH" ]]; then
    exit 0
fi

# Count lines in the file
LINE_COUNT=$(wc -l < "$FILE_PATH")

# Check against limits
SOFT_LIMIT=300
HARD_LIMIT=500

if [[ $LINE_COUNT -gt $HARD_LIMIT ]]; then
    echo "ERROR: File exceeds hard limit of $HARD_LIMIT lines ($LINE_COUNT lines)"
    echo "Action required: Split $FILE_PATH into smaller modules"
    echo "See CODING_STANDARDS.md for guidance"
    exit 1
elif [[ $LINE_COUNT -gt $SOFT_LIMIT ]]; then
    echo "WARNING: File exceeds soft limit of $SOFT_LIMIT lines ($LINE_COUNT lines)"
    echo "Consider splitting $FILE_PATH into smaller modules"
    exit 0
fi

exit 0

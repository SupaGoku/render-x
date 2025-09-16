---
description: Create fast-track priority spec by referencing core create-spec instruction
globs:
alwaysApply: false
version: 2.1
encoding: UTF-8
---

# Create Priority Item Spec

## Overview

Use this instruction to create a priority spec (hotfix, priority feature, or operational task) under `.blueprint/specs/priority` by following the core spec creation workflow.

<pre_flight_check>
EXECUTE: @.blueprint/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="execute_create_spec">

### Step 1: Execute Core Spec Creation

Follow the complete spec creation workflow from @.blueprint/instructions/core/create-spec.md with the following modification:

**Directory Override**: Create the spec directory under `.blueprint/specs/priority/` instead of `.blueprint/specs/current/`

<path_modification>
- Base path: `.blueprint/specs/priority/`
- Dirname format: `00-{spec-name}-{YYYY-MM-DD}` (priority 00 by default)
- All other steps remain identical to create-spec.md
</path_modification>

</step>

</process_flow>

<post_flight_check>
EXECUTE: @.blueprint/instructions/meta/post-flight.md
</post_flight_check>

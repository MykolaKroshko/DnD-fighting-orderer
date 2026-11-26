# Claude Code team rollout

This document describes a proposed rollout of the Claude Code setup in this repository. The repository already has shared permissions, a file-write guard, an edit logger, and a Stop quality hook in `.claude/settings.json`; managed policy below adds organization-wide limits and telemetry. The rollout uses file-based managed settings on developer machines. If the organization already deploys policy through MDM or the Claude admin console, deploy the same policy there instead and verify the source in `/status`.

## Managed policy

Deploy `managed-settings.json` through the device-management system to these exact locations:

| OS | Managed settings path | Delivery |
|---|---|---|
| Windows | `C:\Program Files\ClaudeCode\managed-settings.json` | Intune or Group Policy; direct file deployment for unmanaged pilot machines |
| macOS | `/Library/Application Support/ClaudeCode/managed-settings.json` | Jamf or another MDM; direct file deployment for pilot machines |
| Linux and WSL | `/etc/claude-code/managed-settings.json` | Configuration management or the approved machine image |

Use the OS rows that match the team’s actual devices. Windows WSL reads the Linux path; do not use the legacy Windows path under `C:\ProgramData\ClaudeCode`.

Initial policy:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./**/.env)",
      "Read(./**/.env.*)"
    ],
    "disableBypassPermissionsMode": "disable"
  },
  "cleanupPeriodDays": 30,
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "https://otel-collector.example.invalid",
    "OTEL_LOG_USER_PROMPTS": "0",
    "OTEL_LOG_ASSISTANT_RESPONSES": "0",
    "OTEL_LOG_TOOL_DETAILS": "0",
    "OTEL_LOG_TOOL_CONTENT": "0",
    "OTEL_LOG_RAW_API_BODIES": "0",
    "OTEL_METRICS_INCLUDE_SESSION_ID": "false",
    "OTEL_METRICS_INCLUDE_ACCOUNT_UUID": "false",
    "OTEL_METRICS_INCLUDE_REPOSITORY": "true"
  }
}
```

Replace the example collector URL with the organization’s approved endpoint before deployment. Keep authentication credentials in the MDM secret store or managed server configuration; do not commit them to this repository. The managed deny rules prevent reading `.env` files, and disabling bypass mode prevents switching to bypass permissions. Project-level `.claude/settings.json` continues to provide the repository’s hooks and command rules. Confirm the managed source and policy with `/status`, then use `claude doctor` to identify rejected settings. Verify the deny rule with a harmless attempted read of a test `.env` file containing no secrets.

## Audit trail and retention

| Record | Location | Retention |
|---|---|---|
| Session transcripts and tool results | Local Claude Code project data under `%USERPROFILE%\.claude\projects\` on Windows, `~/.claude/projects/` on macOS/Linux/WSL | 30 days via `cleanupPeriodDays`; developers must not treat this as a backup |
| Quality-hook work queue | OS temporary directory as `claude-quality-<sessionId>.json`; the Stop hook removes it after a passing run. This is a list of changed paths, not an audit log. | Deleted on pass; failed-run queue remains for retry and is subject to normal OS temp cleanup |
| Central audit events | Organization-controlled OpenTelemetry collector and SIEM | 90 days, then automatic deletion unless an incident/legal hold applies |

Export metadata events needed to investigate decisions: `tool_decision`, `safety_event`, `permission_mode_changed`, `managed_settings_resolved`, `retention_sweep`, and hook execution events. Correlate by `tool_use_id` where available. Keep `OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_ASSISTANT_RESPONSES`, `OTEL_LOG_TOOL_DETAILS`, `OTEL_LOG_TOOL_CONTENT`, and `OTEL_LOG_RAW_API_BODIES` disabled as shown in the policy. The collector must reject content-bearing fields if a client accidentally sends them. Do not put source code, prompts, tool arguments, or API request/response bodies in the audit index.

The local cleanup period does not cover every local record: prompt history and some usage/configuration files may remain until explicitly removed. For a deletion request, follow the organization’s local-data procedure and use the supported project purge command for the installed Claude Code version. Restrict access to the local profile and central logs to the developer and authorized security staff.

## Telemetry and visibility

Enable aggregate session, cost, token, tool-decision, and active-time metrics. Include repository identity for service-level trends, but disable session and account UUID dimensions as shown above. The engineering lead may see aggregate adoption and activity by repository, overall token/cost trends, tool allow/deny rates, and whether managed settings and hooks are active. These metrics do not establish that generated code is correct, that a ticket is complete, or that an individual developer is productive; tests, reviews, and delivery outcomes remain the quality measures.

### Personal data in metrics

Claude Code telemetry includes `user.id`, and includes `user.email` when available. The two `OTEL_METRICS_INCLUDE_*` settings above suppress session and account UUID dimensions; they do not remove `user.id` or `user.email`. Before enabling the collector, configure it to drop or pseudonymize those user attributes at ingestion, and verify with a sample event that the stored record contains neither a person’s name, email, account UUID, nor a stable individual identifier. Keep any re-identification map separately under restricted access, if there is a documented security need. Publish the telemetry purpose and retention to the team before the pilot. Do not use individual-level activity or cost data for performance ranking or compensation decisions.

## Rollout stages and gates

1. **Maintainer machine.** Install the managed file, start a fresh session, confirm its source in `/status`, verify that a test `.env` read is denied, and confirm one session metric and one metadata event arrive without prompt or tool content. Proceed only when all checks pass and the collector applies the privacy filters.
2. **Pilot (2–3 developers across supported OSes).** Use one real, non-sensitive feature task per person. Confirm hooks run, normal work remains possible, denied actions stay blocked, and audit events arrive. Ask participants to review the telemetry notice and local-data cleanup behavior. Proceed when there are no unexplained policy failures, no content leakage, and each OS has a verified managed-policy source.
3. **Repository team.** Roll out the pinned project setup and managed policy to all contributors. Check the gates from stage 2 for a full working week; document support contacts and recovery steps. Proceed when every active contributor can verify policy through `/status` and the security owner has approved dashboards and retention.
4. **Department.** Expand by repository/team cohort, not all at once. For each cohort, repeat the OS, policy, privacy, and denied-action checks. Complete rollout only when every cohort has an owner, a tested incident contact path, and no unresolved high-severity policy or privacy issue.

At any stage, stop expansion if a managed setting is missing, a protected read succeeds, content reaches telemetry, or hooks block unrelated read-only work. Fix the cause and repeat that stage’s gate before proceeding.

## Incident response and recovery

1. Stop the Claude Code session and pause the affected rollout. Do not ask the agent to continue while the cause is unknown.
2. Preserve the Git state: record the branch, `git status`, and the diff; save relevant `tool_use_id` and session identifiers. Do not overwrite uncommitted work while collecting evidence.
3. If a credential or personal data may have been exposed, revoke or rotate it first. Then restrict access to affected logs, notify the security/privacy owner, and request deletion from the collector under the incident process.
4. Review the managed policy source in `/status`, `claude doctor` output, hook events, central audit events, and local transcript/tool-result files. Establish whether the action came from a file tool, Bash, a hook, a subagent, or an external process.
5. Treat `/rewind` as a convenience for tracked file-tool edits only. It does not reliably reverse Bash-only changes, most subagent changes, external changes, or effects outside the working tree. Restore files from the saved Git diff or a known-good commit, and separately undo external side effects through their owning system.
6. Re-run the independent checks relevant to the incident, verify the final diff, and record the cause, scope, recovery, and any policy change. Resume the rollout only after the security owner approves the fix and the failed rollout gate passes again.

## References

- Repository controls: [`.claude/settings.json`](.claude/settings.json) and [`CLAUDE.md`](CLAUDE.md).
- Claude Code managed settings and OS paths: [Deploy managed settings](https://code.claude.com/docs/en/managed-settings).
- Telemetry configuration, fields, and metrics: [Monitoring](https://code.claude.com/docs/en/monitoring-usage).
- Local data, cleanup, and checkpoints: [Claude directory](https://code.claude.com/docs/en/claude-directory) and [Checkpointing](https://code.claude.com/docs/en/checkpointing).

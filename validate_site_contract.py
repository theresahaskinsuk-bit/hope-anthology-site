#!/usr/bin/env python3
"""Pre-package baseline and route-invariant gate for The Hope Anthology.

Run this gate before packaging every Hope Anthology change:

    python3 validate_site_contract.py --root . --baseline origin/main \
      --report reports/prepackage-site-contract.md

The gate fetches the remote baseline, records its full commit SHA, verifies that
that baseline is an ancestor of the current checkout, then validates the site
navigation and footer contracts. Findings listed in the version-controlled
known-findings baseline are reported prominently as outstanding but do not
block unrelated packaging. Any finding not in that baseline exits non-zero.

The active-file manifest is deliberately explicit. Add a new custom page's
content and renderer files to the lists below when it is made live. Retired
content (currently the former Collections landing page and its historical
collection renderer) is intentionally excluded instead of silently accepted.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

EXPECTED_NAVIGATION = ["To Keep", "To Make", "The Story", "For Artists", "Collective"]
KNOWN_FINDINGS_FILE = "site-contract-known-findings.json"

# Page-level content sources. These are the files that supply a visible page's
# site navigation. Supplementary generated data, such as content.home-recent-
# artists.js, does not contain navigation and is correctly outside this list.
ACTIVE_CONTENT_FILES = [
    "content.collaborate.js",
    "content.collective.js",
    "content.for-organisations.js",
    "content.home.js",
    "content.info-page-template.js",
    "content.keep-collections.js",
    "content.make-template.js",
    "content.story.js",
    "content.to-keep.js",
    "content.to-make.js",
    "content.to-make.nell-hardy-e3.js",
    "content.to-make.ellien-bruce-e4.js",
    "content.why-we-sell-this-way.js",
]

# Live page renderers whose visible Footer Navigate column is part of the
# contract. Retired collection renderers and the unused stability loader are
# intentionally excluded.
ACTIVE_RENDERER_FILES = [
    "ha-artist-page.js",
    "ha-collaborate.js",
    "ha-collective.js",
    "ha-for-organisations.js",
    "ha-home.js",
    "ha-info-page-template.js",
    "ha-make-template.js",
    "ha-story.js",
    "ha-to-keep.js",
    "ha-to-make.js",
    "ha-to-make-maker.js",
    "ha-why-we-sell-this-way.js",
]

# Only the Story renderer constructs its footer Navigate links directly from
# content data. All other active renderers carry the final For Organisations
# anchor in renderer markup.
DATA_DRIVEN_FOOTERS = {"ha-story.js": "content.story.js"}

NODE_CONTENT_READER = r"""
const fs = require('fs');
const vm = require('vm');
const filename = process.argv[1];
const source = fs.readFileSync(filename, 'utf8');
const sandbox = {window: {}};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, {filename, timeout: 1000});
const found = [];
const seen = new Set();
function visit(value, trail) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value.navigation) || Array.isArray(value.nav)) {
    found.push({trail, content: value, navigation: Array.isArray(value.navigation) ? value.navigation : value.nav, footer: value.footer || null});
  }
  if (Array.isArray(value)) value.forEach((entry, index) => visit(entry, `${trail}[${index}]`));
  else Object.entries(value).forEach(([key, entry]) => visit(entry, `${trail}.${key}`));
}
Object.entries(sandbox.window).forEach(([key, value]) => visit(value, `window.${key}`));
process.stdout.write(JSON.stringify(found));
"""


@dataclass
class Finding:
    severity: str
    area: str
    file: str
    message: str


def finding_key(finding: Finding) -> tuple[str, str, str]:
    """Stable identity for a contract finding recorded in the baseline."""
    return (finding.area, finding.file, finding.message)


def load_known_findings(root: Path) -> tuple[set[tuple[str, str, str]], list[Finding]]:
    """Read the committed baseline; malformed or missing baseline blocks packaging."""
    path = root / KNOWN_FINDINGS_FILE
    if not path.is_file():
        return set(), [Finding("ERROR", "known-findings-baseline", KNOWN_FINDINGS_FILE, "Known-findings baseline file is missing.")]
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return set(), [Finding("ERROR", "known-findings-baseline", KNOWN_FINDINGS_FILE, f"Known-findings baseline cannot be read: {exc}.")]
    if not isinstance(payload, dict) or payload.get("schema_version") != 1:
        return set(), [Finding("ERROR", "known-findings-baseline", KNOWN_FINDINGS_FILE, "Known-findings baseline must be a JSON object with schema_version 1.")]
    items = payload.get("findings")
    if not isinstance(items, list):
        return set(), [Finding("ERROR", "known-findings-baseline", KNOWN_FINDINGS_FILE, "Known-findings baseline must contain a findings array.")]
    keys: set[tuple[str, str, str]] = set()
    errors: list[Finding] = []
    for index, item in enumerate(items, start=1):
        if not isinstance(item, dict):
            errors.append(Finding("ERROR", "known-findings-baseline", KNOWN_FINDINGS_FILE, f"Baseline finding {index} is not an object."))
            continue
        key = (str(item.get("area", "")).strip(), str(item.get("file", "")).strip(), str(item.get("message", "")).strip())
        if not all(key):
            errors.append(Finding("ERROR", "known-findings-baseline", KNOWN_FINDINGS_FILE, f"Baseline finding {index} must contain non-empty area, file, and message fields."))
        elif key in keys:
            errors.append(Finding("ERROR", "known-findings-baseline", KNOWN_FINDINGS_FILE, f"Baseline finding {index} duplicates an earlier finding."))
        else:
            keys.add(key)
    return keys, errors


def classify_findings(findings: list[Finding], known: set[tuple[str, str, str]]) -> tuple[list[Finding], list[Finding]]:
    """Split findings into blocking regressions and documented outstanding debt."""
    new: list[Finding] = []
    pre_existing: list[Finding] = []
    for finding in findings:
        if finding.area != "known-findings-baseline" and finding_key(finding) in known:
            pre_existing.append(finding)
        else:
            new.append(finding)
    return new, pre_existing


def git(root: Path, *args: str, check: bool = True) -> str:
    result = subprocess.run(
        ["git", "-C", str(root), *args], text=True, capture_output=True, check=False
    )
    if check and result.returncode:
        detail = (result.stderr or result.stdout).strip()
        raise RuntimeError(f"git {' '.join(args)} failed: {detail}")
    return result.stdout.strip()


def load_navigation_records(path: Path) -> list[dict[str, Any]]:
    result = subprocess.run(
        ["node", "-e", NODE_CONTENT_READER, str(path)],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode:
        detail = (result.stderr or result.stdout).strip()
        raise RuntimeError(f"Node could not evaluate {path.name}: {detail}")
    return json.loads(result.stdout)


def value_for_link(link: Any, key: str) -> str:
    if not isinstance(link, dict):
        return ""
    return str(link.get(key, ""))


def footer_has_for_organisations(value: Any) -> bool:
    """Return true when a data-defined Navigate column includes the exact label."""
    if not isinstance(value, dict):
        return False
    columns = value.get("columns")
    if not isinstance(columns, list):
        return False
    for column in columns:
        if not isinstance(column, dict) or str(column.get("title", "")).strip() != "Navigate":
            continue
        links = column.get("links", [])
        if isinstance(links, list) and any(
            isinstance(link, dict) and str(link.get("label", "")).strip() == "For Organisations"
            for link in links
        ):
            return True
    return False


def has_data_defined_navigate_column(value: Any) -> bool:
    return isinstance(value, dict) and isinstance(value.get("columns"), list) and any(
        isinstance(column, dict) and str(column.get("title", "")).strip() == "Navigate"
        for column in value.get("columns", [])
    )


def validate_home_to_make_links(value: Any) -> list[str]:
    """Return Home To Make CTA/panel route failures beyond the site nav array."""
    if not isinstance(value, dict):
        return ["Home content object could not be read."]
    findings: list[str] = []
    hero = value.get("hero", {})
    if not isinstance(hero, dict) or str(hero.get("cta2Url", "")) != "/to-make":
        actual = hero.get("cta2Url", "no URL") if isinstance(hero, dict) else "no URL"
        findings.append(f"Home hero To Make CTA must point to /to-make; found {actual}.")
    worlds = value.get("worlds", {})
    panels = worlds.get("panels", []) if isinstance(worlds, dict) else []
    to_make_panels = [panel for panel in panels if isinstance(panel, dict) and str(panel.get("label", "")).strip() == "To Make"]
    if len(to_make_panels) != 1:
        findings.append(f"Home must contain exactly one To Make panel; found {len(to_make_panels)}.")
    elif str(to_make_panels[0].get("linkUrl", "")) != "/to-make":
        findings.append(f"Home To Make panel must point to /to-make; found {to_make_panels[0].get('linkUrl', 'no URL')}.")
    return findings


def validate_content(root: Path) -> tuple[list[Finding], dict[str, list[dict[str, Any]]]]:
    findings: list[Finding] = []
    records_by_file: dict[str, list[dict[str, Any]]] = {}
    for relative in ACTIVE_CONTENT_FILES:
        path = root / relative
        if not path.is_file():
            findings.append(Finding("ERROR", "active-content", relative, "Active content file is missing."))
            continue
        try:
            records = load_navigation_records(path)
        except (RuntimeError, json.JSONDecodeError) as exc:
            findings.append(Finding("ERROR", "active-content", relative, str(exc)))
            continue
        records_by_file[relative] = records
        if len(records) != 1:
            findings.append(
                Finding(
                    "ERROR",
                    "navigation",
                    relative,
                    f"Expected exactly one page navigation record; found {len(records)}.",
                )
            )
            continue
        navigation = records[0].get("navigation", [])
        labels = [value_for_link(item, "label").strip() for item in navigation]
        if labels != EXPECTED_NAVIGATION:
            findings.append(
                Finding(
                    "ERROR",
                    "navigation",
                    relative,
                    f"Navigation labels must be exactly {EXPECTED_NAVIGATION}; found {labels}.",
                )
            )
        to_make = next((item for item in navigation if value_for_link(item, "label").strip() == "To Make"), None)
        target = value_for_link(to_make, "url") or value_for_link(to_make, "href")
        if target != "/to-make":
            findings.append(
                Finding(
                    "ERROR",
                    "to-make-route",
                    relative,
                    f"To Make navigation must point to /to-make; found {target or 'no URL'}.",
                )
            )
        # Home has two additional visible To Make destinations. Keeping them
        # inside this gate prevents an unrelated Home content update from
        # restoring the retired stained-glass route.
        if relative == "content.home.js":
            for message in validate_home_to_make_links(records[0].get("content")):
                findings.append(Finding("ERROR", "to-make-route", relative, message))
    return findings, records_by_file


def validate_footers(root: Path, content_records: dict[str, list[dict[str, Any]]]) -> list[Finding]:
    findings: list[Finding] = []
    required_anchor = 'href="/for-organisations">For Organisations</a>'
    for relative in ACTIVE_RENDERER_FILES:
        path = root / relative
        if not path.is_file():
            findings.append(Finding("ERROR", "footer", relative, "Active renderer file is missing."))
            continue
        source = path.read_text(encoding="utf-8")
        if relative in DATA_DRIVEN_FOOTERS:
            content_file = DATA_DRIVEN_FOOTERS[relative]
            records = content_records.get(content_file, [])
            if len(records) != 1:
                findings.append(
                    Finding("ERROR", "footer", relative, f"Cannot inspect data-driven footer from {content_file}."))
                continue
            footer = records[0].get("footer")
            if not has_data_defined_navigate_column(footer):
                findings.append(
                    Finding("ERROR", "footer", relative, f"{content_file} has no data-defined Navigate column to validate."))
            elif not footer_has_for_organisations(footer):
                findings.append(
                    Finding("ERROR", "footer", relative, f"{content_file} Footer Navigate column is missing exact label 'For Organisations'."))
        elif required_anchor not in source:
            findings.append(
                Finding("ERROR", "footer", relative, "Footer Navigate column is missing exact anchor label 'For Organisations'."))
    return findings


def baseline_status(root: Path, baseline: str, fetch: bool) -> tuple[dict[str, str], list[Finding]]:
    findings: list[Finding] = []
    try:
        if fetch:
            git(root, "fetch", "--prune", "origin")
        remote_sha = git(root, "rev-parse", "--verify", baseline)
        head_sha = git(root, "rev-parse", "HEAD")
        ancestor = subprocess.run(
            ["git", "-C", str(root), "merge-base", "--is-ancestor", remote_sha, head_sha],
            check=False,
        ).returncode == 0
        if not ancestor:
            findings.append(
                Finding("ERROR", "baseline", ".git", f"{baseline} ({remote_sha}) is not an ancestor of HEAD ({head_sha}). Start from a fresh GitHub main baseline."))
        status = git(root, "status", "--short")
        return {
            "baseline_ref": baseline,
            "remote_main_sha": remote_sha,
            "head_sha": head_sha,
            "worktree_changes": "yes" if status else "no",
        }, findings
    except RuntimeError as exc:
        findings.append(Finding("ERROR", "baseline", ".git", str(exc)))
        return {"baseline_ref": baseline, "remote_main_sha": "unavailable", "head_sha": "unavailable", "worktree_changes": "unknown"}, findings


def finding_table(findings: list[Finding], empty_message: str) -> list[str]:
    lines = [
        "| Severity | Area | File | Finding |",
        "| --- | --- | --- | --- |",
    ]
    if findings:
        lines.extend(f"| {f.severity} | {f.area} | `{f.file}` | {f.message} |" for f in findings)
    else:
        lines.append(f"| PASS | all | — | {empty_message} |")
    return lines


def markdown_report(status: dict[str, str], new_findings: list[Finding], pre_existing: list[Finding], known_total: int) -> str:
    lines = [
        "# Hope Anthology pre-package site-contract gate",
        "",
        f"**Run at:** {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}",
        f"**Baseline ref:** `{status['baseline_ref']}`",
        f"**Remote baseline SHA:** `{status['remote_main_sha']}`",
        f"**HEAD SHA:** `{status['head_sha']}`",
        f"**Working-tree changes present:** {status['worktree_changes']}",
        "",
        "## Result",
        "",
        "**PASS** — safe to package." if not new_findings else f"**FAIL** — {len(new_findings)} new contract violation(s); do not package.",
        "",
        f"**Outstanding known findings:** {len(pre_existing)} of {known_total} recorded baseline finding(s). They are reported below but do not block unrelated packaging.",
        "",
        "## Checks",
        "",
        "1. Fresh remote baseline is fetched and is an ancestor of the current checkout.",
        "2. Every active page content file has the exact navigation labels: To Keep, To Make, The Story, For Artists, Collective.",
        "3. Every active page's To Make navigation destination is `/to-make`.",
        "4. Every visible Footer Navigate column contains the exact label `For Organisations`.",
        "",
        "## New violations — blocking",
        "",
        *finding_table(new_findings, "No new contract violations."),
        "",
        "## Pre-existing violations — outstanding, non-blocking",
        "",
        *finding_table(pre_existing, "No recorded known findings remain in the current checkout."),
        "",
        "## Baseline accounting",
        "",
        f"- Baseline file: `{KNOWN_FINDINGS_FILE}`",
        f"- Recorded known findings: {known_total}",
        f"- Still present: {len(pre_existing)}",
        f"- Resolved since baseline: {known_total - len(pre_existing)}",
        f"- New blocking findings: {len(new_findings)}",
        "",
        "> Remove resolved entries from the committed baseline as part of the naming clean-up. Once the baseline findings array is empty, every contract finding is automatically new and therefore blocking; no gate code change is required.",
        "",
        "## Active-file manifest",
        "",
        "### Content files",
        "",
        *[f"- `{name}`" for name in ACTIVE_CONTENT_FILES],
        "",
        "### Footer renderers",
        "",
        *[f"- `{name}`" for name in ACTIVE_RENDERER_FILES],
        "",
        "> Retired historical collection files and non-page supplementary data are intentionally excluded. Add a new page's content and renderer to the manifest when that page becomes live.",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", type=Path, default=Path("."), help="Git repository root (default: current directory).")
    parser.add_argument("--baseline", default="origin/main", help="Remote baseline ref to fetch and record (default: origin/main).")
    parser.add_argument("--report", type=Path, help="Optional Markdown report path, relative to --root unless absolute.")
    parser.add_argument("--no-fetch", action="store_true", help="Skip git fetch; reserved for isolated automated tests only.")
    parser.add_argument("--json", action="store_true", help="Write machine-readable results to stdout instead of a text summary.")
    args = parser.parse_args()
    root = args.root.resolve()
    if not (root / ".git").exists():
        print(f"ERROR: {root} is not a Git checkout; start from a fresh GitHub main clone.", file=sys.stderr)
        return 2

    known_findings, baseline_findings = load_known_findings(root)
    status, findings = baseline_status(root, args.baseline, not args.no_fetch)
    findings.extend(baseline_findings)
    content_findings, records = validate_content(root)
    findings.extend(content_findings)
    findings.extend(validate_footers(root, records))
    findings.sort(key=lambda item: (item.area, item.file, item.message))
    new_findings, pre_existing = classify_findings(findings, known_findings)

    report = markdown_report(status, new_findings, pre_existing, len(known_findings))
    if args.report:
        report_path = args.report if args.report.is_absolute() else root / args.report
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(report, encoding="utf-8")
    if args.json:
        print(json.dumps({
            "status": status,
            "result": {
                "blocking_new_findings": len(new_findings),
                "outstanding_known_findings": len(pre_existing),
                "recorded_known_findings": len(known_findings),
            },
            "findings": [asdict(finding) for finding in findings],
            "new_findings": [asdict(finding) for finding in new_findings],
            "pre_existing_findings": [asdict(finding) for finding in pre_existing],
        }, indent=2))
    else:
        print(report)
    return 1 if new_findings else 0


if __name__ == "__main__":
    raise SystemExit(main())

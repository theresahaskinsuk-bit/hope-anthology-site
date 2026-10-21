#!/usr/bin/env python3
"""Generate standalone Hope Editions content from a downloaded Editions workbook."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Iterable

from openpyxl import load_workbook

SCRIPT_PATH = "generate_editions_content.py"
PALE_YELLOW = "FFF2CC"
URL_RE = re.compile(r"^https://[^\s]+$", re.I)
STATUSES = {"available", "paused", "hidden"}
PRICE_KEYS = {"price", "priceNumber", "priceFrom", "fromPrice"}
PUBLISH_LABEL = "Publish prices to the website (YES/NO)"
ASSETS = {"logo": "https://images.squarespace-cdn.com/content/6a258894c750534b28845855/1f3bfb43-558e-4262-b2e2-d4e3b56bd77e/01-the-hope-anthology.jpg?content-type=image%2Fjpeg", "star": "https://images.squarespace-cdn.com/content/6a258894c750534b28845855/470da432-cdf9-45be-b3ba-2e9599ce5f4f/04-the-hope-anthology-botanical-star.png?content-type=image%2Fpng"}
NAV = [{"label": "To Keep", "url": "/to-keep"}, {"label": "To Make", "url": "/to-make"}, {"label": "The Story", "url": "/story"}]
FOOTER = {"privacyUrl": "/privacy-policy", "accessibilityUrl": "/accessibility", "copyright": "© The Hope Anthology 2026"}
LAYOUTS = {"Two side by side": (2, 0), "Feature and one beside": (2, 1), "Three all small": (3, 0), "Feature and two beside": (3, 1), "Two on two": (4, 0), "Three then one": (4, 0), "Three above feature below": (4, 1), "Five all small": (5, 0), "Three above feature and one below": (5, 1)}
REQUIRED_META = ("Slug", "Edition Number", "Title", "Strapline", "Hero Paragraph 1", "Hero Paragraph 2", "Hero Paragraph 3", "Hero Sign-off", "Things Paragraph", "Painting URL", "Painting Alt", "Painting Artist", "Painting Title", "Painting Year", "Painting Medium", "Painting Collection", "Painting Rights", "Painting Line", "Pre-footer Heading", "Pre-footer Paragraph 1", "Pre-footer Paragraph 2", "Person Name", "Person Role")


@dataclass(frozen=True)
class Issue:
    severity: str
    sheet: str
    cell: str
    field: str
    message: str


class Audit:
    def __init__(self, mode: str) -> None:
        self.mode = mode
        self.issues: list[Issue] = []
        self.placeholders: list[Issue] = []
        self.force_block = False

    def add(self, severity: str, sheet: str, cell: str, field: str, message: str) -> None:
        self.issues.append(Issue(severity, sheet, cell, field, message))

    def fatal(self, sheet: str, cell: str, field: str, message: str) -> None: self.add("FATAL", sheet, cell, field, message)
    def error(self, sheet: str, cell: str, field: str, message: str) -> None: self.add("ERROR", sheet, cell, field, message)
    def warn(self, sheet: str, cell: str, field: str, message: str) -> None: self.add("WARNING", sheet, cell, field, message)
    def required(self, sheet: str, cell: str, field: str, message: str) -> None: self.add("ERROR" if self.mode == "strict" else "WARNING", sheet, cell, field, message)

    def placeholder(self, sheet: str, cell: str, field: str, message: str) -> None:
        issue = Issue("ERROR" if self.mode == "strict" else "WARNING", sheet, cell, field, message)
        self.issues.append(issue); self.placeholders.append(issue)

    def blocking(self, sheet: str, cell: str, field: str, message: str) -> None:
        self.error(sheet, cell, field, message); self.force_block = True

    @property
    def errors(self) -> list[Issue]: return [issue for issue in self.issues if issue.severity == "ERROR"]
    @property
    def fatals(self) -> list[Issue]: return [issue for issue in self.issues if issue.severity == "FATAL"]


def text(value: Any) -> str: return "" if value is None else str(value).strip()
def norm(value: Any) -> str: return re.sub(r"[^a-z0-9]+", "", re.sub(r"\([^)]*\)", "", text(value).replace("\n", " ").lower()))
def https(value: Any) -> bool: return bool(URL_RE.match(text(value)))
def yesno(value: Any) -> bool | None:
    value = text(value).upper(); return True if value == "YES" else False if value == "NO" else None
def posint(value: Any) -> int | None:
    try: number = Decimal(text(value))
    except InvalidOperation: return None
    return int(number) if number > 0 and number == number.to_integral_value() else None
def parse_price(value: Any) -> Decimal | None:
    try: number = Decimal(re.sub(r"[^0-9.,]", "", text(value)).replace(",", ""))
    except InvalidOperation: return None
    return number if number > 0 else None
def pale_yellow(cell: Any) -> bool:
    fill = cell.fill
    raw = text(fill.fgColor.rgb).upper() if fill and fill.fill_type == "solid" and fill.fgColor.type == "rgb" else ""
    return raw.endswith(PALE_YELLOW)
def hmap(ws: Any, row: int) -> dict[str, tuple[int, Any]]: return {norm(cell.value): (cell.column, cell) for cell in ws[row] if norm(cell.value)}
def source_cell(ws: Any, row: int, mapping: dict[str, tuple[int, Any]], key: str) -> Any | None: return ws.cell(row=row, column=mapping[key][0]) if key in mapping else None
def value(ws: Any, row: int, mapping: dict[str, tuple[int, Any]], key: str) -> str:
    cell = source_cell(ws, row, mapping, key); return text(cell.value) if cell else ""
def row_data(ws: Any, row: int, mapping: dict[str, tuple[int, Any]]) -> bool: return any(text(ws.cell(row, column).value) for column, _ in mapping.values())


def scan_placeholders(audit: Audit, wb: Any) -> None:
    for ws in wb.worksheets:
        for row in ws.iter_rows():
            for cell in row:
                if pale_yellow(cell): audit.placeholder(ws.title, cell.coordinate, "Unresolved placeholder", "Cell has the pale-yellow unresolved-placeholder fill.")


def find_headers(ws: Any, required: Iterable[str], limit: int = 200) -> tuple[int | None, dict[str, tuple[int, Any]]]:
    wanted = set(required)
    for row in range(1, min(limit, ws.max_row) + 1):
        headers = hmap(ws, row)
        if wanted.issubset(headers): return row, headers
    return None, {}


def label_cells(ws: Any, label: str) -> list[Any]: return [cell for row in ws.iter_rows() for cell in row if norm(cell.value) == norm(label)]


def settings(audit: Audit, wb: Any) -> dict[str, Any]:
    out = {"publish": False, "cell": "—"}
    if "README" not in wb.sheetnames:
        audit.blocking("Workbook", "—", "README", "README sheet is missing."); return out
    ws = wb["README"]; found = label_cells(ws, PUBLISH_LABEL)
    if len(found) != 1:
        audit.blocking(ws.title, "—", PUBLISH_LABEL, "Expected exactly one visible publication-price setting label."); return out
    cell = ws.cell(found[0].row, found[0].column + 1); out["cell"] = cell.coordinate; entry = text(cell.value).upper()
    if entry not in {"YES", "NO"}: audit.blocking(ws.title, cell.coordinate, PUBLISH_LABEL, "Value must be exactly YES or NO.")
    out["publish"] = entry == "YES"; return out


def parse_roster(audit: Audit, wb: Any) -> list[dict[str, Any]]:
    if "Editions Roster" not in wb.sheetnames:
        audit.fatal("Workbook", "—", "Editions Roster", "Editions Roster sheet is missing."); return []
    ws = wb["Editions Roster"]; keys = {"active", "slug", "editionnumber", "title", "pageurl", "insitemenu"}; header, all_headers = find_headers(ws, keys)
    if not header:
        audit.fatal(ws.title, "1:200", "Editions Roster", "Required roster headers are missing or renamed."); return []
    mapping = {"active": all_headers["active"], "slug": all_headers["slug"], "number": all_headers["editionnumber"], "title": all_headers["title"], "pageUrl": all_headers["pageurl"], "inMenu": all_headers["insitemenu"]}
    seen_slug: set[str] = set(); seen_number: set[str] = set(); seen_path: set[str] = set(); out: list[dict[str, Any]] = []
    for row in range(header + 1, ws.max_row + 1):
        if not row_data(ws, row, mapping): continue
        entry = {key: value(ws, row, mapping, key) for key in mapping}
        if not entry["slug"] and not entry["active"]: continue
        active = yesno(entry["active"])
        active_cell = source_cell(ws, row, mapping, "active")
        if active is None:
            audit.required(ws.title, active_cell.coordinate if active_cell else str(row), "Active (YES/NO)", "Value must be YES or NO."); continue
        if not active: continue
        cells = {key: source_cell(ws, row, mapping, key) for key in mapping}
        for key, label in (("slug", "Slug"), ("number", "Edition Number"), ("title", "Title"), ("pageUrl", "Page URL")):
            if not entry[key]: audit.required(ws.title, cells[key].coordinate if cells[key] else str(row), label, "Required active roster value is blank.")
        expected = "/editions/" + entry["slug"]
        if entry["pageUrl"].rstrip("/") != expected:
            audit.required(ws.title, cells["pageUrl"].coordinate if cells["pageUrl"] else str(row), "Page URL", f"Active Edition route must be exactly {expected}; found {entry['pageUrl'] or 'blank'}.")
        for seen, key, label in ((seen_slug, "slug", "Slug"), (seen_number, "number", "Edition Number"), (seen_path, "pageUrl", "Page URL")):
            if entry[key] in seen: audit.required(ws.title, cells[key].coordinate if cells[key] else str(row), label, f"Duplicate active Edition {label.lower()}: {entry[key]}.")
            seen.add(entry[key])
        out.append({"slug": entry["slug"], "editionNumber": entry["number"], "title": entry["title"], "pageUrl": entry["pageUrl"].rstrip("/"), "inSiteMenu": yesno(entry["inMenu"]) is True, "row": row})
    if not out: audit.required(ws.title, "—", "Editions Roster", "At least one active Edition is required.")
    return out


def metadata_cells(ws: Any, artist_header: int) -> dict[str, Any]: return {re.sub(r"\s+", " ", text(ws.cell(row, 1).value)): ws.cell(row, 2) for row in range(1, artist_header) if text(ws.cell(row, 1).value)}

def required_metadata(audit: Audit, ws: Any, fields: dict[str, Any], label: str) -> str:
    cell = fields.get(label); entry = text(cell.value) if cell else ""
    if cell is None: audit.fatal(ws.title, "A:B", label, "Required EDITION field label is missing or renamed.")
    elif not entry: audit.required(ws.title, cell.coordinate, label, "Required value is blank.")
    return entry


def validate_pullouts(audit: Audit, ws: Any, fields: dict[str, Any]) -> None:
    count = 0
    for label in ("Hero Paragraph 1", "Hero Paragraph 2"):
        cell = fields.get(label); entry = text(cell.value) if cell else ""
        if entry.count("*") % 2: audit.required(ws.title, cell.coordinate if cell else "—", label, "Asterisk pull-out markers are unmatched."); continue
        matches = re.findall(r"\*([^*]+)\*", entry)
        if any(not match.strip() for match in matches): audit.required(ws.title, cell.coordinate if cell else "—", label, "Asterisk pull-out phrases must not be empty.")
        count += len(matches)
    if count > 2: audit.required(ws.title, "—", "Hero Paragraphs 1–2", f"At most two pull-out phrases are allowed; found {count}.")


def parse_artists(audit: Audit, ws: Any, header: int, pieces_header: int) -> list[dict[str, Any]]:
    wanted = {"active", "artistslug", "artistorder", "displayname", "layout", "whyline"}; mapping = hmap(ws, header)
    if not wanted.issubset(mapping):
        audit.fatal(ws.title, str(header), "Artists table", "Required Artists headers are missing or renamed."); return []
    keys = {"active": mapping["active"], "slug": mapping["artistslug"], "artistOrder": mapping["artistorder"], "name": mapping["displayname"], "layout": mapping["layout"], "whyLine": mapping["whyline"]}
    seen_order: set[int] = set(); seen_slug: set[str] = set(); out: list[dict[str, Any]] = []
    for row in range(header + 1, pieces_header):
        if not row_data(ws, row, keys): continue
        values = {key: value(ws, row, keys, key) for key in keys}
        if values.get("active", "").upper().startswith("PIECES"): continue
        if not values["slug"] and not values["active"]: continue
        active = yesno(values["active"]); active_cell = source_cell(ws, row, keys, "active")
        if active is None:
            audit.required(ws.title, active_cell.coordinate if active_cell else str(row), "Active (YES/NO)", "Value must be YES or NO."); continue
        if not active: continue
        cells = {key: source_cell(ws, row, keys, key) for key in keys}
        for key, label in (("slug", "Artist Slug"), ("artistOrder", "Artist Order"), ("name", "Display Name"), ("layout", "Layout"), ("whyLine", "Why line")):
            if not values[key]: audit.required(ws.title, cells[key].coordinate if cells[key] else str(row), label, "Required active artist value is blank.")
        number = posint(values["artistOrder"])
        if number is None: audit.required(ws.title, cells["artistOrder"].coordinate if cells["artistOrder"] else str(row), "Artist Order", "Must be a positive whole number."); number = 0
        if number in seen_order: audit.required(ws.title, cells["artistOrder"].coordinate if cells["artistOrder"] else str(row), "Artist Order", f"Duplicate active Artist Order: {number}.")
        seen_order.add(number)
        if values["slug"] in seen_slug: audit.required(ws.title, cells["slug"].coordinate if cells["slug"] else str(row), "Artist Slug", f"Duplicate active Artist Slug: {values['slug']}.")
        seen_slug.add(values["slug"])
        if values["layout"] not in LAYOUTS: audit.required(ws.title, cells["layout"].coordinate if cells["layout"] else str(row), "Layout", "Unsupported Edition layout.")
        out.append({"active": True, "slug": values["slug"], "artistOrder": number, "name": values["name"], "layout": values["layout"], "whyLine": values["whyLine"], "pieces": []})
    return sorted(out, key=lambda artist: (artist["artistOrder"], artist["slug"]))


def parse_pieces(audit: Audit, ws: Any, header: int, artists: list[dict[str, Any]], publish: bool) -> None:
    fields = {"active": ["active"], "artist": ["artistslug"], "pieceOrder": ["pieceorder"], "title": ["piecetitle"], "world": ["world"], "status": ["status"], "medium": ["medium"], "price": ["pricenumberonly", "price"], "listingUrl": ["listingurl"], "featured": ["featured"], "meaning": ["meaning"], "chip1": ["chip1"], "chip2": ["chip2"], "chip3": ["chip3"], "chip4": ["chip4"], "chip5": ["chip5"], "image1Url": ["image1url"], "image1Alt": ["image1alt"], "image2Url": ["image2url"], "image2Alt": ["image2alt"], "image3Url": ["image3url"], "image3Alt": ["image3alt"], "notes": ["notes"], "image1Photo": ["image1photo"], "image2Photo": ["image2photo"], "image3Photo": ["image3photo"], "placeholder": ["placeholder"]}
    headers = hmap(ws, header); mapping: dict[str, tuple[int, Any]] = {}
    for key, aliases in fields.items():
        found = next((headers[name] for name in aliases if name in headers), None)
        if found: mapping[key] = found
        elif not key.endswith("Photo") and key != "placeholder": audit.fatal(ws.title, str(header), key, "Required Pieces header is missing or renamed.")
    if any(re.fullmatch(r"chip[6-9]\d*", name) for name in headers): audit.required(ws.title, str(header), "Chips", "More than 5 Chip columns are not allowed.")
    by_artist = {artist["slug"]: artist for artist in artists}; seen: dict[str, set[int]] = {slug: set() for slug in by_artist}
    for row in range(header + 1, ws.max_row + 1):
        if not row_data(ws, row, mapping): continue
        values = {key: value(ws, row, mapping, key) for key in mapping}
        if not values.get("title") and not values.get("artist") and not values.get("status"): continue
        cells = {key: source_cell(ws, row, mapping, key) for key in mapping}
        active = yesno(values.get("active"))
        if active is None:
            audit.required(ws.title, cells["active"].coordinate if cells.get("active") else str(row), "Active (YES/NO)", "Value must be YES or NO; it is retained but does not decide publication."); active = False
        status = values.get("status", "").casefold(); visible = status in {"available", "paused"}
        if status not in STATUSES: audit.required(ws.title, cells["status"].coordinate if cells.get("status") else str(row), "Status", "Must be exactly available, paused, or hidden.")
        if visible:
            for key, label in (("artist", "Artist Slug"), ("pieceOrder", "PieceOrder"), ("title", "Piece Title"), ("world", "World"), ("listingUrl", "Listing URL")):
                if not values.get(key): audit.required(ws.title, cells[key].coordinate if cells.get(key) else str(row), label, "Required visible piece value is blank.")
            if posint(values.get("pieceOrder")) is None: audit.required(ws.title, cells["pieceOrder"].coordinate if cells.get("pieceOrder") else str(row), "PieceOrder", "Must be a positive whole number.")
            if values.get("world") not in {"To Keep", "To Make"}: audit.required(ws.title, cells["world"].coordinate if cells.get("world") else str(row), "World", "Must be exactly To Keep or To Make.")
            # 21 Oct 2026: "#" means no shop link yet (demo cards, or an artist whose listing isn't ready). The card's link then does nothing.
            if values.get("listingUrl") == "#": audit.warn(ws.title, cells["listingUrl"].coordinate if cells.get("listingUrl") else str(row), "Listing URL", "No shop link yet (#). The card's shop link will do nothing until a real https:// link is added.")
            elif not https(values.get("listingUrl")): audit.required(ws.title, cells["listingUrl"].coordinate if cells.get("listingUrl") else str(row), "Listing URL", "Must be an absolute https:// URL.")
        images: list[dict[str, str]] = []
        for n in range(1, 4):
            u, al = values.get(f"image{n}Url", ""), values.get(f"image{n}Alt", "")
            uc, ac = cells.get(f"image{n}Url"), cells.get(f"image{n}Alt")
            if bool(u) != bool(al): audit.required(ws.title, (ac if u else uc).coordinate if (ac if u else uc) else str(row), f"Image {n}", "URL and Alt must be filled together.")
            if u and not https(u): audit.required(ws.title, uc.coordinate if uc else str(row), f"Image {n} URL", "Must be an absolute https:// URL.")
            if visible and n == 1 and (not u or not al): audit.required(ws.title, (uc if not u else ac).coordinate if (uc if not u else ac) else str(row), "Image 1", "Visible piece requires URL and Alt.")
            ph = values.get(f"image{n}Photo", "").strip().upper(); pc = cells.get(f"image{n}Photo")
            if ph not in ("", "YES", "NO"): audit.required(ws.title, pc.coordinate if pc else str(row), f"Image {n} Photo?", "Must be YES or blank.")
            if u and al: images.append({"url": u, "alt": al, "photo": True} if ph == "YES" else {"url": u, "alt": al})
        chips: list[str] = []
        for n in range(1, 6):
            chip = values.get(f"chip{n}", ""); cc = cells.get(f"chip{n}")
            if chip and https(chip): audit.required(ws.title, cc.coordinate if cc else str(row), f"Chip {n}", "Informational chips must be text, not an absolute https:// URL.")
            if chip: chips.append(chip)
        cost = parse_price(values.get("price"))
        if visible and cost is None:
            (audit.required if publish else audit.warn)(ws.title, cells["price"].coordinate if cells.get("price") else str(row), "Price (£) number only", "Visible piece price is missing or invalid." + (" It is required when Publish prices is YES." if publish else " No public price is emitted while publication is NO."))
        if status == "hidden": continue
        if values.get("artist") not in by_artist:
            audit.required(ws.title, cells["artist"].coordinate if cells.get("artist") else str(row), "Artist Slug", "Visible piece references an inactive or missing artist.")
            continue
        order = posint(values.get("pieceOrder")) or 0
        if order in seen[values["artist"]]: audit.required(ws.title, cells["pieceOrder"].coordinate if cells.get("pieceOrder") else str(row), "PieceOrder", f"Duplicate visible PieceOrder for {values['artist']}.")
        seen[values["artist"]].add(order)
        piece = {"active": active, "pieceOrder": order, "title": values.get("title", ""), "world": values.get("world", ""), "status": status, "medium": values.get("medium", ""), "listingUrl": values.get("listingUrl", ""), "meaning": values.get("meaning", ""), "featured": values.get("featured", "").upper() == "YES", "chips": chips, "images": images, "notes": values.get("notes", "")}
        # Optional (21 Oct 2026): Placeholder? YES shows the demonstration label on the card (stock/sample images while artists are recruited).
        if values.get("placeholder", "").strip().upper() == "YES": piece["placeholder"] = True
        if publish and cost is not None: piece.update({"price": "£" + format(cost.quantize(Decimal("0.01")), ".2f"), "priceNumber": float(cost)})
        by_artist[values["artist"]]["pieces"].append(piece)
    for artist in artists:
        artist["pieces"].sort(key=lambda piece: (piece["pieceOrder"], piece["title"].casefold()))
        expected, feature_count = LAYOUTS.get(artist["layout"], (None, None))
        if expected is not None and len(artist["pieces"]) != expected: audit.required(ws.title, artist["slug"], "Layout", f"{artist['layout']!r} needs {expected} visible pieces; found {len(artist['pieces'])}.")
        actual = sum(1 for piece in artist["pieces"] if piece["featured"])
        if feature_count is not None and actual != feature_count: audit.required(ws.title, artist["slug"], "Featured", f"{artist['layout']!r} needs {feature_count} Featured=YES piece(s); found {actual}.")


def parse_edition(audit: Audit, wb: Any, roster: dict[str, Any], publish: bool) -> dict[str, Any] | None:
    if roster["slug"] not in wb.sheetnames:
        audit.required("Editions Roster", str(roster["row"]), "Slug", f"Active Edition tab {roster['slug']!r} is missing."); return None
    ws = wb[roster["slug"]]
    artists_header, _ = find_headers(ws, {"active", "artistslug", "artistorder", "displayname", "layout", "whyline"})
    pieces_header, _ = find_headers(ws, {"active", "artistslug", "pieceorder", "piecetitle", "world", "status", "listingurl", "image1url", "image1alt"})
    if not artists_header or not pieces_header:
        audit.fatal(ws.title, "1:200", "Edition sections", "Could not locate complete Artists and Pieces tables."); return None
    fields = metadata_cells(ws, artists_header)
    values = {label: required_metadata(audit, ws, fields, label) for label in REQUIRED_META}
    meta_cell = fields.get("Meta Description"); meta_description = text(meta_cell.value) if meta_cell else ""
    if not meta_description: audit.warn(ws.title, meta_cell.coordinate if meta_cell else "—", "Meta Description", "Meta Description is blank. It is optional and is not rendered; add it in Squarespace SEO settings when ready.")
    photo_url_cell, photo_alt_cell = fields.get("Photo URL"), fields.get("Photo Alt")
    photo_url, photo_alt = text(photo_url_cell.value) if photo_url_cell else "", text(photo_alt_cell.value) if photo_alt_cell else ""
    if bool(photo_url) != bool(photo_alt): audit.required(ws.title, (photo_alt_cell if photo_url else photo_url_cell).coordinate if (photo_alt_cell if photo_url else photo_url_cell) else "—", "Pre-footer photo", "Photo URL and Photo Alt must be an optional pair.")
    elif photo_url and not https(photo_url): audit.required(ws.title, photo_url_cell.coordinate, "Photo URL", "Photo URL must be an absolute https:// URL.")
    elif not photo_url: audit.warn(ws.title, photo_url_cell.coordinate if photo_url_cell else "—", "Pre-footer photo", "Photo URL and Photo Alt are both blank; the pre-footer will render without an image.")
    partner_cells = {label: fields.get(label) for label in ("Partner Name", "Partner Logo URL", "Partner Logo Alt")}
    partner_values = {label: text(cell.value) if cell else "" for label, cell in partner_cells.items()}
    filled = [label for label, entry in partner_values.items() if entry]
    if filled and len(filled) != 3: audit.required(ws.title, partner_cells[filled[0]].coordinate if partner_cells[filled[0]] else "—", "Partner", "Partner Name, Partner Logo URL, and Partner Logo Alt must be all filled or all blank.")
    if partner_values["Partner Logo URL"] and not https(partner_values["Partner Logo URL"]): audit.required(ws.title, partner_cells["Partner Logo URL"].coordinate if partner_cells["Partner Logo URL"] else "—", "Partner Logo URL", "Must be an absolute https:// URL.")
    if values["Painting URL"] and not https(values["Painting URL"]): audit.required(ws.title, fields["Painting URL"].coordinate if fields.get("Painting URL") else "—", "Painting URL", "Must be an absolute https:// URL.")
    if values["Slug"] != roster["slug"]: audit.required(ws.title, fields["Slug"].coordinate if fields.get("Slug") else "—", "Slug", f"Edition tab Slug must match roster slug {roster['slug']!r}.")
    if values["Edition Number"] != roster["editionNumber"]: audit.required(ws.title, fields["Edition Number"].coordinate if fields.get("Edition Number") else "—", "Edition Number", "Edition tab number must match its roster row.")
    if values["Title"] != roster["title"]: audit.required(ws.title, fields["Title"].coordinate if fields.get("Title") else "—", "Title", "Edition tab title must match its roster row.")
    validate_pullouts(audit, ws, fields)
    artists = parse_artists(audit, ws, artists_header, pieces_header); parse_pieces(audit, ws, pieces_header, artists, publish)
    partner = {"name": partner_values["Partner Name"], "logoUrl": partner_values["Partner Logo URL"], "logoAlt": partner_values["Partner Logo Alt"]} if len(filled) == 3 else None
    photo = {"url": photo_url, "alt": photo_alt} if photo_url and photo_alt else None
    return {"slug": roster["slug"], "pageUrl": roster["pageUrl"], "editionNumber": values["Edition Number"], "title": values["Title"], "inSiteMenu": roster["inSiteMenu"], "strapline": values["Strapline"], "metaDescription": meta_description, "heroParagraph1": values["Hero Paragraph 1"], "heroParagraph2": values["Hero Paragraph 2"], "heroParagraph3": values["Hero Paragraph 3"], "heroSignoff": values["Hero Sign-off"], "thingsParagraph": values["Things Paragraph"], "painting": {"url": values["Painting URL"], "alt": values["Painting Alt"], "artist": values["Painting Artist"], "title": values["Painting Title"], "year": values["Painting Year"], "medium": values["Painting Medium"], "collection": values["Painting Collection"], "rights": values["Painting Rights"], "line": values["Painting Line"]}, "photo": photo, "partner": partner, "preFooterHeading": values["Pre-footer Heading"], "preFooterParagraph1": values["Pre-footer Paragraph 1"], "preFooterParagraph2": values["Pre-footer Paragraph 2"], "personName": values["Person Name"], "personRole": values["Person Role"], "artists": artists}


# ---------------------------------------------------------------------------
# Partner pages (17 Oct 2026). Optional "Partner Pages" tab: field labels in
# column A, one partner page per column from column B. Each partner page reuses
# an existing Edition's artists and pieces, and overrides the hero, colours,
# header and footer so the page reads as the partner's own.
# ---------------------------------------------------------------------------
PARTNER_TAB = "Partner Pages"
PARTNER_FIELDS = {
    "Active (YES/NO)": "active", "Page Slug": "slug", "Base Edition": "baseEdition", "Partner Name": "name",
    "Partner Logo URL": "logoUrl", "Partner Logo Alt": "logoAlt", "Partner Link URL": "linkUrl", "Back Link Label": "backLabel",
    "Eyebrow": "eyebrow", "Strapline": "strapline", "Body Paragraph 1": "body1", "Body Paragraph 2": "body2",
    "Body Paragraph 3": "body3", "Body Paragraph 4": "body4", "Reach Line": "reach", "Sign-off": "signoff",
    "Photo URL": "photoUrl", "Photo Alt": "photoAlt", "Quote": "quote", "Quote Name": "quoteName", "Quote Role": "quoteRole",
    "Things Paragraph": "things", "Colour Hero Dark": "heroDark", "Colour Hero Light": "heroLight", "Colour Accent": "accent",
    "Colour Button": "button", "Title Font": "titleFont", "Footer Line 1": "footer1", "Footer Line 2": "footer2",
    "Footer Link Label": "footerLinkLabel", "Footer Link URL": "footerLinkUrl", "Concept Banner": "banner",
}
HEX_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")
TITLE_FONTS = {"", "Amatic SC"}


def parse_partner_pages(audit: Audit, wb: Any, editions: dict[str, Any]) -> dict[str, Any]:
    if PARTNER_TAB not in wb.sheetnames:
        return {}
    ws = wb[PARTNER_TAB]
    rows: dict[str, int] = {}
    for row in range(1, ws.max_row + 1):
        label = text(ws.cell(row, 1).value)
        if label in PARTNER_FIELDS:
            rows[PARTNER_FIELDS[label]] = row
    missing = [label for label, key in PARTNER_FIELDS.items() if key not in rows]
    if missing:
        audit.fatal(ws.title, "A:A", "Partner Pages", "Missing field labels: " + ", ".join(missing)); return {}
    header_row = next((row for row in range(1, ws.max_row + 1) if norm(ws.cell(row, 1).value) == "field"), None)
    out: dict[str, Any] = {}
    for column in range(2, ws.max_column + 1):
        if header_row and norm(ws.cell(header_row, column).value) == "help":
            continue
        values = {key: text(ws.cell(rows[key], column).value) for key in rows}
        if not any(values.values()):
            continue
        where = lambda key: ws.cell(rows[key], column).coordinate
        active = yesno(values["active"])
        if active is None:
            audit.required(ws.title, where("active"), "Active (YES/NO)", "Value must be YES or NO."); continue
        if not active:
            continue
        for key in ("slug", "baseEdition", "name", "linkUrl", "backLabel", "eyebrow", "heroDark", "heroLight", "accent", "button"):
            if not values[key]:
                audit.required(ws.title, where(key), key, "Required value is blank.")
        if values["slug"] and not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", values["slug"]):
            audit.required(ws.title, where("slug"), "Page Slug", "Use lower-case letters, numbers and hyphens only.")
        if values["slug"] in editions:
            audit.required(ws.title, where("slug"), "Page Slug", "Must not match an existing Edition slug.")
        if values["slug"] in out:
            audit.required(ws.title, where("slug"), "Page Slug", "Duplicate partner page slug.")
        if values["baseEdition"] and values["baseEdition"] not in editions:
            audit.required(ws.title, where("baseEdition"), "Base Edition", "Must be the slug of an active Edition.")
        for key in ("heroDark", "heroLight", "accent", "button"):
            if values[key] and not HEX_RE.match(values[key]):
                audit.required(ws.title, where(key), key, "Colour must be a six-digit hex code like #277F86.")
        if values["titleFont"] not in TITLE_FONTS:
            audit.required(ws.title, where("titleFont"), "Title Font", "Leave blank for the Hope font, or use Amatic SC.")
        for url_key, alt_key, label in (("logoUrl", "logoAlt", "Partner logo"), ("photoUrl", "photoAlt", "Photo")):
            if bool(values[url_key]) != bool(values[alt_key]):
                audit.required(ws.title, where(alt_key if values[url_key] else url_key), label, "URL and Alt must be filled together.")
            if values[url_key] and not https(values[url_key]):
                audit.required(ws.title, where(url_key), label + " URL", "Must be an absolute https:// URL.")
        for key in ("linkUrl", "footerLinkUrl"):
            if values[key] and not https(values[key]):
                audit.required(ws.title, where(key), key, "Must be an absolute https:// URL.")
        if not values["photoUrl"]:
            audit.warn(ws.title, where("photoUrl"), "Photo", "No photo yet; a labelled placeholder shows instead.")
        if not values["quote"]:
            audit.warn(ws.title, where("quote"), "Quote", "No quote yet; a labelled placeholder shows instead.")
        record = {key: entry for key, entry in values.items() if key != "active"}
        record["pageUrl"] = "/editions/" + values["slug"]
        record["body"] = [values[k] for k in ("body1", "body2", "body3", "body4") if values[k]]
        for k in ("body1", "body2", "body3", "body4"):
            record.pop(k, None)
        out[values["slug"]] = record
    return out


def prune(value: Any, publish: bool) -> Any:
    if publish: return value
    if isinstance(value, dict): return {key: prune(entry, publish) for key, entry in value.items() if key not in PRICE_KEYS}
    if isinstance(value, list): return [prune(entry, publish) for entry in value]
    return value

def js(payload: dict[str, Any], source: str) -> str: return f"// Auto-generated by {SCRIPT_PATH} from {source}.\n// DO NOT EDIT MANUALLY — amend the workbook and regenerate.\nwindow.HA_EDITIONS_CONTENT = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True); fd, temporary = tempfile.mkstemp(prefix="." + path.name + ".", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle: handle.write(content)
        os.replace(temporary, path)
    except Exception:
        try: os.unlink(temporary)
        except OSError: pass
        raise


def report_markdown(workbook: Path, mode: str, setting: dict[str, Any], editions: list[dict[str, Any]], audit: Audit, output: Path | None) -> str:
    lines = ["# Hope Editions generation report", "", f"**Generator:** `{SCRIPT_PATH}`  ", f"**Workbook:** `{workbook.name}`  ", f"**Workbook SHA-256:** `{hashlib.sha256(workbook.read_bytes()).hexdigest()}`  ", f"**Generated at:** {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}  ", f"**Mode:** `{mode}`  ", f"**Outcome:** `{'generated' if output else 'not generated'}`", "", "## Publication settings", "", f"- Publish prices to the website: `{'YES' if setting['publish'] else 'NO'}` (`README!{setting['cell']}`)", f"- Public price fields emitted: `{'yes' if setting['publish'] else 'no'}`", "", "## Generated Edition summary", "", "| Slug | Route | Artists | Pieces |", "| --- | --- | ---: | ---: |"]
    lines += [f"| `{edition['slug']}` | `{edition['pageUrl']}` | {len(edition['artists'])} | {sum(len(artist['pieces']) for artist in edition['artists'])} |" for edition in editions] or ["| — | — | 0 | 0 |"]
    lines += ["", "## Unresolved placeholder report", "", "| Sheet | Cell | Field | Finding |", "| --- | --- | --- | --- |"]
    lines += [f"| `{issue.sheet}` | `{issue.cell}` | {issue.field} | {issue.message} |" for issue in audit.placeholders] or ["| — | — | — | No unresolved placeholder markers were found. |"]
    rest = [issue for issue in audit.issues if issue not in audit.placeholders]
    lines += ["", "## Validation findings", "", "| Severity | Sheet | Cell | Field | Finding |", "| --- | --- | --- | --- | --- |"]
    lines += [f"| {issue.severity} | `{issue.sheet}` | `{issue.cell}` | {issue.field} | {issue.message} |" for issue in rest] or ["| PASS | — | — | — | No non-placeholder validation findings. |"]
    lines += ["", "## Restored baseline validation inventory", "", "- **Workbook markers:** scans every sheet for the pale-yellow `#FFF2CC` unresolved-placeholder fill. The c8ebb6b Editions generator had no equivalent text-placeholder rule, so ordinary text and image URLs are not scanned for that word.", "- **README and roster:** exact publication control; active roster values; exact `/editions/<slug>` route; unique active slug, number and route; Edition-tab existence.", "- **Edition metadata:** required hero, painting, partner and pre-footer fields; painting and optional asset URL/pair checks; roster metadata matching; optional-meta/photo warnings; and pull-out marker checks.", "- **Artists and pieces:** full table/header checks, Active YES/NO retained but only contributor Artist Active gates publication, status-only public inclusion, numeric order/duplicate checks, world and URL checks, image pairs, 1–5 chips, price handling, and layout/featured count checks.", "- **Modes:** strict turns normal data/placeholder problems into output-blocking errors; permissive reports them as warnings while fatal structures and blocking README settings still withhold output.", ""]
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workbook", type=Path, required=True); parser.add_argument("--output", type=Path, required=True); parser.add_argument("--report", type=Path, required=True); parser.add_argument("--mode", choices=("strict", "permissive"), default="strict")
    args = parser.parse_args()
    if not args.workbook.is_file(): print("ERROR: workbook does not exist", file=sys.stderr); return 2
    audit = Audit(args.mode); wb = load_workbook(args.workbook, data_only=False); scan_placeholders(audit, wb); setting = settings(audit, wb); roster = parse_roster(audit, wb)
    editions: list[dict[str, Any]] = []
    for row in roster:
        parsed = parse_edition(audit, wb, row, setting["publish"])
        if parsed: editions.append(parsed)
    editions.sort(key=lambda edition: edition["editionNumber"])
    edition_map = {edition["slug"]: edition for edition in editions}
    partner_pages = parse_partner_pages(audit, wb, edition_map)
    payload = prune({"generatedFrom": args.workbook.name, "publishPrices": setting["publish"], "images": ASSETS, "navigation": NAV, "footer": FOOTER, "editions": edition_map, "partnerPages": partner_pages}, setting["publish"])
    may_write = not audit.fatals and not audit.force_block and not (args.mode == "strict" and audit.errors)
    output = args.output if may_write else None
    if output: write(output, js(payload, args.workbook.name))
    write(args.report, report_markdown(args.workbook, args.mode, setting, editions, audit, output))
    for issue in audit.issues: print(f"{issue.severity}: {issue.sheet}!{issue.cell} [{issue.field}] {issue.message}")
    print("REPORT:", args.report)
    if output: print("GENERATED:", output)
    if audit.fatals: return 2
    if audit.force_block or (args.mode == "strict" and audit.errors): return 1
    return 0


if __name__ == "__main__": raise SystemExit(main())

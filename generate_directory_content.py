#!/usr/bin/env python3
"""Generate Hope Anthology directory and artist-page content from both live-sheet exports.

The two input files are downloaded workbook snapshots.  The generator never edits a
workbook and writes public content only after the selected validation mode permits it.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import unicodedata
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Iterable

from openpyxl import load_workbook

SCRIPT_PATH = "generate_directory_content.py"
PLACEHOLDER_TEXT = "placeholder"
PALE_YELLOW = "FFF2CC"
URL_RE = re.compile(r"^https://[^\s]+$", re.I)
STATUSES = {"available", "paused", "hidden"}
SIZES = {"", "60", "50", "40", "33", "40 under"}
LAYOUTS = {"", "Default", "Even", "Pairs", "Stacks", "Mixed", "Trios", "Custom"}
PRICE_KEYS = {"price", "priceNumber", "priceFrom", "fromPrice", "computedFrom"}
PUBLISH_LABEL = "Publish prices to the website (YES/NO)"
RECRUIT_LABEL = "Directory recruitment body"

ASSETS = {
    "logo": "https://images.squarespace-cdn.com/content/6a258894c750534b28845855/1f3bfb43-558e-4262-b2e2-d4e3b56bd77e/01-the-hope-anthology.jpg?content-type=image%2Fjpeg",
    "star": "https://images.squarespace-cdn.com/content/6a258894c750534b28845855/470da432-cdf9-45be-b3ba-2e9599ce5f4f/04-the-hope-anthology-botanical-star.png?content-type=image%2Fpng",
}
NAV = [
    {"label": "To Keep", "url": "/to-keep"},
    {"label": "To Make", "url": "/to-make"},
    {"label": "The Story", "url": "/story"},
    {"label": "For Artists", "url": "/for-artists"},
    {"label": "Collective", "url": "/collective"},
]
FOOTER = {"privacyUrl": "/privacy-policy", "accessibilityUrl": "/accessibility", "copyright": "© The Hope Anthology 2026"}
COLLECTIVE = {"heading": "Something worth being part of.", "body": "New designs, behind-the-scenes making, and the occasional reminder that you’re doing better than you think. No noise. No pressure. Just the Anthology.", "buttonLabel": "Join the Collective", "buttonUrl": "/collective"}

ROSTER = {
    "active": ["active"], "slug": ["slug"], "name": ["displayname"], "buttonName": ["buttonname"],
    "artistNumber": ["artistnumber"], "badge": ["badge"], "medium": ["medium"], "collections": ["collections"],
    "priceFrom": ["pricefrom"], "difficulty": ["difficulty"], "technique": ["technique"], "delivery": ["delivery"],
    "feeling": ["feeling"], "trait1": ["trait1"], "trait2": ["trait2"], "trait3": ["trait3"],
    "cardUrl": ["cardurl"], "heroImage": ["heroimageurl"], "heroAlt": ["heroimagealt"],
}
PROFILE = {
    "slug": ["slug"], "name": ["displayname"], "discipline": ["discipline"], "bio": ["bio"],
    "metaDescription": ["metadescription"], "statsCollections": ["statscollections"],
    "statsWorks": ["statsprints", "statspatterns"], "statsFromPrice": ["statsfromprice"],
    "galleryLayout": ["gallerylayout"], "artistImageUrl": ["artistimageurl"], "artistImageAlt": ["artistimagealt"],
}
PRODUCT = {
    "active": ["active"], "collection": ["collection"], "collectionOrder": ["collectionorder"], "productOrder": ["productorder"],
    "title": ["producttitle", "patterntitle"], "status": ["status"], "size": ["size"], "medium": ["medium"],
    "sizes": ["sizes"], "difficulty": ["difficulty"], "technique": ["technique"], "delivery": ["delivery"],
    "price": ["pricenumberonly", "price"], "listingUrl": ["etsyurl", "listingurl"], "meaning": ["meaningdescription", "meaning"],
    "chip1": ["chip1"], "chip2": ["chip2"], "chip3": ["chip3"], "chip4": ["chip4"], "chip5": ["chip5"],
    "image1Url": ["image1url"], "image1Alt": ["image1alt"], "image2Url": ["image2url"], "image2Alt": ["image2alt"],
    "image3Url": ["image3url"], "image3Alt": ["image3alt"], "notes": ["notes"],
    # Optional (19 Oct 2026): Photo? YES marks a photo, which fills the mount to the grey. Blank = flat artwork on a white mat.
    "image1Photo": ["image1photo"], "image2Photo": ["image2photo"], "image3Photo": ["image3photo"],
}
GROUP = {"name": ["groupname"], "oneLine": ["oneline"], "order": ["grouporder"], "layout": ["layout"]}


@dataclass(frozen=True)
class Issue:
    severity: str
    sheet: str
    cell: str
    field: str
    message: str


class Audit:
    """Carries legacy strict/permissive semantics and a separate placeholder report."""
    def __init__(self, mode: str) -> None:
        self.mode = mode
        self.issues: list[Issue] = []
        self.placeholders: list[Issue] = []
        self.roster: list[dict[str, Any]] = []
        self.force_block = False

    def add(self, severity: str, sheet: str, cell: str, field: str, message: str) -> None:
        self.issues.append(Issue(severity, sheet, cell, field, message))

    def fatal(self, sheet: str, cell: str, field: str, message: str) -> None:
        self.add("FATAL", sheet, cell, field, message)

    def error(self, sheet: str, cell: str, field: str, message: str) -> None:
        self.add("ERROR", sheet, cell, field, message)

    def warn(self, sheet: str, cell: str, field: str, message: str) -> None:
        self.add("WARNING", sheet, cell, field, message)

    def required(self, sheet: str, cell: str, field: str, message: str) -> None:
        self.add("ERROR" if self.mode == "strict" else "WARNING", sheet, cell, field, message)

    def placeholder(self, sheet: str, cell: str, field: str, message: str) -> None:
        issue = Issue("ERROR" if self.mode == "strict" else "WARNING", sheet, cell, field, message)
        self.issues.append(issue)
        self.placeholders.append(issue)

    def blocking(self, sheet: str, cell: str, field: str, message: str) -> None:
        self.error(sheet, cell, field, message)
        self.force_block = True

    @property
    def errors(self) -> list[Issue]:
        return [i for i in self.issues if i.severity == "ERROR"]

    @property
    def fatals(self) -> list[Issue]:
        return [i for i in self.issues if i.severity == "FATAL"]


def text(value: Any) -> str:
    return "" if value is None else str(value).strip()


def norm(value: Any) -> str:
    cleaned = unicodedata.normalize("NFKC", text(value)).replace("\n", " ")
    cleaned = re.sub(r"\([^)]*\)", "", cleaned)
    return re.sub(r"[^a-z0-9]+", "", cleaned.casefold())


def https(value: Any) -> bool:
    return bool(URL_RE.match(text(value)))


def slugify(value: Any) -> str:
    raw = unicodedata.normalize("NFKD", text(value)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", raw)).strip("-")


def yesno(value: Any) -> bool | None:
    value = text(value).upper()
    return True if value == "YES" else False if value == "NO" else None


def posint(value: Any) -> int | None:
    try:
        number = Decimal(text(value))
    except InvalidOperation:
        return None
    if number <= 0 or number != number.to_integral_value():
        return None
    return int(number)


def parse_price(value: Any) -> Decimal | None:
    cleaned = re.sub(r"[^0-9.,]", "", text(value)).replace(",", "")
    try:
        number = Decimal(cleaned)
    except InvalidOperation:
        return None
    return number if number > 0 else None


def price_string(value: Decimal) -> str:
    return "£" + format(value.quantize(Decimal("0.01")), ".2f")


def contains_placeholder(value: Any) -> bool:
    """Match c8ebb6b markers only when validating required or published fields."""
    return PLACEHOLDER_TEXT in text(value).casefold()
def pale_yellow(cell: Any) -> bool:
    fill = cell.fill
    if not fill or fill.fill_type != "solid":
        return False
    color = fill.fgColor
    raw = text(color.rgb).upper() if color and color.type == "rgb" else ""
    return raw.endswith(PALE_YELLOW)


def hmap(ws: Any, row: int) -> dict[str, tuple[int, Any]]:
    return {norm(cell.value): (cell.column, cell) for cell in ws[row] if norm(cell.value)}


def match(headers: dict[str, tuple[int, Any]], aliases: Iterable[str]) -> tuple[int, Any] | None:
    return next((headers[name] for name in aliases if name in headers), None)


def map_headers(audit: Audit, ws: Any, row: int, fields: dict[str, list[str]], required: Iterable[str], label: str) -> dict[str, tuple[int, Any]]:
    headers = hmap(ws, row)
    out: dict[str, tuple[int, Any]] = {}
    for key, aliases in fields.items():
        found = match(headers, aliases)
        if found:
            out[key] = found
    for key in required:
        if key not in out:
            audit.fatal(ws.title, f"{row}:{row}", key, f"Required {label} header is missing or renamed.")
    return out


def cell(ws: Any, row: int, mapping: dict[str, tuple[int, Any]], key: str) -> Any | None:
    return ws.cell(row=row, column=mapping[key][0]) if key in mapping else None


def get(ws: Any, row: int, mapping: dict[str, tuple[int, Any]], key: str) -> str:
    found = cell(ws, row, mapping, key)
    return text(found.value) if found else ""


def row_has_values(ws: Any, row: int, mapping: dict[str, tuple[int, Any]]) -> bool:
    return any(text(ws.cell(row, column).value) for column, _ in mapping.values())


def locate_product_header(ws: Any, kind: str) -> int | None:
    wanted = "patterntitle" if kind == "to-make" else "producttitle"
    for row in range(1, min(100, ws.max_row) + 1):
        labels = set(hmap(ws, row))
        if wanted in labels and "collection" in labels:
            return row
    return None


def profile_cells(ws: Any, product_header: int) -> dict[str, Any]:
    return {norm(ws.cell(row, 1).value): ws.cell(row, 2) for row in range(1, product_header) if norm(ws.cell(row, 1).value)}


def profile_value(audit: Audit, ws: Any, entries: dict[str, Any], key: str, required: bool = True) -> tuple[str, Any | None]:
    source = next((entries[name] for name in PROFILE[key] if name in entries), None)
    if source is None:
        if required:
            audit.fatal(ws.title, "A:B", key, "Required profile label is missing or renamed.")
        return "", None
    value = text(source.value)
    if required and not value:
        audit.required(ws.title, source.coordinate, key, "Required profile value is blank.")
    elif required and contains_placeholder(value):
        audit.placeholder(ws.title, source.coordinate, key, "Contains unresolved PLACEHOLDER text marker.")
    return value, source


def scan_placeholders(audit: Audit, wb: Any, label: str) -> None:
    """Scan every workbook cell for the pale-yellow unresolved-marker fill only."""
    for ws in wb.worksheets:
        for row in ws.iter_rows():
            for source in row:
                if pale_yellow(source):
                    audit.placeholder(ws.title, source.coordinate, label, "Cell has the pale-yellow unresolved-placeholder fill.")


def label_cells(ws: Any, label: str) -> list[Any]:
    target = norm(label)
    return [source for row in ws.iter_rows() for source in row if norm(source.value) == target]


def settings(audit: Audit, wb: Any, name: str) -> dict[str, Any]:
    setting = {"workbook": name, "publishPrices": False, "publishCell": "—", "recruitment": "", "recruitmentCell": "—"}
    if "README" not in wb.sheetnames:
        audit.blocking("Workbook", "—", "README", "README sheet is missing.")
        return setting
    ws = wb["README"]
    for label, key in ((PUBLISH_LABEL, "publish"), (RECRUIT_LABEL, "recruitment")):
        found = label_cells(ws, label)
        if len(found) != 1:
            audit.blocking(ws.title, "—", label, "Expected exactly one visible README setting label.")
            continue
        source = ws.cell(found[0].row, found[0].column + 1)
        value = text(source.value)
        setting["publishCell" if key == "publish" else "recruitmentCell"] = source.coordinate
        if key == "publish":
            if value.upper() not in {"YES", "NO"}:
                audit.blocking(ws.title, source.coordinate, label, "Value must be exactly YES or NO.")
            setting["publishPrices"] = value.upper() == "YES"
        else:
            if not value:
                audit.blocking(ws.title, source.coordinate, label, "Required publication copy is blank.")
            setting["recruitment"] = value
    return setting


def roster_rows(audit: Audit, wb: Any, kind: str) -> list[dict[str, Any]]:
    sheet_name = "To Make Roster" if kind == "to-make" else "To Keep Roster"
    if sheet_name not in wb.sheetnames:
        audit.fatal("Workbook", "—", "Roster", f"Expected {sheet_name} sheet.")
        return []
    ws = wb[sheet_name]
    required = ["active", "slug", "name", "artistNumber", "medium", "collections", "priceFrom", "feeling", "trait1", "trait2", "trait3", "cardUrl", "heroImage", "heroAlt"]
    if kind == "to-make":
        required += ["difficulty", "technique", "delivery"]
    mapping = map_headers(audit, ws, 1, ROSTER, required, "roster")
    seen: dict[str, int] = {}
    records: list[dict[str, Any]] = []
    for row in range(2, ws.max_row + 1):
        if not row_has_values(ws, row, mapping):
            continue
        values = {key: get(ws, row, mapping, key) for key in mapping}
        if not values.get("slug"):
            continue
        sources = {key: cell(ws, row, mapping, key) for key in mapping}
        active = yesno(values.get("active"))
        if active is None:
            audit.required(ws.title, sources["active"].coordinate if sources.get("active") else str(row), "Active (YES/NO)", "Record has data but Active is not YES or NO.")
            continue
        if values["slug"] in seen:
            audit.required(ws.title, sources["slug"].coordinate, "Slug", f"Duplicates roster row {seen[values['slug']]}.")
        seen[values["slug"]] = row
        if active:
            for key in required:
                if not values.get(key):
                    audit.required(ws.title, sources[key].coordinate if sources.get(key) else str(row), key, "Required active contributor value is blank.")
                elif contains_placeholder(values[key]):
                    audit.placeholder(ws.title, sources[key].coordinate if sources.get(key) else str(row), key, "Contains unresolved PLACEHOLDER text marker.")
            if values["slug"] != slugify(values["slug"]):
                audit.required(ws.title, sources["slug"].coordinate, "Slug", "Must be lower-case, URL-safe, and hyphen-separated.")
            if posint(values["artistNumber"]) is None:
                audit.blocking(ws.title, sources["artistNumber"].coordinate, "Artist Number", "Active contributor requires a unique positive whole Artist Number across both workbooks.")
            if not https(values["heroImage"]):
                audit.blocking(ws.title, sources["heroImage"].coordinate, "Hero Image URL", "Active contributor requires an absolute https:// Hero Image URL.")
            prefix = "/to-make/" if kind == "to-make" else "/to-keep/"
            if not values["cardUrl"].startswith(prefix):
                audit.required(ws.title, sources["cardUrl"].coordinate, "Card URL", f"Must start with {prefix}.")
        elif values.get("artistNumber"):
            audit.warn(ws.title, sources["artistNumber"].coordinate, "Artist Number", "Inactive contributor has an Artist Number; clear it until active.")
        record = {
            "active": active, "slug": values["slug"], "name": values["name"], "buttonName": values.get("buttonName", ""),
            "artistNumber": posint(values.get("artistNumber")) or 0, "badge": values.get("badge", ""), "medium": values["medium"],
            "filterMedium": re.sub(r"\s+patterns$", "", values["medium"], flags=re.I).strip() or values["medium"],
            "collections": [item.strip() for item in values["collections"].split(",") if item.strip()], "priceFrom": values["priceFrom"],
            "difficulty": values.get("difficulty", ""), "technique": values.get("technique", ""), "delivery": values.get("delivery", ""),
            "feeling": values["feeling"], "traits": [values.get(key, "") for key in ("trait1", "trait2", "trait3") if values.get(key, "")],
            "cardUrl": values["cardUrl"], "heroImage": values["heroImage"], "heroAlt": values["heroAlt"], "sourceRow": row,
            "priceFromCell": sources.get("priceFrom"),
        }
        records.append(record)
        audit.roster.append({"sheet": ws.title, "row": row, "active": active, "artistNumber": record["artistNumber"], "rawArtistNumber": values.get("artistNumber", ""), "name": record["name"]})
    return records


def groups_table(ws: Any, product_header: int) -> tuple[int | None, int | None]:
    title = None
    for row in range(product_header + 1, ws.max_row + 1):
        if text(ws.cell(row, 1).value).upper().startswith("GROUPS"):
            title = row
        if {'groupname', 'oneline', 'grouporder', 'layout'}.issubset(set(hmap(ws, row))):
            return title or row - 1, row
    return title, None


def parse_groups(audit: Audit, ws: Any, title_row: int | None, header_row: int | None) -> list[dict[str, Any]]:
    if not header_row:
        return []
    mapping = map_headers(audit, ws, header_row, GROUP, GROUP, "Groups table")
    records: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in range(header_row + 1, ws.max_row + 1):
        if not row_has_values(ws, row, mapping):
            continue
        values = {key: get(ws, row, mapping, key) for key in mapping}
        sources = {key: cell(ws, row, mapping, key) for key in mapping}
        if values.get("name", "").startswith("Group name must match"):
            continue
        name = values.get("name", "")
        if not name:
            audit.required(ws.title, sources["name"].coordinate if sources.get("name") else str(row), "Group name", "Groups rows need a name.")
            continue
        if name in seen:
            audit.required(ws.title, sources["name"].coordinate, "Group name", "Duplicate group name.")
        seen.add(name)
        for key, label in (("name", "Group name"), ("oneLine", "One line"), ("layout", "Group Layout")):
            if values.get(key) and contains_placeholder(values[key]):
                audit.placeholder(ws.title, sources[key].coordinate if sources.get(key) else str(row), label, "Contains unresolved PLACEHOLDER text marker.")
        layout = values.get("layout", "")
        if layout not in LAYOUTS:
            audit.required(ws.title, sources["layout"].coordinate, "Group Layout", "Must be blank (Default), Default, Even, Pairs, Stacks, Mixed, Trios, or Custom.")
        order = posint(values.get("order"))
        if order is None:
            audit.required(ws.title, sources["order"].coordinate, "Group order", "Must be a positive whole number.")
            order = 0
        records.append({"name": name, "oneLine": values.get("oneLine", ""), "order": order, "layout": layout, "products": []})
    return records


def validate_images(audit: Audit, ws: Any, sources: dict[str, Any], values: dict[str, str], visible: bool) -> list[dict[str, str]]:
    result: list[dict[str, str]] = []
    for number in range(1, 4):
        url_key, alt_key = f"image{number}Url", f"image{number}Alt"
        url, alt = values.get(url_key, ""), values.get(alt_key, "")
        url_cell, alt_cell = sources.get(url_key), sources.get(alt_key)
        if bool(url) != bool(alt):
            audit.required(ws.title, (alt_cell if url else url_cell).coordinate if (alt_cell if url else url_cell) else "—", f"Image {number}", "URL and Alt must be filled together.")
        if url and not https(url):
            audit.required(ws.title, url_cell.coordinate if url_cell else "—", f"Image {number} URL", "Must be an absolute https:// URL.")
        if visible and number == 1 and (not url or not alt):
            audit.required(ws.title, (url_cell if not url else alt_cell).coordinate if (url_cell if not url else alt_cell) else "—", "Image 1", "Visible product requires URL and Alt.")
        photo_raw = values.get(f"image{number}Photo", "").strip().upper()
        photo_cell = sources.get(f"image{number}Photo")
        if photo_raw not in ("", "YES", "NO"):
            audit.required(ws.title, photo_cell.coordinate if photo_cell else "—", f"Image {number} Photo?", "Must be YES or blank.")
        if url and alt:
            image = {"url": url, "alt": alt}
            if photo_raw == "YES":
                image["photo"] = True
            result.append(image)
    return result


def parse_contributor(audit: Audit, wb: Any, roster: dict[str, Any], kind: str, publish_prices: bool) -> dict[str, Any] | None:
    if roster["name"] not in wb.sheetnames:
        audit.fatal("Roster", str(roster["sourceRow"]), "Contributor tab", f"No sheet named {roster['name']!r} exists for active roster record {roster['slug']!r}.")
        return None
    ws = wb[roster["name"]]
    header = locate_product_header(ws, kind)
    if not header:
        audit.fatal(ws.title, "1:100", "Products table", "Could not locate the restructured product header row.")
        return None
    profile_entries = profile_cells(ws, header)
    base: dict[str, str] = {}
    profile_sources: dict[str, Any | None] = {}
    required_profile = {"slug", "name", "discipline", "bio", "metaDescription", "statsCollections", "statsWorks", "statsFromPrice"}
    for key in PROFILE:
        base[key], profile_sources[key] = profile_value(audit, ws, profile_entries, key, key in required_profile)
    if base["galleryLayout"] not in LAYOUTS:
        audit.required(ws.title, profile_sources["galleryLayout"].coordinate if profile_sources["galleryLayout"] else "A:B", "Gallery Layout", "Must be blank (Default), Default, Even, Pairs, Stacks, Mixed, Trios, or Custom.")
    if bool(base["artistImageUrl"]) != bool(base["artistImageAlt"]):
        source = profile_sources["artistImageAlt"] if base["artistImageUrl"] else profile_sources["artistImageUrl"]
        audit.required(ws.title, source.coordinate if source else "A:B", "Artist Image", "URL and Alt must be an optional pair.")
    elif base["artistImageUrl"] and not https(base["artistImageUrl"]):
        audit.required(ws.title, profile_sources["artistImageUrl"].coordinate if profile_sources["artistImageUrl"] else "A:B", "Artist Image URL", "Must be an absolute https:// URL.")

    fields = dict(PRODUCT)
    if kind == "to-keep":
        required_product = ["active", "collection", "collectionOrder", "productOrder", "title", "status", "size", "medium", "sizes", "price", "listingUrl", "meaning", "chip1", "chip2", "chip3", "chip4", "chip5", "image1Url", "image1Alt", "image2Url", "image2Alt", "image3Url", "image3Alt", "notes"]
    else:
        required_product = ["active", "collection", "collectionOrder", "productOrder", "title", "status", "size", "medium", "difficulty", "technique", "delivery", "price", "listingUrl", "meaning", "chip1", "chip2", "chip3", "chip4", "chip5", "image1Url", "image1Alt", "image2Url", "image2Alt", "image3Url", "image3Alt", "notes"]
    mapping = map_headers(audit, ws, header, fields, required_product, "product")
    header_names = set(hmap(ws, header))
    if any(re.fullmatch(r"chip[6-9]\d*", name) for name in header_names):
        audit.required(ws.title, str(header), "Chips", "More than 5 Chip columns are not allowed.")

    group_title, group_header = groups_table(ws, header)
    groups = parse_groups(audit, ws, group_title, group_header)
    by_group = {group["name"]: group for group in groups}
    product_end = (group_title - 1) if group_title else ws.max_row
    products: list[dict[str, Any]] = []
    derived_slugs: dict[str, str] = {}
    for row in range(header + 1, product_end + 1):
        if not row_has_values(ws, row, mapping):
            continue
        values = {key: get(ws, row, mapping, key) for key in mapping}
        if not values.get("title"):
            continue
        sources = {key: cell(ws, row, mapping, key) for key in mapping}
        active = yesno(values.get("active"))
        if active is None:
            audit.required(ws.title, sources["active"].coordinate if sources.get("active") else str(row), "Active (YES/NO)", "Value must be YES or NO. Active NO always hides the product.")
            active = False
        status = values.get("status", "").casefold()
        # Active NO always hides the product, whatever Status says (15 Oct 2026). Status applies only to Active YES rows.
        visible = bool(active) and status in {"available", "paused"}
        if status not in STATUSES:
            audit.required(ws.title, sources["status"].coordinate if sources.get("status") else str(row), "Status", "Must be exactly available, paused, or hidden.")
        size_lookup = {"": "", "60": "60", "50": "50", "40": "40", "33": "33", "40 under": "40 under"}
        size = size_lookup.get(values.get("size", "").casefold())
        if size is None:
            audit.required(ws.title, sources["size"].coordinate if sources.get("size") else str(row), "Size", "Must be blank, 60, 50, 40, 33, or 40 under.")
            size = ""
        if visible:
            for key in ("collection", "collectionOrder", "productOrder", "title", "medium", "listingUrl", "meaning"):
                if not values.get(key):
                    audit.required(ws.title, sources[key].coordinate if sources.get(key) else str(row), key, "Visible product value is blank.")
                elif contains_placeholder(values[key]):
                    audit.placeholder(ws.title, sources[key].coordinate if sources.get(key) else str(row), key, "Contains unresolved PLACEHOLDER text marker.")
            for key in ("size", "sizes", "difficulty", "technique", "delivery", "price", "chip1", "chip2", "chip3", "chip4", "chip5", "image1Url", "image1Alt", "image2Url", "image2Alt", "image3Url", "image3Alt"):
                if values.get(key) and contains_placeholder(values[key]):
                    audit.placeholder(ws.title, sources[key].coordinate if sources.get(key) else str(row), key, "Contains unresolved PLACEHOLDER text marker.")
            for key, label in (("collectionOrder", "CollectionOrder"), ("productOrder", "ProductOrder")):
                if posint(values.get(key)) is None:
                    audit.required(ws.title, sources[key].coordinate if sources.get(key) else str(row), label, "Must be a positive whole number.")
            if not https(values.get("listingUrl")):
                audit.required(ws.title, sources["listingUrl"].coordinate if sources.get("listingUrl") else str(row), "Listing URL", "Visible product requires an absolute https:// URL.")
        images = validate_images(audit, ws, sources, values, visible)
        chips: list[str] = []
        for number in range(1, 6):
            chip = values.get(f"chip{number}", "")
            chip_cell = sources.get(f"chip{number}")
            if chip and https(chip):
                audit.required(ws.title, chip_cell.coordinate if chip_cell else str(row), f"Chip {number}", "Informational chips must be text, not an absolute https:// URL.")
            if chip:
                chips.append(chip)
        numeric_price = parse_price(values.get("price"))
        if visible and numeric_price is None:
            source = sources.get("price")
            (audit.required if publish_prices else audit.warn)(ws.title, source.coordinate if source else str(row), "Price (£) number only", "Visible product price is missing or invalid." + (" It is required when Publish prices is YES." if publish_prices else " No public price is emitted while publication is NO."))
        product_slug = slugify(values.get("title"))
        if visible and not product_slug:
            audit.required(ws.title, sources["title"].coordinate if sources.get("title") else str(row), "Product Title", "Visible product has no URL-safe derived slug.")
        if visible and product_slug:
            if product_slug in derived_slugs:
                audit.required(ws.title, sources["title"].coordinate if sources.get("title") else str(row), "Product Title", f"Derived slug {product_slug!r} duplicates row {derived_slugs[product_slug]}.")
            derived_slugs[product_slug] = str(row)
        record: dict[str, Any] = {
            "active": active, "slug": product_slug, "collection": values.get("collection", ""), "collectionOrder": posint(values.get("collectionOrder")) or 0,
            "productOrder": posint(values.get("productOrder")) or 0, "title": values.get("title", ""), "status": status, "size": size,
            "medium": values.get("medium", ""), "listingUrl": values.get("listingUrl", ""), "etsyUrl": values.get("listingUrl", ""),
            "meaning": values.get("meaning", ""), "chips": chips, "images": images, "notes": values.get("notes", ""),
        }
        if kind == "to-keep":
            record["sizes"] = values.get("sizes", "")
        else:
            record.update({"difficulty": values.get("difficulty", ""), "technique": values.get("technique", ""), "delivery": values.get("delivery", "")})
        if publish_prices and numeric_price is not None:
            record.update({"price": price_string(numeric_price), "priceNumber": float(numeric_price)})
        if visible:
            products.append(record)

    if groups:
        visible_collections = {product["collection"] for product in products}
        for group in groups:
            if group["name"] not in visible_collections:
                audit.warn(ws.title, str(group_header), "Group name", f"Group {group['name']!r} has no visible products, so it is left off the page.")
        for product in products:
            if product["collection"] not in by_group:
                audit.required(ws.title, product["title"], "Collection", f"Collection {product['collection']!r} has no Groups row.")
            else:
                by_group[product["collection"]]["products"].append(product)
        groups = [group for group in groups if group["products"]]
        groups.sort(key=lambda group: (group["order"], group["name"].casefold()))
    else:
        groups = [{"name": "", "oneLine": "", "order": 1, "layout": "", "products": products}]

    all_slugs: dict[str, str] = {}
    for group in groups:
        group["products"].sort(key=lambda product: (product["productOrder"], product["title"].casefold()))
        effective = group["layout"] or base["galleryLayout"] or "Default"
        group["effectiveLayout"] = effective
        if effective == "Custom" and any(not product["size"] for product in group["products"]):
            audit.required(ws.title, group["name"] or "—", "Custom Layout", "A Custom group cannot contain a blank Size.")
        for index, product in enumerate(group["products"]):
            if product["size"] == "40 under" and (index == 0 or group["products"][index - 1]["size"] != "40"):
                audit.required(ws.title, product["title"], "40 under", "Must directly follow a 40 in the same group.")
            if product["slug"] in all_slugs:
                audit.required(ws.title, product["title"], "Product Title", f"Derived product slug {product['slug']!r} appears in both {all_slugs[product['slug']]} and {roster['slug']}.")
            all_slugs[product["slug"]] = roster["slug"]

    if base["slug"] != roster["slug"]:
        audit.warn(ws.title, profile_sources["slug"].coordinate if profile_sources["slug"] else "B2", "Slug", "Contributor-profile slug does not match roster slug.")
    if base["name"] != roster["name"]:
        audit.warn(ws.title, profile_sources["name"].coordinate if profile_sources["name"] else "B3", "Display Name", "Contributor-profile display name does not match roster.")
    if ws.title != roster["name"]:
        audit.warn(ws.title, "A1", "Contributor tab", "Contributor-tab title does not match roster Display Name.")
    named_groups = [group for group in groups if group["name"]]
    if posint(base["statsCollections"]) != len(named_groups):
        audit.warn(ws.title, profile_sources["statsCollections"].coordinate if profile_sources["statsCollections"] else "B7", "Stats — Collections", f"States {base['statsCollections']!r}; generated value is {len(named_groups)}.")
    work_label = "Stats — Patterns" if kind == "to-make" else "Stats — Prints"
    if posint(base["statsWorks"]) != len(products):
        audit.warn(ws.title, profile_sources["statsWorks"].coordinate if profile_sources["statsWorks"] else "B8", work_label, f"States {base['statsWorks']!r}; generated value is {len(products)}.")
    if set(roster["collections"]) != {product["collection"] for product in products}:
        audit.warn(ws.title, "B7", "Collections", "Roster collections do not match the emitted product collections.")
    source_prices = [parse_price(get(ws, row, mapping, "price")) for row in range(header + 1, product_end + 1) if row_has_values(ws, row, mapping)]
    source_prices = [value for value in source_prices if value is not None]
    computed_from = price_string(min(source_prices)) if source_prices else ""
    if products and not computed_from:
        audit.warn(ws.title, profile_sources["statsFromPrice"].coordinate if profile_sources["statsFromPrice"] else "B9", "Stats — From Price", "Emitted products have no valid numeric price in the workbook.")
    elif computed_from:
        for label, supplied, source in (("Roster Price From", roster["priceFrom"], roster.get("priceFromCell")), ("Stats — From Price", base["statsFromPrice"], profile_sources["statsFromPrice"])):
            if parse_price(supplied) != parse_price(computed_from):
                audit.warn(ws.title, source.coordinate if source else "—", label, f"States {supplied!r}; source products calculate {computed_from}.")
    stats_key = "patterns" if kind == "to-make" else "prints"
    profile = {
        "discipline": base["discipline"], "bio": base["bio"], "metaDescription": base["metaDescription"], "galleryLayout": base["galleryLayout"] or "Default",
        # Artist Image falls back to the roster card image (Hero Image URL/Alt) when the profile cells are blank.
        "artistImage": ({"url": base["artistImageUrl"], "alt": base["artistImageAlt"]} if base["artistImageUrl"] and base["artistImageAlt"]
                        else {"url": roster["heroImage"], "alt": roster["heroAlt"]} if https(roster.get("heroImage")) and roster.get("heroAlt") else None),
        "stats": {"collections": len(named_groups), stats_key: len(products), "fromPrice": computed_from},
    }
    return {**roster, "profile": profile, "groups": groups, "productCount": len(products), "computedFrom": computed_from}


def parse_book(audit: Audit, path: Path, kind: str) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    wb = load_workbook(path, data_only=False)
    scan_placeholders(audit, wb, "Unresolved placeholder")
    publication = settings(audit, wb, path.name)
    roster = roster_rows(audit, wb, kind)
    contributors: list[dict[str, Any]] = []
    for item in roster:
        if item["active"]:
            parsed = parse_contributor(audit, wb, item, kind, publication["publishPrices"])
            if parsed:
                contributors.append(parsed)
    return contributors, publication


def validate_product_slugs(audit: Audit, contributors: list[dict[str, Any]]) -> None:
    """Restore the baseline duplicate derived-product-slug check across contributor tabs."""
    seen: dict[str, str] = {}
    for contributor in contributors:
        for group in contributor["groups"]:
            for product in group["products"]:
                product_slug = product.get("slug", "")
                if not product_slug:
                    continue
                previous = seen.get(product_slug)
                if previous and previous != contributor["slug"]:
                    audit.required("Workbook", product.get("title", "—"), "Product Title", f"Derived product slug {product_slug!r} appears in both {previous} and {contributor['slug']}.")
                else:
                    seen[product_slug] = contributor["slug"]


def validate_artist_numbers(audit: Audit) -> None:
    seen: dict[int, dict[str, Any]] = {}
    active_numbers: list[int] = []
    for item in audit.roster:
        raw, number = item["rawArtistNumber"], item["artistNumber"]
        if raw and not number and item["active"]:
            audit.blocking(item["sheet"], str(item["row"]), "Artist Number", "Artist Number must be a positive whole integer.")
        if not number:
            continue
        if number in seen:
            old = seen[number]
            audit.blocking(item["sheet"], str(item["row"]), "Artist Number", f"Artist Number {number} duplicates {old['sheet']} row {old['row']} ({old['name']}).")
        else:
            seen[number] = item
        if item["active"]:
            active_numbers.append(number)
    if active_numbers:
        assigned = set(active_numbers)
        gaps = [str(value) for value in range(min(assigned), max(assigned) + 1) if value not in assigned]
        if gaps:
            audit.warn("Workbook", "—", "Artist Number", "Active Artist Number sequence has gap(s): " + ", ".join(gaps) + ".")


def prune_prices(value: Any, publish: bool) -> Any:
    if publish:
        return value
    if isinstance(value, dict):
        return {key: prune_prices(item, publish) for key, item in value.items() if key not in PRICE_KEYS}
    if isinstance(value, list):
        return [prune_prices(item, publish) for item in value]
    return value


def js(global_name: str, payload: dict[str, Any], source: str) -> str:
    return f"// Auto-generated by {SCRIPT_PATH} from {source}.\n// DO NOT EDIT MANUALLY — amend the workbook and regenerate.\nwindow.{global_name} = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"


def maker_js(slug: str, payload: dict[str, Any], source: str) -> str:
    return f"// Auto-generated by {SCRIPT_PATH} from {source}.\n// DO NOT EDIT MANUALLY — amend the workbook and regenerate.\nwindow.HA_TO_MAKE_MAKERS = window.HA_TO_MAKE_MAKERS || {{}};\nwindow.HA_TO_MAKE_MAKERS[{json.dumps(slug)}] = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"


def keep_profile(item: dict[str, Any], publish: bool) -> dict[str, Any]:
    profile = item["profile"]
    products = [product for group in item["groups"] for product in group["products"]]
    return prune_prices({
        "slug": item["slug"], "path": "/to-keep/" + item["slug"], "world": "To Keep", "eyebrow": "TO KEEP · ANTHOLOGY ARTIST",
        "artistName": item["name"], "artistTitle": profile["discipline"], "bio": profile["bio"],
        "metaTitle": item["name"] + " — " + profile["discipline"] + " | The Hope Anthology", "metaDescription": profile["metaDescription"],
        "profile": profile, "stats": profile["stats"], "breadcrumbs": [{"label": "To Keep", "url": "/to-keep"}, {"label": item["name"]}],
        "groups": item["groups"], "products": products,
    }, publish)


def index_entry(item: dict[str, Any], make: bool, publish: bool) -> dict[str, Any]:
    keys = ["slug", "active", "name", "buttonName", "artistNumber", "badge", "heroImage", "heroAlt", "medium", "filterMedium", "collections", "feeling", "traits", "cardUrl"]
    if make:
        keys += ["difficulty", "technique", "delivery"]
    if publish:
        keys.append("priceFrom")
    return {key: item[key] for key in keys}


def index_payload(items: list[dict[str, Any]], make: bool, source: str, publication: dict[str, Any]) -> dict[str, Any]:
    works = [product for item in items for group in item["groups"] for product in group["products"]]
    return {
        "generatedFrom": source, "images": ASSETS, "navigation": NAV,
        "page": {"eyebrow": "To Make" if make else "To Keep", "headingHtml": "Curated <em>Makers</em>" if make else "Curated <em>Artists</em>",
                 "intro": "A growing anthology of people who design things for other people to make. Patterns, templates and guides — chosen because making is one of the oldest ways there is of getting through something." if make else "A growing anthology of artists whose work carries meaning — pieces to lift you, anchor you, or simply stay with you. Every artist is here because their work holds a feeling worth keeping.",
                 "stats": [{"value": len(items), "label": "MAKERS" if make else "ARTISTS"}, {"value": len(works), "label": "PATTERNS" if make else "WORKS"}, {"value": len({p["collection"] for p in works if p["collection"]}), "label": "COLLECTIONS"}]},
        "filters": {"medium": (["All mediums"] if make else ["All"]) + sorted({item["filterMedium"] if make else item["medium"] for item in items if item["medium"]}), **({"level": ["All levels", "Beginner", "Improver"], "delivery": ["All delivery", "Instant download", "Posted to you"]} if make else {})},
        "recruitment": {"eyebrow": "FOR MAKERS" if make else "FOR ARTISTS", "heading": "Do you design things for other people to make?" if make else "Your work could be here.", "body": publication["recruitment"], "linkLabel": "See how it works for artists →", "linkUrl": "/for-artists"},
        "collective": COLLECTIVE, "footer": FOOTER, "makers" if make else "artists": [index_entry(item, make, publication["publishPrices"]) for item in items],
    }


def write_atomic(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix="." + path.name + ".", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
        os.replace(temporary, path)
    except Exception:
        try: os.unlink(temporary)
        except OSError: pass
        raise


def report_markdown(audit: Audit, mode: str, keep: list[dict[str, Any]], make: list[dict[str, Any]], settings_keep: dict[str, Any], settings_make: dict[str, Any], outputs: list[Path], source: str) -> str:
    lines = ["# Hope Anthology Directory Workbook Generation Report", "", f"**Generator:** `{SCRIPT_PATH}`  ", f"**Sources:** `{source}`  ", f"**Mode:** `{mode}`  ", f"**Outcome:** `{'generated' if outputs else 'not generated'}`", "", "## Publication settings", "", f"- To Keep Publish prices: `{'YES' if settings_keep['publishPrices'] else 'NO'}` (`README!{settings_keep['publishCell']}`)", f"- To Make Publish prices: `{'YES' if settings_make['publishPrices'] else 'NO'}` (`README!{settings_make['publishCell']}`)", "", "## Summary", "", "| Metric | Value |", "| --- | ---: |", f"| Active contributors | {len(keep) + len(make)} |", f"| Emitted products/patterns | {sum(item['productCount'] for item in keep + make)} |", f"| Generated content files | {len(outputs)} |", f"| Fatal structural issues | {len(audit.fatals)} |", f"| Errors | {len(audit.errors)} |", f"| Unresolved placeholders | {len(audit.placeholders)} |", "", "## Generated files", ""]
    lines += [f"- `{path.name}`" for path in outputs] or ["- None — validation stopped output."]
    lines += ["", "## Unresolved placeholder report", "", "| Sheet | Cell | Field | Finding |", "| --- | --- | --- | --- |"]
    lines += [f"| `{item.sheet}` | `{item.cell}` | {item.field} | {item.message} |" for item in audit.placeholders] or ["| — | — | — | No unresolved placeholder markers were found. |"]
    others = [item for item in audit.issues if item not in audit.placeholders]
    lines += ["", "## Validation findings", "", "| Severity | Sheet | Cell | Field | Finding |", "| --- | --- | --- | --- | --- |"]
    lines += [f"| {item.severity} | `{item.sheet}` | `{item.cell}` | {item.field} | {item.message} |" for item in others] or ["| PASS | — | — | — | No non-placeholder validation findings. |"]
    lines += ["", "## Restored baseline validation inventory", "", "- **Workbook markers:** scans every sheet for the pale-yellow `#FFF2CC` fill; checks only required or published fields for the unresolved `placeholder` text substring, so README copy and Notes are not falsely blocked.", "- **README:** exactly-one visible publication switch and recruitment-copy labels, YES/NO value, and cross-workbook price-switch agreement.", "- **Roster:** sheet/header presence, Active YES/NO, required active values, URL-safe unique slug, unique positive Artist Number, Hero URL, Card URL route, inactive-number warning, and global Artist Number gap warning.", "- **Profile:** required profile fields, profile/roster slug and display-name warnings, contributor-tab name warning, emitted collection/work count and computed-price consistency warnings.", "- **Products:** table/header presence, valid status, retained product Active field, required visible values, listing/image URLs and URL/alt pairs, title slug duplication, numeric ordering, prices, and global generated-price omission when publishing is NO.", "- **Modes:** strict records normal data and placeholder issues as errors and withholds all output; permissive records them as warnings but still refuses fatal structures and explicitly blocking cross-workbook settings.", ""]
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--to-keep-workbook", type=Path, required=True)
    parser.add_argument("--to-make-workbook", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--mode", choices=("strict", "permissive"), default="strict")
    args = parser.parse_args()
    if not args.to_keep_workbook.is_file() or not args.to_make_workbook.is_file():
        print("ERROR: a specified workbook was not found.", file=sys.stderr)
        return 2
    audit = Audit(args.mode)
    keep, settings_keep = parse_book(audit, args.to_keep_workbook, "to-keep")
    make, settings_make = parse_book(audit, args.to_make_workbook, "to-make")
    if settings_keep["publishPrices"] != settings_make["publishPrices"]:
        audit.blocking("Publication settings", f"{args.to_keep_workbook.name} README!{settings_keep['publishCell']}; {args.to_make_workbook.name} README!{settings_make['publishCell']}", PUBLISH_LABEL, "Both workbooks must use the same YES or NO value before whole-Anthology generation.")
    validate_product_slugs(audit, keep)
    validate_product_slugs(audit, make)
    validate_artist_numbers(audit)
    outputs: list[Path] = []
    may_write = not audit.fatals and not audit.force_block and not (args.mode == "strict" and audit.errors)
    source = args.to_keep_workbook.name + " + " + args.to_make_workbook.name
    if may_write:
        out = args.output_dir
        chrome = {"images": {"logo": ASSETS["logo"], "star": "https://images.squarespace-cdn.com/content/6a258894c750534b28845855/0956e10d-38c6-4fd7-8e06-7f2579fb75d6/collections-footer-star-hope-anthology.png?content-type=image%2Fpng"}, "navigation": NAV, "collective": COLLECTIVE, "footer": {"instagramUrl": "https://www.instagram.com/thehopeanthology", **FOOTER}}
        payloads: list[tuple[Path, str]] = [
            (out / "content.to-keep.js", js("HA_TO_KEEP_CONTENT", index_payload(keep, False, args.to_keep_workbook.name, settings_keep), args.to_keep_workbook.name)),
            (out / "content.keep-collections.js", js("HA_KEEP_COLLECTIONS_CONTENT", {"generatedFrom": args.to_keep_workbook.name, **chrome, "collections": {item["slug"]: keep_profile(item, settings_keep["publishPrices"]) for item in keep}}, args.to_keep_workbook.name)),
            (out / "content.to-make.js", js("HA_TO_MAKE_CONTENT", index_payload(make, True, args.to_make_workbook.name, settings_make), args.to_make_workbook.name)),
        ]
        recent = []
        for world, items in (("TO KEEP", keep), ("TO MAKE", make)):
            recent += [{"artistNumber": item["artistNumber"], "world": world, "name": item["name"], "buttonName": item["buttonName"], "heroImage": item["heroImage"], "heroAlt": item["heroAlt"], "feeling": item["feeling"], "cardUrl": item["cardUrl"]} for item in items]
        recent.sort(key=lambda item: item["artistNumber"], reverse=True)
        payloads.append((out / "content.home-recent-artists.js", js("HA_HOME_RECENT_ARTISTS", {"generatedFrom": source, "artists": recent[:4]}, source)))
        for item in make:
            maker = prune_prices({"generatedFrom": args.to_make_workbook.name, "images": ASSETS, "navigation": NAV, "collective": COLLECTIVE, "footer": FOOTER, "maker": {key: value for key, value in item.items() if key not in {"sourceRow", "priceFromCell"}}}, settings_make["publishPrices"])
            payloads.append((out / f"content.to-make.{item['slug']}.js", maker_js(item["slug"], maker, args.to_make_workbook.name)))
        for path, content in payloads:
            write_atomic(path, content)
            outputs.append(path)
    write_atomic(args.report, report_markdown(audit, args.mode, keep, make, settings_keep, settings_make, outputs, source))
    for issue in audit.issues:
        print(f"{issue.severity}: {issue.sheet}!{issue.cell} [{issue.field}] {issue.message}")
    print("REPORT:", args.report)
    for path in outputs:
        print("GENERATED:", path)
    if audit.fatals:
        return 2
    if audit.force_block or (args.mode == "strict" and audit.errors):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

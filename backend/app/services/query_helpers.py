from __future__ import annotations

import re
from collections import defaultdict


def split_identifier_terms(value: str | None) -> list[str]:
    if not value:
        return []
    parts = re.split(r"[\s,，\n\r\t]+", value.strip())
    seen = set()
    output: list[str] = []
    for part in parts:
        term = part.strip()
        if not term:
            continue
        key = term.upper()
        if key in seen:
            continue
        seen.add(key)
        output.append(term)
    return output


def group_by_keys(items: list[dict], *keys: str) -> list[dict]:
    grouped: dict[tuple, list[dict]] = defaultdict(list)
    for item in items:
        grouped[tuple(item.get(key) for key in keys)].append(item)
    output = []
    for group_key, group_items in grouped.items():
        output.append(
            {
                "group_key": {key: value for key, value in zip(keys, group_key, strict=False)},
                "items": group_items,
            }
        )
    return output

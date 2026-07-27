"""
PATCH for split_project.py — NiiCk Export Cleaner
===================================================
Replace the two functions below in your existing split_project.py:
  - find_component_candidates()
  - looks_component_like_class()

This fixes Framer exports that use data-framer-name, arbitrary class names,
and deeply nested divs instead of semantic HTML.
"""

# ─── DROP-IN REPLACEMENT ──────────────────────────────────────────────────────
# Replace your existing find_component_candidates() with this one.

def find_component_candidates(html: str) -> list:
    """
    Improved Framer-aware candidate finder.
    Strategy priority (highest → lowest):
      1. data-framer-name  (Framer's own label)
      2. data-name / data-component / data-section
      3. Semantic tags with id=
      4. Semantic tags without id
      5. div/section with component-like class names (expanded list)
    """
    open_tag = re.compile(
        r"<(header|nav|main|footer|section|article|aside|div)\b([^>]*)>",
        flags=re.I,
    )
    candidates = []

    for match in open_tag.finditer(html):
        tag   = match.group(1).lower()
        attrs = match.group(2) or ""
        start = match.start()
        end   = find_matching_close(html, tag, match.end())

        if end == -1:
            continue

        block_len = end - start
        if block_len < 80:          # too small to be a real component
            continue
        if block_len > len(html) * 0.95:  # nearly the whole page → skip
            continue

        ident      = get_attr(attrs, "id")
        class_name = get_attr(attrs, "class")
        data_name  = (
            get_attr(attrs, "data-framer-name")   # ← Framer's own label
            or get_attr(attrs, "data-name")
            or get_attr(attrs, "data-component")
            or get_attr(attrs, "data-section")
            or get_attr(attrs, "data-block")
        )

        name  = guess_component_name(tag, ident, class_name, data_name)
        score = score_candidate(tag, ident, class_name, data_name)

        if not name:
            continue

        # divs need a stronger signal — must have id, data-*, or a good class
        if tag == "div" and score < 60:
            continue

        candidates.append({
            "start":  start,
            "end":    end,
            "tag":    tag,
            "name":   sanitize_name(name),
            "score":  score,
            "length": block_len,
        })

    return candidates


# ─── DROP-IN REPLACEMENT ──────────────────────────────────────────────────────
# Replace your existing looks_component_like_class() with this one.

def looks_component_like_class(class_name: str) -> bool:
    """
    Expanded keyword list tuned for Framer exports.
    Framer often uses compound class names like 'hero-section', 'nav-wrapper',
    'features-grid', 'cta-block', 'marquee-track', etc.
    """
    value = (class_name or "").lower().strip()
    if not value:
        return False

    # High-confidence standalone names
    exact = {
        "header", "nav", "navbar", "hero", "banner", "intro",
        "features", "feature", "cards", "card", "cta", "pricing",
        "testimonial", "testimonials", "gallery", "about", "contact",
        "footer", "sidebar", "modal", "section", "main", "page",
        "logo", "ticker", "marquee", "faq", "team", "clients",
        "process", "services", "blog", "portfolio", "stats",
        "announcement", "cookie", "popup", "overlay", "drawer",
    }
    if value in exact:
        return True

    # Compound keyword match (e.g. "hero-section", "nav-wrapper", "cta-block")
    keywords = list(exact) + [
        "wrapper", "container", "section", "block", "grid",
        "row", "col", "panel", "group", "area", "zone",
        "track", "strip", "band", "row", "layout",
    ]
    for kw in keywords:
        if value == kw:
            return True
        if value.startswith(kw + "-") or value.startswith(kw + "_"):
            return True
        if value.endswith("-" + kw) or value.endswith("_" + kw):
            return True

    return False


# ─── ALSO UPDATE score_candidate() ───────────────────────────────────────────
# Replace your existing score_candidate() with this one.
# data-framer-name now gets the highest bonus.

def score_candidate(tag: str, ident: str, class_name: str, data_name: str) -> int:
    score = 0

    # Tag score
    if tag in {"header", "nav", "main", "footer"}:
        score += 100
    elif tag == "section":
        score += 80
    elif tag in {"article", "aside"}:
        score += 60
    elif tag == "div":
        score += 20      # div starts low — needs other signals

    # Attribute bonuses
    if data_name:
        score += 120     # data-framer-name / data-* → strongest signal
    if ident:
        score += 100     # id= → strong
    if looks_component_like_class(class_name):
        score += 50      # recognisable class → medium
    elif class_name:
        score += 10      # has some class → weak

    return score

import os
import re

# Config
HEADER_FILE = "fotki.user.js"
SRC_FILES = [
    "src/styles.js",
    "src/utils.js",
    "src/lightbox.js",
    "src/app.js"
]

def get_version(content):
    """Extracts version from the userscript header."""
    match = re.search(r"// @version\s+([\d\.]+)", content)
    return match.group(1) if match else "unknown"

def extract_metadata_only(content):
    """Extracts ONLY the metadata block, ignoring the rest of the file."""
    match = re.search(r"(// ==UserScript==[\s\S]*?// ==/UserScript==)", content)
    if not match:
        return None
    metadata = match.group(1)
    # Remove @require lines since we are bundling them
    metadata = re.sub(r"// @require.*?\n", "", metadata)
    return metadata

def build():
    if not os.path.exists("dist"):
        os.makedirs("dist")

    print("🏗️  Building Single-File Userscript...")

    # 1. Read Header File
    try:
        with open(HEADER_FILE, "r", encoding="utf-8") as f:
            header_content = f.read()
    except FileNotFoundError:
        print(f"❌ Error: {HEADER_FILE} not found.")
        return

    # 2. Extract Metadata (and discard the old loader code!)
    version = get_version(header_content)
    metadata_block = extract_metadata_only(header_content)
    
    if not metadata_block:
        print("❌ Error: Could not find UserScript metadata block.")
        return

    output_filename = f"dist/fotki.v{version}.user.js"
    print(f"📌 Detected Version: {version}")

    # 3. Read Modules
    modules_content = ""
    for src in SRC_FILES:
        if os.path.exists(src):
            with open(src, "r", encoding="utf-8") as f:
                content = f.read()
                # Clean up redundant namespace declarations to keep code tidy
                content = content.replace("window.Fotki = window.Fotki || {};", "")
                modules_content += f"\n    // --- {src} ---\n{content}\n"
        else:
            print(f"⚠️  Warning: {src} not found.")

    # 4. Assembly
    # We create a SINGLE IIFE that defines everything first, then runs init at the bottom.
    final_script = f"""{metadata_block}

(function() {{
    'use strict';

    // 1. Setup Namespace
    window.Fotki = window.Fotki || {{}};

    // 2. Bundled Modules
{modules_content}

    // 3. Initialize App (Now guaranteed to exist)
    if (window.Fotki.App) {{
        window.Fotki.App.init();
        console.log('Fotki: Bundled version v{version} loaded.');
    }} else {{
        console.error('Fotki: App module missing.');
    }}
}})();
"""

    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(final_script)

    print(f"✅ Success! Created {output_filename}")

if __name__ == "__main__":
    build()
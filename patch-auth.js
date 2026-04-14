// ============================================
// Patch: Add auth to all HTML pages
// ============================================
const fs = require('fs');
const path = require('path');

const htmlFiles = ['index.html', 'exchange.html'];

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.log('SKIP: ' + file + ' not found');
        return;
    }

    let html = fs.readFileSync(filePath, 'utf8');

    // 1. Add authContainer in header if not exists
    if (!html.includes('authContainer')) {
        // Try to find the last nav item area / header buttons
        // Look for closing </nav> or </header> and inject before
        
        // Strategy: find the header area and add auth container
        // We look for patterns like btn-primary in header
        
        // Replace the last button in nav with auth container
        // Pattern: find </nav> or the end of nav-links
        
        if (html.includes('nav-links')) {
            html = html.replace(
                /(<ul class="nav-links"[\s\S]*?)(<\/ul>)/i,
                '$1<li id="authContainer"><button class="btn btn-primary" onclick="Auth.showMain()" style="padding:10px 24px;font-size:.85rem;border-radius:12px">Войти</button></li>\n$2'
            );
        } else if (html.includes('</nav>')) {
            html = html.replace(
                '</nav>',
                '<div id="authContainer" style="margin-left:auto"><button class="btn btn-primary" onclick="Auth.showMain()" style="padding:10px 24px;font-size:.85rem;border-radius:12px">Войти</button></div>\n</nav>'
            );
        } else if (html.includes('</header>')) {
            html = html.replace(
                '</header>',
                '<div id="authContainer" style="margin-left:auto"><button class="btn btn-primary" onclick="Auth.showMain()" style="padding:10px 24px;font-size:.85rem;border-radius:12px">Войти</button></div>\n</header>'
            );
        }
    }

    // 2. Add auth.js script if not exists
    if (!html.includes('auth.js')) {
        html = html.replace(
            '</body>',
            '<script src="js/auth.js"></script>\n</body>'
        );
    }

    fs.writeFileSync(filePath, html, 'utf8');
    console.log('PATCHED: ' + file);
});

console.log('Done! Auth container and script added.');

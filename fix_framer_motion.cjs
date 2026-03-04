const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!fullPath.includes('_backup') && !fullPath.includes('node_modules')) {
                results = results.concat(walk(fullPath));
            }
        } else if (fullPath.endsWith('.jsx')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('./src');
let fixedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Check for usages of framer-motion components
    const usesMotion = /<motion\./.test(content) || /motion\./.test(content) || /import .*\{.*motion.*\}/.test(content);
    const usesAnimatePresence = /<AnimatePresence/.test(content);
    const usesUseAnimation = /useAnimation/.test(content);
    const usesUseMotionValue = /useMotionValue/.test(content);
    const usesUseTransform = /useTransform/.test(content);
    const usesUseSpring = /useSpring/.test(content);

    // Determine which ones are actually used logically (without getting tricked by import itself if it was there)
    // Actually, we should just check if they are in the file except in the import statement.
    // Simpler: if they are in the file at all.
    const needed = [];
    if (/<motion\.|motion\./.test(content)) needed.push('motion');
    if (/<AnimatePresence|<\/AnimatePresence/.test(content)) needed.push('AnimatePresence');
    if (/useAnimation\(/.test(content)) needed.push('useAnimation');
    if (/useMotionValue\(/.test(content)) needed.push('useMotionValue');
    if (/useTransform\(/.test(content)) needed.push('useTransform');
    if (/useSpring\(/.test(content)) needed.push('useSpring');

    if (needed.length > 0) {
        // Detect existing import
        const importRegex = /import\s+{([^}]+)}\s+from\s+['"]framer-motion['"]/;
        const match = content.match(importRegex);

        let existingImports = [];
        if (match) {
            existingImports = match[1].split(',').map(s => s.trim());
        }

        const missing = needed.filter(n => !existingImports.includes(n));

        if (missing.length > 0) {
            if (match) {
                // replace existing import
                const newImports = [...new Set([...existingImports, ...missing])].join(', ');
                content = content.replace(importRegex, `import { ${newImports} } from 'framer-motion'`);
                fs.writeFileSync(file, content);
                fixedCount++;
                console.log('Fixed', file, 'added:', missing);
            } else {
                // add new import at top, after react imports or just top
                const newImport = `import { ${needed.join(', ')} } from 'framer-motion';\n`;

                // insert after the last import, or at the top
                const lines = content.split('\n');
                let lastImportLineIndex = -1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim().startsWith('import ')) {
                        lastImportLineIndex = i;
                    }
                }

                if (lastImportLineIndex !== -1) {
                    lines.splice(lastImportLineIndex + 1, 0, newImport);
                    content = lines.join('\n');
                } else {
                    content = newImport + content;
                }

                fs.writeFileSync(file, content);
                fixedCount++;
                console.log('Added import to', file, ':', needed);
            }
        }
    }
});
console.log('Total fixed files:', fixedCount);

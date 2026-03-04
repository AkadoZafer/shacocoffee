const fs = require('fs');
const path = require('path');

// Recursively walk through directories
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

// Map of JSX usage patterns -> { library, importName }
const USAGE_RULES = [
    // react-router-dom
    { pattern: /<Outlet\s|<Outlet\/|<Outlet>/, lib: 'react-router-dom', name: 'Outlet' },
    { pattern: /<Link\s|<Link\/|<Link>/, lib: 'react-router-dom', name: 'Link' },
    { pattern: /<NavLink\s|<NavLink\/|<NavLink>/, lib: 'react-router-dom', name: 'NavLink' },
    { pattern: /<Navigate\s|<Navigate\/|<Navigate>/, lib: 'react-router-dom', name: 'Navigate' },
    { pattern: /useNavigate\(/, lib: 'react-router-dom', name: 'useNavigate' },
    { pattern: /useParams\(/, lib: 'react-router-dom', name: 'useParams' },
    { pattern: /useLocation\(/, lib: 'react-router-dom', name: 'useLocation' },
    { pattern: /useSearchParams\(/, lib: 'react-router-dom', name: 'useSearchParams' },

    // framer-motion
    { pattern: /<motion\.|motion\./, lib: 'framer-motion', name: 'motion' },
    { pattern: /<AnimatePresence|<\/AnimatePresence/, lib: 'framer-motion', name: 'AnimatePresence' },
    { pattern: /useAnimation\(/, lib: 'framer-motion', name: 'useAnimation' },
    { pattern: /useMotionValue\(/, lib: 'framer-motion', name: 'useMotionValue' },
    { pattern: /useTransform\(/, lib: 'framer-motion', name: 'useTransform' },
    { pattern: /useSpring\(/, lib: 'framer-motion', name: 'useSpring' },

    // lucide-react (common icons)
    { pattern: /<ArrowLeft\s|<ArrowLeft\/|<ArrowLeft>/, lib: 'lucide-react', name: 'ArrowLeft' },
    { pattern: /<ArrowRight\s|<ArrowRight\/|<ArrowRight>/, lib: 'lucide-react', name: 'ArrowRight' },
    { pattern: /<ChevronLeft\s|<ChevronLeft\/|<ChevronLeft>/, lib: 'lucide-react', name: 'ChevronLeft' },
    { pattern: /<ChevronRight\s|<ChevronRight\/|<ChevronRight>/, lib: 'lucide-react', name: 'ChevronRight' },
    { pattern: /<ChevronDown\s|<ChevronDown\/|<ChevronDown>/, lib: 'lucide-react', name: 'ChevronDown' },
    { pattern: /<ChevronUp\s|<ChevronUp\/|<ChevronUp>/, lib: 'lucide-react', name: 'ChevronUp' },
    { pattern: /<Check\s|<Check\/|<Check>/, lib: 'lucide-react', name: 'Check' },
    { pattern: /<CheckCircle\s|<CheckCircle\/|<CheckCircle>/, lib: 'lucide-react', name: 'CheckCircle' },
    { pattern: /<AlertCircle\s|<AlertCircle\/|<AlertCircle>/, lib: 'lucide-react', name: 'AlertCircle' },
    { pattern: /<AlertTriangle\s|<AlertTriangle\/|<AlertTriangle>/, lib: 'lucide-react', name: 'AlertTriangle' },
    { pattern: /<Info\s|<Info\/|<Info>/, lib: 'lucide-react', name: 'Info' },
    { pattern: /<X\s|<X\/|<X>/, lib: 'lucide-react', name: 'X' },
    { pattern: /<Search\s|<Search\/|<Search>/, lib: 'lucide-react', name: 'Search' },
    { pattern: /<Home\s|<Home\/|<Home>/, lib: 'lucide-react', name: 'Home' },
    { pattern: /<Heart\s|<Heart\/|<Heart>/, lib: 'lucide-react', name: 'Heart' },
    { pattern: /<Star\s|<Star\/|<Star>/, lib: 'lucide-react', name: 'Star' },
    { pattern: /<Phone\s|<Phone\/|<Phone>/, lib: 'lucide-react', name: 'Phone' },
    { pattern: /<Mail\s|<Mail\/|<Mail>/, lib: 'lucide-react', name: 'Mail' },
    { pattern: /<MapPin\s|<MapPin\/|<MapPin>/, lib: 'lucide-react', name: 'MapPin' },
    { pattern: /<Clock\s|<Clock\/|<Clock>/, lib: 'lucide-react', name: 'Clock' },
    { pattern: /<Settings\s|<Settings\/|<Settings>/, lib: 'lucide-react', name: 'Settings' },
    { pattern: /<User\s|<User\/|<User>/, lib: 'lucide-react', name: 'User' },
    { pattern: /<LogOut\s|<LogOut\/|<LogOut>/, lib: 'lucide-react', name: 'LogOut' },
    { pattern: /<Trash2\s|<Trash2\/|<Trash2>/, lib: 'lucide-react', name: 'Trash2' },
    { pattern: /<Edit\s|<Edit\/|<Edit>/, lib: 'lucide-react', name: 'Edit' },
    { pattern: /<Eye\s|<Eye\/|<Eye>/, lib: 'lucide-react', name: 'Eye' },
    { pattern: /<EyeOff\s|<EyeOff\/|<EyeOff>/, lib: 'lucide-react', name: 'EyeOff' },
    { pattern: /<Plus\s|<Plus\/|<Plus>/, lib: 'lucide-react', name: 'Plus' },
    { pattern: /<Minus\s|<Minus\/|<Minus>/, lib: 'lucide-react', name: 'Minus' },
    { pattern: /<ShoppingCart\s|<ShoppingCart\/|<ShoppingCart>/, lib: 'lucide-react', name: 'ShoppingCart' },
    { pattern: /<ShoppingBag\s|<ShoppingBag\/|<ShoppingBag>/, lib: 'lucide-react', name: 'ShoppingBag' },
    { pattern: /<Gift\s|<Gift\/|<Gift>/, lib: 'lucide-react', name: 'Gift' },
    { pattern: /<Wallet\s|<Wallet\/|<Wallet>/, lib: 'lucide-react', name: 'Wallet' },
    { pattern: /<CreditCard\s|<CreditCard\/|<CreditCard>/, lib: 'lucide-react', name: 'CreditCard' },
    { pattern: /<Copy\s|<Copy\/|<Copy>/, lib: 'lucide-react', name: 'Copy' },
    { pattern: /<Sun\s|<Sun\/|<Sun>/, lib: 'lucide-react', name: 'Sun' },
    { pattern: /<Moon\s|<Moon\/|<Moon>/, lib: 'lucide-react', name: 'Moon' },
    { pattern: /<Globe\s|<Globe\/|<Globe>/, lib: 'lucide-react', name: 'Globe' },
    { pattern: /<Bell\s|<Bell\/|<Bell>/, lib: 'lucide-react', name: 'Bell' },
    { pattern: /<Shield\s|<Shield\/|<Shield>/, lib: 'lucide-react', name: 'Shield' },
    { pattern: /<Lock\s|<Lock\/|<Lock>/, lib: 'lucide-react', name: 'Lock' },
    { pattern: /<Unlock\s|<Unlock\/|<Unlock>/, lib: 'lucide-react', name: 'Unlock' },
    { pattern: /<Coffee\s|<Coffee\/|<Coffee>/, lib: 'lucide-react', name: 'Coffee' },
    { pattern: /<Store\s|<Store\/|<Store>/, lib: 'lucide-react', name: 'Store' },
    { pattern: /<QrCode\s|<QrCode\/|<QrCode>/, lib: 'lucide-react', name: 'QrCode' },
    { pattern: /<Sparkles\s|<Sparkles\/|<Sparkles>/, lib: 'lucide-react', name: 'Sparkles' },
    { pattern: /<Flame\s|<Flame\/|<Flame>/, lib: 'lucide-react', name: 'Flame' },
    { pattern: /<Tag\s|<Tag\/|<Tag>/, lib: 'lucide-react', name: 'Tag' },
    { pattern: /<Ticket\s|<Ticket\/|<Ticket>/, lib: 'lucide-react', name: 'Ticket' },
    { pattern: /<ExternalLink\s|<ExternalLink\/|<ExternalLink>/, lib: 'lucide-react', name: 'ExternalLink' },
    { pattern: /<Share2\s|<Share2\/|<Share2>/, lib: 'lucide-react', name: 'Share2' },
    { pattern: /<Navigation\s|<Navigation\/|<Navigation>/, lib: 'lucide-react', name: 'Navigation' },
    { pattern: /<MapPinOff\s|<MapPinOff\/|<MapPinOff>/, lib: 'lucide-react', name: 'MapPinOff' },
    { pattern: /<Loader\s|<Loader\/|<Loader>/, lib: 'lucide-react', name: 'Loader' },
    { pattern: /<RefreshCw\s|<RefreshCw\/|<RefreshCw>/, lib: 'lucide-react', name: 'RefreshCw' },
    { pattern: /<Package\s|<Package\/|<Package>/, lib: 'lucide-react', name: 'Package' },
    { pattern: /<Percent\s|<Percent\/|<Percent>/, lib: 'lucide-react', name: 'Percent' },
    { pattern: /<Camera\s|<Camera\/|<Camera>/, lib: 'lucide-react', name: 'Camera' },
    { pattern: /<Image\s|<Image\/|<Image>/, lib: 'lucide-react', name: 'Image' },
    { pattern: /<Wifi\s|<Wifi\/|<Wifi>/, lib: 'lucide-react', name: 'Wifi' },
    { pattern: /<WifiOff\s|<WifiOff\/|<WifiOff>/, lib: 'lucide-react', name: 'WifiOff' },
    { pattern: /<MoreVertical\s|<MoreVertical\/|<MoreVertical>/, lib: 'lucide-react', name: 'MoreVertical' },
    { pattern: /<MoreHorizontal\s|<MoreHorizontal\/|<MoreHorizontal>/, lib: 'lucide-react', name: 'MoreHorizontal' },
    { pattern: /<Receipt\s|<Receipt\/|<Receipt>/, lib: 'lucide-react', name: 'Receipt' },
    { pattern: /<Crown\s|<Crown\/|<Crown>/, lib: 'lucide-react', name: 'Crown' },
    { pattern: /<Gem\s|<Gem\/|<Gem>/, lib: 'lucide-react', name: 'Gem' },
    { pattern: /<Award\s|<Award\/|<Award>/, lib: 'lucide-react', name: 'Award' },
    { pattern: /<TrendingUp\s|<TrendingUp\/|<TrendingUp>/, lib: 'lucide-react', name: 'TrendingUp' },
    { pattern: /<TrendingDown\s|<TrendingDown\/|<TrendingDown>/, lib: 'lucide-react', name: 'TrendingDown' },
    { pattern: /<Zap\s|<Zap\/|<Zap>/, lib: 'lucide-react', name: 'Zap' },
    { pattern: /<Filter\s|<Filter\/|<Filter>/, lib: 'lucide-react', name: 'Filter' },
    { pattern: /<SortAsc\s|<SortAsc\/|<SortAsc>/, lib: 'lucide-react', name: 'SortAsc' },
    { pattern: /<SortDesc\s|<SortDesc\/|<SortDesc>/, lib: 'lucide-react', name: 'SortDesc' },
    { pattern: /<Bookmark\s|<Bookmark\/|<Bookmark>/, lib: 'lucide-react', name: 'Bookmark' },
    { pattern: /<MessageCircle\s|<MessageCircle\/|<MessageCircle>/, lib: 'lucide-react', name: 'MessageCircle' },
    { pattern: /<Send\s|<Send\/|<Send>/, lib: 'lucide-react', name: 'Send' },
    { pattern: /<Instagram\s|<Instagram\/|<Instagram>/, lib: 'lucide-react', name: 'Instagram' },
    { pattern: /<Twitter\s|<Twitter\/|<Twitter>/, lib: 'lucide-react', name: 'Twitter' },
    { pattern: /<Facebook\s|<Facebook\/|<Facebook>/, lib: 'lucide-react', name: 'Facebook' },
    { pattern: /<Youtube\s|<Youtube\/|<Youtube>/, lib: 'lucide-react', name: 'Youtube' },
    { pattern: /<Linkedin\s|<Linkedin\/|<Linkedin>/, lib: 'lucide-react', name: 'Linkedin' },
    { pattern: /<Github\s|<Github\/|<Github>/, lib: 'lucide-react', name: 'Github' },
    { pattern: /<History\s|<History\/|<History>/, lib: 'lucide-react', name: 'History' },
    { pattern: /<Calendar\s|<Calendar\/|<Calendar>/, lib: 'lucide-react', name: 'Calendar' },
    { pattern: /<FileText\s|<FileText\/|<FileText>/, lib: 'lucide-react', name: 'FileText' },
    { pattern: /<Download\s|<Download\/|<Download>/, lib: 'lucide-react', name: 'Download' },
    { pattern: /<Upload\s|<Upload\/|<Upload>/, lib: 'lucide-react', name: 'Upload' },
    { pattern: /<RotateCcw\s|<RotateCcw\/|<RotateCcw>/, lib: 'lucide-react', name: 'RotateCcw' },
    { pattern: /<Volume2\s|<Volume2\/|<Volume2>/, lib: 'lucide-react', name: 'Volume2' },
    { pattern: /<VolumeX\s|<VolumeX\/|<VolumeX>/, lib: 'lucide-react', name: 'VolumeX' },
];

const files = walk('./src');
let totalFixed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Group needed imports by library
    const neededByLib = {};

    USAGE_RULES.forEach(rule => {
        if (rule.pattern.test(content)) {
            if (!neededByLib[rule.lib]) neededByLib[rule.lib] = [];
            if (!neededByLib[rule.lib].includes(rule.name)) {
                neededByLib[rule.lib].push(rule.name);
            }
        }
    });

    // For each library, check if import exists and has all needed names
    Object.keys(neededByLib).forEach(lib => {
        const needed = neededByLib[lib];
        const importRegex = new RegExp(`import\\s+{([^}]+)}\\s+from\\s+['"]${lib.replace('/', '\\/')}['"]`);
        const match = content.match(importRegex);

        let existingImports = [];
        if (match) {
            existingImports = match[1].split(',').map(s => s.trim()).filter(Boolean);
        }

        const missing = needed.filter(n => !existingImports.includes(n));

        if (missing.length > 0) {
            if (match) {
                // Extend existing import
                const newImports = [...new Set([...existingImports, ...missing])].join(', ');
                content = content.replace(importRegex, `import { ${newImports} } from '${lib}'`);
                modified = true;
                console.log(`[FIXED] ${file} -> ${lib}: added [${missing.join(', ')}]`);
            } else {
                // Add new import line after last import
                const importLine = `import { ${needed.join(', ')} } from '${lib}';\n`;
                const lines = content.split('\n');
                let lastImportLineIndex = -1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim().startsWith('import ')) {
                        lastImportLineIndex = i;
                    }
                }
                if (lastImportLineIndex !== -1) {
                    lines.splice(lastImportLineIndex + 1, 0, importLine);
                    content = lines.join('\n');
                } else {
                    content = importLine + content;
                }
                modified = true;
                console.log(`[ADDED] ${file} -> ${lib}: [${needed.join(', ')}]`);
            }
        }
    });

    if (modified) {
        fs.writeFileSync(file, content);
        totalFixed++;
    }
});
console.log(`\n✅ Total files fixed: ${totalFixed}`);

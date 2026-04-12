const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                processDir(fullPath);
            }
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    let original = content;

    // 1. Clean Custom Tailwind Classes replacing them with Inline ones
    content = content.replace(/\bbtn-premium\b/g, 'relative overflow-hidden bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-95 transition-all duration-300 rounded-2xl');

    content = content.replace(/\bbtn-gold-animated\b/g, 'relative overflow-hidden bg-linear-to-r from-amber-500 via-orange-500 to-amber-500 text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-95 transition-all duration-300 rounded-2xl');

    // 2. Replace Custom old theme variables 
    content = content.replace(/\bfrom-navy\b/g, 'from-slate-900');
    content = content.replace(/\bto-navy\b/g, 'to-slate-900');
    content = content.replace(/\bbg-navy\b/g, 'bg-slate-900');
    content = content.replace(/\btext-navy\b/g, 'text-slate-900');
    content = content.replace(/\bshadow-navy(?=\/|\b)/g, 'shadow-slate-900');

    content = content.replace(/\bfrom-gold\b/g, 'from-amber-500');
    content = content.replace(/\bto-gold\b/g, 'to-amber-500');
    content = content.replace(/\bbg-gold\b/g, 'bg-amber-500');
    content = content.replace(/\btext-gold\b/g, 'text-amber-500');
    content = content.replace(/\bshadow-gold(?=\/|\b)/g, 'shadow-amber-500');

    content = content.replace(/text-slate(?!\-)/g, 'text-slate-500');
    content = content.replace(/bg-slate(?!\-)/g, 'bg-slate-500');
    content = content.replace(/border-slate(?!\-)/g, 'border-slate-500');
    content = content.replace(/text-slate-light/g, 'text-slate-400');
    content = content.replace(/text-slate-dark/g, 'text-slate-700');

    content = content.replace(/\bbg-success\b/g, 'bg-emerald-500');
    content = content.replace(/\btext-success\b/g, 'text-emerald-500');
    content = content.replace(/\bbg-danger\b/g, 'bg-red-500');
    content = content.replace(/\btext-danger\b/g, 'text-red-500');

    // 3. Fix weird corruption issues (-slate-900 etc.)
    // Simple heuristic: if it contains text-white, it's likely a background
    content = content.replace(/ -slate-900 text-white/g, ' bg-slate-900 text-white');
    content = content.replace(/"-slate-900 text-white/g, '"bg-slate-900 text-white');
    content = content.replace(/h-full -slate-900/g, 'h-full bg-slate-900');
    content = content.replace(/w-(\d+)\s+h-(\d+)[^"]*-slate-900/g, (m) => m.replace('-slate-900', 'bg-slate-900'));
    content = content.replace(/w-(\d+)\s+h-(\d+)[^"]*-amber-500/g, (m) => m.replace('-amber-500', 'bg-amber-500'));
    content = content.replace(/w-(\d+)\s+h-(\d+)[^"]*-emerald-500/g, (m) => m.replace('-emerald-500', 'bg-emerald-500'));
    
    // Convert remaining -color to text-color
    content = content.replace(/(\s|")-slate-900/g, '$1text-slate-900');
    content = content.replace(/(\s|")-amber-500/g, '$1text-amber-500');
    content = content.replace(/(\s|")-red-500/g, '$1text-red-500');
    content = content.replace(/(\s|")-emerald-500/g, '$1text-emerald-500');
    
    // Fix focus:-amber-500/20 and focus:-amber-500
    content = content.replace(/focus:text-amber-500\/20/g, 'focus:ring-amber-500/20');
    content = content.replace(/focus:text-amber-500/g, 'focus:border-amber-500');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

processDir(path.join(__dirname, 'components'));
processDir(path.join(__dirname, 'app'));

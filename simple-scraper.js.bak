// Simple scraper using native fetch (Node 18+) without cheerio
// Fetches raw HTML and saves it for manual inspection

const URLS = {
    main: 'https://nexolauncher.vercel.app/',
    wasm: 'https://nexolauncher.vercel.app/htmls/WASM-GC/Online/index.html',
    js: 'https://nexolauncher.vercel.app/htmls/JS/Offline/index.html'
};

import fs from 'fs/promises';
import path from 'path';

async function fetchAndSave(url, name) {
    console.log(`\n🔍 Fetching ${name}...`);
    console.log(`   URL: ${url}`);
    
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const html = await res.text();
        
        // Extract title using regex (no cheerio needed)
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'No title';
        
        // Extract description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i);
        const description = descMatch ? descMatch[1] : '';
        
        console.log(`   ✅ Title: ${title}`);
        console.log(`   📄 Size: ${html.length.toLocaleString()} bytes`);
        
        // Save to file
        const outputDir = './scraped_data';
        await fs.mkdir(outputDir, { recursive: true });
        
        const filepath = path.join(outputDir, `${name}.html`);
        await fs.writeFile(filepath, html, 'utf-8');
        
        console.log(`   💾 Saved to: ${filepath}`);
        
        // Extract script references
        const scriptMatches = [...html.matchAll(/<script[^>]*src=["']([^"']+)["']/g)];
        const inlineScripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
        
        // Extract link references
        const linkMatches = [...html.matchAll(/<link[^>]*href=["']([^"']+)["']/g)];
        
        console.log(`   📜 External scripts: ${scriptMatches.length}`);
        console.log(`   📜 Inline scripts: ${inlineScripts.length}`);
        console.log(`   🔗 Links: ${linkMatches.length}`);
        
        // Return metadata
        return {
            name,
            url,
            title,
            description,
            size: html.length,
            externalScripts: scriptMatches.map(m => m[1]),
            links: linkMatches.map(m => m[1]),
            html: html.substring(0, 2000) // Preview
        };
        
    } catch (error) {
        console.error(`   ❌ Error:`, error.message);
        return { name, url, error: error.message };
    }
}

async function main() {
    console.log('🚀 Simple Nexolauncher Scraper');
    console.log('='.repeat(50));
    
    const results = [];
    
    for (const [name, url] of Object.entries(URLS)) {
        const result = await fetchAndSave(url, name);
        results.push(result);
    }
    
    // Save summary
    const summaryPath = './scraped_data/summary.json';
    await fs.writeFile(
        summaryPath,
        JSON.stringify(results.map(r => ({ 
            name: r.name, 
            title: r.title, 
            size: r.size,
            externalScripts: r.externalScripts?.length || 0,
            links: r.links?.length || 0,
            error: r.error 
        })), null, 2),
        'utf-8'
    );
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 COMPLETE');
    console.log('='.repeat(50));
    console.log(`\nFiles saved to: ./scraped_data/`);
    console.log('  - main.html');
    console.log('  - wasm.html');
    console.log('  - js.html');
    console.log('  - summary.json');
}

main().catch(console.error);

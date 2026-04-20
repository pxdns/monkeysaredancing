import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

// URLs to scrape from nexolauncher
const URLS = {
    main: 'https://nexolauncher.vercel.app/',
    wasm: 'https://nexolauncher.vercel.app/htmls/WASM-GC/Online/index.html',
    js: 'https://nexolauncher.vercel.app/htmls/JS/Offline/index.html'
};

async function scrapePage(url, name) {
    console.log(`\n🔍 Scraping ${name}...`);
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
        const $ = cheerio.load(html);
        
        // Extract metadata
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        const ogTitle = $('meta[property="og:title"]').attr('content') || '';
        
        // Extract all scripts
        const scripts = [];
        $('script').each((i, el) => {
            const src = $(el).attr('src');
            const content = $(el).html();
            if (src) {
                scripts.push({ type: 'external', src });
            } else if (content && content.length > 100) {
                scripts.push({ type: 'inline', length: content.length, preview: content.substring(0, 200) });
            }
        });
        
        // Extract all links
        const links = [];
        $('link').each((i, el) => {
            const rel = $(el).attr('rel');
            const href = $(el).attr('href');
            if (href) {
                links.push({ rel, href });
            }
        });
        
        // Extract inline styles
        const styles = [];
        $('style').each((i, el) => {
            const content = $(el).html();
            if (content && content.length > 50) {
                styles.push({ length: content.length, preview: content.substring(0, 200) });
            }
        });
        
        // Look for Eaglercraft specific data
        const eaglerData = {
            hasEPK: html.includes('assets.epk') || html.includes('assets.epw'),
            hasWASM: html.includes('WebAssembly') || html.includes('.wasm'),
            hasJSPI: html.includes('WebAssembly.Suspending'),
            hasTeaVM: html.includes('teavm') || html.includes('TeaVM'),
            dbName: html.match(/indexedDB\.open\(['"]([^'"]+)/)?.[1] || null,
            localStorageKeys: [...html.matchAll(/localStorage\.(getItem|setItem)\(['"]([^'"]+)/g)].map(m => m[2]),
            relayServers: [...html.matchAll(/wss?:\/\/[^"'\s]+/g)].map(m => m[0]),
        };
        
        const result = {
            url,
            title,
            description,
            ogTitle,
            htmlLength: html.length,
            scripts: scripts.length,
            links: links.length,
            styles: styles.length,
            eaglerData,
            fullHtml: html.substring(0, 5000), // First 5000 chars for inspection
            rawHtml: html // Full HTML
        };
        
        console.log(`   ✅ Title: ${title}`);
        console.log(`   📄 HTML size: ${html.length.toLocaleString()} bytes`);
        console.log(`   📜 Scripts: ${scripts.length}`);
        console.log(`   🔗 Links: ${links.length}`);
        console.log(`   🎨 Styles: ${styles.length}`);
        console.log(`   🎮 EPK: ${eaglerData.hasEPK ? 'Yes' : 'No'}, WASM: ${eaglerData.hasWASM ? 'Yes' : 'No'}`);
        
        return result;
        
    } catch (error) {
        console.error(`   ❌ Error scraping ${name}:`, error.message);
        return { url, error: error.message };
    }
}

async function saveResults(results) {
    const outputDir = './scraped_data';
    await fs.mkdir(outputDir, { recursive: true });
    
    for (const [name, data] of Object.entries(results)) {
        if (data.error) continue;
        
        // Save full HTML
        await fs.writeFile(
            path.join(outputDir, `${name}_full.html`),
            data.rawHtml,
            'utf-8'
        );
        
        // Save metadata JSON
        const metadata = {
            url: data.url,
            title: data.title,
            description: data.description,
            ogTitle: data.ogTitle,
            htmlLength: data.htmlLength,
            scripts: data.scripts,
            links: data.links,
            styles: data.styles,
            eaglerData: data.eaglerData
        };
        
        await fs.writeFile(
            path.join(outputDir, `${name}_metadata.json`),
            JSON.stringify(metadata, null, 2),
            'utf-8'
        );
        
        console.log(`   💾 Saved to ${outputDir}/${name}_*`);
    }
}

async function extractAssets(results) {
    console.log('\n📦 Extracting asset references...');
    
    const assets = {
        jsFiles: new Set(),
        wasmFiles: new Set(),
        epkFiles: new Set(),
        images: new Set(),
        cssFiles: new Set()
    };
    
    for (const [name, data] of Object.entries(results)) {
        if (data.error || !data.rawHtml) continue;
        
        const html = data.rawHtml;
        
        // Extract JS files
        const jsMatches = html.matchAll(/src=["']([^"']+\.js)["']/g);
        for (const match of jsMatches) assets.jsFiles.add(match[1]);
        
        // Extract WASM files
        const wasmMatches = html.matchAll(/["']([^"']+\.wasm)["']/g);
        for (const match of wasmMatches) assets.wasmFiles.add(match[1]);
        
        // Extract EPK files
        const epkMatches = html.matchAll(/["']([^"']+\.epk)["']/g);
        for (const match of epkMatches) assets.epkFiles.add(match[1]);
        
        // Extract images
        const imgMatches = html.matchAll(/["']([^"']+\.(?:png|jpg|jpeg|gif|ico|svg))["']/g);
        for (const match of imgMatches) assets.images.add(match[1]);
        
        // Extract CSS
        const cssMatches = html.matchAll(/href=["']([^"']+\.css)["']/g);
        for (const match of cssMatches) assets.cssFiles.add(match[1]);
    }
    
    const assetReport = {
        jsFiles: [...assets.jsFiles],
        wasmFiles: [...assets.wasmFiles],
        epkFiles: [...assets.epkFiles],
        images: [...assets.images],
        cssFiles: [...assets.cssFiles]
    };
    
    await fs.writeFile(
        './scraped_data/assets.json',
        JSON.stringify(assetReport, null, 2),
        'utf-8'
    );
    
    console.log('   📜 JS files:', assets.jsFiles.size);
    console.log('   ⚙️  WASM files:', assets.wasmFiles.size);
    console.log('   📦 EPK files:', assets.epkFiles.size);
    console.log('   🖼️  Images:', assets.images.size);
    console.log('   🎨 CSS files:', assets.cssFiles.size);
    
    return assetReport;
}

// Main execution
async function main() {
    console.log('🚀 Nexolauncher Scraper Starting...');
    console.log('='.repeat(50));
    
    const results = {};
    
    for (const [name, url] of Object.entries(URLS)) {
        results[name] = await scrapePage(url, name);
    }
    
    // Save all results
    await saveResults(results);
    
    // Extract and save asset references
    await extractAssets(results);
    
    // Summary report
    console.log('\n' + '='.repeat(50));
    console.log('📊 SCRAPING COMPLETE');
    console.log('='.repeat(50));
    console.log(`\nData saved to: ./scraped_data/`);
    console.log('Files:');
    console.log('  - main_full.html / main_metadata.json');
    console.log('  - wasm_full.html / wasm_metadata.json');
    console.log('  - js_full.html / js_metadata.json');
    console.log('  - assets.json (all referenced assets)');
}

main().catch(console.error);

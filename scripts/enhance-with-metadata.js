#!/usr/bin/env node

const { writeFileSync, readFileSync, existsSync } = require('fs');
const { join } = require('path');
const https = require('https');

class DatasetEnhancer {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.huggingFaceDataset = null;
    this.titleToMetadata = new Map();
    this.idToMetadata = new Map(); // Add dedicated ID lookup
  }

  /**
   * Download and parse the HuggingFace dataset
   */
  async downloadHuggingFaceDataset() {
    console.log('Downloading HuggingFace dataset...');
    
    try {
      // Use the HuggingFace datasets API to get the real data
      const apiUrl = 'https://datasets-server.huggingface.co/first-rows?dataset=whiskwhite%2Fleetcode-complete&config=default&split=train';
      
      console.log('Fetching real dataset from HuggingFace API...');
      const apiData = await this.fetchJsonData(apiUrl);
      
      if (apiData && apiData.rows) {
        console.log(`Downloaded ${apiData.rows.length} problems from real dataset`);
        
        // If we got limited rows, try to get more
        if (apiData.rows.length < 100) {
          console.log('Limited rows returned, attempting to download full dataset...');
          const fullData = await this.downloadDatasetChunks();
          if (fullData.length > apiData.rows.length) {
            return fullData;
          }
        }
        
        return apiData.rows.map(item => item.row);
      } else {
        throw new Error('API response not in expected format');
      }
      
    } catch (error) {
      console.error('Failed to download real HuggingFace dataset:', error);
      throw new Error('Cannot proceed without real dataset. Please check HuggingFace API access or dataset availability.');
    }
  }

  /**
   * Fetch JSON data from URL
   */
  fetchJsonData(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        });
        
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Download dataset in chunks to get complete real data
   */
  async downloadDatasetChunks() {
    console.log('Downloading complete dataset in chunks...');
    const allRows = [];
    let offset = 0;
    const chunkSize = 100; // Smaller chunks for more reliable downloads
    let hasMore = true;
    
    while (hasMore && offset < 3000) { // LeetCode has ~3000 problems
      try {
        const url = `https://datasets-server.huggingface.co/rows?dataset=whiskwhite%2Fleetcode-complete&config=default&split=train&offset=${offset}&length=${chunkSize}`;
        const data = await this.fetchJsonData(url);
        
        if (data && data.rows && data.rows.length > 0) {
          allRows.push(...data.rows.map(row => row.row));
          offset += data.rows.length;
          console.log(`Downloaded ${allRows.length} problems so far...`);
          
          if (data.rows.length < chunkSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
        
        // Small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error downloading chunk at offset ${offset}:`, error);
        // Don't give up immediately, try a few more times
        if (offset === 0) {
          throw new Error('Cannot download any data from HuggingFace dataset');
        }
        hasMore = false;
      }
    }
    
    if (allRows.length === 0) {
      throw new Error('Failed to download any real data from HuggingFace dataset');
    }
    
    console.log(`Successfully downloaded ${allRows.length} real problems from HuggingFace`);
    return allRows;
  }

  /**
   * Build a mapping from problem titles and IDs to metadata
   */
  buildTitleMapping() {
    console.log('Building title and ID mapping...');
    
    for (const problem of this.huggingFaceDataset) {
      // Extract TypeScript code snippet
      const tsCodeSnippet = problem.code_snippets?.find(snippet => 
        snippet.lang === 'typescript'
      );
      
      if (tsCodeSnippet) {
        const metadata = {
          id: problem.id,
          title: problem.title,
          title_slug: problem.title_slug,
          difficulty: problem.difficulty,
          content: problem.content,
          questionCode: tsCodeSnippet.code
        };

        // Primary ID-based mapping (most reliable)
        this.idToMetadata.set(problem.id, metadata);
        
        // Secondary title-based mappings for fallback
        const normalizedTitle = this.normalizeTitle(problem.title);
        this.titleToMetadata.set(normalizedTitle, metadata);
        
        // Also map by title_slug for better matching
        if (problem.title_slug) {
          this.titleToMetadata.set(problem.title_slug, metadata);
        }
      }
    }
    
    console.log(`Built ID mapping for ${this.idToMetadata.size} problems`);
    console.log(`Built title mapping for ${this.titleToMetadata.size} problems`);
  }

  /**
   * Normalize title for matching
   */
  normalizeTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract problem number and title from directory name
   */
  parseProblemDir(dirName) {
    const match = dirName.match(/^(\d+)-(.+)$/);
    if (match) {
      return {
        number: parseInt(match[1]),
        title: match[2].replace(/-/g, ' ')
      };
    }
    return null;
  }

  /**
   * Find metadata for a problem directory
   */
  findMetadata(problemDir) {
    const parsed = this.parseProblemDir(problemDir);
    if (!parsed) return null;

    // Strategy 1: PRIORITY - Direct ID lookup (fastest and most reliable)
    const metadata = this.idToMetadata.get(parsed.number);
    if (metadata) {
      console.log(`✓ Found by ID: ${problemDir} -> ${metadata.title} (ID: ${metadata.id})`);
      return metadata;
    }

    // Strategy 2: Fallback - Exact normalized title match
    const normalizedTitle = this.normalizeTitle(parsed.title);
    let titleMetadata = this.titleToMetadata.get(normalizedTitle);
    if (titleMetadata) {
      console.log(`✓ Found by title: ${problemDir} -> ${titleMetadata.title}`);
      return titleMetadata;
    }

    // Strategy 3: Last resort - Fuzzy title matching
    for (const [key, value] of this.titleToMetadata.entries()) {
      if (key.includes(normalizedTitle) || normalizedTitle.includes(key)) {
        console.log(`✓ Found by fuzzy: ${problemDir} -> ${value.title}`);
        return value;
      }
    }

    return null;
  }

  /**
   * Create questionCode.ts file for a problem
   */
  createQuestionCodeFile(problemDir, questionCode) {
    const problemPath = join(this.rootDir, problemDir);
    const questionCodePath = join(problemPath, 'questionCode.ts');
    
    // Remove trailing semicolon from function endings (more comprehensive)
    let cleanedCode = questionCode
      .replace(/};\s*$/, '}')  // Remove semicolon after closing brace at end
      .replace(/}\s*;\s*\n?\s*$/, '}'); // Remove semicolon after closing brace with potential newlines
    
    // Normalize all line endings to CRLF (Windows standard)
    cleanedCode = cleanedCode.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');
    
    // Ensure file ends with CRLF
    if (!cleanedCode.endsWith('\r\n')) {
      cleanedCode += '\r\n';
    }
    
    try {
      writeFileSync(questionCodePath, cleanedCode, 'utf-8');
      return true;
    } catch (error) {
      console.error(`Error writing questionCode.ts for ${problemDir}:`, error);
      return false;
    }
  }

  /**
   * Process all problem directories
   */
  async enhanceProblems() {
    console.log('Enhancing problems with question code...');
    
    const { readdirSync } = require('fs');
    const entries = readdirSync(this.rootDir, { withFileTypes: true });
    
    let enhancedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const problemPath = join(this.rootDir, entry.name);
        const noteFile = join(problemPath, 'Note.md');
        const answerFile = join(problemPath, 'answer.ts');
        const questionCodeFile = join(problemPath, 'questionCode.ts');
        
        // Check if this is a valid problem directory
        if (existsSync(noteFile) && existsSync(answerFile)) {
          // Always update questionCode.ts, don't skip existing files
          const metadata = this.findMetadata(entry.name);
          
          if (metadata && metadata.questionCode) {
            const success = this.createQuestionCodeFile(entry.name, metadata.questionCode);
            if (success) {
              const action = existsSync(questionCodeFile) ? 'Updated' : 'Created';
              console.log(`✓ ${action} ${entry.name}`);
              enhancedCount++;
            } else {
              errorCount++;
            }
          } else {
            console.log(`⚠ No metadata found for ${entry.name}`);
            notFoundCount++;
          }
        }
      }
    }

    console.log('\nEnhancement complete:');
    console.log(`✓ Enhanced: ${enhancedCount}`);
    console.log(`⚠ Not found: ${notFoundCount}`);
    console.log(`✗ Errors: ${errorCount}`);
  }

  /**
   * Main enhancement process
   */
  async enhance() {
    try {
      // Download and parse the HuggingFace dataset
      this.huggingFaceDataset = await this.downloadHuggingFaceDataset();
      
      // Build the title mapping
      this.buildTitleMapping();
      
      // Enhance all problems
      await this.enhanceProblems();
      
      console.log('Dataset enhancement completed successfully!');
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const rootDir = args[0] || process.cwd();
  
  console.log(`Enhancing dataset in: ${rootDir}`);
  
  try {
    const enhancer = new DatasetEnhancer(rootDir);
    await enhancer.enhance();
    process.exit(0);
  } catch (error) {
    console.error('Enhancement failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DatasetEnhancer };

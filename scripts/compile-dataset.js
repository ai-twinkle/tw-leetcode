#!/usr/bin/env node

const { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

class DatasetCompiler {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.problemDirs = [];
  }

  /**
   * Scan the root directory for problem folders
   */
  scanProblemDirs() {
    console.log('Scanning for problem directories...');
    
    const entries = readdirSync(this.rootDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const problemPath = join(this.rootDir, entry.name);
        const noteFile = join(problemPath, 'Note.md');
        const answerFile = join(problemPath, 'answer.ts');
        
        // Check if both Note.md and answer.ts exist
        if (existsSync(noteFile) && existsSync(answerFile)) {
          this.problemDirs.push(entry.name);
        }
      }
    }
    
    console.log(`Found ${this.problemDirs.length} problem directories`);
  }

  /**
   * Parse the Note.md file to extract question, constraints, thought, time_complexity, and space_complexity
   */
  parseNoteFile(notePath) {
    const content = readFileSync(notePath, 'utf-8');
    
    // Extract the main problem description (everything before "**Constraints:**")
    const questionMatch = content.match(/^(.*?)(?=\n\*\*Constraints:\*\*)/s);
    const question = questionMatch ? questionMatch[1].trim() : '';
    
    // Extract constraints (including header, from "**Constraints:**" to "## 基礎思路")
    const constraintsMatch = content.match(/(\*\*Constraints:\*\*.*?)(?=\n## 基礎思路)/s);
    const constraints = constraintsMatch ? constraintsMatch[1].trim() : '';
    
    // Extract the thought process (including header, from "## 基礎思路" to "## 時間複雜度")
    const thoughtMatch = content.match(/(## 基礎思路.*?)(?=\n## 時間複雜度)/s);
    const thought = thoughtMatch ? thoughtMatch[1].trim() : '';
    
    // Extract time complexity (including header, from "## 時間複雜度" to "## 空間複雜度")
    const timeComplexityMatch = content.match(/(## 時間複雜度.*?)(?=\n## 空間複雜度)/s);
    const time_complexity = timeComplexityMatch ? timeComplexityMatch[1].trim() : '';
    
    // Extract space complexity (including header, from "## 空間複雜度" onwards)
    const spaceComplexityMatch = content.match(/(## 空間複雜度.*)/s);
    const space_complexity = spaceComplexityMatch ? spaceComplexityMatch[1].trim() : '';
    
    return { content, question, constraints, thought, time_complexity, space_complexity };
  }

  /**
   * Parse the answer.ts file to extract the main function
   */
  parseAnswerFile(answerPath) {
    const content = readFileSync(answerPath, 'utf-8');
    
    // Remove any import statements and export statements
    let cleanContent = content
      .replace(/^import.*$/gm, '')
      .replace(/^export.*$/gm, '')
      .trim();
    
    return cleanContent;
  }

  /**
   * Parse the questionCode.ts file to extract the TypeScript starter code snippet
   */
  parseQuestionCodeFile(questionCodePath) {
    const content = readFileSync(questionCodePath, 'utf-8');
    
    // Return the content as-is since it's already a clean TypeScript function signature
    return content.trim();
  }

  /**
   * Compile a single problem into a dataset entry
   */
  compileProblem(problemDir) {
    try {
      console.log(`Processing: ${problemDir}`);
      
      const problemPath = join(this.rootDir, problemDir);
      const notePath = join(problemPath, 'Note.md');
      const answerPath = join(problemPath, 'answer.ts');
      const questionCodePath = join(problemPath, 'questionCode.ts');
      
      // Parse files
      const { content, question, constraints, thought, time_complexity, space_complexity } = this.parseNoteFile(notePath);
      const answer = this.parseAnswerFile(answerPath);
      
      // Parse questionCode - this is now required
      let questionCode = '';
      if (existsSync(questionCodePath)) {
        questionCode = this.parseQuestionCodeFile(questionCodePath);
      }
      
      // Use full raw content as the text field
      const text = content;
      
      return {
        text,
        question,
        constraints,
        thought,
        answer,
        questionCode,
        src: problemDir,
        time_complexity,
        space_complexity
      };
      
    } catch (error) {
      console.error(`Error processing ${problemDir}:`, error);
      return null;
    }
  }

  /**
   * Validate the compiled entry format
   */
  validateEntry(entry) {
    const requiredFields = ['text', 'question', 'constraints', 'thought', 'answer', 'questionCode', 'src', 'time_complexity', 'space_complexity'];
    
    for (const field of requiredFields) {
      if (!entry[field] || entry[field].trim() === '') {
        console.warn(`Entry ${entry.src} is missing or has empty field: ${field}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Sort entries by problem number
   */
  sortEntries(entries) {
    return entries.sort((a, b) => {
      const aNumber = parseInt(a.src.match(/^(\d+)-/)?.[1] || '0');
      const bNumber = parseInt(b.src.match(/^(\d+)-/)?.[1] || '0');
      return aNumber - bNumber;
    });
  }

  /**
   * Compile the entire dataset
   */
  async compile(options) {
    console.log('Starting dataset compilation...');
    
    // Scan for problem directories
    this.scanProblemDirs();
    
    if (this.problemDirs.length === 0) {
      throw new Error('No problem directories found');
    }
    
    // Compile each problem
    const entries = [];
    let successCount = 0;
    let failCount = 0;
    
    for (const problemDir of this.problemDirs) {
      const entry = this.compileProblem(problemDir);
      
      if (entry) {
        if (options.validateFormat && !this.validateEntry(entry)) {
          console.warn(`Skipping invalid entry: ${problemDir}`);
          failCount++;
          continue;
        }
        
        entries.push(entry);
        successCount++;
      } else {
        failCount++;
      }
    }
    
    console.log(`Compilation complete: ${successCount} successful, ${failCount} failed`);
    
    // Sort entries by problem number
    const sortedEntries = this.sortEntries(entries);
    
    // Ensure output directory exists
    const outputDir = dirname(options.outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // Write JSONL file
    const jsonlLines = sortedEntries.map(entry => JSON.stringify(entry));
    const jsonlContent = jsonlLines.join('\n');
    
    writeFileSync(options.outputPath, jsonlContent, 'utf-8');
    
    console.log(`Dataset compiled successfully!`);
    console.log(`Output: ${options.outputPath}`);
    console.log(`Total entries: ${sortedEntries.length}`);
    
    // Generate summary statistics
    this.generateSummary(sortedEntries, outputDir);
  }

  /**
   * Generate summary statistics
   */
  generateSummary(entries, outputDir) {
    const entriesWithQuestionCode = entries.filter(e => e.questionCode && e.questionCode.trim() !== '');
    
    const summary = {
      total_problems: entries.length,
      problems_with_question_code: entriesWithQuestionCode.length,
      compilation_date: new Date().toISOString(),
      problems_range: {
        min: Math.min(...entries.map(e => parseInt(e.src.match(/^(\d+)-/)?.[1] || '0'))),
        max: Math.max(...entries.map(e => parseInt(e.src.match(/^(\d+)-/)?.[1] || '0')))
      },
      average_text_length: Math.round(entries.reduce((sum, e) => sum + e.text.length, 0) / entries.length),
      average_answer_length: Math.round(entries.reduce((sum, e) => sum + e.answer.length, 0) / entries.length),
      average_question_code_length: entriesWithQuestionCode.length > 0 ? 
        Math.round(entriesWithQuestionCode.reduce((sum, e) => sum + e.questionCode.length, 0) / entriesWithQuestionCode.length) : 0
    };
    
    const summaryPath = join(outputDir, 'dataset_summary.json');
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
    
    console.log(`Summary saved to: ${summaryPath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const rootDir = args[0] || process.cwd();
  const outputPath = args[1] || join(rootDir, 'data', 'datasets.jsonl');
  
  // Ensure data directory exists
  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  const options = {
    outputPath,
    includeConstraints: true,
    validateFormat: true
  };
  
  try {
    const compiler = new DatasetCompiler(rootDir);
    await compiler.compile(options);
    process.exit(0);
  } catch (error) {
    console.error('Compilation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DatasetCompiler };

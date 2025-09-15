#!/usr/bin/env node

const { readFileSync, readdirSync, statSync } = require('fs');
const { join, basename } = require('path');

class CodeConsistencyVerifier {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.results = [];
  }

  /**
   * Extract function or class signature from TypeScript code
   * Handles both standalone functions and class-based problems
   */
  extractFunctionSignature(code, referenceFunction = null) {
    // Remove comments and clean up
    const cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').trim();
    
    // Find all function declarations first
    const functionMatches = [...cleanCode.matchAll(/function\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^{]+)/g)];
    
    // Check if this has classes
    const hasClass = cleanCode.includes('class ') && !cleanCode.includes('* class ');
    
    // If we have a reference function (from question), always try to find matching function first
    if (referenceFunction && referenceFunction.type !== 'class') {
      const exactMatch = functionMatches.find(match => match[1] === referenceFunction.name);
      if (exactMatch) {
        return this.parseFunctionMatch(exactMatch);
      }
    }
    
    // If no functions found, try class extraction
    if (functionMatches.length === 0) {
      if (hasClass) {
        const classSignature = this.extractClassSignature(cleanCode, referenceFunction?.name);
        if (classSignature) {
          return classSignature;
        }
      }
      return null;
    }

    // If only one function, return it (even if there are also classes)
    if (functionMatches.length === 1) {
      const match = functionMatches[0];
      return this.parseFunctionMatch(match);
    }

    // Multiple functions found - try to find the main one
    
    // Strategy 1: If we have a reference class, look for matching class
    if (referenceFunction && referenceFunction.type === 'class') {
      const classSignature = this.extractClassSignature(cleanCode, referenceFunction.name);
      if (classSignature && classSignature.name === referenceFunction.name) {
        return classSignature;
      }
    }

    // Strategy 2: Look for functions that don't start with common helper prefixes
    const mainFunctions = functionMatches.filter(match => {
      const name = match[1];
      return !name.match(/^(helper|build|ensure|generate|compute|acquire|initialize|devowel|parse|dfs|bfs|get|set)/i);
    });

    if (mainFunctions.length === 1) {
      return this.parseFunctionMatch(mainFunctions[0]);
    }

    // Strategy 3: Look for functions with names that match common LeetCode patterns
    const leetcodeFunctions = functionMatches.filter(match => {
      const name = match[1];
      return name.match(/^(count|find|max|min|is|can|has|check|solve|remove|add|merge|sort|search|judge|num|largest|smallest|closest|recover|lca)/i);
    });

    if (leetcodeFunctions.length >= 1) {
      return this.parseFunctionMatch(leetcodeFunctions[0]);
    }

    // Strategy 4: Return the first function (often the main exported function)
    return this.parseFunctionMatch(functionMatches[0]);
  }

  /**
   * Extract class signature including constructor and methods
   */
  extractClassSignature(cleanCode, referenceClassName = null) {
    // Find all class declarations
    const classMatches = [...cleanCode.matchAll(/class\s+(\w+)\s*\{/g)];
    
    if (classMatches.length === 0) {
      return null;
    }

    let targetClassMatch = null;
    
    // If we have a reference class name, try to find exact match first
    if (referenceClassName) {
      targetClassMatch = classMatches.find(match => match[1] === referenceClassName);
    }
    
    // If no reference match found, take the first class
    if (!targetClassMatch) {
      targetClassMatch = classMatches[0];
    }

    const className = targetClassMatch[1];
    
    // Find the class body for the target class
    let braceCount = 0;
    let classStart = cleanCode.indexOf(targetClassMatch[0]) + targetClassMatch[0].length;
    let classEnd = classStart;
    
    for (let i = classStart; i < cleanCode.length; i++) {
      if (cleanCode[i] === '{') {
        braceCount++;
      } else if (cleanCode[i] === '}') {
        braceCount--;
        if (braceCount < 0) {
          classEnd = i;
          break;
        }
      }
    }

    const classBody = cleanCode.substring(classStart, classEnd);

    // Extract constructor
    const constructorMatch = classBody.match(/constructor\s*\(([^)]*)\)/);
    const constructorParams = constructorMatch ? this.parseParameters(constructorMatch[1]) : [];

    // Extract all methods (excluding private methods)
    const methodMatches = [...classBody.matchAll(/(\w+)\s*\(([^)]*)\)\s*:\s*([^{;]+)/g)];
    const methods = methodMatches
      .filter(match => {
        const methodName = match[1];
        // Skip constructor and private methods
        if (methodName === 'constructor') return false;
        
        // Check if method is declared as private
        const methodStart = classBody.indexOf(match[0]);
        const beforeMethod = classBody.substring(Math.max(0, methodStart - 50), methodStart);
        if (beforeMethod.includes('private')) return false;
        
        return true;
      })
      .map(match => ({
        name: match[1],
        parameters: this.parseParameters(match[2]),
        returnType: match[3].trim()
      }));

    return {
      type: 'class',
      name: className,
      constructor: {
        parameters: constructorParams
      },
      methods: methods
    };
  }

  /**
   * Parse parameters from parameter string
   */
  parseParameters(paramString) {
    if (!paramString || paramString.trim() === '') {
      return [];
    }

    const parameters = [];
    const params = paramString.split(',').map(p => p.trim());
    
    for (const param of params) {
      const paramMatch = param.match(/(\w+)\s*:\s*(.+)/);
      if (paramMatch) {
        parameters.push({
          name: paramMatch[1],
          type: paramMatch[2].trim()
        });
      }
    }
    return parameters;
  }

  /**
   * Parse a function match into a signature object
   */
  parseFunctionMatch(match) {
    const name = match[1];
    const paramString = match[2].trim();
    const returnType = match[3].trim();

    const parameters = [];
    
    if (paramString) {
      const params = paramString.split(',').map(p => p.trim());
      for (const param of params) {
        const paramMatch = param.match(/(\w+)\s*:\s*(.+)/);
        if (paramMatch) {
          parameters.push({
            name: paramMatch[1],
            type: paramMatch[2].trim()
          });
        }
      }
    }

    return { name, parameters, returnType };
  }

  /**
   * Check if directory contains LeetCode problem
   */
  isLeetCodeDirectory(dirPath) {
    const dirName = basename(dirPath);
    try {
      return /^\d+/.test(dirName) && statSync(dirPath).isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify consistency between question and answer files
   */
  verifyDirectory(dirPath) {
    const dirName = basename(dirPath);
    const result = {
      directory: dirName,
      hasQuestionFile: false,
      hasAnswerFile: false,
      questionSignature: null,
      answerSignature: null,
      issues: []
    };

    const questionPath = join(dirPath, 'questionCode.ts');
    const answerPath = join(dirPath, 'answer.ts');

    // Check if files exist
    try {
      statSync(questionPath);
      result.hasQuestionFile = true;
    } catch (error) {
      // File doesn't exist
    }

    try {
      statSync(answerPath);
      result.hasAnswerFile = true;
    } catch (error) {
      // File doesn't exist
    }

    if (!result.hasQuestionFile && !result.hasAnswerFile) {
      result.issues.push('Neither questionCode.ts nor answer.ts found');
      return result;
    }

    if (!result.hasQuestionFile) {
      result.issues.push('Missing questionCode.ts file');
    }

    if (!result.hasAnswerFile) {
      result.issues.push('Missing answer.ts file');
    }

    // If both files exist, compare their signatures
    if (result.hasQuestionFile && result.hasAnswerFile) {
      try {
        const questionCode = readFileSync(questionPath, 'utf-8');
        const answerCode = readFileSync(answerPath, 'utf-8');

        result.questionSignature = this.extractFunctionSignature(questionCode);
        result.answerSignature = this.extractFunctionSignature(answerCode, result.questionSignature);

        // Compare function signatures
        if (!result.questionSignature) {
          result.issues.push('Could not extract function signature from questionCode.ts');
        }

        if (!result.answerSignature) {
          result.issues.push('Could not extract function signature from answer.ts');
        }

        if (result.questionSignature && result.answerSignature) {
          this.compareSignatures(result.questionSignature, result.answerSignature, result.issues);
        }

      } catch (error) {
        result.issues.push(`Error reading files: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Compare two signatures (function or class) for consistency
   */
  compareSignatures(question, answer, issues) {
    // Check if both are the same type (function vs class)
    const questionType = question.type || 'function';
    const answerType = answer.type || 'function';

    if (questionType !== answerType) {
      issues.push(`Signature type mismatch: question is ${questionType}, answer is ${answerType}`);
      return;
    }

    if (questionType === 'class') {
      this.compareClassSignatures(question, answer, issues);
    } else {
      this.compareFunctionSignatures(question, answer, issues);
    }
  }

  /**
   * Compare class signatures
   */
  compareClassSignatures(question, answer, issues) {
    // Check class names
    if (question.name !== answer.name) {
      issues.push(`Class name mismatch: question has '${question.name}', answer has '${answer.name}'`);
    }

    // Compare constructor parameters
    this.compareParameterLists(
      question.constructor.parameters,
      answer.constructor.parameters,
      issues,
      'Constructor'
    );

    // Compare methods
    const questionMethods = new Map(question.methods.map(m => [m.name, m]));
    const answerMethods = new Map(answer.methods.map(m => [m.name, m]));

    // Check for missing methods
    for (const [methodName, questionMethod] of questionMethods) {
      if (!answerMethods.has(methodName)) {
        issues.push(`Missing method in answer: '${methodName}'`);
      } else {
        const answerMethod = answerMethods.get(methodName);
        
        // Compare return types
        if (questionMethod.returnType !== answerMethod.returnType) {
          issues.push(`Method '${methodName}' return type mismatch: question has '${questionMethod.returnType}', answer has '${answerMethod.returnType}'`);
        }

        // Compare parameters
        this.compareParameterLists(
          questionMethod.parameters,
          answerMethod.parameters,
          issues,
          `Method '${methodName}'`
        );
      }
    }

    // Check for extra methods in answer
    for (const methodName of answerMethods.keys()) {
      if (!questionMethods.has(methodName)) {
        issues.push(`Extra method in answer: '${methodName}'`);
      }
    }
  }

  /**
   * Compare function signatures (original logic)
   */
  compareFunctionSignatures(question, answer, issues) {
    // Check function names
    if (question.name !== answer.name) {
      issues.push(`Function name mismatch: question has '${question.name}', answer has '${answer.name}'`);
    }

    // Check return types
    if (question.returnType !== answer.returnType) {
      issues.push(`Return type mismatch: question has '${question.returnType}', answer has '${answer.returnType}'`);
    }

    // Compare parameters
    this.compareParameterLists(question.parameters, answer.parameters, issues, 'Function');
  }

  /**
   * Compare parameter lists
   */
  compareParameterLists(questionParams, answerParams, issues, context) {
    // Check parameter count
    if (questionParams.length !== answerParams.length) {
      issues.push(`${context} parameter count mismatch: question has ${questionParams.length}, answer has ${answerParams.length}`);
      return;
    }

    // Check each parameter
    for (let i = 0; i < questionParams.length; i++) {
      const qParam = questionParams[i];
      const aParam = answerParams[i];

      if (qParam.name !== aParam.name) {
        issues.push(`${context} parameter ${i + 1} name mismatch: question has '${qParam.name}', answer has '${aParam.name}'`);
      }

      if (qParam.type !== aParam.type) {
        issues.push(`${context} parameter ${i + 1} type mismatch: question has '${qParam.type}', answer has '${aParam.type}'`);
      }
    }
  }

  /**
   * Main verification method
   */
  verifyAllDirectories() {
    console.log('🔍 Starting code consistency verification...\n');

    try {
      const items = readdirSync(this.rootDir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          const dirPath = join(this.rootDir, item.name);
          
          if (this.isLeetCodeDirectory(dirPath)) {
            const result = this.verifyDirectory(dirPath);
            this.results.push(result);
          }
        }
      }

      this.generateReport();
    } catch (error) {
      console.error('❌ Error during verification:', error.message);
      process.exit(1);
    }
  }

  /**
   * Extract problem ID from directory name for sorting
   */
  extractProblemId(directoryName) {
    const match = directoryName.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 999999; // Put non-numeric at end
  }

  /**
   * Generate and display verification report
   */
  generateReport() {
    console.log('📊 VERIFICATION REPORT');
    console.log('='.repeat(50));

    const totalDirectories = this.results.length;
    const directoriesWithIssues = this.results.filter(r => r.issues.length > 0);
    const directoriesWithoutFiles = this.results.filter(r => !r.hasQuestionFile || !r.hasAnswerFile);

    console.log(`Total LeetCode directories scanned: ${totalDirectories}`);
    console.log(`Directories with issues: ${directoriesWithIssues.length}`);
    console.log(`Directories missing files: ${directoriesWithoutFiles.length}`);
    console.log();

    if (directoriesWithIssues.length === 0) {
      console.log('✅ No consistency issues found! All function signatures match.');
      return;
    }

    console.log('❌ ISSUES FOUND (sorted by problem ID):');
    console.log('-'.repeat(30));

    // Sort directories with issues by problem ID
    const sortedIssues = directoriesWithIssues.sort((a, b) => {
      const idA = this.extractProblemId(a.directory);
      const idB = this.extractProblemId(b.directory);
      return idA - idB;
    });

    for (const result of sortedIssues) {
      console.log(`\n📁 ${result.directory}:`);
      
      for (const issue of result.issues) {
        console.log(`   • ${issue}`);
      }

      if (result.questionSignature && result.answerSignature) {
        if (result.questionSignature.type === 'class' && result.answerSignature.type === 'class') {
          console.log(`   Question: class ${result.questionSignature.name}`);
          console.log(`   Answer:   class ${result.answerSignature.name}`);
          
          // Show constructor if it has parameters
          if (result.questionSignature.constructor.parameters.length > 0) {
            const qConstructorParams = result.questionSignature.constructor.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
            const aConstructorParams = result.answerSignature.constructor.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
            console.log(`   Q Constructor: constructor(${qConstructorParams})`);
            console.log(`   A Constructor: constructor(${aConstructorParams})`);
          }
          
          // Show methods
          if (result.questionSignature.methods && result.questionSignature.methods.length > 0) {
            console.log(`   Methods: ${result.questionSignature.methods.map(m => m.name).join(', ')}`);
          }
        } else if (result.questionSignature.type !== 'class' && result.answerSignature.type !== 'class') {
          const qParams = result.questionSignature.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
          const aParams = result.answerSignature.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
          
          console.log(`   Question: function ${result.questionSignature.name}(${qParams}): ${result.questionSignature.returnType}`);
          console.log(`   Answer:   function ${result.answerSignature.name}(${aParams}): ${result.answerSignature.returnType}`);
        }
        // Mixed types are already reported as signature type mismatch in the issues
      }
    }

    console.log('\n📋 SUMMARY BY ISSUE TYPE:');
    console.log('-'.repeat(30));

    const issueTypes = new Map();
    for (const result of this.results) {
      for (const issue of result.issues) {
        const issueType = issue.split(':')[0];
        issueTypes.set(issueType, (issueTypes.get(issueType) || 0) + 1);
      }
    }

    for (const [issueType, count] of issueTypes) {
      console.log(`${issueType}: ${count} occurrences`);
    }

    console.log('\n✅ Verification complete!');
  }
}

// Main execution
function main() {
  const workspaceRoot = process.argv[2] || process.cwd();
  
  try {
    const verifier = new CodeConsistencyVerifier(workspaceRoot);
    verifier.verifyAllDirectories();
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { CodeConsistencyVerifier };
// Test script for Anthropic Thinking Protocol integration

import { AnthropicThinkingProtocol } from './analytics/anthropicThinkingProtocol.js';
import { PromptAnalyzer, PromptContext } from './analytics/promptAnalyzer.js';
import chalk from 'chalk';

// Sample thought with raw thinking
const thoughtWithRawThinking = `
\`\`\`thinking
Let me think about this problem step by step. First, I need to understand what's being asked.
The user wants me to implement a feature that allows for better reasoning through structured thinking.
I should consider multiple approaches to this problem. One approach would be to use a template-based system.
Another approach would be to use a more dynamic system that adapts to the specific problem.
I think the second approach is better because it's more flexible.
Let me verify this by considering some edge cases...
\`\`\`

Based on my analysis, I recommend implementing the Anthropic Thinking Protocol to enhance reasoning capabilities.
`;

// Sample thought without raw thinking
const thoughtWithoutRawThinking = `
I recommend implementing the Anthropic Thinking Protocol to enhance reasoning capabilities.
This will allow for better structured thinking and improved reasoning.
`;

// Sample prompt metadata
const promptMetadata = {
  originalPrompt: 'Implement the Anthropic Thinking Protocol to enhance reasoning capabilities',
  taskType: 'analytical' as 'analytical',
  complexity: 'complex' as 'complex',
  goals: ['Implement Anthropic Thinking Protocol', 'Enhance reasoning capabilities'],
  constraints: ['Must be compatible with existing system'],
  domains: ['AI', 'Reasoning', 'Cognitive Science'],
  priority: 'high' as 'high', // Type assertion to ensure it's the literal type
  keywords: ['thinking', 'protocol', 'reasoning', 'anthropic'],
  entities: ['Anthropic', 'Thinking Protocol'],
  sentiment: {
    sentiment: 'neutral' as 'neutral',
    intensity: 0.5,
    emotionalTone: ['analytical'],
    urgency: 'medium' as 'medium'
  },
  intent: {
    primaryIntent: 'create_content',
    secondaryIntents: ['improve_content'],
    confidence: 0.8,
    actionOriented: true
  }
};

// Create instances of required components
const anthropicThinkingProtocol = new AnthropicThinkingProtocol();
const promptContext = new PromptContext();
promptContext.initializeWithPrompt('Implement the Anthropic Thinking Protocol', new PromptAnalyzer(promptContext));

// Test function
async function testAnthropicThinkingProtocol() {
  console.log(chalk.cyan('Testing Anthropic Thinking Protocol Integration'));
  console.log(chalk.cyan('==========================================='));
  
  // Test 1: Process thought with raw thinking
  console.log(chalk.magenta('\nTest 1: Processing thought with raw thinking'));
  const result1 = anthropicThinkingProtocol.applyThinkingProtocol(thoughtWithRawThinking, promptMetadata);
  
  console.log(chalk.cyan('Raw Thinking Extracted:'), result1.rawThinking ? 'Yes' : 'No');
  console.log(chalk.cyan('Raw Thinking:'), result1.rawThinking);
  console.log(chalk.cyan('Structured Thinking Components:'));
  console.log(`  Initial Engagement: ${result1.structuredThinking.initialEngagement ? '✓' : '✗'}`);
  console.log(`  Problem Analysis: ${result1.structuredThinking.problemAnalysis ? '✓' : '✗'}`);
  console.log(`  Multiple Hypotheses: ${result1.structuredThinking.multipleHypotheses.length > 0 ? '✓' : '✗'} (${result1.structuredThinking.multipleHypotheses.length})`);
  console.log(`  Testing & Verification: ${result1.structuredThinking.testingAndVerification ? '✓' : '✗'}`);
  console.log(`  Knowledge Synthesis: ${result1.structuredThinking.knowledgeSynthesis ? '✓' : '✗'}`);
  
  // Test 2: Process thought without raw thinking
  console.log(chalk.magenta('\nTest 2: Processing thought without raw thinking'));
  const result2 = anthropicThinkingProtocol.applyThinkingProtocol(thoughtWithoutRawThinking, promptMetadata);
  
  console.log(chalk.cyan('Raw Thinking Extracted:'), result2.rawThinking ? 'Yes' : 'No');
  console.log(chalk.cyan('Structured Thinking Components:'));
  console.log(`  Initial Engagement: ${result2.structuredThinking.initialEngagement ? '✓' : '✗'}`);
  console.log(`  Problem Analysis: ${result2.structuredThinking.problemAnalysis ? '✓' : '✗'}`);
  console.log(`  Multiple Hypotheses: ${result2.structuredThinking.multipleHypotheses.length > 0 ? '✓' : '✗'} (${result2.structuredThinking.multipleHypotheses.length})`);
  console.log(`  Testing & Verification: ${result2.structuredThinking.testingAndVerification ? '✓' : '✗'}`);
  console.log(`  Knowledge Synthesis: ${result2.structuredThinking.knowledgeSynthesis ? '✓' : '✗'}`);
  
  // Test 3: Generate thinking protocol template
  console.log(chalk.magenta('\nTest 3: Generating thinking protocol template'));
  const template = anthropicThinkingProtocol.generateThinkingProtocolTemplate(promptMetadata);
  console.log(chalk.cyan('Template Generated:'), template ? 'Yes' : 'No');
  console.log(chalk.cyan('Template Length:'), template.length);
  console.log(chalk.cyan('Template Contains Task-Specific Guidance:'), template.includes('analytical_task_guidance') ? 'Yes' : 'No');
  console.log(chalk.cyan('Template Contains Complexity-Specific Guidance:'), template.includes('complex_task_guidance') ? 'Yes' : 'No');
  
  console.log(chalk.green('\nAll tests completed successfully!'));
}

// Run the test
testAnthropicThinkingProtocol().catch(error => {
  console.error(chalk.red('Error running tests:'), error);
});
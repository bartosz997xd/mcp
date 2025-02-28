// PromptAnalyzer.ts
// This component is responsible for analyzing prompts to extract key information
// and track alignment between thoughts and the original prompt.
export class PromptAnalyzer {
    promptContext;
    constructor(promptContext) {
        this.promptContext = promptContext;
    }
    /**
     * Analyzes a prompt to extract key information (optimized for token efficiency)
     * @param prompt The user's original prompt
     * @returns PromptMetadata object with extracted information
     */
    analyzePrompt(prompt) {
        // Extract goals from the prompt - limit to top 2 goals
        const goals = this.extractGoals(prompt).slice(0, 2);
        // Extract constraints from the prompt - limit to top 2 constraints
        const constraints = this.extractConstraints(prompt).slice(0, 2);
        // Extract knowledge domains - limit to top 2 domains
        const domains = this.extractDomains(prompt).slice(0, 2);
        // Extract expected output format
        const expectedOutputFormat = this.extractOutputFormat(prompt);
        // Determine priority
        const priority = this.determinePriority(prompt);
        // Estimate complexity
        const complexity = this.estimateComplexity(prompt);
        // Extract keywords - limit to top 5 keywords
        const keywords = this.extractKeywords(prompt).slice(0, 5);
        // Extract entities - limit to top 3 entities
        const entities = this.extractEntities(prompt).slice(0, 3);
        // Determine task type
        const taskType = this.determineTaskType(prompt);
        // Simplified sentiment analysis
        const sentiment = {
            sentiment: this.analyzeSentiment(prompt).sentiment,
            intensity: this.analyzeSentiment(prompt).intensity,
            emotionalTone: this.analyzeSentiment(prompt).emotionalTone.slice(0, 1), // Limit to top 1
            urgency: this.analyzeSentiment(prompt).urgency
        };
        // Simplified intent classification
        const intent = {
            primaryIntent: this.classifyIntent(prompt).primaryIntent,
            secondaryIntents: this.classifyIntent(prompt).secondaryIntents.slice(0, 1), // Limit to top 1
            confidence: this.classifyIntent(prompt).confidence,
            actionOriented: this.classifyIntent(prompt).actionOriented
        };
        return {
            originalPrompt: prompt,
            goals,
            constraints,
            domains,
            expectedOutputFormat,
            priority,
            complexity,
            keywords,
            entities,
            taskType,
            sentiment,
            intent
        };
    }
    /**
     * Analyzes a thought to determine how well it aligns with the prompt (optimized)
     * @param thought The thought text
     * @param promptMetadata The prompt metadata
     * @returns PromptAlignmentData with alignment scores and feedback
     */
    analyzeThoughtAlignment(thought, promptMetadata) {
        // Calculate overall alignment score
        const promptAlignment = this.calculateAlignmentScore(thought, promptMetadata);
        // Calculate relevance to different prompt aspects (simplified)
        const promptRelevance = {};
        // Only calculate relevance for goals (most important)
        promptMetadata.goals.forEach((goal, index) => {
            const goalKeywords = goal.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 3);
            let goalKeywordMatches = 0;
            for (const keyword of goalKeywords) {
                if (thought.toLowerCase().includes(keyword)) {
                    goalKeywordMatches++;
                }
            }
            const relevance = goalKeywords.length > 0 ?
                (goalKeywordMatches / goalKeywords.length) * 10 : 5;
            promptRelevance[`goal_${index}`] = Math.round(relevance);
        });
        // Generate alignment data
        const alignmentData = {
            promptAlignment,
            promptRelevance
        };
        // Add drift warning only if alignment is very low
        if (promptAlignment < 4) {
            alignmentData.driftWarning = `Low alignment with prompt (${promptAlignment}/10)`;
            alignmentData.suggestedCorrections = [`Focus more on the main goals: ${promptMetadata.goals[0]}`];
        }
        return alignmentData;
    }
    /**
     * Extracts goals from the prompt
     */
    extractGoals(prompt) {
        const goals = [];
        // Look for goal indicators
        const goalIndicators = [
            "goal is", "objective is", "aim is", "purpose is", "trying to",
            "want to", "need to", "would like to", "goal:", "objective:"
        ];
        // Simple extraction based on indicators
        // In a real implementation, this would use more sophisticated NLP
        const sentences = prompt.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
        for (const sentence of sentences) {
            for (const indicator of goalIndicators) {
                if (sentence.toLowerCase().includes(indicator)) {
                    goals.push(sentence);
                    break;
                }
            }
        }
        // If no explicit goals found, use the first sentence as an implicit goal
        if (goals.length === 0 && sentences.length > 0) {
            goals.push(sentences[0]);
        }
        return goals;
    }
    /**
     * Extracts constraints from the prompt
     */
    extractConstraints(prompt) {
        const constraints = [];
        // Look for constraint indicators
        const constraintIndicators = [
            "must", "should", "need to", "have to", "required",
            "necessary", "important", "essential", "critical",
            "cannot", "can't", "don't", "shouldn't", "mustn't"
        ];
        // Simple extraction based on indicators
        const sentences = prompt.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
        for (const sentence of sentences) {
            for (const indicator of constraintIndicators) {
                if (sentence.toLowerCase().includes(indicator)) {
                    constraints.push(sentence);
                    break;
                }
            }
        }
        return constraints;
    }
    /**
     * Extracts knowledge domains from the prompt
     */
    extractDomains(prompt) {
        // This is a simplified implementation
        // In a real system, this would use a more sophisticated domain classifier
        const domainKeywords = {
            "programming": ["code", "programming", "software", "development", "algorithm", "function"],
            "math": ["math", "calculation", "formula", "equation", "numerical"],
            "science": ["science", "scientific", "experiment", "hypothesis", "theory"],
            "business": ["business", "market", "strategy", "company", "product", "service"],
            "writing": ["write", "essay", "article", "blog", "content", "story"],
            "design": ["design", "layout", "visual", "UI", "UX", "interface"],
            "data": ["data", "analysis", "statistics", "dataset", "visualization"]
        };
        const domains = [];
        const promptLower = prompt.toLowerCase();
        for (const [domain, keywords] of Object.entries(domainKeywords)) {
            for (const keyword of keywords) {
                if (promptLower.includes(keyword)) {
                    domains.push(domain);
                    break;
                }
            }
        }
        return domains;
    }
    /**
     * Extracts expected output format from the prompt
     */
    extractOutputFormat(prompt) {
        // Look for format indicators
        const formatIndicators = [
            "format:", "in the form of", "as a", "output as", "result as",
            "in markdown", "in json", "in html", "in csv", "in table"
        ];
        const promptLower = prompt.toLowerCase();
        for (const indicator of formatIndicators) {
            const index = promptLower.indexOf(indicator);
            if (index !== -1) {
                // Extract the part after the indicator
                const afterIndicator = prompt.substring(index + indicator.length).trim();
                const formatDescription = afterIndicator.split(/[.!?]/)[0].trim();
                return formatDescription;
            }
        }
        return undefined;
    }
    /**
     * Determines priority level from the prompt
     */
    determinePriority(prompt) {
        const promptLower = prompt.toLowerCase();
        // Check for high priority indicators
        const highPriorityIndicators = [
            "urgent", "immediately", "asap", "critical", "high priority",
            "as soon as possible", "emergency", "deadline"
        ];
        for (const indicator of highPriorityIndicators) {
            if (promptLower.includes(indicator)) {
                return 'high';
            }
        }
        // Check for medium priority indicators
        const mediumPriorityIndicators = [
            "important", "soon", "timely", "needed", "significant"
        ];
        for (const indicator of mediumPriorityIndicators) {
            if (promptLower.includes(indicator)) {
                return 'medium';
            }
        }
        // Default to low priority
        return 'low';
    }
    /**
     * Estimates complexity of the prompt
     */
    estimateComplexity(prompt) {
        // This is a simplified implementation
        // In a real system, this would use more sophisticated metrics
        // Count words as a basic complexity measure
        const wordCount = prompt.split(/\s+/).length;
        // Check for complexity indicators
        const promptLower = prompt.toLowerCase();
        const complexityIndicators = [
            "complex", "complicated", "difficult", "challenging", "advanced",
            "sophisticated", "intricate", "elaborate", "comprehensive"
        ];
        for (const indicator of complexityIndicators) {
            if (promptLower.includes(indicator)) {
                return 'complex';
            }
        }
        // Use word count as a fallback
        if (wordCount > 100) {
            return 'complex';
        }
        else if (wordCount > 30) {
            return 'medium';
        }
        else {
            return 'simple';
        }
    }
    /**
     * Extracts keywords from the prompt
     */
    extractKeywords(prompt) {
        // This is a simplified implementation
        // In a real system, this would use more sophisticated NLP techniques
        // Remove common stop words
        const stopWords = ["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "about", "as"];
        // Split into words, convert to lowercase, and filter
        const words = prompt.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3) // Filter out short words
            .filter(word => !stopWords.includes(word)); // Filter out stop words
        // Count word frequency
        const wordCounts = {};
        for (const word of words) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
        // Sort by frequency and take top 10
        return Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }
    /**
     * Extracts entities from the prompt
     */
    extractEntities(prompt) {
        // This is a simplified implementation
        // In a real system, this would use named entity recognition
        // Look for capitalized words as potential entities
        const words = prompt.split(/\s+/);
        const entities = [];
        for (let i = 0; i < words.length; i++) {
            const word = words[i].replace(/[^\w]/g, '');
            // Check if word starts with capital letter and isn't at the beginning of a sentence
            if (word.length > 0 &&
                word[0] === word[0].toUpperCase() &&
                word[0] !== word[0].toLowerCase() &&
                i > 0) {
                entities.push(word);
            }
        }
        return [...new Set(entities)]; // Remove duplicates
    }
    /**
     * Determines the task type from the prompt
     */
    determineTaskType(prompt) {
        const promptLower = prompt.toLowerCase();
        // Check for creative indicators
        const creativeIndicators = [
            "create", "design", "generate", "write", "compose", "imagine", "story"
        ];
        // Check for analytical indicators
        const analyticalIndicators = [
            "analyze", "evaluate", "assess", "compare", "contrast", "examine"
        ];
        // Check for informational indicators
        const informationalIndicators = [
            "explain", "describe", "what is", "how to", "information about", "tell me about"
        ];
        // Check for technical indicators
        const technicalIndicators = [
            "code", "program", "implement", "function", "algorithm", "debug", "fix"
        ];
        // Count matches for each category
        let creativeCount = 0;
        let analyticalCount = 0;
        let informationalCount = 0;
        let technicalCount = 0;
        for (const indicator of creativeIndicators) {
            if (promptLower.includes(indicator))
                creativeCount++;
        }
        for (const indicator of analyticalIndicators) {
            if (promptLower.includes(indicator))
                analyticalCount++;
        }
        for (const indicator of informationalIndicators) {
            if (promptLower.includes(indicator))
                informationalCount++;
        }
        for (const indicator of technicalIndicators) {
            if (promptLower.includes(indicator))
                technicalCount++;
        }
        // Determine the dominant type
        const counts = [
            { type: 'creative', count: creativeCount },
            { type: 'analytical', count: analyticalCount },
            { type: 'informational', count: informationalCount },
            { type: 'technical', count: technicalCount }
        ];
        counts.sort((a, b) => b.count - a.count);
        // If there's a clear winner, return that type
        if (counts[0].count > 0 && counts[0].count > counts[1].count) {
            return counts[0].type;
        }
        // If there's a tie or no clear pattern, return mixed
        return 'mixed';
    }
    /**
     * Calculates alignment score between a thought and the prompt
     */
    calculateAlignmentScore(thought, promptMetadata) {
        // This is a simplified implementation
        // In a real system, this would use more sophisticated semantic similarity
        let score = 5; // Start with a neutral score
        // Check keyword overlap
        const thoughtLower = thought.toLowerCase();
        let keywordMatches = 0;
        for (const keyword of promptMetadata.keywords) {
            if (thoughtLower.includes(keyword)) {
                keywordMatches++;
            }
        }
        // Adjust score based on keyword matches
        const keywordScore = Math.min(10, keywordMatches * 2);
        score = (score + keywordScore) / 2;
        // Check goal alignment
        let goalAlignmentScore = 0;
        for (const goal of promptMetadata.goals) {
            const goalKeywords = goal.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 3);
            let goalKeywordMatches = 0;
            for (const keyword of goalKeywords) {
                if (thoughtLower.includes(keyword)) {
                    goalKeywordMatches++;
                }
            }
            const goalMatchPercentage = goalKeywords.length > 0 ?
                goalKeywordMatches / goalKeywords.length : 0;
            goalAlignmentScore = Math.max(goalAlignmentScore, goalMatchPercentage * 10);
        }
        // Combine scores
        score = (score + goalAlignmentScore) / 2;
        return Math.round(score);
    }
    /**
     * Calculates relevance scores for different prompt aspects
     */
    calculateRelevanceScores(thought, promptMetadata) {
        const relevanceScores = {};
        const thoughtLower = thought.toLowerCase();
        // Calculate goal relevance
        relevanceScores.goals = this.calculateAspectRelevance(thoughtLower, promptMetadata.goals);
        // Calculate constraint relevance
        relevanceScores.constraints = this.calculateAspectRelevance(thoughtLower, promptMetadata.constraints);
        // Calculate domain relevance
        relevanceScores.domains = this.calculateAspectRelevance(thoughtLower, promptMetadata.domains);
        return relevanceScores;
    }
    /**
     * Calculates relevance score for a specific aspect
     */
    calculateAspectRelevance(thought, aspects) {
        if (aspects.length === 0)
            return 5; // Neutral score if no aspects
        let totalRelevance = 0;
        for (const aspect of aspects) {
            const aspectKeywords = aspect.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 3);
            let keywordMatches = 0;
            for (const keyword of aspectKeywords) {
                if (thought.includes(keyword)) {
                    keywordMatches++;
                }
            }
            const aspectRelevance = aspectKeywords.length > 0 ?
                (keywordMatches / aspectKeywords.length) * 10 : 5;
            totalRelevance += aspectRelevance;
        }
        return Math.round(totalRelevance / aspects.length);
    }
    /**
     * Analyzes the sentiment of the prompt
     * @param prompt The prompt text
     * @returns Sentiment analysis result
     */
    analyzeSentiment(prompt) {
        // This is a simplified implementation
        // In a real system, this would use more sophisticated NLP
        // Check for positive sentiment words
        const positiveWords = [
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'helpful', 'beneficial', 'positive', 'success', 'successful',
            'improve', 'improvement', 'better', 'best', 'like', 'love'
        ];
        // Check for negative sentiment words
        const negativeWords = [
            'bad', 'terrible', 'awful', 'horrible', 'poor', 'negative',
            'fail', 'failure', 'worse', 'worst', 'problem', 'issue',
            'difficult', 'hard', 'trouble', 'dislike', 'hate'
        ];
        // Check for emotional tone words
        const emotionalTones = {
            'excited': ['excited', 'exciting', 'thrilled', 'enthusiastic'],
            'curious': ['curious', 'interested', 'intrigued', 'wondering'],
            'frustrated': ['frustrated', 'annoyed', 'irritated', 'stuck'],
            'concerned': ['concerned', 'worried', 'anxious', 'nervous'],
            'hopeful': ['hopeful', 'optimistic', 'looking forward', 'anticipating'],
            'confused': ['confused', 'unsure', 'uncertain', 'unclear']
        };
        // Check for urgency indicators
        const urgencyWords = [
            'urgent', 'immediately', 'asap', 'quickly', 'soon',
            'deadline', 'critical', 'important', 'priority'
        ];
        const promptLower = prompt.toLowerCase();
        const words = promptLower.split(/\s+/);
        // Count sentiment words
        let positiveCount = 0;
        let negativeCount = 0;
        for (const word of words) {
            if (positiveWords.includes(word))
                positiveCount++;
            if (negativeWords.includes(word))
                negativeCount++;
        }
        // Determine overall sentiment
        let sentiment = 'neutral';
        if (positiveCount > negativeCount + 1) {
            sentiment = 'positive';
        }
        else if (negativeCount > positiveCount + 1) {
            sentiment = 'negative';
        }
        // Calculate intensity
        const totalSentimentWords = positiveCount + negativeCount;
        const intensity = Math.min(1, totalSentimentWords / Math.max(10, words.length * 0.2));
        // Identify emotional tones
        const detectedTones = [];
        for (const [tone, toneWords] of Object.entries(emotionalTones)) {
            if (toneWords.some(toneWord => promptLower.includes(toneWord))) {
                detectedTones.push(tone);
            }
        }
        // Determine urgency
        let urgency = 'low';
        const urgencyCount = urgencyWords.filter(word => promptLower.includes(word)).length;
        if (urgencyCount > 2) {
            urgency = 'high';
        }
        else if (urgencyCount > 0) {
            urgency = 'medium';
        }
        return {
            sentiment,
            intensity,
            emotionalTone: detectedTones.length > 0 ? detectedTones : ['neutral'],
            urgency
        };
    }
    /**
     * Classifies the intent of the prompt
     * @param prompt The prompt text
     * @returns Intent classification result
     */
    classifyIntent(prompt) {
        // This is a simplified implementation
        // In a real system, this would use more sophisticated NLP
        // Define intent patterns
        const intentPatterns = {
            'get_information': [
                /how (to|do|does|can|could|would|should)/i,
                /what (is|are|was|were|will|would)/i,
                /why (is|are|does|do|did)/i,
                /tell me about/i,
                /explain/i,
                /describe/i,
                /information on/i
            ],
            'solve_problem': [
                /solve/i,
                /fix/i,
                /debug/i,
                /issue/i,
                /problem/i,
                /error/i,
                /not working/i,
                /doesn't work/i,
                /help me with/i
            ],
            'create_content': [
                /create/i,
                /generate/i,
                /write/i,
                /design/i,
                /develop/i,
                /build/i,
                /make/i,
                /produce/i
            ],
            'improve_content': [
                /improve/i,
                /enhance/i,
                /optimize/i,
                /refine/i,
                /revise/i,
                /edit/i,
                /update/i,
                /upgrade/i
            ],
            'analyze_content': [
                /analyze/i,
                /evaluate/i,
                /assess/i,
                /review/i,
                /examine/i,
                /investigate/i,
                /study/i
            ],
            'compare_options': [
                /compare/i,
                /contrast/i,
                /difference/i,
                /versus/i,
                /vs/i,
                /better/i,
                /best/i
            ],
            'opinion_request': [
                /what do you think/i,
                /your opinion/i,
                /your thoughts/i,
                /do you believe/i,
                /would you recommend/i,
                /suggest/i
            ]
        };
        // Check for action-oriented language
        const actionVerbs = [
            'do', 'make', 'create', 'build', 'generate', 'implement',
            'develop', 'write', 'code', 'design', 'construct', 'produce'
        ];
        // Count matches for each intent
        const intentScores = {};
        for (const [intent, patterns] of Object.entries(intentPatterns)) {
            intentScores[intent] = 0;
            for (const pattern of patterns) {
                if (pattern.test(prompt)) {
                    intentScores[intent]++;
                }
            }
        }
        // Sort intents by score
        const sortedIntents = Object.entries(intentScores)
            .sort((a, b) => b[1] - a[1])
            .filter(([_, score]) => score > 0)
            .map(([intent]) => intent);
        // Determine if action-oriented
        const promptLower = prompt.toLowerCase();
        const words = promptLower.split(/\s+/);
        const actionOriented = actionVerbs.some(verb => words.includes(verb));
        // Calculate confidence based on score difference
        let confidence = 0.5; // Default medium confidence
        if (sortedIntents.length > 0) {
            const topScore = intentScores[sortedIntents[0]];
            const totalScore = Object.values(intentScores).reduce((sum, score) => sum + score, 0);
            confidence = Math.min(0.95, topScore / Math.max(1, totalScore) * 0.8 + 0.2);
        }
        return {
            primaryIntent: sortedIntents.length > 0 ? sortedIntents[0] : 'unknown',
            secondaryIntents: sortedIntents.slice(1, 3), // Top 2 secondary intents
            confidence,
            actionOriented
        };
    }
    /**
     * Checks for topic drift between a thought and the prompt
     */
    checkForTopicDrift(thought, promptMetadata) {
        const alignmentScore = this.calculateAlignmentScore(thought, promptMetadata);
        // Check if alignment score is below threshold
        if (alignmentScore < 4) {
            const corrections = [];
            // Generate corrections based on missing goals
            for (const goal of promptMetadata.goals) {
                const goalKeywords = goal.toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .split(/\s+/)
                    .filter(word => word.length > 3);
                let goalKeywordMatches = 0;
                for (const keyword of goalKeywords) {
                    if (thought.toLowerCase().includes(keyword)) {
                        goalKeywordMatches++;
                    }
                }
                if (goalKeywordMatches < goalKeywords.length * 0.3) {
                    corrections.push(`Consider addressing the goal: "${goal}"`);
                }
            }
            return {
                hasDrift: true,
                warning: `This thought appears to drift from the original prompt (alignment score: ${alignmentScore}/10)`,
                corrections: corrections.length > 0 ? corrections : ['Try to align more closely with the original prompt goals']
            };
        }
        return { hasDrift: false };
    }
}
// PromptContext class to store and manage prompt information
export class PromptContext {
    metadata = null;
    originalPrompt = '';
    constructor() { }
    /**
     * Initializes the prompt context with a new prompt
     * @param prompt The user's original prompt
     * @param analyzer The prompt analyzer to use
     */
    initializeWithPrompt(prompt, analyzer) {
        this.originalPrompt = prompt;
        this.metadata = analyzer.analyzePrompt(prompt);
    }
    /**
     * Gets the current prompt metadata
     */
    getMetadata() {
        return this.metadata;
    }
    /**
     * Gets the original prompt text
     */
    getOriginalPrompt() {
        return this.originalPrompt;
    }
    /**
     * Checks if the prompt context has been initialized
     */
    isInitialized() {
        return this.metadata !== null;
    }
}

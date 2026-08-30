package com.execflow.service.ai;

import com.execflow.dto.ai.AiAnalysisResult;

public interface AiProviderService {

    /**
     * Sends the given source text (a transcript or raw text input) to the
     * LLM and returns the structured extraction result.
     */
    AiAnalysisResult analyze(String sourceText);
}

const chatSelector = {
  userPrompt(input) {
    return input;
  },
  systemPrompt() {
    return '#PERSONA:\nSingle agent selector';
  },
  responseFormat() {
    return {
      type: 'json_schema',
      json_schema: {
        name: 'agent_selection',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            selected_agent: { type: 'string', enum: ['assistant'] },
            retrieval_prompt: { type: 'string' },
            intention: { type: 'string' },
          },
          required: ['selected_agent'],
          additionalProperties: false,
        },
      },
    };
  },
  textSuggestionSystemPrompt(agentPrompt) {
    return agentPrompt;
  },
  textSuggestionuUserPrompt(input) {
    return input;
  },
  textSuggestionFormat() {
    return { type: 'json_object' };
  },
  moreOptionUserPrompt(input) {
    return input;
  },
  moreOptionSystemPrompt(agentPrompt) {
    return agentPrompt;
  },
  moreOptionResponseFormat() {
    return { type: 'json_object' };
  },
};
export default chatSelector;

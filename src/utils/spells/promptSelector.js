const promptSelector = {
  systemPrompt() { return '#PERSONA:\nPrompt router'; },
  userPrompt(input) { return input; },
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
            intention: { type: 'string' },
          },
          required: ['selected_agent'],
          additionalProperties: false,
        },
      },
    };
  },
  selectedPrompt(intention, agentPrompt) {
    return agentPrompt;
  },
};
export default promptSelector;

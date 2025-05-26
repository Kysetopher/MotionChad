const pathSelector = {
  systemPrompt() { return '#PERSONA:\nPath selector'; },
  responseFormat() { return { type: 'json_object' }; },
};
export default pathSelector;

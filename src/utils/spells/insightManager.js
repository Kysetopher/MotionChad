const insightManager = {
  selectorSystemPrompt() { return 'Select insights'; },
  selectorUserPrompt(input) { return input; },
  selectorResponseFormat() { return { type: 'json_object' }; },
  updateSystemPrompt() { return 'Update insights'; },
  updateUserPrompt(input) { return input; },
  updateResponseFormat() { return { type: 'json_object' }; },
  createSystemPrompt() { return 'Create insight'; },
  createResponseFormat() { return { type: 'json_object' }; },
  categoryResponseFormat() { return { type: 'json_object' }; },
  categoryEmbeddingTags(category) { return category; },
};
export default insightManager;

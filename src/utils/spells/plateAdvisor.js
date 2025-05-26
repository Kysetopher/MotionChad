const plateAdvisor = {
  systemPrompt() { return '#PERSONA:\nPlate advisor'; },
  responseFormat() { return { type: 'json_object' }; },
};
export default plateAdvisor;

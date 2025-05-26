const plateConverter = {
  systemPrompt() { return '#PERSONA:\nPlate converter'; },
  responseFormat() { return { type: 'json_object' }; },
};
export default plateConverter;

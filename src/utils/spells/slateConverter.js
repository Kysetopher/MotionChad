const slateConverter = {
  systemPrompt() { return '#PERSONA:\nSlate converter'; },
  responseFormat() { return { type: 'json_object' }; },
};
export default slateConverter;

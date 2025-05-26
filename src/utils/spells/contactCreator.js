const contactCreator = {
  systemPrompt() {
    return '#PERSONA:\nContact creator';
  },
  responseFormat() {
    return { type: 'json_object' };
  },
};
export default contactCreator;

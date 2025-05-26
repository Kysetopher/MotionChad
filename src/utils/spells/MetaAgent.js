const MetaAgent = {
  insertSystemPrompt() {
    return '#PERSONA:\nMetadata assistant';
  },
  insertResponseFormat() {
    return { type: 'json_object' };
  },
  insertUserPrompt(data, intention) {
    return `#INTENTION:\n${intention}\n${data}`;
  },
  updateSystemPrompt() {
    return '#PERSONA:\nMetadata assistant update';
  },
  updateResponseFormat() {
    return { type: 'json_object' };
  },
};
export default MetaAgent;

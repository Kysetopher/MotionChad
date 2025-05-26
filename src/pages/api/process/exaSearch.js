import Exa from "exa-js"; // Adjust the import according to your actual Exa SDK/package

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.log("Invalid method:", req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log("Request body:", req.body);
  const { title } = req.body;

  if (!title) {
    console.log("Title is missing in the request");
    return res.status(400).json({ message: 'Title is required' });
  }

  const apiKey = process.env.EXASEARCH_API_KEY;
  if (!apiKey) {
    console.log("API key is missing");
    return res.status(500).json({ message: 'API key is missing' });
  }

  const exa = new Exa(apiKey);

  try {
    const now = new Date().toISOString();

    // Calculate date 90 days before now
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const startPublishedDate = startDate.toISOString();

    // Make API request
    console.log("Making API request with title:", title);
    const result = await exa.search(
      title,
      {
        type: "keyword",
        useAutoprompt: false,
        numResults: 2,
        startPublishedDate: startPublishedDate,
        endPublishedDate: now
      }
    );

    // Ensure result is a string
    const resultText = typeof result === 'string' ? result : JSON.stringify(result);
    console.log("API request successful, result:", resultText);

    res.status(200).json({ result: resultText });
  } catch (error) {
    console.error("API request failed:", error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
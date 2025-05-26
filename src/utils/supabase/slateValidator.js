/// FILE — src/utils/supabase/slateValidator.js
/// PURPOSE — Provides functions to interact with the OpenAI API for Slate editor content validation and response retrieval. Handles API requests, retries, and ensures returned content matches the expected Slate node structure. Includes validation logic for Slate body arrays and node types.

import { Node } from 'slate';

// Attempts to fetch a response from the OpenAI API using the provided Slate request and API key.
// Retries the request up to retryCount times if errors occur.
// Validates the structure of the returned Slate body before returning the response.
export async function fetchSlateResponse(slateRequest, apiKey, retryCount = 3) {
  for (let i = 0; i < retryCount; i++) {
    try {
      const slateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify(slateRequest),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
      });

      if (!slateResponse.ok) {
        // Throws an error if the HTTP response is not successful
        throw new Error(`HTTP error! status: ${slateResponse.status}`);
      }

      const responseJson = await slateResponse.json();
      // Parses the Slate body from the API response
      const slateBody = JSON.parse(responseJson.choices[0].message.content).body;

      // Validates the structure of the Slate body
      if (!validateSlateBody(slateBody)) {
        throw new Error('Invalid Slate content structure');
      }

      return responseJson; 

    } catch (error) {
      // Logs the error for each failed attempt
      console.error(`Slate request attempt ${i + 1} failed:`, error.message);

      if (i === retryCount - 1) {
        // Throws an error if all retry attempts are exhausted
        throw new Error('Max retry attempts reached for Slate request');
      }
    }
  }
}

// Validates that the provided Slate body is an array of valid Slate nodes or check-list-items.
// Returns true if all nodes are valid, otherwise returns false.
export function validateSlateBody(slateBody) {
  try {
    // Checks if the Slate body is an array
    if (!Array.isArray(slateBody)) {
      console.error('Invalid Slate body: Not an array');
      return false;
    }

    // Ensures each node is a valid Slate node or a check-list-item
    const isValid = slateBody.every(node => {
      const isNode = Node.isNode(node);
      console.log(`Node type: ${node.type}, isNode: ${isNode}`);
      
      return isNode || node.type === "check-list-item";
    });

    return isValid;

  } catch (e) {
    // Logs errors encountered during validation
    console.error('Error validating Slate content:', e.message);
    return false;
  }
}
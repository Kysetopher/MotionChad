import { updateReverie } from '../../../utils/supabase/functions';
import { ServerClient } from '../../../utils/supabase/server';
import plateAdvisor from '../../../utils/spells/plateAdvisor';
import slateAppendChild from '../../../utils/spells/slateAppendChild';
import limiter from '../../../utils/rateLimiter';

const offsetTree = {};


async function createSlateElement(instruction, children) {
  
  children.forEach((child, index) => {
    // console.log(`Child ${index + 1}:`, child);
  });

  const slateRequest = {
    model: "gpt-4.1", 
    stream: false,
    messages: [
      { role: "system", content: slateAppendChild.systemPrompt() },
      { role: "user", content: JSON.stringify({instruction: instruction, elements: children }) }
    ],
    response_format: slateAppendChild.responseFormat(),
    temperature: 0.3
  };

  const slateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify(slateRequest),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
  });

  if (!slateResponse.ok) {
    throw new Error(`HTTP error! status: ${slateResponse.status}`);
  }
  return await slateResponse.json();

};

function addChildrenAtPath(slateDocument, path, newChildren) {
  let currentNode = slateDocument;
  const nodesStack = [];

  // console.log("Path",path[0]);
  if (path[0]===-1) {
    if (!Array.isArray(currentNode)) {
      throw new Error("Slate document must be an array to append elements.");
    }
    // Append the new elements if they exist
    if (newChildren && Array.isArray(newChildren)) {
      currentNode.push(...newChildren);
    } else {
      throw new Error("No valid elements to append.");
    }

    return slateDocument; // Return the updated document after append
  }
  // Traverse the path to reach the target node
  for (let i = 0; i < path.length; i++) {
    if (Array.isArray(currentNode)) {
      if (!currentNode[path[i]]) {
        throw new Error(`Invalid path at index ${i}. Node at path ${path.slice(0, i + 1)} does not exist.`);
      }
      nodesStack.push(currentNode);
      currentNode = currentNode[path[i]];
    } else if (typeof currentNode === 'object' && currentNode.children) {
      if (!currentNode.children[path[i]]) {
        throw new Error(`Invalid path at index ${i}. Node at path ${path.slice(0, i + 1)} does not exist.`);
      }
      nodesStack.push(currentNode);
      currentNode = currentNode.children[path[i]];
    } else {
      throw new Error(`Node at path index ${i} does not have children and is not an array.`);
    }
  }

  // Append or set the new children based on whether the node already has children
  if (currentNode) {
    // console.log("Adding new children to node:", currentNode);
    if (currentNode.children) {
      currentNode.children = [...currentNode.children, ...newChildren]; // Append new children
    } else {
      currentNode.children = newChildren; // Set new children if none exist
    }
  } else {
    throw new Error(`Target Node at path ${path} does not exist.`);
  }

  // Rebuild the document from the stack to ensure proper reference updating
  for (let i = nodesStack.length - 1; i >= 0; i--) {
    const parent = nodesStack[i];
    if (Array.isArray(parent)) {
      parent[path[i]] = currentNode;
    } else if (typeof parent === 'object' && parent.children) {
      parent.children[path[i]] = currentNode;
    }
    currentNode = parent;
  }

  return slateDocument; // Return the updated document
};

function parseSlateToSingleLevelArray(slateDocument) {
  const result = [];

  function traverse(node, currentPath = [], parentType = null) {
    // If the node has children, traverse them and pass the current node's type as parentType
    if (Array.isArray(node.children)) {
      node.children.forEach((child, index) => {
        traverse(child, [...currentPath, index], node.type || parentType);
      });
    }

    // If the node contains text, add it to the result array using the parentType
    // if (node.text !== undefined) {
      result.push({
        type: node.type || 'paragraph',  // Use the parentType or default to 'paragraph'
        path: currentPath,
        text: node.text
      });
    // }
  }

  // Start traversal from the root of the Slate document
  slateDocument.forEach((node, index) => traverse(node, [index]));

  return result;
};


function updateTextAtPath(slateDocument, index, path, remove, insert, offsetTree) {

  if (typeof slateDocument === 'string') {
    try {
      slateDocument = JSON.parse(slateDocument);
    } catch (e) {
      throw new Error('Invalid JSON format in slateDocument.');
    }
  }

  if (!Array.isArray(path)) {
    throw new Error('The provided path must be an array.');
  }

  let currentNode = slateDocument;
  const nodesStack = [];
  for (let i = 0; i < path.length; i++) {
    if (Array.isArray(currentNode)) {
      if (currentNode[path[i]] === undefined) {
        throw new Error(`Invalid path at index ${i}. Node at path ${path.slice(0, i + 1)} does not exist.`);
      }
      nodesStack.push(currentNode);
      currentNode = currentNode[path[i]];
    } else if (typeof currentNode === 'object' && currentNode.children) {
      if (currentNode.children[path[i]] === undefined) {
        throw new Error(`Invalid path at index ${i}. Node at path ${path.slice(0, i + 1)} does not exist.`);
      }
      nodesStack.push(currentNode);
      currentNode = currentNode.children[path[i]];
    } else {
      throw new Error(`Node at path index ${i} does not have children and is not an array.`);
    }
  }

  if (!currentNode || currentNode.text === undefined) {
    throw new Error(`Target Node at path ${path} does not have a "text" property.`);
  }

  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  const originalText = currentNode.text;
  const removeLength = remove ? remove.length : 0;

  // Compute the new text segments
  const leftText = originalText.substring(0, index);
  const rightText = originalText.substring(index + removeLength);

  const suggestionId = generateId();
  const suggestionKey = `suggestion_${suggestionId}`;

  let removeSuggestionNode;
  if (remove !== undefined && remove !== null) {
    removeSuggestionNode = {
      text: remove,
      suggestion: true,
      [suggestionKey]: {
        id: suggestionId,
        type: "remove",
        userId: "AGENT",
        createdAt: Date.now()
      }
    };
  }

  let insertSuggestionNode;
  if (insert !== undefined && insert !== null) {
    insertSuggestionNode = {
      text: insert,
      suggestion: true,
      [suggestionKey]: {
        id: suggestionId,
        type: "insert",
        userId: "AGENT",
        createdAt: Date.now()
      }
    };
  }

  // Create the new nodes based on the split.
  // The left node is the original text up to the index.
  // The right node is the natural text node created after the split.
  const leftNode = Object.assign({}, currentNode, { text: leftText });
  const rightNode = Object.assign({}, currentNode, { text: rightText });

  const newNodes = [];
  newNodes.push(leftNode);
  if (removeSuggestionNode) newNodes.push(removeSuggestionNode);
  if (insertSuggestionNode) newNodes.push(insertSuggestionNode);
  newNodes.push(rightNode);

  let parent, targetIndex;
  if (nodesStack.length === 0) {
    throw new Error("Target node has no parent.");
  }
  parent = nodesStack[nodesStack.length - 1];
  targetIndex = path[path.length - 1];

  if (Array.isArray(parent)) {
    parent.splice(targetIndex, 1, ...newNodes);
  } else if (parent.children && Array.isArray(parent.children)) {
    parent.children.splice(targetIndex, 1, ...newNodes);
  } else {
    throw new Error("Parent node does not have a valid children array.");
  }

  // Determine the adjusted values.
  // newNodesCount is the total number of nodes inserted in place of the original node.
  const newNodesCount = newNodes.length;
  // The adjusted length is calculated as the difference in the original text length and the new natural text node.
  // (You might adjust this calculation based on your specific logic.)
  const adjustedLength = originalText.length - rightText.length;

  // Now update the offsets for this path.
  updateOffsetsForPath(path, newNodesCount, adjustedLength, offsetTree);

  return slateDocument;
};

function updateOffsetsForPath(originalPath, newNodesCount, adjustedLength, offsetTree) {
  let pointer = offsetTree;
  // Traverse the tree along the original path.
  for (let i = 0; i < originalPath.length; i++) {
    const idx = originalPath[i];
    if (!pointer[idx]) {
      pointer[idx] = { nodeOffset: 0, textOffset: 0, children: {} };
    }
    // At the final level (the original node/left node), update offsets.
    if (i === originalPath.length - 1) {
      pointer[idx].nodeOffset += (newNodesCount - 1);
      pointer[idx].textOffset += adjustedLength;
    } else {
      pointer = pointer[idx].children;
    }
  }
};

function adjustPathAndIndex(originalPath, index, offsetTree) {
  let adjustedPath = [];
  let pointer = offsetTree;
  let finalRecord = null;
  
  // Traverse the original path to build the adjusted path and capture the final record.
  for (let level = 0; level < originalPath.length; level++) {
    const idx = originalPath[level];
    if (!pointer[idx]) {
      pointer[idx] = { nodeOffset: 0, textOffset: 0, children: {} };
    }
    const offsetData = pointer[idx];
    adjustedPath.push(idx + offsetData.nodeOffset);
    
    // Capture the final node record.
    if (level === originalPath.length - 1) {
      finalRecord = offsetData;
    }
    pointer = offsetData.children;
  }
  
  // Adjust the index using the textOffset stored in the final record.
  const adjustedIndex = index - (finalRecord ? finalRecord.textOffset : 0);
  
  return { adjustedPath, adjustedIndex };
}


//-----------------------------------------|                                  |---------------------------------------------------------------------------
//                                         | ENDPOINT ENTRANCE AND VALIDATION | 
//-----------------------------------------|__________________________________|---------------------------------------------------------------

export default async function handler(req, res) {
  limiter(req, res, async () => {
  const { tile } = req.body;
  const offsetTree = {};
  const apiKey = process.env.OPENAI_API_KEY;
  const { id, tags, plate,userinput, ...rest } = tile;
  const parsedBody = parseSlateToSingleLevelArray(plate);
  let userPrompt = { ...rest, userinput:userinput, body: JSON.stringify(parsedBody) };
  // console.log("Parsed Body", parsedBody);
  try {
    const supabase = ServerClient(req, res);
    await updateReverie(supabase, id, { is_streaming:true });
    const tilerequestbody = {
      model: "gpt-4.1",
      stream: false,
      messages: [
        { role: "system", content: plateAdvisor.systemPrompt() },
        { role: "user", content: JSON.stringify(userPrompt) }
      ],
      response_format: plateAdvisor.responseFormat(),
      temperature: 0.3,
    };

    let updatedTileBody = plate; 

    try {
      const tileresponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify(tilerequestbody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
      });

      if (!tileresponse.ok) {
        const errorBody = await tileresponse.text(); 
        console.error(`HTTP error! status: ${tileresponse.status}, body: ${errorBody}`);
        throw new Error(`HTTP error! status: ${tileresponse.status}`);
      }

      const responseData = await tileresponse.json();

      let parsedContent;
      try {
        parsedContent = JSON.parse(responseData.choices[0].message.content);
      } catch (e) {
        parsedContent = responseData.choices[0].message.content;
      }

      if (typeof parsedContent === 'string') {
        try {
          parsedContent = JSON.parse(parsedContent);
        } catch (e) {
          console.error('Error parsing OpenAI response content:', e);
        }
      }
      

      const operations = [];
      console.log(JSON.stringify(parsedContent));
      parsedContent.paths.forEach(( path ) => { 

         const { adjustedPath , adjustedIndex } = path.path ? adjustPathAndIndex(path.path, path.index, offsetTree) : undefined;
        if(adjustedPath !== path) console.log("Path and index are adjusted. \nOriginal Path: ", path.path,", Adjusted Path: ", adjustedPath, "\nOriginal Index: ",path.index, ", Adjusted Index: ",adjustedIndex);
        switch (path.operation) {
          // case "create":
          //   operations.push({ path:-1, instruction });
          // break;
          case "modify":

            updatedTileBody = updateTextAtPath(updatedTileBody, adjustedIndex, adjustedPath , path.remove, path.insert, offsetTree);

          break;
          // case "delete":
          //   updatedTileBody = deleteNode( updatedTileBody, path);
          // break;
          default:
          break;
        }



      });

      await Promise.all(
        operations.map(async ({ path, instruction, children }) => {
          const SlateText = await createSlateElement(instruction, children);
          // console.log(JSON.parse(SlateText.choices[0].message.content).body);
          updatedTileBody = addChildrenAtPath(
            updatedTileBody,
            path,
            JSON.parse(SlateText.choices[0].message.content).body
          );
          // console.log(updatedTileBody);
        })
      );
      
    } catch (error) {
      console.error('Error during OpenAI request:', error);
      return res.status(500).json({ error: error.message });
    }

    try {
      const result = await updateReverie(supabase, id, { plate: updatedTileBody, is_streaming:false });

      if (result.success) {
        return res.status(200).json({ plate: updatedTileBody });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating reverie:', error);
      return res.status(500).json({ error: error.message });
    }

  } catch (error) {
    console.error('General error:', error);
    return res.status(500).json({ error: error.message });
  }
});
};
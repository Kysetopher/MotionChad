import MetaSpells from '../../../utils/spells/MetaSpells';
import { updateReverie, addTags } from '../../../utils/supabase/functions';
import { ServerClient } from '../../../utils/supabase/server';
import limiter from '../../../utils/rateLimiter';

export default async function handler(req, res) {
  limiter(req, res, async () => {
  const { tile, referencedTiles } = req.body;

  const apiKey = process.env.OPENAI_API_KEY;
  const { id, tags, ...rest } = tile;
  let initialtiledata = {   ...rest };

  try {
    const supabase = ServerClient(req, res);

    const tilerequestbody = {
      model: "gpt-4.1",
      stream: false,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: MetaSpells.processFollowupMetaData() },
        { role: "user", content: JSON.stringify(initialtiledata) }
      ],
      temperature: 0.3,
    };

    const tileresponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(tilerequestbody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
    });

    if (!tileresponse.ok) {
      throw new Error(`HTTP error! status: ${tileresponse.status}`);
    }

    const metaData = JSON.parse((await tileresponse.json()).choices[0].message.content);

    const updatedtiledata  = {
      summary: metaData.summary,
      question: metaData.question,
    };
    
    const tagData = metaData.relatedtags;
    const tagIds = await addTags(supabase, tagData);


    try {
      const result = await updateReverie(supabase, tile.id, updatedtiledata);
      // console.log("New Tags Ids:", tagIds, "\nInitial Tag Ids: ", tile.tags);
      const newTags = tagIds.filter(tagId => !tile.tags.includes(tagId));

      if (result.success) {
        return res.status(200).json({
           ...updatedtiledata,
           tags: newTags,
         } );

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
}
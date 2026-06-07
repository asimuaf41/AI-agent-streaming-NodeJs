import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
dotenv.config();

// This creates your connection to Claude
const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function askFromRealEstateAgent(question) {
    console.log('Sending to Claude:', question);
    console.log('---');
    console.log("api key", process.env.ANTHROPIC_API_KEY);

    const response = await client.messages.create({
        // model: 'claude-sonnet-4-5',
        // model: 'claude-sonnet-4-6',
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,                    // maximum length of response
        system: `You are a professional real estate assistant for Atlanta, USA. 
        You help clients find properties and answer real estate questions.
        Always be professional, helpful, and mention that you can search 
        for specific properties if needed.
        Never make up property listings — say you will search for them.`,
        messages: [
            { role: 'user', content: question }
        ]

    });

    // The response text is inside content array
    const answer = response.content[0].text;
    console.log('Claude says:', answer);
    console.log('---');
    console.log('Tokens used:', response.usage);

    return answer;
}
async function askFromReactDeveloper(question) {
    console.log('Sending to Claude:', question);
    console.log('---');
    console.log("api key", process.env.ANTHROPIC_API_KEY);

    const response = await client.messages.create({
        // model: 'claude-sonnet-4-5',
        // model: 'claude-sonnet-4-6',
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,                    // maximum length of response
        system: `You are a senior React developer doing code reviews.
        Be direct, point out issues clearly.
        Always suggest improvements.
        Focus on performance, readability, and best practices.`,
        messages: [
            { role: 'user', content: question }
        ]


    });

    // The response text is inside content array
    const answer = response.content[0].text;
    console.log('Claude says:', answer);
    console.log('---');
    console.log('Tokens used:', response.usage);

    return answer;
}

// Run it
askFromRealEstateAgent('what is today weather today and what is my hooby');
// askFromReactDeveloper('Review this code: const data = fetch(url)');
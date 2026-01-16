import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { prompt, apiKey } = await req.json();

        if (!apiKey) {
            return new Response('API Key is required', { status: 400 });
        }

        if (!prompt) {
            return new Response('Prompt (diff) is required', { status: 400 });
        }

        const google = createGoogleGenerativeAI({
            apiKey: apiKey,
        });

        const output = await generateText({
            model: google('gemini-1.5-flash'),
            system: 'You are a senior DevOps engineer. Summarize this code diff into a Conventional Commit message (e.g., feat: add login). Only return the commit message, no explanation.',
            prompt: prompt,
        });

        return new Response(JSON.stringify({ commit: output.text }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error handling request:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate commit' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

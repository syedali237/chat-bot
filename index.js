const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize OpenAI instance with your API key
const openai = new OpenAI(process.env.OPENAI_API_KEY);

let conversationHistory = [{role : 'assistant' , content: 'Ask me your doubts related to health & fitness..'}];

// Function to generate text based on user input
async function generateText(userInput) {
  try {

    conversationHistory.push({ role: 'user', content: userInput });
    // Create completions using OpenAI API
    const completion = await openai.chat.completions.create({
    //   messages: [{ role: 'user', content: userInput }],
    messages: conversationHistory,
      model: 'gpt-3.5-turbo'
    });

    const generatedText = completion.choices[0].message.content;

    // Return the generated text from the API response
    // return completion.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: generatedText });

    return conversationHistory;
  } catch (error) {
    console.error('Error generating text:', error);
    return 'An error occurred while generating text.';
  }
}

app.get('/', (req, res) => {
    res.render('main', { generatedText: null });
});

// Endpoint to handle incoming messages
app.post('/messages', async (req, res) => {
  try {
    // Get user input from the request body
    // const { content } = req.body;

    // Pass user input to the generateText function
    const generatedText = await generateText(req.body.content);

    // Return the generated text as the response
    res.render('main', { generatedText });
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).json({ error: 'An error occurred while handling the message.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
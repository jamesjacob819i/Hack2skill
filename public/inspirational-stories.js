import { streamGemini } from './gemini-api.js';

let output = document.querySelector('.output');
const md = window.markdownit();

// Automatically generate inspiring stories without prompt
async function generateStory() {
  output.textContent = 'Generating an inspiring story...';

  try {
    // Default content with a predefined story request
    let contents = [
      {
        role: 'user',
        parts: [
          {
            text: "Tell an inspiring story about a woman who overcomes challenges and succeeds in her career. Make it detailed and inspiring, with specific obstacles and how she overcame them."
          }
        ]
      }
    ];

    // Call the model to generate a story
    let stream = streamGemini({
      model: 'gemini-1.5-pro',
      contents,
    });

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    for await (let chunk of stream) {
      buffer.push(chunk);
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr><p style="color: red;">Error: ' + e + '</p>';
    // Fallback if API connection fails
    provideFallbackStory();
  }
}

// Provide a pre-written fallback story if the API fails
function provideFallbackStory() {
  const fallbackStory = `
# Maria's Journey: From Setback to Success

Maria always dreamed of becoming a software engineer, but growing up in a rural community with limited resources made this dream seem distant. Her family couldn't afford a computer, so she would walk three miles to the local library every day after school to use their computers.

Despite these challenges, Maria excelled academically and earned a partial scholarship to college. To cover the remaining costs, she worked two part-time jobs while maintaining a full course load. The demanding schedule meant many sleepless nights, but her determination never wavered.

During her third year, a major tech company visited her campus for recruitment. Despite feeling intimidated by applicants from more prestigious universities, Maria impressed the interviewers with her practical knowledge and problem-solving skills—skills she had developed through her resourceful journey.

Maria secured an internship and eventually a full-time position. Today, she leads a development team at the same company, and has established a scholarship fund for young women from rural areas pursuing careers in technology.

Her story reminds us that success isn't measured by where you start, but by your persistence through the journey.
  `;
  
  output.innerHTML = md.render(fallbackStory);
}

// Generate story on page load
document.addEventListener('DOMContentLoaded', generateStory);
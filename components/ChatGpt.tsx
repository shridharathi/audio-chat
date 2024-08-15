import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
type TextAlign = 'left' | 'right' | 'center';

interface ChatGptProps {
  transcript: string;
}

const chunkTranscript = (transcript: string, chunkSize: number): string[] => {
  const chunks: string[] = [];
  let currentIndex = 0;

  while (currentIndex < transcript.length) {
    const chunk = transcript.slice(currentIndex, currentIndex + chunkSize);
    chunks.push(chunk);
    currentIndex += chunkSize;
  }

  return chunks;
};

export const ChatGpt: React.FC<ChatGptProps> = ({ transcript }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string, content: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatHistoryEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const initialMessage = [
      { role: "system", content: "You are an assistant who will help the user answer any questions regarding the attached transcript." },
    ];

    const assistantMessage = [
      { role: "assistant", content: "Ask away!" }
    ];

    const chunkSize = 1500; // Adjust this size according to token limits
    const transcriptChunks = chunkTranscript(transcript, chunkSize);
    const transcriptMessages = transcriptChunks.map(chunk => ({ role: "user", content: chunk }));

    setChatHistory([...initialMessage, ...transcriptMessages, ...assistantMessage]);
  }, [transcript]);

  const lastIndexRef = useRef<number | null>(null); //

  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const newChatHistory = [...chatHistory, {role: 'user', content: prompt }];
    setChatHistory(newChatHistory); //new
  
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{role: 'user', content: 'prompt' }],
      });
      const responseMessage = completion.choices[0].message.content || '';
      setChatHistory([...newChatHistory, { role: 'assistant', content: responseMessage }]);
    } catch (err) {
      setError('An error occurred while fetching the response.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  useEffect(() => {
    // This will run only on the initial render

      lastIndexRef.current = chatHistory.findIndex(
        (message) => message.role === 'assistant' && message.content === 'Ask away!'
      );
 
  }, [chatHistory]); // Update dependency to chatHistory to find index after it is set


  useEffect(() => {
    // Scroll to the end of the chat history when it updates ..
    if (chatHistoryEndRef.current) {
      chatHistoryEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  return (
    <div style={styles.chatContainer}>
      {error && <div style={styles.chatError}>{error}</div>}
      <div style={styles.chatHistory}>
        {lastIndexRef.current !== null && chatHistory.slice(lastIndexRef.current).map((message, index) => (
          <div key={index} style={message.role === 'user' ? styles.userMessage : styles.assistantMessage}>
            <strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong> {message.content}
          </div>
        ))}
        {/* Reference element for scrolling */}
        <div ref={chatHistoryEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={styles.chatForm}>
        <input
          id="chat-input"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={styles.chatInput}
          placeholder="Type your message here..."
          required
        />
        <button type="submit" disabled={isLoading} style={styles.chatSubmit}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {isLoading && <div style={styles.chatLoading}>Loading...</div>}
    </div>
  );
};

const styles = {
  chatContainer: {
    maxWidth: '600px',
    maxHeight: '400px',
    marginTop: '1rem',
    margin: '0 auto',
    padding: '2rem',
    borderRadius: '4px 0 0 4px',
    backgroundColor: 'bg-gray-100'
  },
  chatForm: {
    display: 'flex',
    marginBottom: '1rem'
  },
  chatInput: {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginRight: '1rem'
  },
  chatSubmit: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#3D3C2A',
    color: '#fff',
    cursor: 'pointer'
  },
  chatLoading: {
    textAlign: 'center' as TextAlign,
    marginTop: '1rem'
  },
  chatError: {
    color: 'red',
    textAlign: 'center' as TextAlign,
    marginTop: '1rem'
  },
  chatHistory: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#fff',
    maxHeight: '400px',
    overflowY: 'auto' as const,
    marginBottom: '1rem'
  },
  userMessage: {
    marginBottom: '1rem',
    textAlign: 'right' as TextAlign // Use the TextAlign type annotation
  },
  assistantMessage: {
    marginBottom: '1rem',
    textAlign: 'left' as TextAlign // Use the TextAlign type annotation
  }
};
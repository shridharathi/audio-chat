import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

interface ChatGptProps {
  transcript: string;
}

export const ChatGpt: React.FC<ChatGptProps> = ({ transcript }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string, content: string }>>([
    { role: 'system', content: `You are an assistant who will help the user answer any questions regarding the attached transcript: ${transcript}` },
    { role: 'assistant', content: 'Ask away!' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatHistoryEndRef = useRef<HTMLDivElement>(null);

  const openai = new OpenAI({
    apiKey: "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",
    dangerouslyAllowBrowser: true // Only use this if you're calling the API from the browser
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const newChatHistory = [...chatHistory, { role: 'user', content: prompt }];
    setChatHistory(newChatHistory);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: newChatHistory,
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
    // Scroll to the end of the chat history when it updates
    if (chatHistoryEndRef.current) {
      chatHistoryEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  return (
    <div style={styles.chatContainer}>
      {error && <div style={styles.chatError}>{error}</div>}
      <div style={styles.chatHistory}>
        {chatHistory.slice(1).map((message, index) => (
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
    textAlign: 'center',
    marginTop: '1rem'
  },
  chatError: {
    color: 'red',
    textAlign: 'center',
    marginTop: '1rem'
  },
  chatHistory: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#fff',
    maxHeight: '500px',
    overflowY: 'auto',
    marginBottom: '1rem'
  },
  userMessage: {
    marginBottom: '1rem',
    textAlign: 'right'
  },
  assistantMessage: {
    marginBottom: '1rem',
    textAlign: 'left'
  }
};
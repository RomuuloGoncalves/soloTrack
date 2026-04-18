import { useState, useMemo } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../../hooks/useTheme';
import { Sidebar } from '../../Components/Sidebar/Sidebar';
import styles from './ChatBot.module.css';
import lightLogo from '../../assets/images/Light-logo.svg';
import darkLogo from '../../assets/images/Dark-Logo.svg';
import serverService from '../../services/serverService';

export function ChatBot() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);

  const logo = useMemo(() => theme === 'dark' ? darkLogo : lightLogo, [theme]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const geminiHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      geminiHistory.push({ role: 'user', parts: [{ text: message }] });

      const response = await serverService.post<{ candidates: any[], error?: string }>('/mcp/chat', {
        messages: geminiHistory
      });

      if (response.data.error) {
         throw new Error(response.data.error);
      }

      const candidates = response.data.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('Desculpe, mas não obtemos uma mensagem válida. Tente novamente mais tarde. Obrigado pela compreenção!');
      }

      const aiResponse = candidates[0].content?.parts?.[0]?.text || 'Resposta vazia da IA.';
      
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: aiResponse }
      ]);
    } catch (error: any) {
      console.error('Erro ao chamar o ChatBot:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido';
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: `Erro: ${errorMessage}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const isChatStarted = messages.length > 0;

  return (
    <div className={`${styles.chatbotLayout} ${isChatStarted ? styles.chatActive : ''}`}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpen={() => setIsSidebarOpen(true)}
        logo={logo} 
      />

      <main className={styles.chatArea}>

        {!isChatStarted && <div className={styles.glowTop}></div>}

        <div className={styles.scrollContainer}>
          {!isChatStarted ? (
            <div className={styles.mainContent}>
              <img src={logo} alt="SoloTrack Logo" className={styles.centralLogo} />
              <div className={styles.greeting}>
                <h1>Bom dia, Marcos</h1>
                <h2>Como eu posso te ajudar hoje?</h2>
                <p>Escolha um prompt abaixo ou escreva o seu próprio para iniciar uma conversa</p>
              </div>
            </div>
          ) : (
            <div className={styles.chatView}>
              {messages.map((msg, index) => (
                <div key={index} className={msg.role === 'user' ? styles.userRow : styles.aiRow}>
                  {msg.role === 'ai' && <img src={lightLogo} className={styles.aiIcon} alt="AI Icon" />}
                  {msg.role === 'user' ? (
                    <div className={styles.userBubble}>{msg.content}</div>
                  ) : (
                    <div className={styles.aiText}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className={styles.aiRow}>
                  <img src={lightLogo} className={styles.aiIcon} alt="AI Icon" />
                  <div className={styles.aiText}>
                    <Loader2 className={styles.spinner} size={20} />
                    <span>SoloTrack está processando os dados...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footerSection}>
          {!isChatStarted && (
            <div className={styles.cardsContainer}>
              <button className={styles.card} onClick={() => {setMessage("Quem são os usuários do sistema?");}}>Quem são os usuários do sistema?</button>
              <button className={styles.card} onClick={() => {setMessage("Quantas áreas de plantio existem?");}}>Quantas áreas de plantio existem?</button>
              <button className={styles.card} onClick={() => {setMessage("Quais os insumos disponíveis?");}}>Quais os insumos disponíveis?</button>
            </div>
          )}

          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <textarea
                className={styles.inputBox}
                placeholder="Como podemos te ajudar hoje?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              />
              <button className={styles.sendButton} onClick={handleSendMessage}>
                <SendHorizontal size={20} color="white" />
              </button>
            </div>
            <p className={styles.disclaimer}>A IA pode cometer erros. Verifique antes.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatBot;
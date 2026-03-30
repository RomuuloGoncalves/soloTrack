// import { useState, useEffect } from 'react';
// import { Menu, SendHorizontal } from 'lucide-react';
// import { Sidebar } from '../Sidebar/Sidebar';
// import styles from './ChatBot.module.css';
// import lightLogo from '../../../assets/images/Light-logo.svg';
// import darkLogo from '../../../assets/images/Dark-Logo.svg';

// export function ChatBot() {
//   const [message, setMessage] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [logo, setLogo] = useState(lightLogo);

//   useEffect(() => {
//     const updateLogo = () => {
//       const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
//       setLogo(isDark ? darkLogo : lightLogo);
//     };

//     updateLogo();

//     const observer = new MutationObserver(updateLogo);
//     observer.observe(document.documentElement, {
//       attributes: true,
//       attributeFilter: ['data-theme'],
//     });

//     return () => observer.disconnect();
//   }, []);

//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//   return (
//     <div className={styles.chatbotLayout}>
//       <Sidebar 
//         isOpen={isSidebarOpen} 
//         onClose={() => setIsSidebarOpen(false)} 
//         logo={logo} 
//       />

//       <main className={styles.chatArea}>
//         <header className={styles.mobileHeader}>
//           <button className={styles.hamburgerButton} onClick={toggleSidebar} aria-label="Abrir Menu">
//             <Menu size={24} color="#244c4e" />
//           </button>
//         </header>

//         <div className={styles.glowTop}></div>

//         <div className={styles.mainContent}>
//           <img src={logo} alt="SoloTrack Logo" className={styles.centralLogo} />
//           <div className={styles.greeting}>
//             <h1>Bom dia, Marcos</h1>
//             <h2>Como eu posso te ajudar hoje?</h2>
//             <p>Escolha um prompt abaixo ou escreva o seu próprio para iniciar uma conversa</p>
//           </div>
//         </div>

//         <div className={styles.footerSection}>
//           <div className={styles.cardsContainer}>
//             <button className={styles.card}>Lorem ipsum dolor sit amet.</button>
//             <button className={styles.card}>Lorem ipsum dolor sit amet.</button>
//             <button className={styles.card}>Lorem ipsum dolor sit amet.</button>
//           </div>

//           <div className={styles.inputContainer}>
//             <div className={styles.inputWrapper}>
//               <textarea
//                 className={styles.inputBox}
//                 placeholder="Como podemos te ajudar hoje?"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//               />
//               <button className={styles.sendButton}>
//                 <SendHorizontal size={20} color="white" />
//               </button>
//             </div>
//             <p className={styles.disclaimer}>A IA pode cometer erros. Verifique antes.</p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default ChatBot;

import { useState, useEffect } from 'react';
import { Menu, SendHorizontal } from 'lucide-react';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './ChatBot.module.css';
import lightLogo from '../../../assets/images/Light-logo.svg';
import darkLogo from '../../../assets/images/Dark-Logo.svg';

export function ChatBot() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logo, setLogo] = useState(lightLogo);

  useEffect(() => {
    const updateLogo = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setLogo(isDark ? darkLogo : lightLogo);
    };
    updateLogo();
    const observer = new MutationObserver(updateLogo);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', content: message },
      { role: 'ai', content: message }
    ]);
    setMessage('');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const isChatStarted = messages.length > 0;

  return (
    <div className={`${styles.chatbotLayout} ${isChatStarted ? styles.chatActive : ''}`}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        logo={logo} 
      />

      <main className={styles.chatArea}>
        <header className={styles.mobileHeader}>
          <button className={styles.hamburgerButton} onClick={toggleSidebar} aria-label="Abrir Menu">
            <Menu size={24} color={"#244c4e"} />
          </button>
        </header>

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
                  <div className={msg.role === 'user' ? styles.userBubble : styles.aiText}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footerSection}>
          {!isChatStarted && (
            <div className={styles.cardsContainer}>
              <button className={styles.card} onClick={() => {setMessage("Lorem ipsum dolor sit amet.");}}>Lorem ipsum dolor sit amet.</button>
              <button className={styles.card} onClick={() => {setMessage("Lorem ipsum dolor sit amet.");}}>Lorem ipsum dolor sit amet.</button>
              <button className={styles.card} onClick={() => {setMessage("Lorem ipsum dolor sit amet.");}}>Lorem ipsum dolor sit amet.</button>
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
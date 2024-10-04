import { useEffect, useState } from "react";  
import Chat from "./components/chat/Chat";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Detail from "./components/detail/Detail";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const getScreenSize = () => {
  if (window.innerWidth >= 1024) {
    return "large";
  } else if (window.innerWidth >= 768) {
    return "medium";
  } else {
    return "small";
  }
};

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getScreenSize());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) {
    return (
      <div className="loading">
        <img src="public/loading.png" alt="Loading..." className="loader" />
      </div>
    );
  }

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleExitChat = () => {
    setSelectedChat(null);
  };

  return (
    <div className="container-fluid" >
      {currentUser ? (
        <>
          {screenSize === "small" ? (
            selectedChat ? (
              <Chat chat={selectedChat} onExit={handleExitChat} />
            ) : (
              <List onChatSelect={handleChatSelect} />
            )
          ) : (
            <>
              <List onChatSelect={handleChatSelect} />
              {selectedChat && (
                <Chat chat={selectedChat} onExit={handleExitChat} />
              )}
            </>
          )}

{screenSize === "large" && chatId && (
  <>

    <Detail />
  </>
)}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;























































// import { useEffect } from "react";
// import Chat from "./components/chat/Chat";
// import Detail from "./components/detail/Detail";
// import List from "./components/list/List";
// import Login from "./components/login/Login";
// import Notification from "./components/notification/Notification";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./lib/firebase";
// import { useUserStore } from "./lib/userStore";
// import { useChatStore } from "./lib/chatStore";

// const App = () => {
//   const { currentUser, isLoading, fetchUserInfo } = useUserStore();
//   const { chatId } = useChatStore();

//   useEffect(() => {
//     const unSub = onAuthStateChanged(auth, (user) => {
//       fetchUserInfo(user?.uid);
//     });

//     return () => {
//       unSub();
//     };
//   }, [fetchUserInfo]);

//   if (isLoading) return <div className="loading">      <img src="public\loading.png" alt="Loading..." className="loader" />
// </div>;

//   return (
//     <div className="container-fluid">
//       {currentUser ? (
//         <>
//           <List />
//           {chatId && <Chat />}
//           {chatId && <Detail />}
//         </>
//       ) : (
//         <Login />
//       )}
//       <Notification />
//     </div>
//   );
// };
// export default App;


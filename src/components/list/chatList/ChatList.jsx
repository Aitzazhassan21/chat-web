// import { useEffect, useState } from "react";
// import "./chatList.css";
// import AddUser from "./addUser/AddUser";
// import { useUserStore } from "../../../lib/userStore";
// import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
// import { db } from "../../../lib/firebase";
// import { useChatStore } from "../../../lib/chatStore";
// import Swal from 'sweetalert2/dist/sweetalert2.js';
// import 'sweetalert2/src/sweetalert2.scss'; // Import the SweetAlert2 styles
// import { BsSearch } from "react-icons/bs";
// import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';

// const ChatList = ({showChat,setShowChat }) => {
//   const [chats, setChats] = useState([]);
//   const [addMode, setAddMode] = useState(false);
//   const [input, setInput] = useState("");

//   const { currentUser } = useUserStore();
//   const { changeChat } = useChatStore();
//   useEffect(() => {
//     if (!currentUser.id) {
//       console.error('currentUser.id is undefined');
//       return;
//     }
  
//     const unSub = onSnapshot(
//       doc(db, "userchats", currentUser.id),
//       async (res) => {
//         try {
//           const items = res.data()?.chats || [];
  
//           const promises = items.map(async (item) => {
//             if (!item.receiverId) {
//               console.error('receiverId is undefined for chat item:', item);
//               return null; // Skip this item if receiverId is undefined
//             }
  
//             const userDocRef = doc(db, "users", item.receiverId);
//             const userDocSnap = await getDoc(userDocRef);
//             const user = userDocSnap.data();
  
//             return { ...item, user };
//           });
  
//           const chatData = await Promise.all(promises);
//           // Filter out any null results caused by undefined receiverId
//           setChats(chatData.filter(chat => chat !== null).sort((a, b) => b.updatedAt - a.updatedAt));
//         } catch (err) {
//           console.error("Error fetching chats:", err);
//         }
//       }
//     );
  
//     return () => {
//       unSub();
//     };
//   }, [currentUser.id]);
  

//   const handleSelect = async (chat) => {
//     const userChats = chats.map((item) => {
//       const { user, ...rest } = item;
//       return rest;
//     });
  
//     const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
  
//     if (chatIndex !== -1) {
//       userChats[chatIndex].isSeen = true;
//       const userChatsRef = doc(db, "userchats", currentUser.id);
  
//       try {
//         await updateDoc(userChatsRef, {
//           chats: userChats,
//         });
  
//         changeChat(chat.chatId, chat.user);
//         onChatSelect(chat); 
//       } catch (err) {
//         console.error("Error updating seen status:", err);
//       }
//     } else {
//       console.warn("Chat not found in userChats:", chat);
//     }
//   };
  
  

//   const handleDelete = async (chat) => {
//     Swal.fire({
//       title: 'Are you sure?',
//       text: "Do you really want to delete this chat?",
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'Cancel',
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         const userChatsRef = doc(db, "userchats", currentUser.id);
//         const userChats = chats.map((item) => {
//           const { user, ...rest } = item;
//           return rest;
//         });

//         const chatIndex = userChats.findIndex(
//           (item) => item.chatId === chat.chatId
//         );

//         if (chatIndex !== -1) {
//           userChats.splice(chatIndex, 1);

//           try {
//             await updateDoc(userChatsRef, {
//               chats: userChats,
//             });

//             Swal.fire(
//               'Deleted!',
//               'Your chat has been deleted.',
//               'success'
//             );
//           } catch (err) {
//             console.log(err);
//           }
//         }
//       }
//     });
//   };
//   const filteredChats = chats.filter((c) => {
//     const isMatch = c.user.username.toLowerCase().includes(input.toLowerCase());
//     if (!isMatch) {
//       console.log(`Chat not matching filter: ${c.user.username}`);
//     }
//     return isMatch;
//   });
  

//   const handleAddUser = () => {
//     setAddMode(false);
//   };

//   return (
//     <div className="chatList">
//       <div className="search">
//         <div className="searchBar">
//         <BsSearch  color="gray"/>
//           <input
//             type="text"
//             placeholder="Search"
//             onChange={(e) => setInput(e.target.value)}
//           />
//         </div>
//         <div
//   style={{ color: "gray", fontSize: "17px", cursor: "pointer", }}
//   className="add"
//   onClick={() => setAddMode((prev) => !prev)}
// >
//   <div style={{marginTop:"-5px",marginLeft:"-0px"}}>
//   {addMode ? <AiOutlineMinus /> : <AiOutlinePlus />}
//   </div>
// </div>
//       </div>
//       {filteredChats.map((chat) => (
//         <div
//           className="item"
//           key={chat.chatId}
//           onClick={() => handleSelect(chat)}
//           style={{
//             backgroundColor: chat?.isSeen ? "transparent" : "#f0f2f5" ,
//           }}
//         >
//           <img
//             src={
//               chat.user.blocked.includes(currentUser.id)
//                 ? "./avatar.png"
//                 : chat.user.avatar || "./avatar.png"
//             }
//             alt=""
//           />
//           <div className="texts">
//             <span >
//               {chat.user.blocked.includes(currentUser.id)
//                 ? "User"
//                 : chat.user.username}
//             </span>
//             <p
//               style={{
//                 fontSize: "12px",
//                 fontWeight: 300,
//                 color:"gray",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {chat.lastMessage.split(" ").length > 4
//                 ? chat.lastMessage.split(" ").slice(0, 3).join(" ") + "......"
//                 : chat.lastMessage}
//             </p>
//           </div>
//           <img
//             src="./delete.png"
//             alt=""
//             className="delete"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleDelete(chat);
//             }}
//             style={{ height: '29px', width: '29px' }}
//           />
//         </div>
//       ))}

//       {addMode && <AddUser onAddUser={handleAddUser} />}
//     </div>
//   );
// };

// export default ChatList;

import { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss'; 
import { BsSearch } from "react-icons/bs";
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';

const ChatList = ({ onChatSelect }) => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser.id) {
      console.error('currentUser.id is undefined:', currentUser);
      return;
    }

    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      if (!res.exists()) {
        console.warn('No such document for userchats:', currentUser.id);
        return;
      }
      
      const items = res.data()?.chats || [];
      const promises = items.map(async (item) => {
        if (!item.receiverId) {
          console.error('receiverId is undefined for chat item:', item);
          return null; 
        }

        const userDocRef = doc(db, "users", item.receiverId);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
            console.warn('No such user document for receiverId:', item.receiverId);
            return null;
          }
          const user = userDocSnap.data();
          return { ...item, user };
        } catch (err) {
          console.error("Error fetching user data:", err);
          return null;
        }
      });

      const chatData = await Promise.all(promises);
      setChats(chatData.filter(chat => chat !== null).sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
    if (chatIndex !== -1) {
      userChats[chatIndex].isSeen = true;
      const userChatsRef = doc(db, "userchats", currentUser.id);

      try {
        await updateDoc(userChatsRef, { chats: userChats });
        changeChat(chat.chatId, chat.user);
      } catch (err) {
        console.error("Error updating seen status:", err);
      }
    } else {
      console.warn("Chat not found in userChats:", chat);
    }
    onChatSelect(chat);
  };

  const handleDelete = async (chat) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this chat?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const userChatsRef = doc(db, "userchats", currentUser.id);
        const userChats = chats.map((item) => {
          const { user, ...rest } = item;
          return rest;
        });

        const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
        if (chatIndex !== -1) {
          userChats.splice(chatIndex, 1);
          try {
            await updateDoc(userChatsRef, { chats: userChats });
            Swal.fire('Deleted!', 'Your chat has been deleted.', 'success');
          } catch (err) {
            console.error("Error deleting chat:", err);
          }
        } else {
          console.warn("Chat to delete not found:", chat);
        }
      }
    });
  };

  const filteredChats = chats.filter((c) => {
    const isMatch = c.user.username.toLowerCase().includes(input.toLowerCase());
    if (!isMatch) {
      console.log(`Chat not matching filter: ${c.user.username}`);
    }
    return isMatch;
  });

  const handleAddUser = () => {
    setAddMode(false);
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <BsSearch color="gray" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div
          style={{ color: "gray", fontSize: "17px", cursor: "pointer" }}
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        >
          <div style={{ marginTop: "-5px", marginLeft: "-0px" }}>
            {addMode ? <AiOutlineMinus /> : <AiOutlinePlus />}
          </div>
        </div>
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#f0f2f5",
          }}
        >
          <img
            src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : chat.user.avatar || "./avatar.png"}
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}
            </span>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 300,
                color: "gray",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {chat.lastMessage.split(" ").length > 4
                ? chat.lastMessage.split(" ").slice(0, 3).join(" ") + "......"
                : chat.lastMessage}
            </p>
          </div>
          <img
            src="./delete.png"
            alt=""
            className="delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(chat);
            }}
            style={{ height: '29px', width: '29px' }}
          />
        </div>
      ))}

      {addMode && <AddUser onAddUser={handleAddUser} />}
    </div>
  );
};

export default ChatList;

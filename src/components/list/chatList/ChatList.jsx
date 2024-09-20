import { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss'; // Import the SweetAlert2 styles

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser.id) {
      console.error('currentUser.id is undefined');
      return;
    }

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data()?.chats || [];

        const promises = items.map(async (item) => {
          if (!item.receiverId) {
            console.error('receiverId is undefined');
            return null; // Skip this item if receiverId is undefined
          }

          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        // Filter out any null results caused by undefined receiverId
        setChats(chatData.filter(chat => chat !== null).sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    if (chatIndex !== -1) {
      userChats[chatIndex].isSeen = true;

      const userChatsRef = doc(db, "userchats", currentUser.id);

      try {
        await updateDoc(userChatsRef, {
          chats: userChats,
        });
        changeChat(chat.chatId, chat.user);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleDelete = async (chat) => {
    // Show confirmation dialog using SweetAlert2
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

        const chatIndex = userChats.findIndex(
          (item) => item.chatId === chat.chatId
        );

        if (chatIndex !== -1) {
          userChats.splice(chatIndex, 1);

          try {
            await updateDoc(userChatsRef, {
              chats: userChats,
            });

            Swal.fire(
              'Deleted!',
              'Your chat has been deleted.',
              'success'
            );
          } catch (err) {
            console.log(err);
          }
        }
      }
    });
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  const handleAddUser = () => {
    setAddMode(false);
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}
            </span>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 300,
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

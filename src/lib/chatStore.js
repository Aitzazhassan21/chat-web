// import { create } from "zustand";
// import { useUserStore } from "./userStore";

// export const useChatStore = create((set) => ({
//   chatId: null,
//   user: null,
//   isCurrentUserBlocked: false,
//   isReceiverBlocked: false,
//   changeChat: (chatId, user) => {
//     const currentUser = useUserStore.getState().currentUser;

//     // CHECK IF CURRENT USER IS BLOCKED
//     if (user.blocked.includes(currentUser.id)) {
//       return set({
//         chatId,
//         user: null,
//           isCurrentUserBlocked: true,
//         isReceiverBlocked: false,
//       });
//     }

//     // CHECK IF RECEIVER IS BLOCKED
//     else if (currentUser.blocked.includes(user.id)) {
//       return set({
//         chatId,
//         user: user,
//         isCurrentUserBlocked: false,
//         isReceiverBlocked: true,
//       });
//     } else {
//       return set({
//         chatId,
//         user,
//         isCurrentUserBlocked: false,
//         isReceiverBlocked: false,
//       });
//     }
//   },

//   changeBlock: () => {
//     set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
//   },
//   resetChat: () => {
//     set({
//       chatId: null,
//       user: null,
//       isCurrentUserBlocked: false,
//       isReceiverBlocked: false,
//     });
//   },
// }));
import { create } from "zustand";
import { useUserStore } from "./userStore"; // Assuming userStore manages current user info
import { doc, onSnapshot, updateDoc } from "firebase/firestore"; // Firestore imports
import { db } from "./firebase"; // Firebase configuration (make sure to replace with your Firebase config)

export const useChatStore = create((set) => ({
  chatId: null,
  senderId: null,
  receiverId: null,
  user: null, // Receiver user
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  messages: [],

  // Change chat and handle sender, receiver IDs
  changeChat: (chatId, selectedUser) => {
    const currentUser = useUserStore.getState().currentUser; // Fetch current user from userStore

    if (!currentUser || !selectedUser) {
      console.error("Current user or selected user not found");
      return;
    }

    const senderId = currentUser.id;
    const receiverId = selectedUser.id;

    console.log("Sender ID:", senderId); // Debugging log
    console.log("Receiver ID:", receiverId); // Debugging log

    // Check if current user is blocked by the receiver
    if (selectedUser.blocked && selectedUser.blocked.includes(senderId)) {
      set({
        chatId,
        user: null,
        senderId,
        receiverId,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
        messages: [],
      });
    } 
    // Check if receiver is blocked by the current user
    else if (currentUser.blocked && currentUser.blocked.includes(receiverId)) {
      set({
        chatId,
        user: selectedUser,
        senderId,
        receiverId,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
        messages: [],
      });
    } 
    // If neither user is blocked
    else {
      set({
        chatId,
        user: selectedUser,
        senderId,
        receiverId,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });

      // Sync chat messages from Firestore when chatId is changed
      useChatStore.getState().syncChatMessages(chatId);
    }
  },

  // Sync chat messages from Firestore using onSnapshot
  syncChatMessages: (chatId) => {
    if (!chatId) {
      console.error("Chat ID is null or undefined");
      return;
    }

    const chatRef = doc(db, "chats", chatId);
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      const chatData = snapshot.data();
      const messages = chatData?.messages || [];

      // Update the Zustand store with new messages
      set({ messages });

      console.log("Messages synced:", messages);
    });

    // Return unsubscribe function to clean up the listener
    return () => unsubscribe();
  },

  // Handle deleting a message in Zustand
  handleDelete: async (messageId, deleteForAll = false) => {
    const { chatId, messages, senderId } = useChatStore.getState();
    if (!chatId) return;
  
    const updatedMessages = messages.map((msg) => {
      if (msg.messageId === messageId) {
        // Delete for everyone
        if (deleteForAll) {
          return { ...msg, deletedForEveryone: true };
        } 
        // Delete only for current user
        else if (msg.senderId === senderId) {
          return { ...msg, deletedForMe: true };
        }
      }
      return msg;
    });
  
    const chatRef = doc(db, "chats", chatId);
    try {
      await updateDoc(chatRef, { messages: updatedMessages });
      console.log("Message updated successfully.");
    } catch (error) {
      console.error("Error updating Firestore document:", error);
    }
  },
  

  // Reset the chat state
  resetChat: () => {
    set({
      chatId: null,
      senderId: null,
      receiverId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
      messages: [],
    });
  },
}));

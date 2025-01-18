import { create } from "zustand";

type ChatState = {
  chatTitle: string;
  setChatTitle: (title: string) => void;
};

export const useSetChatTitle = create<ChatState>((set) => ({
  chatTitle: "Welcome User!",
  setChatTitle: (chat) => set({ chatTitle: chat }),
}));

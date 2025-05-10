import { DriveStep } from "driver.js";

export const tourSteps: DriveStep[] = [
  {
    element: '[data-testid="sidebar-nav"]',
    popover: {
      title: "Explore the Sidebar",
      description:
        "Your control hub for starting new chats, accessing history, and customizing your experience.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="new-chat-button"]',
    popover: {
      title: "Start a New Chat",
      description: "Begin a fresh conversation with Maven AI effortlessly.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="history-button"]',
    popover: {
      title: "Review Chat History",
      description: "Easily revisit your past conversations at any time.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="toggle-sidebar"]',
    popover: {
      title: "Toggle Sidebar",
      description: "Show or hide the sidebar to optimize your workspace.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="theme-toggle-button"]',
    popover: {
      title: "Switch Themes",
      description: "Personalize your interface with light or dark mode.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="user-profile"]',
    popover: {
      title: "Manage Your Profile",
      description: "Access and update your profile settings here.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="chat-header"]',
    popover: {
      title: "Chat Overview",
      description:
        "View your chat title and share conversations with the share button.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-testid="chat-panel"]',
    popover: {
      title: "Compose Your Query",
      description:
        "Craft your message and enhance it with search, related suggestions, or a specific data source.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-testid="search-button"]',
    popover: {
      title: "Enable Search",
      description:
        "Activate external data retrieval for richer, more detailed responses.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-testid="related-button"]',
    popover: {
      title: "Discover Related Queries",
      description:
        "Unlock relevant follow-up questions to deepen your conversation.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-testid="source-select"]',
    popover: {
      title: "Select Data Source",
      description:
        "Choose a source like Insight or Tokopedia for tailored query results.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-testid="rate-limit"]',
    popover: {
      title: "Usage Limits",
      description:
        "To ensure fair access, this portfolio app applies usage limits for all users.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-testid="send-button"]',
    popover: {
      title: "Send Your Message",
      description: "Press Enter or click to engage with Maven AI instantly.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-testid="rate-app"]',
    popover: {
      title: "Share Your Feedback",
      description:
        "Rate the app to help improve and support the developer’s work!",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-testid="dev-portfolio"]',
    popover: {
      title: "Discover More Projects",
      description:
        "Explore the developer’s portfolio to see other innovative creations.",
      side: "right",
      align: "start",
    },
  },
];

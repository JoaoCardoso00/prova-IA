import { useEffect, useRef } from "react";

export function Chat({ messages }: { messages: MessageProps[] }) {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 border rounded-md mb-4 shrink-0 p-3 flex flex-col gap-6 overflow-auto">
      {messages.map((message, i) => (
        <Message key={i} {...message} />
      ))}
      <div ref={chatRef} />
    </div>
  );
}

export type MessageProps = {
  message: string;
  sender: "user" | "bot";
  initial?: boolean;
};

function Message({ message, sender, initial }: MessageProps) {
  let image =
    sender === "user" ? "https://i.imgur.com/8Km9tLL.png" : "/questly.png";

  if (sender === "bot") {
    return (
      <div className="flex text-gray-900">
        <div className="mr-2 flex-shrink-0">
          <img src="/questly.png" alt="" className="h-8 w-8" />
        </div>
        <div className="mt-1">
          {initial ? (
            <h4 className="text-sm font-bold">
              Olá, bem vindo(a) ao criador de questões do questly!
            </h4>
          ) : null}
          <p className="mt-1 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex text-gray-900 ml-auto">
      <div className="text-right">
        <p className="mt-1 text-sm">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0">
        <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100">
          <svg
            className="h-full w-full text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>
      </div>
    </div>
  );
}

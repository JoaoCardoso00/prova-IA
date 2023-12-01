"use client";
import Image from "next/image";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  Fragment,
  KeyboardEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import OpenAI from "openai";
import {
  AdjustmentsVerticalIcon,
  ExclamationTriangleIcon,
  FaceFrownIcon,
  FaceSmileIcon,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Listbox, Transition } from "@headlessui/react";
import { Chat, MessageProps } from "@/components/chat";

type PossibleDifficulty = "easy" | "medium" | "hard" | "impossible" | null;
let possibleMessages = {
  nivel:
    "Qual é o nível de ensino dos alunos que responderão a estas questões?",
  tipo: "Você está buscando uma questão de múltipla escolha, resposta curta, dissertativa ou de outro formato?",
  topico:
    "Existe algum tópico específico ou habilidade que você deseja avaliar com esta questão?",
  baseada_em_material:
    "Você deseja que a questão seja baseada em um texto, imagem, caso de estudo ou outro tipo de material de apoio?",
  conteudo: "Qual é o conteúdo que você deseja avaliar com esta questão?",
  quantidade_de_alternativas:
    "Quantas alternativas você deseja que a questão tenha?",
  formato: "Qual é o formato da questão?",
};

const difficulty = [
  {
    name: "Fácil",
    value: "easy",
    icon: FaceSmileIcon,
    iconColor: "text-white",
    bgColor: "bg-green-400",
  },
  {
    name: "Médio",
    value: "medium",
    icon: FaceFrownIcon,
    iconColor: "text-white",
    bgColor: "bg-yellow-400",
  },
  {
    name: "Difícil",
    value: "hard",
    icon: FireIcon,
    iconColor: "text-white",
    bgColor: "bg-red-400",
  },
  {
    name: "Impossível",
    value: "impossible",
    icon: ExclamationTriangleIcon,
    iconColor: "text-white",
    bgColor: "bg-black",
  },
  {
    name: "Não especificado",
    value: null,
    icon: XMarkIcon,
    iconColor: "text-gray-400",
    bgColor: "bg-transparent",
  },
];

const openai = new OpenAI({
  apiKey: "chave-api",
  dangerouslyAllowBrowser: true,
});

export default function Home() {
  const [selected_difficulty, set_selected_difficulty] = useState<
    (typeof difficulty)[number]
  >(difficulty[4]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [responded, setResponded] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([
    {
      initial: true,
      message:
        "Primeiro preciso saber qual é a área de ensino ou o assunto específico para o qual você está criando a questão?",
      sender: "bot",
    },
  ]);

  async function generateQuestion() {
    let prompt = `Você é um expert em criar questões para provas, exercicios, simulados, entre outros, seu objetivo é criar uma questão de dificuldade: ${selected_difficulty.name}, que fique claro que dificuldade "impossivel" não deve ser impossivel, apenas muito dificil, foram feitas algumas perguntas para o usuário, quando o usuário foi perguntado: ${questions[0]}, ele respondeu: ${answers[0]}, quando o usuário foi perguntado: ${questions[1]}, ele respondeu: ${answers[1]}, quando o usuário foi perguntado: ${questions[2]}, ele respondeu: ${answers[2]}, quando o usuário foi perguntado: ${questions[3]}, ele respondeu: ${answers[3]}, gere uma questão baseada nessas informações, não peça mais informações, sempre dê a resposta da questão e faça com que a resposta tenha a formação simples, o usuário não conseguirá responder, se você não tiver informações suficientes, você pode cria-las ou assumir que o usuário não sabe, mas não peça mais informações, o usuário não conseguirá responder.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    console.log(completion);

    let previous_chat = messages.slice(0, -1);
    setMessages([
      ...previous_chat,
      {
        message:
          completion.choices[0].message.content ??
          "Não foi possível gerar a questão",
        sender: "bot",
      },
    ]);

    setResponded(true);
  }

  function sendBotMessage(message: string) {
    setMessages((prev) => [
      ...prev,
      {
        message,
        sender: "bot",
      },
    ]);
  }

  function pushQuestion(question: string) {
    setQuestions((prev) => [...prev, question]);
  }

  function sendNextMassage() {
    let userMessage = messages[messages.length - 1].message;
    let currentBotMessage = messages.filter((m) => m.sender === "bot").length;
    console.log(currentBotMessage);

    switch (currentBotMessage) {
      case 1:
        sendBotMessage(possibleMessages.nivel);
        pushQuestion(possibleMessages.nivel);
        break;
      case 2:
        sendBotMessage(possibleMessages.tipo);
        pushQuestion(possibleMessages.tipo);
        break;
      case 3:
        // check if "multipla escolha" or any other options is in the message
        let is_multipla_escolha = userMessage
          .toLowerCase()
          .includes("multipla escolha");

        let is_resposta_curta = userMessage
          .toLowerCase()
          .includes("resposta curta");

        let is_dissertativa = userMessage
          .toLowerCase()
          .includes("dissertativa");

        let is_outro_formato = userMessage
          .toLowerCase()
          .includes("outro formato");

        if (is_multipla_escolha) {
          sendBotMessage(possibleMessages.quantidade_de_alternativas);
          pushQuestion(possibleMessages.quantidade_de_alternativas);
        }

        if (is_resposta_curta) {
          sendBotMessage(possibleMessages.conteudo);
          pushQuestion(possibleMessages.conteudo);
        }

        if (is_dissertativa) {
          sendBotMessage(possibleMessages.conteudo);
          pushQuestion(possibleMessages.conteudo);
        }

        if (is_outro_formato) {
          sendBotMessage(possibleMessages.formato);
          pushQuestion(possibleMessages.formato);
        }
        break;
      case 4:
        sendBotMessage(possibleMessages.baseada_em_material);
        pushQuestion(possibleMessages.baseada_em_material);
        break;
    }
  }

  useEffect(() => {
    let lastMessage = messages[messages.length - 1];

    if (lastMessage.sender === "user") {
      setAnswers((prev) => [...prev, lastMessage.message]);

      let is_last_message = questions.length === 4;

      console.log(is_last_message);

      if (!is_last_message) {
        sendNextMassage();
      } else {
        if (!responded) {
          sendBotMessage("Criando Questão...");
          generateQuestion();
        }
      }
    }
  }, [messages]);

  return (
    <main className="flex bg-white min-h-screen flex-col items-center justify-center ">
      <div className="w-[36rem] h-[42rem] flex flex-col">
        <Chat messages={messages} />
        <InputBox
          setMessages={setMessages}
          selected={selected_difficulty}
          setSelected={set_selected_difficulty}
        />
        {/* <button className="bg-red-500" onClick={() => generateQuestion()}>
          TESTE
        </button> */}
      </div>
    </main>
  );
}

function InputBox({
  setMessages,
  selected,
  setSelected,
}: {
  setMessages: Dispatch<SetStateAction<MessageProps[]>>;
  selected: (typeof difficulty)[number];
  setSelected: Dispatch<SetStateAction<(typeof difficulty)[number]>>;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [val, setVal] = useState("");
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.target.value);
  };

  function handleSendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!val) return;
    setMessages((prev) => [
      ...prev,
      {
        message: val,
        sender: "user",
      },
    ]);
    setVal("");
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(event as unknown as FormEvent<HTMLFormElement>);
    }
  };

  useEffect(() => {
    if (!textAreaRef.current) return;

    const textArea = textAreaRef.current;

    // Function to update height
    const updateHeight = () => {
      textArea.style.height = "auto"; // Reset height to recalculate
      const newHeight = Math.min(textArea.scrollHeight, 128); // 128px is equivalent to h-32
      textArea.style.height = `${newHeight}px`;
    };

    // Initial height setting
    updateHeight();

    // Event listener for window resize
    window.addEventListener("resize", updateHeight);

    return () => {
      // Cleanup listener on component unmount
      window.removeEventListener("resize", updateHeight);
    };
  }, [val]);

  return (
    <div className="flex items-start space-x-4">
      <div className="min-w-0 flex-1">
        <form
          action="#"
          className="relative"
          onSubmit={(e) => handleSendMessage(e)}
        >
          <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
            <label htmlFor="comment" className="sr-only">
              Escreva aqui!
            </label>
            <textarea
              rows={1}
              name="comment"
              id="comment"
              onKeyDown={handleKeyPress}
              className="block w-full resize-none overflow-auto pt-2 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Escreva aqui..."
              value={val}
              onChange={handleChange}
              ref={textAreaRef}
            />
          </div>

          <div className="inset-x-0 bottom-0 flex justify-between pl-3 pr-2 mt-4">
            <div className="flex items-center space-x-5">
              <div className="flex items-center">
                <button
                  type="button"
                  className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                >
                  <PaperClipIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Attach a file</span>
                </button>
              </div>
              <div className="flex items-center">
                <Listbox value={selected} onChange={setSelected}>
                  {({ open }) => (
                    <>
                      <Listbox.Label className="sr-only">
                        Dificuldade
                      </Listbox.Label>
                      <div className="relative">
                        <Listbox.Button className="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                          <span className="flex items-center justify-center">
                            {selected.value === null ? (
                              <span>
                                <AdjustmentsVerticalIcon
                                  className="h-5 w-5 flex-shrink-0"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">
                                  Mude a dificuldade da questão
                                </span>
                              </span>
                            ) : (
                              <span>
                                <span
                                  className={classNames(
                                    selected.bgColor,
                                    "flex h-8 w-8 items-center justify-center rounded-full"
                                  )}
                                >
                                  <selected.icon
                                    className="h-5 w-5 flex-shrink-0 text-white"
                                    aria-hidden="true"
                                  />
                                </span>
                                <span className="sr-only">{selected.name}</span>
                              </span>
                            )}
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 ml-6 -mt-72 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm">
                            {difficulty.map((mood) => (
                              <Listbox.Option
                                key={mood.value}
                                className={({ active }) =>
                                  classNames(
                                    active ? "bg-gray-100" : "bg-white",
                                    "relative cursor-default select-none px-3 py-2"
                                  )
                                }
                                value={mood}
                              >
                                <div className="flex items-center">
                                  <div
                                    className={classNames(
                                      mood.bgColor,
                                      "flex h-8 w-8 items-center justify-center rounded-full"
                                    )}
                                  >
                                    <mood.icon
                                      className={classNames(
                                        mood.iconColor,
                                        "h-5 w-5 flex-shrink-0"
                                      )}
                                      aria-hidden="true"
                                    />
                                  </div>
                                  <span className="ml-3 block truncate text-gray-900 font-medium">
                                    {mood.name}
                                  </span>
                                </div>
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </>
                  )}
                </Listbox>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Enviar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function classNames(...classes: string[] | boolean[]) {
  return classes.filter(Boolean).join(" ");
}

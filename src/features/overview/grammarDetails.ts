interface Detail {
  function: string;
  columns: { heading: string; lines: string[] }[];
  tip: string;
}
export const grammarDetails: Detail[] = [
  { function: "", columns: [], tip: "" },
  {
    function:
      "Personal pronouns and be tell us who or what somebody or something is.",
    columns: [
      {
        heading: "Singular",
        lines: [
          "I am → I'm",
          "you are → you're",
          "he is → he's",
          "she is → she's",
          "it is → it's",
        ],
      },
      {
        heading: "Plural",
        lines: ["we are → we're", "you are → you're", "they are → they're"],
      },
      {
        heading: "Examples",
        lines: ["I'm Luke.", "She's twelve.", "They're good friends."],
      },
    ],
    tip: "I is always capitalized. You can address one person or several people. Use it for most animals and things; a known pet can be he or she.",
  },
  {
    function: "Use be + not to say that something is not true.",
    columns: [
      { heading: "I", lines: ["I am not → I'm not", "I'm not eight."] },
      {
        heading: "He / she / it",
        lines: [
          "he is not → he isn't",
          "she is not → she isn't",
          "it is not → it isn't",
        ],
      },
      {
        heading: "You / we / they",
        lines: [
          "you are not → you aren't",
          "we are not → we aren't",
          "they are not → they aren't",
        ],
      },
    ],
    tip: "There is no amn't. Say I'm not.",
  },
  {
    function: "Ask whether something is true with a yes/no question using be.",
    columns: [
      {
        heading: "Statement → question",
        lines: [
          "Luke is from Greenwich.",
          "Is Luke from Greenwich?",
          "You are eleven.",
          "Are you eleven?",
        ],
      },
      {
        heading: "Yes",
        lines: ["Yes, I am.", "Yes, he is.", "Yes, she is.", "Yes, they are."],
      },
      {
        heading: "No",
        lines: [
          "No, I'm not.",
          "No, he isn't.",
          "No, she isn't.",
          "No, they aren't.",
        ],
      },
    ],
    tip: "Swap the subject and be. Use the full form of be in a yes answer; give a short answer rather than yes or no alone.",
  },
  {
    function: "Use question words when you want specific information.",
    columns: [
      {
        heading: "Person / thing",
        lines: ["Who is that? → Tony.", "What is this? → A biscuit."],
      },
      {
        heading: "Place / time",
        lines: [
          "Where are you? → In the bath.",
          "Where are you from? → Greenwich.",
          "When is it? → Today.",
        ],
      },
      {
        heading: "Other questions",
        lines: [
          "How old are you? → Eleven.",
          "where is → where's",
          "who is → who's",
          "what is → what's",
        ],
      },
    ],
    tip: "Where asks about a place; who asks about a person.",
  },
  {
    function:
      "Possessive determiners show who something belongs to. Put them before a noun or adjective + noun.",
    columns: [
      {
        heading: "Singular",
        lines: [
          "I → my room",
          "you → your room",
          "he → his name",
          "she → her name",
          "it → its door",
        ],
      },
      {
        heading: "Plural",
        lines: ["we → our house", "you → your family", "they → their names"],
      },
      {
        heading: "Examples",
        lines: [
          "My name is Luke.",
          "Her name is Pia.",
          "Their names are Anna and Jack.",
        ],
      },
    ],
    tip: "your means belonging to you; you're means you are. its means belonging to it; it's means it is.",
  },
  {
    function: "Say that a person, animal, or thing exists or is in a place.",
    columns: [
      {
        heading: "Singular",
        lines: [
          "There is a mouse.",
          "Is there a mouse?",
          "Yes, there is.",
          "No, there isn't.",
        ],
      },
      {
        heading: "Plural",
        lines: [
          "There are two mice.",
          "Are there two mice?",
          "Yes, there are.",
          "No, there aren't.",
        ],
      },
      {
        heading: "Places",
        lines: ["under the chair", "on the table", "in the room"],
      },
    ],
    tip: "There is is often shortened to there's. Use is for one, are for more than one.",
  },
  {
    function:
      "Use an indefinite article for one person or thing that is not yet specifically known.",
    columns: [
      {
        heading: "a + consonant sound",
        lines: ["a problem", "a uniform", "a new boy", "a fridge"],
      },
      {
        heading: "an + vowel sound",
        lines: ["an interview", "an uncle", "an English test", "an idea"],
      },
      {
        heading: "Compare",
        lines: [
          "a cousin / an aunt",
          "a loft / an address",
          "a uniform / an uncle",
        ],
      },
    ],
    tip: "Listen to the first sound of the next word. Its first letter is not always enough.",
  },
  {
    function:
      "Use the definite article for a person or thing that is already known.",
    columns: [
      {
        heading: "the [ðə]",
        lines: ["the problem", "the uniform", "the new boy", "the dog"],
      },
      {
        heading: "the [ði]",
        lines: [
          "the interview",
          "the uncle",
          "the English test",
          "the art room",
        ],
      },
      {
        heading: "Singular / plural",
        lines: ["the boy", "the boys", "the house", "the houses"],
      },
    ],
    tip: "The spelling the stays the same. Pronunciation changes with the next sound.",
  },
  {
    function: "Use have got or has got to say that somebody has something.",
    columns: [
      {
        heading: "I / you / we / they",
        lines: [
          "I have got → I've got",
          "you have got → you've got",
          "we have got → we've got",
          "they have got → they've got",
        ],
      },
      {
        heading: "He / she / it",
        lines: [
          "he has got → he's got",
          "she has got → she's got",
          "it has got → it's got",
        ],
      },
      {
        heading: "Examples",
        lines: [
          "I've got a dog.",
          "She's got two guinea pigs.",
          "We've got a computer room.",
        ],
      },
    ],
    tip: "Use has got only with he, she, and it.",
  },
  {
    function:
      "Use haven't got or hasn't got to say somebody does not have something.",
    columns: [
      {
        heading: "I / you / we / they",
        lines: [
          "I haven't got a pet.",
          "You haven't got a bag.",
          "We haven't got a pet.",
          "They haven't got books.",
        ],
      },
      {
        heading: "He / she / it",
        lines: [
          "He hasn't got a dog.",
          "Holly hasn't got her charm.",
          "It hasn't got a door.",
        ],
      },
      {
        heading: "Build the negative",
        lines: [
          "have + not + got",
          "has + not + got",
          "haven't got",
          "hasn't got",
        ],
      },
    ],
    tip: "Do not say we'ven't got. Say we haven't got.",
  },
];

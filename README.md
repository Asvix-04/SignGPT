# SignGPT

Let's start from a clean slate, we have chatgpt for general queries, coding problems....any problem it has solution for everything. In recent times every bot like generally if we see the trajectory of the AI bots, its largely focusing the majority group i.e people/humans without disablities but what about those who cannot speak,listen and see? They are also a part of the world, they should also get the leisure of solving their day-to-day problems with an AI conversational bot.

### My goal with this venture is to hit the minority with a transformational change which (maybe) no one thought of, so lets just build what no one has done it before!

A constructual vision of mine with this project is to have a sign to sign feature with an integrated bot having an AI avatar. like user will sign to the bot asking a question and the bot will answer it with a sign language response using an AI avatar. If the question's answer cannot be interpreted in sign language then the bot will automatically give two options either get the reponse in textual manner or in audio format.

Add ons?

> Users could choose and modify the AI avatars like facially.
> users can increase or decrease the conversationallity and user friendliness of the bot.
> users can choose AI avatars according to their characters (for example: charming, savvy, cool, humorous)
> AI avatars can be inspired from Marvel/DC charaacter, personally i would like an AI avatar of JOKER & THE BATMAN! (i'mma an ex-marvel fan btw)

Apart from my ranting i would love to have some contributors to this project, if you think you have what we need then please make a pull request stating your additions and if you've some cool ideas as well to integrate with SignGPT, drop a mail at agvskanda@gmail.com


# There could be 2 projects with this particular idea, one is the above described one and the another one could be:



# Sign-AI Meet

**SignViz Meet** is a real-time, sign language–enabled video conferencing platform designed specifically for deaf and hard-of-hearing users. It supports gesture recognition, speech-to-sign translation, and accessibility-first communication to enable natural, inclusive conversations online. 

---

## Features

- Real-time Sign Language Recognition from webcam
- Speech-to-Sign output via avatar/animation
- Video calling powered by WebRTC
- Optional subtitles and text overlays
- Accessibility-first UI (high contrast, gesture space zoom)
- Bi-directional communication: Deaf ↔ Hearing

---

## Tech Stack

| Layer           | Tech                                     |
|----------------|------------------------------------------|
| Frontend        | React.js + Tailwind + CSS                |
| Backend         | Node.js or FastAPI                       |
| Video Layer     | WebRTC (100ms / Daily.co / Twilio)       |
| Sign Detection  | MediaPipe / OpenPose + TensorFlow        |
| Speech-to-Text  | OpenAI Whisper / Google Speech API       |
| Sign Rendering  | 3D Avatar (Three.js or Unity WebGL)      |

---

## Installation

```bash
git clone https://github.com/Asvix-04/SignGPT.git
cd Sign-AIMeet
npm install
npm run dev

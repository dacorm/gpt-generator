import { tokenize, textify } from "./tokenizer.js";

const range = (count) => Array.from(Array(count).keys());
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = (list) => list[random(0, list.length - 1)];

const escapeString = (token) => `_+${token}`;
const fromTokens = (tokens) => escapeString(tokens.join(""));

function sliceCorpus(corpus, sampleSize) {
  return corpus
    .map((_, index) => corpus.slice(index, index + sampleSize))
    .filter((group) => group.length === sampleSize);
}

function collectTransitions(samples) {
  return samples.reduce((transitions, sample) => {
    const lastIndex = sample.length - 1;
    const lastToken = sample[lastIndex];
    const restTokens = sample.slice(0, lastIndex);

    const state = fromTokens(restTokens);
    const next = lastToken;

    transitions[state] = transitions[state] ?? [];
    transitions[state].push(next);
    return transitions;
  }, {});
}

function createChain(startText, transitions) {
  const head = startText ?? pickRandom(Object.keys(transitions));
  return tokenize(head);
}

function predictNext(chain, transitions, sampleSize) {
  const lastState = fromTokens(chain.slice(-(sampleSize - 1)));
  const nextWords = transitions[lastState] ?? [];
  return pickRandom(nextWords);
}

function* generateChain(startText, transitions, sampleSize) {
  const chain = createChain(startText, transitions);

  while (true) {
    const state = predictNext(chain, transitions, sampleSize);
    yield state;

    if (state) chain.push(state);
    else chain.pop();
  }
}

export function generate({
  source,
  start = null,
  wordsCount = 200,
  sampleSize = 3,
} = {}) {
  if (!source) throw new Error("The source text cannot be empty.");
  if (sampleSize < 2) throw new Error("Sample size must not be less than 2.");

  const corpus = tokenize(String(source));
  const samples = sliceCorpus(corpus, sampleSize);
  const transitions = collectTransitions(samples);

  const generator = generateChain(start, transitions, sampleSize);
  const chain = range(wordsCount).map((_) => generator.next().value);
  return textify(chain);
}

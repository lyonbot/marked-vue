<script setup lang="ts">
/// <reference types="vite/client" />

import { ref } from 'vue';
import { MarkedVue } from '../../src'
import fullContent from '../../README.md?raw'
// import fullContent from './sample.md?raw'

import 'github-markdown-css/github-markdown.css'

const content = ref("")
const timer = setInterval(() => {
  content.value = fullContent.slice(0, content.value.length + 40);
  if (content.value.length >= fullContent.length) {
    clearInterval(timer);
  }
}, 80);



// example: use "marked-emoji" extension

import { type Marked } from 'marked';
import { markedEmoji, type EmojiToken } from "marked-emoji";

const markedSetup = (marked: Marked) => {
  marked.use(markedEmoji({
    emojis: {
      "heart": "❤️",
      "tada": "🎉",
      "smile": "😄",
      "sad": "😢",
      "angry": "😠",
      "laugh": "😂",
      "confused": "😕",
      "wink": "😉",
    },
  }))
}
</script>

<template>
  <div class="demo-container">
    <!-- anchor element, to auto scroll to the bottom -->
    <div style="flex: 1 0 100px; margin-top: -100px; z-index: -1;"></div>

    <div class="markdown-body">
      <MarkedVue :content="content" :setup="markedSetup">
        <!-- custom code block renderer -->
        <template #code="{ token }">
          <pre class="my-code-block">
          <div class="my-code-block-lang" v-if="token.lang">
            <span>{{ token.lang }}</span>
          </div>
          <code>{{ token.text }}</code>
        </pre>
        </template>

        <!-- custom list item renderer -->
        <template #list_item="{ token, content }">
          <li class="my-list-item">
            <component :is="content" />
          </li>
        </template>

        <!-- for extension "marked-emoji" -->
        <!-- see https://github.com/UziTech/marked-emoji -->
        <template #emoji="{ token }: { token: EmojiToken<string> }">
          <span class="my-emoji">{{ token.emoji }}</span>
        </template>
      </MarkedVue>
    </div>
  </div>
</template>

<style>
.my-code-block {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.my-code-block-lang {
  display: flex;
  justify-content: flex-end;
  background-color: #e0e0e0;
  padding: 0 10px;
  border-radius: 5px;
  margin: -10px;
  margin-bottom: 5px;
}

.my-list-item {
  animation: my-list-item-enter 1s ease-in-out;
}

.my-list-item:hover {
  background-color: #e0e0e0;
  outline: 1px solid #000;
}

@keyframes my-list-item-enter {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.demo-container {
  display: flex;
  flex-direction: column-reverse;
  overflow: auto;
  height: 90vh;
  border: 1px solid #000;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
  max-width: 1200px;
  margin: auto;
}
</style>

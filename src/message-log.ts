import { Display } from 'rot-js';
import { Colors } from './colors';

export class Message {
  count: number;

  constructor(public plainText: string, public fg: Colors) {
    this.count = 1;
  }

  get fullText(): string {
    if (this.count > 1) {
      return `${this.plainText} (x${this.count})`;
    }
    return this.plainText;
  }
}

export class MessageLog {
  messages: Message[];

  constructor() {
    this.messages = [];
  }

  addMessage(text: string, fg: Colors = Colors.White, stack: boolean = true) {
    if (
      stack &&
      this.messages.length > 0 &&
      this.messages[this.messages.length - 1].plainText === text
    ) {
      this.messages[this.messages.length - 1].count++;
    } else {
      this.messages.push(new Message(text, fg));
    }
  }

  render(
    display: Display,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.renderMessages(display, x, y, width, height, this.messages);
  }

  renderMessages(
    display: Display,
    x: number,
    y: number,
    width: number,
    height: number,
    messages: Message[],
  ) {
    let yOffset = height - 1;

    const reversed = messages.slice().reverse();
    for (let msg of reversed) {
      let lines = [msg.fullText];
      if (msg.fullText.length > width) {
        const words = msg.fullText.split(' ');
        let currentLine = '';
        lines = [];

        // loop through words
        while (words.length > 0) {
          // if current line length + word length > width: start new line
          if ((currentLine + ' ' + words[0]).length > width) {
            lines.push(currentLine);
            currentLine = '';
          } else {
            // else add word to current line
            currentLine += ' ' + words.shift();
          }
        }

        lines.push(currentLine);
        lines.reverse();
      }

      for (let line of lines) {
        const text = `%c{${msg.fg}}${line}`;
        display.drawText(x, y + yOffset, text, width);
        yOffset -= 1;
        if (yOffset < 0) return;
      }
    }
  }
}

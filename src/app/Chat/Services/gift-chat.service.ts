import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GiftAssistantApiService } from './gift-assistant-api.service';

export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  displayText?: string;
  products?: GiftProduct[];
  timestamp: Date;
  isTyping?: boolean;
}

export interface GiftProduct {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  description?: string;
  whyRecommended?: string;
}

export interface GiftRequestState {
  recipientType?: string;
  ageRange?: string;
  interests?: string[];
  stylePreferences?: string;
  colorPreferences?: string[];
  budget?: string;
  occasion?: string;
  additionalNotes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GiftChatService {
  private apiService = inject(GiftAssistantApiService);

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private stateSubject = new BehaviorSubject<GiftRequestState>({});
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();
  public state$: Observable<GiftRequestState> = this.stateSubject.asObservable();
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private sessionId = '';
  private typingTimer: any = null;

  constructor() {
    this.initializeSession();
  }

  private initializeSession(): void {
    let id = localStorage.getItem('gift_assistant_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('gift_assistant_session_id', id);
    }
    this.sessionId = id;

    const cachedHistory = localStorage.getItem(`gift_assistant_history_${id}`);
    if (cachedHistory) {
      try {
        const parsed = JSON.parse(cachedHistory) as ChatMessage[];
        this.messagesSubject.next(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
        const cachedState = localStorage.getItem(`gift_assistant_state_${id}`);
        if (cachedState) {
          this.stateSubject.next(JSON.parse(cachedState));
        }
        return;
      } catch (e) {
        console.error('Failed to parse cached history', e);
      }
    }

    this.messagesSubject.next([this.createWelcomeMessage()]);
  }

  private createWelcomeMessage(): ChatMessage {
    return {
      sender: 'assistant',
      text: "Hi there! ✨ I'm your personal gift curator. Tell me about who you're shopping for, and I'll find the perfect handmade treasures from our collection.",
      timestamp: new Date(),
    };
  }

  public sendMessage(messageText: string): void {
    if (!messageText || messageText.trim() === '' || this.loadingSubject.value) return;

    const currentMessages = this.messagesSubject.value;
    const userMessage: ChatMessage = {
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    const updatedMessages = [...currentMessages, userMessage];
    this.messagesSubject.next(updatedMessages);
    this.saveToStorage(updatedMessages, this.stateSubject.value);
    this.loadingSubject.next(true);

    this.apiService.chat(this.sessionId, messageText).subscribe({
      next: (res) => {
        const data = res.data || res;
        const fullText = data.reply || '';
        const products = data.products || [];
        const state = data.state || {};

        this.loadingSubject.next(false);
        this.animateTyping(updatedMessages, fullText, products, state);
      },
      error: () => {
        const errorMessage: ChatMessage = {
          sender: 'assistant',
          text: "I'm having trouble connecting right now. Let's try that again in a moment!",
          timestamp: new Date(),
        };
        const finalMessages = [...updatedMessages, errorMessage];
        this.messagesSubject.next(finalMessages);
        this.saveToStorage(finalMessages, this.stateSubject.value);
        this.loadingSubject.next(false);
      },
    });
  }

  private animateTyping(
    previousMessages: ChatMessage[],
    fullText: string,
    products: GiftProduct[],
    state: GiftRequestState
  ): void {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
    }

    const replyMessage: ChatMessage = {
      sender: 'assistant',
      text: fullText,
      displayText: '',
      products: products,
      timestamp: new Date(),
      isTyping: true,
    };

    let charIndex = 0;
    const charsPerTick = Math.max(1, Math.ceil(fullText.length / 40));

    const allMessages = [...previousMessages, replyMessage];
    this.messagesSubject.next(allMessages);

    this.typingTimer = setInterval(() => {
      charIndex += charsPerTick;
      if (charIndex >= fullText.length) {
        charIndex = fullText.length;
        clearInterval(this.typingTimer);
        this.typingTimer = null;

        replyMessage.displayText = fullText;
        replyMessage.isTyping = false;

        const finalMessages = [...previousMessages, { ...replyMessage }];
        this.messagesSubject.next(finalMessages);
        this.stateSubject.next(state);
        this.saveToStorage(finalMessages, state);
      } else {
        replyMessage.displayText = fullText.substring(0, charIndex);
        this.messagesSubject.next([...previousMessages, { ...replyMessage }]);
      }
    }, 25);
  }

  public resetSession(): void {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }

    // Call backend to clear server-side state
    this.apiService.resetSession(this.sessionId).subscribe({ error: () => {} });

    // Generate new session
    const id = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    localStorage.setItem('gift_assistant_session_id', id);
    this.sessionId = id;

    const initialMessages: ChatMessage[] = [this.createWelcomeMessage()];
    this.messagesSubject.next(initialMessages);
    this.stateSubject.next({});
    this.loadingSubject.next(false);
    this.saveToStorage(initialMessages, {});
  }

  public getDisplayText(msg: ChatMessage): string {
    if (msg.sender === 'user') return msg.text;
    if (msg.isTyping && msg.displayText !== undefined) return msg.displayText;
    return msg.text;
  }

  private saveToStorage(messages: ChatMessage[], state: GiftRequestState): void {
    localStorage.setItem(`gift_assistant_history_${this.sessionId}`, JSON.stringify(messages));
    localStorage.setItem(`gift_assistant_state_${this.sessionId}`, JSON.stringify(state));
  }
}

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GiftChatService, ChatMessage, GiftRequestState } from '../../Services/gift-chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gift-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './gift-chat.component.html',
  styleUrl: './gift-chat.component.css'
})
export class GiftChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;

  private chatService = inject(GiftChatService);

  messages: ChatMessage[] = [];
  currentState: GiftRequestState = {};
  isLoading = false;
  userInput = '';
  showPanel = false;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(
      this.chatService.messages$.subscribe(msgs => {
        this.messages = msgs;
        this.scrollToBottom();
      }),
      this.chatService.state$.subscribe(state => {
        this.currentState = state;
      }),
      this.chatService.loading$.subscribe(loading => {
        this.isLoading = loading;
        this.scrollToBottom();
      })
    );
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) return;
    this.chatService.sendMessage(this.userInput);
    this.userInput = '';
  }

  sendSuggestion(text: string): void {
    if (this.isLoading) return;
    this.chatService.sendMessage(text);
  }

  resetChat(): void {
    this.chatService.resetSession();
  }

  getDisplayText(msg: ChatMessage): string {
    return this.chatService.getDisplayText(msg);
  }

  hasPreferences(): boolean {
    if (!this.currentState) return false;
    return !!(
      this.currentState.recipientType ||
      this.currentState.ageRange ||
      (this.currentState.interests && this.currentState.interests.length > 0) ||
      this.currentState.stylePreferences ||
      (this.currentState.colorPreferences && this.currentState.colorPreferences.length > 0) ||
      this.currentState.budget ||
      this.currentState.occasion ||
      this.currentState.additionalNotes
    );
  }

  private scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop =
          this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}

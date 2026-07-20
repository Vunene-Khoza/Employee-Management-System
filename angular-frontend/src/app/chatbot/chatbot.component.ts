import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';

export interface MessageSegment {
  text: string;
  isLink: boolean;
  route?: string;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  timestamp: Date;
  segments: MessageSegment[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatBody') private chatBody!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading = false;

  constructor(
    private chatService: ChatService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      // Add initial greeting with inline navigation links
      const greeting = 'Hello! I am your HR Chatbot. How can I help you today? You can ask me questions, or quickly [View Employees|/employees], [Add Employee|/create-employee], or [View Departments|/departments].';
      this.messages.push({
        segments: this.parseSegments(greeting),
        sender: 'bot',
        timestamp: new Date()
      });
    }
  }

  parseSegments(text: string): MessageSegment[] {
    const segments: MessageSegment[] = [];
    const regex = /\[([^|\]]+)\|([^\]]+)\]/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Add plain text before match
      if (match.index > lastIndex) {
        segments.push({
          text: text.substring(lastIndex, match.index),
          isLink: false
        });
      }
      // Add link segment
      segments.push({
        text: match[1].trim(),
        isLink: true,
        route: match[2].trim()
      });
      lastIndex = regex.lastIndex;
    }
    
    // Add remaining plain text
    if (lastIndex < text.length) {
      segments.push({
        text: text.substring(lastIndex),
        isLink: false
      });
    }
    
    return segments;
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userText = this.newMessage;
    this.messages.push({
      segments: [{ text: userText, isLink: false }],
      sender: 'user',
      timestamp: new Date()
    });

    this.newMessage = '';
    this.isLoading = true;

    this.chatService.sendMessage(userText).subscribe({
      next: (response) => {
        this.messages.push({
          segments: this.parseSegments(response.response),
          sender: 'bot',
          timestamp: new Date()
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error communicating with chatbot API:', err);
        this.messages.push({
          segments: [{ text: 'Sorry, I am having trouble connecting right now. Please try again later.', isLink: false }],
          sender: 'bot',
          timestamp: new Date()
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  onActionClick(route: string) {
    this.router.navigate([route]);
  }

  private scrollToBottom(): void {
    try {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Chatbot {
  id: number;
  name: string;
  triggered: number;
  stepsFinished: number;
  finished: number;
  created: string;
  updated: string;
}

@Component({
  selector: 'app-chatbot-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-table.component.html',
  styleUrl: './chatbot-table.component.css'
})
export class ChatbotTableComponent {
  chatbots: Chatbot[] = [
    {
      id: 1,
      name: 'xx',
      triggered: 0,
      stepsFinished: 0,
      finished: 0,
      created: 'Created 0 minutes ago',
      updated: 'Updated 0 minutes ago'
    },
    {
      id: 2,
      name: 'test2',
      triggered: 0,
      stepsFinished: 0,
      finished: 0,
      created: 'Created 5 days ago',
      updated: 'Updated 5 days ago'
    },
    {
      id: 3,
      name: 'test222',
      triggered: 0,
      stepsFinished: 0,
      finished: 0,
      created: 'Created 9 days ago',
      updated: 'Updated 9 days ago'
    },
    {
      id: 4,
      name: 'test',
      triggered: 0,
      stepsFinished: 0,
      finished: 0,
      created: 'Created 9 days ago',
      updated: 'Updated 9 days ago'
    },
    {
      id: 5,
      name: 'Doctor Appointment',
      triggered: 3,
      stepsFinished: 6,
      finished: 3,
      created: 'Created 2 months ago',
      updated: 'Updated 8 days ago'
    }
  ];

  getPlatformIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      'twitter': '𝕏',
      'whatsapp': 'W',
      'instagram': 'I',
      'github': 'G',
      'messenger': 'M',
      'webpage': '🌐'
    };
    return icons[platform] || platform.charAt(0).toUpperCase();
  }

  getPlatformIconClass(platform: string): string {
    const classes: { [key: string]: string } = {
      'twitter': 'bg-black',
      'whatsapp': 'bg-green-500',
      'instagram': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'github': 'bg-gray-800',
      'messenger': 'bg-blue-600',
      'webpage': 'bg-orange-500'
    };
    return classes[platform] || 'bg-gray-500';
  }
} 
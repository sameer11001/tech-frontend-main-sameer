import { AutomationsComponent } from "./automations.component";
import { ChatbotComponent } from "../../../chatbot/chatbot.component";
import { ChatbotBuilderComponent } from "../../../chatbot/pages/chatbot-builder/chatbot-builder.component";
import { AutomationsDefaultComponent } from "./automations-default.component";

export const automationsRoutes = {
  path: 'automations',
  component: AutomationsComponent,
  children: [
    {
      path: '',
      component: AutomationsDefaultComponent
    },
    {
      path: 'chatbot',
      component: ChatbotComponent
    },
    {
      path: 'chatbot/builder',
      component: ChatbotBuilderComponent
    }
  ]
}; 
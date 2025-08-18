import { Injectable } from "@angular/core";
import { ApiService } from "../../api/api.service";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ChatbotApiService {
    constructor(private apiService: ApiService) { }

    createChatbotMetadata(payload: any): Observable<any> {
        return this.apiService.post('v1/chatbot/metadata', payload);
    }

    editChatbotFlowNode(payload: any): Observable<any> {
        return this.apiService.post('v1/chatbot/nodes', payload);
    }

    getChatbotFlows(): Observable<any> {
        return this.apiService.get('v1/chatbot/nodes');
    }

    getChatbotsMetadata(): Observable<any> {
        return this.apiService.get('v1/chatbot/metadata');
    }

    triggerChatbots(payload: any): Observable<any> {
        return this.apiService.post('v1/chatbot/trigger', payload);
    }

}

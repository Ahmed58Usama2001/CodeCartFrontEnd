import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Order } from '../../Shared/models/Order';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  hubUrl = environment.hubUrl;
  hubConnection?: HubConnection;
  orderSignal = signal<Order | null>(null);
  connectionState = signal<HubConnectionState>(HubConnectionState.Disconnected);

  async createHubConnection(token?: string) {
    // Don't create a new connection if one already exists and is connected
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    // Stop existing connection if it exists
    if (this.hubConnection) {
      await this.stopHubConnection();
    }

    if (!token) {
      console.error('No token provided for SignalR connection');
      throw new Error('Authentication token is required for SignalR connection');
    }

    const connectionBuilder = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging('Information');

    this.hubConnection = connectionBuilder.build();

    // Set up event handlers
    this.setupEventHandlers();

    try {
      await this.hubConnection.start();
      this.connectionState.set(HubConnectionState.Connected);
      console.log('SignalR connection established');
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.connectionState.set(HubConnectionState.Disconnected);
      throw error;
    }
  }

  async stopHubConnection() {
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) {
      try {
        await this.hubConnection.stop();
        this.connectionState.set(HubConnectionState.Disconnected);
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      } finally {
        this.hubConnection = undefined;
      }
    }
  }

  private setupEventHandlers() {
    if (!this.hubConnection) return;

    // Handle connection state changes
    this.hubConnection.onclose(() => {
      this.connectionState.set(HubConnectionState.Disconnected);
      console.log('SignalR connection closed');
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionState.set(HubConnectionState.Reconnecting);
      console.log('SignalR reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState.set(HubConnectionState.Connected);
      console.log('SignalR reconnected');
    });

    // Set up your custom event handlers
    this.hubConnection.on("OrderCompletionNotification", (order: Order) => {
      this.orderSignal.set(order);
      console.log('Order completion notification received:', order);
    });
  }

  // Helper method to check if connected
  isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }

  // Method to send messages (if needed in the future)
  async sendMessage(methodName: string, ...args: any[]) {
    if (this.isConnected() && this.hubConnection) {
      try {
        await this.hubConnection.invoke(methodName, ...args);
      } catch (error) {
        console.error(`Error sending message ${methodName}:`, error);
        throw error;
      }
    } else {
      console.warn('Cannot send message: SignalR connection not established');
    }
  }
}
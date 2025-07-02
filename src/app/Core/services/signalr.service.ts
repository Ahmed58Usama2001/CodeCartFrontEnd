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
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    if (this.hubConnection) {
      await this.stopHubConnection();
    }

    const connectionBuilder = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        withCredentials: true,
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect();

    this.hubConnection = connectionBuilder.build();

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

    this.hubConnection.on("OrderCompletionNotification", (order: Order) => {
      this.orderSignal.set(order);
      console.log('Order completion notification received:', order);
    });
  }

  isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }


}
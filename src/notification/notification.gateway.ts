import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    notifyNewMail(targetEmail: string, mailData: any) {
        // Notify specifically to the user's room (email-based room)
        this.server.emit(`new_mail_${targetEmail}`, mailData);
    }

    @SubscribeMessage('join')
    handleJoinRoom(client: Socket, email: string) {
        client.join(email);
        console.log(`User ${email} joined their personal room`);
    }
}

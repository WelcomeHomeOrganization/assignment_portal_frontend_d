"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (employeeId: string | undefined) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!employeeId) return;

        const backendUrl = process.env.BACKEND_LINK || "http://localhost:3001";

        const socketInstance = io(`${backendUrl}/notifications`, {
            query: { employeeId },
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        const onConnect = () => {
            console.log('Connected to notification server! 🚀');
            setIsConnected(true);
        };
        const onDisconnect = () => setIsConnected(false);
        const onError = (error: any) => console.error('Connection error:', error);

        socketInstance.on("connect", onConnect);
        socketInstance.on("connect_error", onError);
        socketInstance.on("disconnect", onDisconnect);

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [employeeId]);

    return { socket, isConnected };
};

"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (employeeId?: string) => {

    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
    useEffect(() => {
        if (!employeeId) return;

        const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_LINK || "http://localhost:3001";

        const socket = io(`${backendUrl}/notifications`, {
            query: { employeeId },
            transports: ["websocket"],
            withCredentials: true,
        });

        socketRef.current = socket;
        setSocketInstance(socket);
        socket.on("connect", () => {
            console.log('Connected to notification server! 🚀');
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("connect_error", (err) => {
            console.warn("Socket connection failed:", err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setSocketInstance(null);
        };

    }, [employeeId]);

    return { socket: socketInstance, isConnected };
};
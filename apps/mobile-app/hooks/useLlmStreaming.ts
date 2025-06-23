import { useEffect, useState } from 'react';
import socket from '../services/llmSocket';

export const useLlmStreaming = () => {
    const [response, setResponse] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const startRequest = (taskData: any, question: string) => {
        setResponse('');
        setIsStreaming(true);
        socket.emit("start-llm-request", {
            attivita: { ...taskData, messaggio: question }
        });
    };

    useEffect(() => {
        socket.on("llm-chunk", (chunk: string) => {
            setResponse(prev => prev + chunk);
        });

        socket.on("llm-done", () => {
            setIsStreaming(false);
        });

        socket.on("llm-error", (msg: string) => {
            setResponse(msg);
            setIsStreaming(false);
        });

        return () => {
            socket.off("llm-chunk");
            socket.off("llm-done");
            socket.off("llm-error");
        };
    }, []);

    return { response, isStreaming, startRequest };
};

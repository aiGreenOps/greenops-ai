import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLlmStreaming } from '../../hooks/useLlmStreaming';


type AiAssistantModalProps = {
    visible: boolean;
    onClose: () => void;
    taskData: any;
};

export default function AiAssistantModal({ visible, onClose, taskData }: AiAssistantModalProps) {
    const [question, setQuestion] = useState('');

    const { response: aiResponse, isStreaming: isLoading, startRequest } = useLlmStreaming();

    const isDisabled = question.trim().length === 0 || isLoading;
    const scrollRef = useRef<ScrollView>(null);

    const handleSend = () => {
        if (!question.trim()) return;
        Keyboard.dismiss();
        startRequest(taskData, question);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [aiResponse]);


    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalBackdrop}
                >
                    <TouchableWithoutFeedback
                        onPress={(e) => {
                            if (e.target === e.currentTarget) {
                                onClose();
                            }
                        }}
                    >
                        <View style={styles.fullscreenTouchable}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    <View style={styles.header}>
                                        <Text style={styles.title}>AI Assistant</Text>
                                        <TouchableOpacity onPress={onClose}>
                                            <Feather name="x" style={styles.iconClose} color="#374151" />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView
                                        ref={scrollRef}
                                        style={styles.textContent}
                                        contentContainerStyle={[styles.textContentInner]}
                                        keyboardShouldPersistTaps="handled"
                                    >

                                        {(!isLoading && !aiResponse) && (
                                            <>
                                                <View style={styles.iconWrapper}>
                                                    <Feather name="cpu" size={48} color="#9ca3af" />
                                                </View>
                                                <Text style={styles.description}>
                                                    Ask a question about the activity and receive personalized advice
                                                </Text>
                                            </>
                                        )}

                                        {isLoading && aiResponse === '' && (
                                            <View style={styles.loadingContainer}>
                                                <View style={styles.iconWrapper}>
                                                    <Feather name="cpu" size={48} color="#9ca3af" />
                                                </View>
                                                <Text style={styles.description}>I'm thinking...</Text>
                                            </View>
                                        )}

                                        {aiResponse !== '' && (
                                            <View style={styles.responseBox}>
                                                <Text style={styles.responseText}>{aiResponse.trimStart()}</Text>
                                            </View>
                                        )}
                                    </ScrollView>

                                    <View style={styles.footer}>
                                        <View style={styles.inputRow}>
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder="Write your question..."
                                                value={question}
                                                onChangeText={setQuestion}
                                                returnKeyType="send"
                                                onSubmitEditing={handleSend}
                                                blurOnSubmit={false}
                                            />
                                            <TouchableOpacity
                                                onPress={handleSend}
                                                style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
                                                disabled={isDisabled}
                                            >
                                                <Feather name="send" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>


                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    fullscreenTouchable: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        flexDirection: 'column',
        paddingTop: 16,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 'auto',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -3 },
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: 'rgb(232, 228, 236)',
        paddingBottom: 16,
    },
    title: {
        fontWeight: '700',
        fontSize: 16,
        color: '#111827',
        paddingLeft: 16,
    },
    iconClose: {
        paddingRight: 16,
        fontSize: 16,
    },
    footer: {
        borderTopWidth: 1,
        borderColor: 'rgb(232, 228, 236)',
        paddingVertical: 12,
        paddingBottom: 24,
        paddingHorizontal: 16,
    },
    iconWrapper: {
        marginVertical: 24,
        alignItems: 'center',
    },
    description: {
        fontSize: 14,
        fontWeight: 300,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        backgroundColor: 'transparent',
        color: '#111827',
        borderRadius: 8,
        borderColor: 'rgb(232, 228, 236)',
        borderWidth: 1,
        paddingHorizontal: 12,
        marginRight: 12,
        height: 44,
    },
    sendButton: {
        backgroundColor: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        padding: 8,
        height: 44,
        width: 44,
        maxHeight: 44,
        maxWidth: 44,
    },
    sendButtonDisabled: {
        opacity: 0.4,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    responseBox: {
        backgroundColor: '#f0f9ff',
        borderRadius: 8,
        padding: 16,
        marginVertical: 12,
    },
    responseText: {
        fontSize: 14,
        color: '#1e3a8a',
        lineHeight: 20,
    },
    textContent: {
        height: 'auto',
        paddingHorizontal: 24,
    },
    textContentInner: {
        justifyContent: 'center',
        flexGrow: 1,
    }
});

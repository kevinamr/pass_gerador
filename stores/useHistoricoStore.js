import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const useHistoricoStore = create(
    persist(
        (set, get) => ({
            historico: [],
            visiveis: {},

            carregarHistorico: async (token) => {
                try {
                    if (token) {
                        const res = await fetch(`${API_BASE}/historico`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (res.ok) {
                            const dados = await res.json();
                            set({ historico: dados, visiveis: {} });
                            return;
                        }
                    }
                } catch (e) {
                    console.log('Erro ao buscar histórico do backend:', e);
                }
            },

            alternarVisibilidade: (id) =>
                set((state) => ({
                    visiveis: {
                        ...state.visiveis,
                        [id]: !state.visiveis[id],
                    },
                })),

            adicionarSenha: async (token, nomeAplicativo, senha) => {
                const novoItem = {
                    id: Date.now().toString(),
                    nomeAplicativo: nomeAplicativo.trim(),
                    senha,
                };

                set((state) => ({
                    historico: [novoItem, ...state.historico],
                }));

                try {
                    if (token) {
                        const res = await fetch(`${API_BASE}/historico`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                nomeAplicativo: novoItem.nomeAplicativo,
                                senha: novoItem.senha,
                            }),
                        });

                        if (res.status === 401) {
                            console.log('Usuário não autenticado ao salvar histórico no backend.');
                        }
                    }
                } catch (e) {
                    console.log('Erro ao salvar histórico no backend:', e);
                }
            },

            deletarSenha: async (token, id) => {
                set((state) => ({
                    historico: state.historico.filter((item) => item.id !== id),
                }));

                try {
                    if (token) {
                        await fetch(`${API_BASE}/historico/${id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                        });
                    }
                } catch (e) {
                    console.log('Erro ao deletar histórico no backend:', e);
                }
            },
        }),
        {
            name: 'historico-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ historico: state.historico }),
        }
    )
);
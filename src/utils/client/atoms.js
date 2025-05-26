// utils/atoms.js
import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { isMobile } from 'react-device-detect';
import { revCacheStorage } from './customStorage';

const jotaiLocalStorage = createJSONStorage(() => localStorage);

// “environment” atoms – rarely change
export const mobileClientAtom   = atom(isMobile);
export const pageStates = Object.freeze({
    REVERIE: { id: 'reverie', tab: 'dashboard' },
    HOME: { id: 'home', tab: 'home' },
    LOGIN: { id: 'login', tab: 'login' },
    CHAT: { id: 'chat', tab: 'chat' },
    AGENT: { id: 'agent', tab: 'agent' },
    DASHBOARD: { id: 'dashboard', tab: 'dashboard' },
    FEED: { id: 'feed', tab: 'feed' },
    TOKEN: { id: 'token', tab: 'dashboard' },
    CHECKOUT: { id: 'checkout', tab: 'membership' },
    SUBSCRIPTION: { id: 'subscription', tab: 'membership' },
    MEMBERSHIP: { id: 'membership', tab: 'membership' },
    SETTINGS: { id: 'settings', tab: 'settings' },
    MEMORY: { id: 'memory', tab: 'memory' },
    PROFILE: { id: 'profile', tab: 'profile' },
    PUBLIC: { id: 'public', tab: 'public' },
    PUBLIC_REVERIE: { id: 'public_reverie', tab: 'public' },
});

// persistent‑in‑localStorage atoms
export const revCacheAtom        = atomWithStorage('gctx:revCache',        [],      revCacheStorage);
export const publicRevCacheAtom  = atomWithStorage('gctx:publicRevCache',  [],      revCacheStorage);
export const chatCacheAtom       = atomWithStorage('gctx:chatCache',       [],      jotaiLocalStorage);
export const sessionAtom         = atomWithStorage('gctx:session',         null,    jotaiLocalStorage);
export const userInputAtom = atomWithStorage('gctx:userInput', '', jotaiLocalStorage);
export const processingAtom = atomWithStorage('gctx:processing', 0, jotaiLocalStorage);
export const openRevAtom = atomWithStorage('gctx:openRev', '', jotaiLocalStorage);
export const pageStateAtom = atomWithStorage('gctx:pageState', '', jotaiLocalStorage);
export const scrambleAtom = atomWithStorage('gctx:scramble', false, jotaiLocalStorage);
export const placeholderAtom = atomWithStorage('gctx:placeholder', 'What brings you in?', jotaiLocalStorage);
export const userDataAtom = atomWithStorage('gctx:userData', null, jotaiLocalStorage);
export const topbarDeleteAtom = atomWithStorage('gctx:topbarDelete', null, jotaiLocalStorage);
export const reverieDataAtom = atomWithStorage('gctx:reverieData', null, jotaiLocalStorage);
export const allUsersAtom = atomWithStorage('gctx:allUsers', null, jotaiLocalStorage);
export const activeTabAtom = atomWithStorage('gctx:activeTab', null, jotaiLocalStorage);
export const isBelowTabletAtom = atomWithStorage('gctx:isBelowTablet', false, jotaiLocalStorage);
export const userInsightsAtom = atomWithStorage('gctx:userInsights', [], jotaiLocalStorage);
export const suggestionsAtom = atomWithStorage('gctx:suggestions', [], jotaiLocalStorage);
export const suggestionsActiveAtom = atomWithStorage('gctx:suggestionsActive', false, jotaiLocalStorage);
export const chatStatusAtom = atomWithStorage('gctx:chatStatus', '', jotaiLocalStorage);
export const newCardIdAtom = atomWithStorage('gctx:newCardId', null, jotaiLocalStorage);



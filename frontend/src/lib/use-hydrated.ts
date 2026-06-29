import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * 检测客户端 hydration 是否完成。
 * SSR 时返回 false，客户端首次渲染后返回 true。
 *
 * 用 useSyncExternalStore 而非 "useEffect + setState(true)" 模式，
 * 避免触发 react-hooks/set-state-in-effect lint 规则与级联渲染。
 * 用于等待 zustand persist 从 localStorage 读取认证状态。
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

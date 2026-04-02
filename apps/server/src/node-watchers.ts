import type WebSocket from "ws"

// connectionId → Set of WebSocket clients watching this node
const nodeWatchers: Map<string, Set<WebSocket>> = new Map()

export function subscribe(connectionId: string, ws: WebSocket): void {
  let watchers = nodeWatchers.get(connectionId)
  if (!watchers) {
    watchers = new Set()
    nodeWatchers.set(connectionId, watchers)
  }
  watchers.add(ws)
}

export function unsubscribe(connectionId: string, ws: WebSocket): boolean {
  const watchers = nodeWatchers.get(connectionId)
  if (!watchers) return false
  const deleted = watchers.delete(ws)
  if (watchers.size === 0) {
    nodeWatchers.delete(connectionId)
  }
  return deleted
}

export function unsubscribeAll(ws: WebSocket): string[] {
  const removedIds: string[] = []
  for (const [connectionId] of nodeWatchers) {
    if (unsubscribe(connectionId, ws)) {
      removedIds.push(connectionId)
    }
  }
  return removedIds
}

export function getOtherWatchers(connectionId: string, excludeWs: WebSocket): WebSocket[] {
  const watchers = nodeWatchers.get(connectionId)
  if (!watchers) return []
  return [...watchers].filter((ws) => ws !== excludeWs)
}

export function getWatcherCount(connectionId: string): number {
  return nodeWatchers.get(connectionId)?.size ?? 0
}

// Exposed for testing only
export function _reset(): void {
  nodeWatchers.clear()
}

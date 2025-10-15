export interface TimelineEvent {
  time: number;
  action: 'play' | 'stop' | 'trigger';
  clip?: string;
  payload?: Record<string, unknown>;
}

export interface TimelineDefinition {
  id: string;
  duration: number;
  loop?: boolean;
  events: TimelineEvent[];
}

export const sampleTimeline: TimelineDefinition = {
  id: 'idle-demo',
  duration: 10,
  loop: true,
  events: [
    { time: 0, action: 'play', clip: 'Idle', payload: { blend: 0.5 } },
    { time: 5, action: 'trigger', payload: { effect: 'spark' } }
  ],
};

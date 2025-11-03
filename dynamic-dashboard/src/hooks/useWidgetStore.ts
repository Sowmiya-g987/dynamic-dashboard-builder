// src/hooks/useWidgetStore.ts
import { create } from "zustand";
export interface WidgetData {
  schemaName: string; 
  xField: string;
  yField: string;
  branch?: string;
  typeOf?: string;
}

export type Widget = {
  id: number;
  type: string; 
  position: { x: number; y: number; w: number; h: number };
  data: WidgetData;
};

type State = {
  widgets: Widget[];
  addWidget: (w: Widget) => void;
  updateWidgetData: (id: number, data: Partial<WidgetData>) => void;
};

export const useWidgetStore = create<State>((set) => ({
  widgets: [],
  addWidget: (w) => set((s) => ({ widgets: [...s.widgets, w] })),
  updateWidgetData: (id, data) =>
    set((s) => ({
      widgets: s.widgets.map((w) => (w.id === id ? { ...w, data: { ...w.data, ...data } } : w)),
    })),
}));

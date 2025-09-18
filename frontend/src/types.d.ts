declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  export interface ReactElement<P = any> {
    type: any;
    props: P;
    key: string | number | null;
  }
  
  export interface ReactNode {
    type: any;
    props: any;
    key: string | number | null;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  export const Fragment: any;
}

declare module 'react-dom' {
  export function render(element: any, container: any): void;
}

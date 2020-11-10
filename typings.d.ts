declare module '*.css';
declare module '*.less';
declare module '*.png';
declare var global: NodeJS.Global & typeof globalThis;
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}
